import { expect, mock, test } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiKeyFormDialog } from "../src/components/token/ApiKeyFormDialog";
import { CCSwitchImportDialog } from "../src/components/token/CCSwitchImportDialog";
import { LanguageContext } from "../src/context/Language";
import { getDefaultApiKeyCreateForm } from "../src/helpers/format";

function createRoot() {
  const root = document.createElement("div");
  root.id = "root";
  document.body.append(root);
  return root;
}

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

test("the key form dialog names itself by its heading and traps the page behind it", () => {
  const root = createRoot();

  render(
    <English>
      <ApiKeyFormDialog
        form={getDefaultApiKeyCreateForm()}
        groupOptions={[]}
        groupsLoading={false}
        mode="create"
        status={null}
        submitting={false}
        onChange={() => undefined}
        onClose={() => undefined}
        onSubmit={() => undefined}
      />
    </English>,
    { container: root },
  );

  expect(screen.getByRole("dialog", { name: "Create key" })).toBeTruthy();
  expect(root.hasAttribute("inert")).toBe(true);
});

test("the key form dialog switches to edit copy and shows the key it edits", () => {
  const root = createRoot();

  render(
    <English>
      <ApiKeyFormDialog
        form={getDefaultApiKeyCreateForm()}
        groupOptions={[]}
        groupsLoading={false}
        mode="edit"
        status={null}
        submitting={false}
        tokenName="Production"
        onChange={() => undefined}
        onClose={() => undefined}
        onSubmit={() => undefined}
      />
    </English>,
    { container: root },
  );

  const dialog = screen.getByRole("dialog", { name: "Edit key" });

  expect(dialog.textContent).toContain("Production");
  expect(screen.getByRole("button", { name: "Save changes" })).toBeTruthy();
});

test("Escape closes the key form dialog unless a submission is in flight", async () => {
  const onClose = mock(() => undefined);
  const root = createRoot();

  const view = render(
    <English>
      <ApiKeyFormDialog
        form={getDefaultApiKeyCreateForm()}
        groupOptions={[]}
        groupsLoading={false}
        mode="create"
        status={null}
        submitting
        onChange={() => undefined}
        onClose={onClose}
        onSubmit={() => undefined}
      />
    </English>,
    { container: root },
  );

  await userEvent.setup({ document }).keyboard("{Escape}");
  expect(onClose).toHaveBeenCalledTimes(0);

  view.rerender(
    <English>
      <ApiKeyFormDialog
        form={getDefaultApiKeyCreateForm()}
        groupOptions={[]}
        groupsLoading={false}
        mode="create"
        status={null}
        submitting={false}
        onChange={() => undefined}
        onClose={onClose}
        onSubmit={() => undefined}
      />
    </English>,
  );

  await userEvent.setup({ document }).keyboard("{Escape}");
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
});

test("the CC Switch dialog restores focus to the control that opened it", async () => {
  const opener = document.createElement("button");
  document.body.append(opener);
  const root = createRoot();
  opener.focus();

  const view = render(
    <English>
      <CCSwitchImportDialog
        app="claude"
        modelOptions={["claude-sonnet-4.6"]}
        models={{ model: "claude-sonnet-4.6" }}
        modelsLoading={false}
        name="My Claude"
        tokenName="Production"
        onAppChange={() => undefined}
        onChangeModels={() => undefined}
        onChangeName={() => undefined}
        onClose={() => undefined}
        onSubmit={() => undefined}
      />
    </English>,
    { container: root },
  );

  const dialog = screen.getByRole("dialog", { name: "Import to CC Switch" });
  expect(dialog.contains(document.activeElement)).toBe(true);

  view.unmount();
  expect(document.activeElement).toBe(opener);
  opener.remove();
});
