import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { AuthSubmitButton } from "../src/components/auth/AuthSubmitButton";

test("auth submit keeps its name and marks busy while loading", () => {
  const { rerender } = render(
    <AuthSubmitButton label="Sign in" loading={false} />,
  );

  expect(
    screen.getByRole("button", { name: "Sign in" }).getAttribute("aria-busy"),
  ).toBeNull();

  rerender(<AuthSubmitButton disabled label="Sign in" loading />);

  const button = screen.getByRole("button", { name: "Sign in" });
  expect(button.getAttribute("aria-busy")).toBe("true");
  expect(button).toHaveProperty("disabled", true);
});
