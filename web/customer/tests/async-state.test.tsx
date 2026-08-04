import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../src/components/common/ui/AsyncState";
import { DataTable } from "../src/components/table/DataTable";
import { LanguageContext } from "../src/context/Language";

function English({ children }: { children: React.ReactNode }) {
  return (
    <LanguageContext.Provider
      value={{
        language: "en",
        setLanguage: () => undefined,
        translationVersion: 0,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

test("async states distinguish loading, empty, and recoverable errors", async () => {
  const retry = mock(() => undefined);
  const { rerender } = render(
    <English>
      <LoadingState id="Loading records" />
    </English>,
  );
  const loading = screen.getByRole("status");
  expect(loading.getAttribute("aria-busy")).toBe("true");
  expect(loading.querySelectorAll(".state-skeleton-line").length).toBe(3);

  rerender(
    <English>
      <EmptyState
        action={<button type="button">Create API key</button>}
        id="No records yet"
      />
    </English>,
  );
  expect(screen.getByText("No records yet")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Create API key" })).toBeTruthy();

  rerender(
    <English>
      <ErrorState id="Failed to load records" onRetry={retry} />
    </English>,
  );
  await userEvent
    .setup({ document })
    .click(screen.getByRole("button", { name: "Try again" }));
  expect(retry).toHaveBeenCalledTimes(1);
});

test("data table exposes captioned headers and mobile labels", () => {
  render(
    <English>
      <DataTable
        caption="Usage records"
        captionId="usage-records-caption"
        headers={["Model", "Cost"]}
        mobileLabels={["Model", "Billed cost"]}
        rows={[["gpt-5", "$1.20"]]}
      />
    </English>,
  );

  const region = screen.getByRole("region", { name: "Usage records" });
  expect(region.getAttribute("tabindex")).toBe("0");
  expect(screen.getByText("Usage records").tagName).toBe("CAPTION");
  expect(screen.getAllByRole("columnheader")[0]?.getAttribute("scope")).toBe(
    "col",
  );
  expect(screen.getByText("$1.20").getAttribute("data-label")).toBe(
    "Billed cost",
  );
});
