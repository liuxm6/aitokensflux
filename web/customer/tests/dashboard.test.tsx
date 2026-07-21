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

function dashboardResponses(failSelf = false, planCount = 1) {
  const plans = Array.from({ length: planCount }, (_, index) => {
    const id = 7 + index;
    const plan = {
      id,
      title: index === 0 ? "Pro" : `Plan ${index + 1}`,
      price_amount: 20 + index,
      total_amount: 50_000_000 - index * 500_000,
      duration_value: 1,
      duration_unit: "month",
      quota_reset_period: "monthly",
    };
    return {
      plan,
      subscription: {
        id: 9 + index,
        user_id: 1,
        plan_id: id,
        status: "active",
        start_time: 1,
        end_time: 4_102_444_800 - index,
        amount_total: plan.total_amount,
        amount_used: 1_000_000,
      },
    };
  });

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
        data: { subscriptions: plans },
      },
    ],
    [
      "/api/subscription/plans",
      {
        success: true,
        data: plans.map(({ plan }) => ({ plan })),
      },
    ],
  ]);
}

function renderDashboard(failSelf = false, planCount = 1) {
  const responses = dashboardResponses(failSelf, planCount);
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

test("dashboard reveals large plan collections five at a time", async () => {
  const user = userEvent.setup({ document });
  renderDashboard(false, 20);

  expect((await screen.findAllByText("Plan 5")).length).toBeGreaterThan(0);
  expect(screen.queryAllByText("Plan 6")).toHaveLength(0);

  await user.click(
    screen.getByRole("button", {
      name: "Show more plans (15 remaining)",
    }),
  );

  expect(screen.getByText("Plan 10")).toBeTruthy();
  expect(screen.queryAllByText("Plan 11")).toHaveLength(0);
  expect(
    screen.getByRole("button", {
      name: "Show more plans (10 remaining)",
    }),
  ).toBeTruthy();
});

test("additional plans expand without hiding the primary plan", async () => {
  const user = userEvent.setup({ document });
  renderDashboard(false, 6);

  expect((await screen.findAllByText("Pro")).length).toBeGreaterThan(0);
  const expand = screen.getByRole("button", { name: "Expand Plan 2" });
  await user.click(expand);

  const compactPlan = expand.closest(".dashboard-plan-disclosure-card");
  expect(compactPlan).toBeTruthy();
  expect(
    within(compactPlan as HTMLElement).getByText("Plan used"),
  ).toBeTruthy();
  expect(
    within(compactPlan as HTMLElement).getByText("Next reset"),
  ).toBeTruthy();
  expect(
    screen.getByRole("button", { name: "Collapse Plan 2" }),
  ).toBeTruthy();
});

test("dashboard failure keeps summaries hidden and offers retry", async () => {
  renderDashboard(true);

  expect(await screen.findByText("Failed to load dashboard data")).toBeTruthy();
  expect(screen.queryByRole("list", { name: "Account overview" })).toBeNull();
  expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
});
