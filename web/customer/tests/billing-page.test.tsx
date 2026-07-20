import { afterEach, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TopupPage } from "../src/pages/TopUp";
import { AuthContext } from "../src/context/Auth";
import { LanguageContext } from "../src/context/Language";

const originalFetch = globalThis.fetch;

function renderBillingPage() {
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
      return Response.json({ success: true, data: { items: [] } });
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
        data: {
          enable_online_topup: false,
          enable_redemption: false,
        },
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
});
