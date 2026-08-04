import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { FormField } from "../src/components/common/ui/FormField";

test("form field connects labels, help, errors, actions, and forwarded focus", () => {
  const inputRef = createRef<HTMLInputElement>();
  render(
    <FormField
      action={<button type="button">Reveal password</button>}
      error="Password is required"
      helperText="Use 8 to 20 characters"
      inputRef={inputRef}
      label="Password"
    >
      <input autoComplete="current-password" type="password" />
    </FormField>,
  );

  const input = screen.getByLabelText("Password");
  expect(input.getAttribute("autocomplete")).toBe("current-password");
  expect(input.getAttribute("aria-invalid")).toBe("true");
  const describedBy = input.getAttribute("aria-describedby") ?? "";
  expect(describedBy).toContain("help");
  expect(describedBy).toContain("error");
  expect(screen.getByText("Use 8 to 20 characters")).toBeTruthy();
  expect(screen.getByRole("alert").textContent).toBe("Password is required");
  expect(screen.getByRole("button", { name: "Reveal password" })).toBeTruthy();

  inputRef.current?.focus();
  expect(document.activeElement).toBe(input);
});
