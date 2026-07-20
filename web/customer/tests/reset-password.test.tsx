import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { LanguageContext } from "../src/context/Language";
import { ResetPasswordPage } from "../src/pages/ResetPassword";

test("invalid reset links are described by the email field", () => {
  window.history.replaceState(null, "", "/reset-password");
  render(
    <LanguageContext.Provider
      value={{
        language: "en",
        setLanguage: () => undefined,
        translationVersion: 0,
      }}
    >
      <ResetPasswordPage />
    </LanguageContext.Provider>,
  );

  const email = screen.getByLabelText("Email");
  expect(email.getAttribute("aria-invalid")).toBe("true");
  expect(email.getAttribute("aria-describedby")).toBeTruthy();
  expect(screen.getByRole("alert").textContent).toBe(
    "Invalid reset link. Please request a new password reset email.",
  );
});
