import { afterEach, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TopupPage } from "../src/pages/TopUp";
import { AuthContext } from "../src/context/Auth";
import { LanguageContext } from "../src/context/Language";

const originalFetch = globalThis.fetch;

function renderBillingPage(
  topupRecords: Array<Record<string, unknown>> = [],
  topupInfo: Record<string, unknown> = {
    enable_online_topup: false,
    enable_redemption: false,
  },
) {
  globalThis.fetch = mock(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url === "/api/status") {
      return Response.json({
        success: true,
        data: { quota_per_unit: 500_000 },
      });
    }
    if (url === "/api/user/self") {
      return Response.json({
        success: true,
        data: {
          id: 1,
          username: "operator",
          email: "ops@example.com",
          role: 1,
          quota: 1_000_000,
        },
      });
    }
    if (url.startsWith("/api/user/topup/self")) {
      return Response.json({ success: true, data: { items: topupRecords } });
    }
    if (url === "/api/subscription/self") {
      return Response.json({
        success: true,
        data: { all_subscriptions: [] },
      });
    }
    if (url === "/api/user/topup/info") {
      return Response.json({
        success: true,
        data: topupInfo,
      });
    }
    return Response.json({ success: true, data: {} });
  }) as typeof fetch;

  render(
    <AuthContext.Provider
      value={{
        user: {
          id: 1,
          username: "operator",
          email: "ops@example.com",
          role: 1,
          quota: 1_000_000,
        },
        authChecking: false,
        setUser: () => undefined,
        signOut: async () => undefined,
      }}
    >
      <LanguageContext.Provider
        value={{
          language: "en",
          setLanguage: () => undefined,
          translationVersion: 0,
        }}
      >
        <TopupPage />
      </LanguageContext.Provider>
    </AuthContext.Provider>,
  );
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("billing page opens the existing top-up flow from its primary action", async () => {
  const user = userEvent.setup({ document });
  renderBillingPage();

  expect(await screen.findByText("No billing records")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Top up now" }));

  expect(
    await screen.findByRole("heading", { level: 2, name: "Top up" }),
  ).toBeTruthy();
  expect(
    screen.getByRole("dialog").querySelector(".purchase-dialog-body"),
  ).toBeTruthy();
});

test("billing page marks quota and paid values as numeric columns", async () => {
  renderBillingPage([
    {
      id: 10,
      amount: 1_000_000,
      money: 2,
      create_time: 1_786_000_000,
      trade_no: "trade-10",
      payment_method: "Stripe",
      status: "success",
    },
  ]);

  const table = await screen.findByRole("table", { name: "Billing records" });
  const quotaCell = table.querySelector('td[data-label="Quota"]');
  const paidCell = table.querySelector('td[data-label="Paid"]');

  expect(quotaCell?.getAttribute("data-numeric")).toBe("true");
  expect(paidCell?.getAttribute("data-numeric")).toBe("true");
});

test("top-up choices expose their selected state to assistive technology", async () => {
  const user = userEvent.setup({ document });
  renderBillingPage([], {
    enable_online_topup: true,
    enable_stripe_topup: true,
    enable_redemption: false,
    amount_options: [10, 20],
    pay_methods: [
      { type: "stripe", name: "Stripe", min_topup: 1 },
      { type: "alipay", name: "Alipay", min_topup: 1 },
    ],
  });

  await user.click(screen.getByRole("button", { name: "Top up now" }));

  const selectedPreset = await screen.findByRole("button", {
    name: "$10",
    pressed: true,
  });
  const selectedMethod = await screen.findByRole("button", {
    name: /Stripe/,
    pressed: true,
  });

  expect(selectedPreset?.textContent).toContain("$10");
  expect(selectedMethod?.textContent).toContain("Stripe");
  expect(
    selectedPreset?.querySelector('.billing-choice-check[aria-hidden="true"]'),
  ).toBeTruthy();
  expect(
    selectedMethod?.querySelector('.billing-choice-check[aria-hidden="true"]'),
  ).toBeTruthy();

  const nextPreset = screen.getByRole("button", { name: "$20" });
  const nextMethod = screen.getByRole("button", { name: "Alipay" });

  await user.click(nextPreset);
  await user.click(nextMethod);

  expect(nextPreset.getAttribute("aria-pressed")).toBe("true");
  expect(nextMethod.getAttribute("aria-pressed")).toBe("true");
  expect(selectedPreset.getAttribute("aria-pressed")).toBe("false");
  expect(selectedMethod.getAttribute("aria-pressed")).toBe("false");
});
