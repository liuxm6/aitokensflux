import { afterEach, expect, mock, test } from "bun:test";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { LanguageContext } from "../src/context/Language";
import { createHomePage } from "../src/pages/Home";

const originalFetch = globalThis.fetch;
const HomePage = createHomePage({
  MarketingHeader: () => null,
  TopupDialog: () => null,
});

type PricingResponse = Error | Record<string, unknown>;

function deferredPricingResponse() {
  let resolve!: (response: Record<string, unknown>) => void;
  const promise = new Promise<Record<string, unknown>>((promiseResolve) => {
    resolve = promiseResolve;
  });
  return { promise, resolve };
}

function renderHomeWithPricing(responses: PricingResponse[]) {
  let pricingRequests = 0;
  globalThis.fetch = mock(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url === "/api/pricing/public") {
      const response = responses[pricingRequests];
      pricingRequests += 1;
      if (response instanceof Error) throw response;
      return Response.json(response ?? { success: false });
    }
    if (url === "/api/subscription/plans") {
      return Response.json({ success: true, data: [] });
    }
    return Response.json({ success: true, data: {} });
  }) as typeof fetch;

  render(
    <LanguageContext.Provider
      value={{
        language: "en",
        setLanguage: () => undefined,
        translationVersion: 0,
      }}
    >
      <HomePage />
    </LanguageContext.Provider>,
  );

  return () => pricingRequests;
}

function renderHomeWithDeferredPricing(
  responses: ReturnType<typeof deferredPricingResponse>[],
) {
  let pricingRequests = 0;
  globalThis.fetch = mock(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url === "/api/pricing/public") {
      const response = responses[pricingRequests];
      pricingRequests += 1;
      return Response.json(
        response ? await response.promise : { success: false },
      );
    }
    if (url === "/api/subscription/plans") {
      return Response.json({ success: true, data: [] });
    }
    return Response.json({ success: true, data: {} });
  }) as typeof fetch;

  render(
    <StrictMode>
      <LanguageContext.Provider
        value={{
          language: "en",
          setLanguage: () => undefined,
          translationVersion: 0,
        }}
      >
        <HomePage />
      </LanguageContext.Provider>
    </StrictMode>,
  );

  return () => pricingRequests;
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("model pricing success false renders the retryable error state", async () => {
  renderHomeWithPricing([{ success: false, message: "pricing unavailable" }]);

  expect(await screen.findByText("Failed to load model pricing")).toBeTruthy();
  expect(screen.queryByText("No model pricing is available")).toBeNull();
  expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
});

test("model pricing network rejection renders the retryable error state", async () => {
  renderHomeWithPricing([new Error("network unavailable")]);

  expect(await screen.findByText("Failed to load model pricing")).toBeTruthy();
  expect(screen.queryByText("No model pricing is available")).toBeNull();
});

test("a successful empty model pricing response renders the empty state", async () => {
  renderHomeWithPricing([{ success: true, data: [] }]);

  expect(await screen.findByText("No model pricing is available")).toBeTruthy();
  expect(screen.queryByText("Failed to load model pricing")).toBeNull();
});

test("retrying model pricing performs a fresh request and recovers", async () => {
  const getPricingRequests = renderHomeWithPricing([
    { success: false, message: "pricing unavailable" },
    {
      success: true,
      data: [
        {
          model_name: "claude-recovered",
          quota_type: 0,
          model_ratio: 1,
          model_price: 0,
          completion_ratio: 1,
          enable_groups: ["claude"],
        },
      ],
    },
  ]);

  await screen.findByText("Failed to load model pricing");
  await userEvent
    .setup({ document })
    .click(screen.getByRole("button", { name: "Try again" }));

  expect(await screen.findByText("claude-recovered")).toBeTruthy();
  expect(getPricingRequests()).toBe(2);
});

test("an older empty pricing response cannot replace a newer failure", async () => {
  const older = deferredPricingResponse();
  const newer = deferredPricingResponse();
  const getPricingRequests = renderHomeWithDeferredPricing([older, newer]);
  expect(getPricingRequests()).toBe(2);

  await act(async () => {
    newer.resolve({ success: false, message: "pricing unavailable" });
    await newer.promise;
  });
  expect(await screen.findByText("Failed to load model pricing")).toBeTruthy();

  await act(async () => {
    older.resolve({ success: true, data: [] });
    await older.promise;
  });
  expect(screen.getByText("Failed to load model pricing")).toBeTruthy();
  expect(screen.queryByText("No model pricing is available")).toBeNull();
});

test("retry recovery cannot be overwritten by an older pricing request", async () => {
  const older = deferredPricingResponse();
  const newer = deferredPricingResponse();
  const retry = deferredPricingResponse();
  const getPricingRequests = renderHomeWithDeferredPricing([
    older,
    newer,
    retry,
  ]);
  expect(getPricingRequests()).toBe(2);

  await act(async () => {
    newer.resolve({ success: false, message: "pricing unavailable" });
    await newer.promise;
  });
  await screen.findByText("Failed to load model pricing");
  await userEvent
    .setup({ document })
    .click(screen.getByRole("button", { name: "Try again" }));
  expect(getPricingRequests()).toBe(3);

  await act(async () => {
    retry.resolve({
      success: true,
      data: [
        {
          model_name: "claude-latest",
          quota_type: 0,
          model_ratio: 1,
          model_price: 0,
          completion_ratio: 1,
          enable_groups: ["claude"],
        },
      ],
    });
    await retry.promise;
  });
  expect(await screen.findByText("claude-latest")).toBeTruthy();

  await act(async () => {
    older.resolve({ success: true, data: [] });
    await older.promise;
  });
  expect(screen.getByText("claude-latest")).toBeTruthy();
  expect(screen.queryByText("No model pricing is available")).toBeNull();
});
