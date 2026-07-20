import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { AppLink } from "../src/components/common/AppLink";
import { DropdownMenu } from "../src/components/common/ui/DropdownMenu";

function MenuHarness() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("none");

  return (
    <>
      <DropdownMenu
        menuClassName="menu"
        menuLabel="Example actions"
        open={open}
        triggerClassName="trigger"
        triggerContent="Choose action"
        onOpenChange={setOpen}
      >
        <button type="button" onClick={() => setSelected("first")}>
          First action
        </button>
        <button type="button" onClick={() => setSelected("second")}>
          Second action
        </button>
        <button type="button" onClick={() => setSelected("third")}>
          Third action
        </button>
      </DropdownMenu>
      <button type="button">Outside action</button>
      <output>{selected}</output>
    </>
  );
}

test("menu supports roving keyboard focus and Escape restoration", async () => {
  const user = userEvent.setup({ document });
  render(<MenuHarness />);
  const trigger = screen.getByRole("button", { name: "Choose action" });

  trigger.focus();
  await user.keyboard("{ArrowDown}");
  expect(document.activeElement).toBe(
    screen.getByRole("menuitem", { name: "First action" }),
  );

  await user.keyboard("{ArrowDown}");
  expect(document.activeElement).toBe(
    screen.getByRole("menuitem", { name: "Second action" }),
  );
  await user.keyboard("{End}");
  expect(document.activeElement).toBe(
    screen.getByRole("menuitem", { name: "Third action" }),
  );
  await user.keyboard("{Home}");
  expect(document.activeElement).toBe(
    screen.getByRole("menuitem", { name: "First action" }),
  );
  await user.keyboard("{ArrowUp}");
  expect(document.activeElement).toBe(
    screen.getByRole("menuitem", { name: "Third action" }),
  );

  await user.keyboard("{Escape}");
  expect(screen.queryByRole("menu")).toBeNull();
  expect(document.activeElement).toBe(trigger);
});

test("menu closes after selection and outside interaction", async () => {
  const user = userEvent.setup({ document });
  render(<MenuHarness />);
  const trigger = screen.getByRole("button", { name: "Choose action" });

  await user.click(trigger);
  await user.click(screen.getByRole("menuitem", { name: "Second action" }));
  expect(screen.getByText("second")).toBeTruthy();
  expect(screen.queryByRole("menu")).toBeNull();

  await user.click(trigger);
  await user.click(screen.getByRole("button", { name: "Outside action" }));
  expect(screen.queryByRole("menu")).toBeNull();
});

test("menu can focus internal navigation links", async () => {
  const user = userEvent.setup({ document });

  function LinkMenuHarness() {
    const [open, setOpen] = useState(false);
    return (
      <DropdownMenu
        menuClassName="menu"
        menuLabel="Account actions"
        open={open}
        triggerClassName="trigger"
        triggerContent="Account"
        onOpenChange={setOpen}
      >
        <AppLink href="/dashboard">Dashboard</AppLink>
        <button type="button">Sign out</button>
      </DropdownMenu>
    );
  }

  render(<LinkMenuHarness />);
  const trigger = screen.getByRole("button", { name: "Account" });
  trigger.focus();
  await user.keyboard("{ArrowDown}");

  expect(document.activeElement).toBe(
    screen.getByRole("menuitem", { name: "Dashboard" }),
  );
});
