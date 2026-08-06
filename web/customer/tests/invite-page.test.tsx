import { afterEach, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { AuthContext } from "../src/context/Auth";
import { LanguageContext } from "../src/context/Language";
import { ToastProvider } from "../src/context/Toast";
import { InvitePage } from "../src/pages/Invite";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("invite records mark reward quota as a numeric column", async () => {
  globalThis.fetch = mock(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url === "/api/status") {
      return Response.json({
        success: true,
        data: { quota_per_unit: 500_000, quota_for_inviter: 1_000_000 },
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
          aff_code: "invite-code",
          aff_count: 1,
          aff_quota: 1_000_000,
          aff_history_quota: 1_000_000,
        },
      });
    }
    if (url === "/api/user/aff") {
      return Response.json({ success: true, data: "invite-code" });
    }
    if (url.startsWith("/api/log/self")) {
      return Response.json({
        success: true,
        data: {
          items: [
            {
              id: 10,
              created_at: 1_786_000_000,
              content: "inviter reward $2.00",
            },
          ],
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
        <ToastProvider>
          <InvitePage />
        </ToastProvider>
      </LanguageContext.Provider>
    </AuthContext.Provider>,
  );

  const table = await screen.findByRole("table", { name: "Invite records" });
  const quotaCell = table.querySelector('td[data-label="Quota"]');

  expect(quotaCell?.getAttribute("data-numeric")).toBe("true");
});
