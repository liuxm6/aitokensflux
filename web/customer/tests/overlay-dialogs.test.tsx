import { afterEach, expect, mock, test } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps, ReactNode } from "react";
import { createSetupPage } from "../src/components/setup/SetupPage";
import { AuthPage } from "../src/pages/Auth";

const originalMatchMedia = window.matchMedia;
const originalFetch = globalThis.fetch;

function installReducedMotion() {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => true,
    }),
  });
}

function createRoot() {
  const root = document.createElement("div");
  root.id = "root";
  document.body.append(root);
  return root;
}

function installStatusResponse() {
  globalThis.fetch = mock(async () =>
    Response.json({ success: true, data: {} }),
  ) as typeof fetch;
}

afterEach(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: originalMatchMedia,
  });
  globalThis.fetch = originalFetch;
});

test("modal auth uses the shared dialog background and Escape handling", async () => {
  installReducedMotion();
  installStatusResponse();
  window.history.replaceState(null, "", "/sign-in");
  const onClose = mock(() => undefined);
  const root = createRoot();

  render(<AuthPage modal onClose={onClose} />, { container: root });

  expect(screen.getByRole("dialog")).toBeTruthy();
  expect(root.hasAttribute("inert")).toBe(true);

  await userEvent.setup({ document }).keyboard("{Escape}");
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
});

test("modal setup uses the shared dialog without changing wizard stages", async () => {
  installReducedMotion();
  const onClose = mock(() => undefined);
  const root = createRoot();
  const SetupPage = createSetupPage({
    MarketingHeader: () => null,
    Pill: ({ children }: { children: ReactNode }) => <>{children}</>,
    T: ({ id, zh, en }: { id?: string; zh?: string; en?: string }) => (
      <>{id ?? zh ?? en}</>
    ),
    AppLink: ({
      href,
      className,
      children,
    }: ComponentProps<"a"> & { href: string }) => (
      <a className={className} href={href}>
        {children}
      </a>
    ),
    CodeBlock: ({ value }: { value: string }) => <pre>{value}</pre>,
    fetchCustomerStatus: () => new Promise(() => undefined),
    getConfiguredServerAddress: () => "http://localhost:3000",
    navigateTo: () => undefined,
  });

  render(<SetupPage modal onClose={onClose} />, { container: root });

  expect(screen.getByRole("dialog", { name: "配置文档" })).toBeTruthy();
  expect(screen.getByText("Which tool do you want to configure?")).toBeTruthy();
  expect(root.hasAttribute("inert")).toBe(true);

  await userEvent.setup({ document }).keyboard("{Escape}");
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
});
