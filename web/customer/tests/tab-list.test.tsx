import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { TabList, TabPanel } from "../src/components/common/ui/TabList";

type Provider = "claude" | "codex" | "gemini";

const tabs = [
  { value: "claude" as Provider, label: "Claude" },
  { value: "codex" as Provider, label: "Codex" },
  { value: "gemini" as Provider, label: "Gemini" },
];

function TabHarness() {
  const [value, setValue] = useState<Provider>("claude");

  return (
    <>
      <TabList
        className="mp-tabs"
        idPrefix="rates"
        label="Model provider"
        tabClassName="mp-tab"
        tabs={tabs}
        value={value}
        onChange={setValue}
      />
      <TabPanel idPrefix="rates" value={value}>
        <p>{value} rates</p>
      </TabPanel>
    </>
  );
}

test("tab list wires each tab to the panel it controls", () => {
  render(<TabHarness />);
  const panel = screen.getByRole("tabpanel");
  const selected = screen.getByRole("tab", { selected: true });

  expect(screen.getByRole("tablist").getAttribute("aria-label")).toBe(
    "Model provider",
  );
  expect(selected.textContent).toBe("Claude");
  expect(selected.getAttribute("aria-controls")).toBe(panel.id);
  expect(panel.getAttribute("aria-labelledby")).toBe(selected.id);
  expect(panel.textContent).toBe("claude rates");
});

test("tab list keeps only the selected tab in the tab order", () => {
  render(<TabHarness />);

  expect(
    screen.getByRole("tab", { name: "Claude" }).getAttribute("tabindex"),
  ).toBe("0");
  expect(
    screen.getByRole("tab", { name: "Codex" }).getAttribute("tabindex"),
  ).toBe("-1");
  expect(
    screen.getByRole("tab", { name: "Gemini" }).getAttribute("tabindex"),
  ).toBe("-1");
});

test("arrow, Home, and End keys move selection and focus together", async () => {
  const user = userEvent.setup({ document });
  render(<TabHarness />);
  screen.getByRole("tab", { name: "Claude" }).focus();

  await user.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(
    screen.getByRole("tab", { name: "Codex" }),
  );
  expect(screen.getByRole("tabpanel").textContent).toBe("codex rates");

  await user.keyboard("{End}");
  expect(document.activeElement).toBe(
    screen.getByRole("tab", { name: "Gemini" }),
  );

  await user.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(
    screen.getByRole("tab", { name: "Claude" }),
  );

  await user.keyboard("{ArrowLeft}");
  expect(document.activeElement).toBe(
    screen.getByRole("tab", { name: "Gemini" }),
  );

  await user.keyboard("{Home}");
  expect(document.activeElement).toBe(
    screen.getByRole("tab", { name: "Claude" }),
  );
  expect(screen.getByRole("tabpanel").textContent).toBe("claude rates");
});

test("selected tab keeps the class the stylesheet targets", async () => {
  const user = userEvent.setup({ document });
  render(<TabHarness />);

  expect(screen.getByRole("tab", { name: "Claude" }).className).toBe(
    "mp-tab active",
  );
  expect(screen.getByRole("tab", { name: "Codex" }).className).toBe("mp-tab");

  await user.click(screen.getByRole("tab", { name: "Codex" }));

  expect(screen.getByRole("tab", { name: "Codex" }).className).toBe(
    "mp-tab active",
  );
  expect(screen.getByRole("tab", { name: "Claude" }).className).toBe("mp-tab");
});
