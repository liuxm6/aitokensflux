import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { ConsoleSummary } from "../src/components/common/ConsoleSummary";
import { ConsolePageHeader } from "../src/components/layout/ConsolePageHeader";
import { LanguageContext } from "../src/context/Language";

function renderWithLanguage(children: ReactNode) {
  render(
    <LanguageContext.Provider
      value={{
        language: "en",
        setLanguage: () => undefined,
        translationVersion: 0,
      }}
    >
      {children}
    </LanguageContext.Provider>,
  );
}

test("console page header exposes one title, description, and action", () => {
  renderWithLanguage(
    <ConsolePageHeader
      action={<button type="button">Refresh</button>}
      descriptionId="Review request usage, token counts, and billing details."
      titleId="Usage details"
    />,
  );

  expect(
    screen.getByRole("heading", { level: 1, name: "Usage details" }),
  ).toBeTruthy();
  expect(
    screen.getByText(
      "Review request usage, token counts, and billing details.",
    ),
  ).toBeTruthy();
  expect(screen.getByRole("button", { name: "Refresh" })).toBeTruthy();
});

test("console summary exposes operational values as a named list", () => {
  renderWithLanguage(
    <ConsoleSummary
      items={[
        { labelId: "Wallet balance", value: "$20.00" },
        { labelId: "Today used", value: "$1.50" },
      ]}
    />,
  );

  const summary = screen.getByRole("list", { name: "Account overview" });
  expect(summary.querySelectorAll("li")).toHaveLength(2);
  expect(screen.getByText("$20.00")).toBeTruthy();
  expect(screen.getByText("$1.50")).toBeTruthy();
});
