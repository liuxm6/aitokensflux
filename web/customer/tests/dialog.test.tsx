import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { AccessibleDialog } from "../src/components/common/ui/Dialog";

function DialogHarness({ closeDisabled = false }: { closeDisabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const initialFocusRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open dialog
      </button>
      {open ? (
        <AccessibleDialog
          ariaLabel="Account actions"
          backdropClassName="backdrop"
          className="dialog"
          closeDisabled={closeDisabled}
          closeLabel="Close dialog"
          initialFocusRef={initialFocusRef}
          panelClassName="panel"
          onClose={() => setOpen(false)}
        >
          <button ref={initialFocusRef} type="button">
            First action
          </button>
          <button type="button">Last action</button>
        </AccessibleDialog>
      ) : null}
    </>
  );
}

test("dialog traps focus, closes with Escape, and restores the trigger", async () => {
  const user = userEvent.setup({ document });
  const root = document.createElement("div");
  root.id = "root";
  document.body.append(root);
  render(<DialogHarness />, { container: root });

  const trigger = screen.getByRole("button", { name: "Open dialog" });
  await user.click(trigger);

  expect(screen.getByRole("dialog", { name: "Account actions" })).toBeTruthy();
  expect(root.hasAttribute("inert")).toBe(true);
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "First action" }),
  );

  await user.tab();
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Last action" }),
  );
  await user.tab();
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "First action" }),
  );
  await user.tab({ shift: true });
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Last action" }),
  );

  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(root.hasAttribute("inert")).toBe(false);
  expect(document.activeElement).toBe(trigger);
});

test("dialog ignores backdrop and Escape while closing is disabled", async () => {
  const user = userEvent.setup({ document });
  const root = document.createElement("div");
  root.id = "root";
  document.body.append(root);
  render(<DialogHarness closeDisabled />, { container: root });

  await user.click(screen.getByRole("button", { name: "Open dialog" }));
  await user.keyboard("{Escape}");
  expect(screen.getByRole("dialog")).toBeTruthy();

  const backdrop = screen.getByRole("button", { name: "Close dialog" });
  expect((backdrop as HTMLButtonElement).disabled).toBe(true);
  await user.click(backdrop);
  expect(screen.getByRole("dialog")).toBeTruthy();
});
