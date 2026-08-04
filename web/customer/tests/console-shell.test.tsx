import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CustomerShell } from "../src/components/layout/CustomerShell";
import { AuthContext } from "../src/context/Auth";
import { LanguageContext } from "../src/context/Language";

function renderConsoleShell(signOut = mock(async () => undefined)) {
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
        signOut,
      }}
    >
      <LanguageContext.Provider
        value={{
          language: "en",
          setLanguage: () => undefined,
          translationVersion: 0,
        }}
      >
        <CustomerShell crumbId="Dashboard" page="dashboard">
          <h1>Dashboard content</h1>
        </CustomerShell>
      </LanguageContext.Provider>
    </AuthContext.Provider>,
  );

  return { signOut };
}

test("console shell exposes account and language actions", async () => {
  const user = userEvent.setup({ document });
  const { signOut } = renderConsoleShell();

  expect(screen.getByRole("button", { name: "Language" })).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Account" }));

  expect(screen.getByRole("menuitem", { name: "Home" })).toBeTruthy();
  expect(
    screen.getByRole("menuitem", { name: "Change password" }),
  ).toBeTruthy();
  expect(screen.getByRole("menuitem", { name: "Change email" })).toBeTruthy();
  await user.click(screen.getByRole("menuitem", { name: "Sign out" }));

  expect(signOut).toHaveBeenCalledTimes(1);
});
