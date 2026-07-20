import { afterEach, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageContext } from "../src/context/Language";
import { createSubscribePage } from "../src/pages/Subscription";

const originalFetch = globalThis.fetch;
const SubscribePage = createSubscribePage({
  MarketingHeader: () => null,
  TopupDialog: () => null,
});

function renderSubscriptionPage(planResponses: Array<Record<string, unknown>>) {
  let planRequests = 0;
  globalThis.fetch = mock(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url === "/api/subscription/plans") {
      const response = planResponses[planRequests];
      planRequests += 1;
      return Response.json(response ?? { success: false });
    }
    if (url === "/api/status") {
      return Response.json({
        success: true,
        data: { quota_per_unit: 500_000 },
      });
    }
    if (url === "/api/user/topup/info") {
      return Response.json({
        success: true,
        data: {
          enable_online_topup: false,
          enable_redemption: false,
        },
      });
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
      <SubscribePage />
    </LanguageContext.Provider>,
  );

  return () => planRequests;
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("subscription plan failures render a retryable error instead of an empty state", async () => {
  renderSubscriptionPage([{ success: false, message: "plans unavailable" }]);

  expect(await screen.findByText("Failed to load plans")).toBeTruthy();
  expect(screen.queryByText("No available plans")).toBeNull();
  expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
});

test("subscription plan retry performs a fresh request and recovers", async () => {
  const getPlanRequests = renderSubscriptionPage([
    { success: false, message: "plans unavailable" },
    { success: true, data: [] },
  ]);

  await screen.findByText("Failed to load plans");
  await userEvent
    .setup({ document })
    .click(screen.getByRole("button", { name: "Try again" }));

  expect(await screen.findByText("No available plans")).toBeTruthy();
  expect(getPlanRequests()).toBe(2);
});
