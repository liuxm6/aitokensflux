import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { AccessibleDialog } from "../src/components/common/ui/Dialog";
import { LanguageContext } from "../src/context/Language";
import { ToastProvider, useToast } from "../src/context/Toast";

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

function NestedDialogHarness() {
  const [outerOpen, setOuterOpen] = useState(false);
  const [innerOpen, setInnerOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOuterOpen(true)}>
        Open outer dialog
      </button>
      {outerOpen ? (
        <AccessibleDialog
          ariaLabel="Outer dialog"
          backdropClassName="backdrop"
          className="dialog"
          closeLabel="Close outer dialog"
          panelClassName="panel"
          onClose={() => setOuterOpen(false)}
        >
          <button type="button" onClick={() => setInnerOpen(true)}>
            Open inner dialog
          </button>
          {innerOpen ? (
            <AccessibleDialog
              ariaLabel="Inner dialog"
              backdropClassName="backdrop"
              className="dialog"
              closeLabel="Close inner dialog"
              panelClassName="panel"
              onClose={() => setInnerOpen(false)}
            >
              <button type="button">Inner action</button>
            </AccessibleDialog>
          ) : null}
        </AccessibleDialog>
      ) : null}
    </>
  );
}

function ToastAction() {
  const notify = useToast();

  return (
    <button
      type="button"
      onClick={() =>
        notify({ message: "Dialog action completed", duration: 0 })
      }
    >
      Complete action
    </button>
  );
}

function ToastDialogHarness() {
  const [open, setOpen] = useState(false);

  return (
    <LanguageContext.Provider
      value={{
        language: "en",
        setLanguage: () => undefined,
        translationVersion: 0,
      }}
    >
      <ToastProvider>
        <button type="button" onClick={() => setOpen(true)}>
          Open toast dialog
        </button>
        {open ? (
          <AccessibleDialog
            ariaLabel="Toast dialog"
            backdropClassName="backdrop"
            className="dialog"
            closeLabel="Close dialog"
            panelClassName="panel"
            onClose={() => setOpen(false)}
          >
            <ToastAction />
          </AccessibleDialog>
        ) : null}
      </ToastProvider>
    </LanguageContext.Provider>
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

test("nested dialogs expose and restore only the topmost layer", async () => {
  const user = userEvent.setup({ document });
  const root = document.createElement("div");
  root.id = "root";
  document.body.append(root);
  render(<NestedDialogHarness />, { container: root });

  await user.click(screen.getByRole("button", { name: "Open outer dialog" }));
  await user.click(screen.getByRole("button", { name: "Open inner dialog" }));

  const outerDialog = screen
    .getAllByRole("dialog", { hidden: true })
    .find((dialog) => dialog.getAttribute("aria-label") === "Outer dialog");
  const innerDialog = screen.getByRole("dialog", { name: "Inner dialog" });
  expect(outerDialog?.getAttribute("aria-hidden")).toBe("true");
  expect(outerDialog?.hasAttribute("inert")).toBe(true);
  expect(innerDialog.hasAttribute("aria-hidden")).toBe(false);
  expect(innerDialog.hasAttribute("inert")).toBe(false);

  await user.keyboard("{Escape}");

  expect(screen.queryByRole("dialog", { name: "Inner dialog" })).toBeNull();
  expect(screen.getByRole("dialog", { name: "Outer dialog" })).toBeTruthy();
  expect(outerDialog?.hasAttribute("aria-hidden")).toBe(false);
  expect(outerDialog?.hasAttribute("inert")).toBe(false);
  expect(root.hasAttribute("inert")).toBe(true);
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Open inner dialog" }),
  );
});

test("dialog toasts stay exposed outside the inert application root", async () => {
  const user = userEvent.setup({ document });
  const root = document.createElement("div");
  root.id = "root";
  document.body.append(root);
  render(<ToastDialogHarness />, { container: root });

  await user.click(screen.getByRole("button", { name: "Open toast dialog" }));
  await user.click(screen.getByRole("button", { name: "Complete action" }));

  const message = screen.getByText("Dialog action completed");
  const viewport = message.closest(".toast-viewport");
  expect(viewport).toBeTruthy();
  expect(root.contains(viewport)).toBe(false);
  expect(viewport?.closest('[aria-hidden="true"]')).toBeNull();

  await user.click(screen.getByRole("button", { name: "Close" }));
  expect(screen.queryByText("Dialog action completed")).toBeNull();
});
