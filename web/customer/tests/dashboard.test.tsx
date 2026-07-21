import { afterEach, expect, mock, test } from "bun:test";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createDashboardPage } from "../src/pages/Dashboard";
import { AuthContext } from "../src/context/Auth";
import { LanguageContext } from "../src/context/Language";

const originalFetch = globalThis.fetch;
const DashboardPage = createDashboardPage({
  TopupDialog: () => <div role="dialog">Top up dialog</div>,
});

function dashboardResponses(failSelf = false) {
  const plan = {
    id: 7,
    title: "Pro",
    price_amount: 20,
    total_amount: 5_000_000,
  };
  return new Map<string, Record<string, unknown>>([
    ["/api/status", { success: true, data: { quota_per_unit: 500_000 } }],
    [
      "/api/user/self",
      failSelf
        ? { success: false, message: "self unavailable" }
        : {
            success: true,
            data: {
              id: 1,
              username: "operator",
              email: "ops@example.com",
              role: 1,
              quota: 1_000_000,
              request_count: 42,
            },
          },
    ],
    [
      "/api/subscription/self",
      {
        success: true,
        data: {
          subscriptions: [
            {
              subscription: {
                id: 9,
                user_id: 1,
                plan_id: 7,
                status: "active",
                start_time: 1,
                end_time: 4_102_444_800,
                amount_total: 5_000_000,
                amount_used: 1_000_000,
              },
              plan,
            },
          ],
        },
      },
    ],
    ["/api/subscription/plans", { success: true, data: [{ plan }] }],
  ]);
}

function renderDashboard(failSelf = false) {
  const responses = dashboardResponses(failSelf);
  globalThis.fetch = mock(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.startsWith("/api/log/self/stat")) {
      return Response.json({
        success: true,
        data: { quota: 250_000, rpm: 3, tpm: 1_200 },
      });
    }
    return Response.json(responses.get(url) ?? { success: true, data: {} });
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
          request_count: 42,
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
        <DashboardPage />
      </LanguageContext.Provider>
    </AuthContext.Provider>,
  );
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("dashboard exposes the current plan and common actions", async () => {
  renderDashboard();

  expect((await screen.findAllByText("Pro")).length).toBeGreaterThan(0);

  const actions = within(
    screen.getByRole("navigation", { name: "Common actions" }),
  );
  expect(
    actions.getByRole("link", { name: "Billing" }).getAttribute("href"),
  ).toBe("/dashboard/billing");
  expect(
    actions.getByRole("link", { name: "View usage" }).getAttribute("href"),
  ).toBe("/dashboard/usage");
  expect(
    actions.getByRole("link", { name: "Manage API keys" }).getAttribute("href"),
  ).toBe("/dashboard/api-key");
  expect(actions.getByRole("link", { name: "Docs" }).getAttribute("href")).toBe(
    "/setup",
  );
});

test("dashboard gives wallet data one region with the top-up action", async () => {
  const user = userEvent.setup({ document });
  renderDashboard();

  const wallet = await screen.findByRole("region", {
    name: "Wallet balance",
  });
  expect(within(wallet).getByText("$2.00")).toBeTruthy();
  expect(within(wallet).getByText("$0.50")).toBeTruthy();
  expect(within(wallet).getByText("42")).toBeTruthy();
  expect(
    within(wallet).getByText("CNY and USD are settled 1:1."),
  ).toBeTruthy();
  expect(screen.getAllByText("Wallet balance")).toHaveLength(1);

  await user.click(within(wallet).getByRole("button", { name: "Top up now" }));
  expect(screen.getByRole("dialog")).toBeTruthy();
});

test("dashboard failure keeps summaries hidden and offers retry", async () => {
  renderDashboard(true);

  expect(await screen.findByText("Failed to load dashboard data")).toBeTruthy();
  expect(screen.queryByRole("list", { name: "Account overview" })).toBeNull();
  expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
});
