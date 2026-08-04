import { afterEach, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccountActionDialog } from "../src/components/account/AccountActionDialog";
import { LanguageContext } from "../src/context/Language";

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: originalMatchMedia,
  });
});

test("account password validation focuses the first invalid field", async () => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: () => ({ matches: true }),
  });
  const root = document.createElement("div");
  root.id = "root";
  document.body.append(root);

  render(
    <LanguageContext.Provider
      value={{
        language: "en",
        setLanguage: () => undefined,
        translationVersion: 0,
      }}
    >
      <AccountActionDialog
        mode="password"
        user={{ id: 1, role: 1, username: "test-user" }}
        onClose={mock(() => undefined)}
        onUserChange={mock(() => undefined)}
      />
    </LanguageContext.Provider>,
    { container: root },
  );

  await userEvent
    .setup({ document })
    .click(screen.getByRole("button", { name: "Save changes" }));

  const currentPassword = screen.getByLabelText("Current password");
  expect(screen.getByRole("alert").textContent).toBe(
    "Enter your current password",
  );
  expect(currentPassword.getAttribute("aria-invalid")).toBe("true");
  expect(document.activeElement).toBe(currentPassword);
});
