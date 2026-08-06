import { afterEach, expect, mock, test } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps, ReactNode } from "react";
import { createSetupPage } from "../src/components/setup/SetupPage";
import { PlanPurchaseDialog } from "../src/components/topup/PlanPurchaseDialog";
import { PurchaseProgressDialog } from "../src/components/topup/PurchaseProgressDialog";
import { LanguageContext } from "../src/context/Language";
import { ToastProvider } from "../src/context/Toast";
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

test("auth validation renders beside the first invalid field and moves focus", async () => {
  installReducedMotion();
  installStatusResponse();
  window.history.replaceState(null, "", "/sign-in");
  const root = createRoot();

  render(
    <LanguageContext.Provider
      value={{
        language: "en",
        setLanguage: () => undefined,
        translationVersion: 0,
      }}
    >
      <ToastProvider>
        <AuthPage modal onClose={() => undefined} />
      </ToastProvider>
    </LanguageContext.Provider>,
    { container: root },
  );

  await userEvent
    .setup({ document })
    .click(screen.getByRole("button", { name: "Sign in" }));

  const accountInput = screen.getByLabelText("Email / username");
  expect(screen.getByRole("alert").textContent).toBe(
    "Enter your email or username, up to 50 characters",
  );
  expect(accountInput.getAttribute("aria-invalid")).toBe("true");
  expect(document.activeElement).toBe(accountInput);
});

test("purchase dialogs keep their heading outside the scrollable body", () => {
  const root = createRoot();

  render(
    <LanguageContext.Provider
      value={{
        language: "en",
        setLanguage: () => undefined,
        translationVersion: 0,
      }}
    >
      <PlanPurchaseDialog
        onClose={() => undefined}
        onPay={() => undefined}
        onSelectedEpayMethodChange={() => undefined}
        plan={{
          name: "Pro",
          price: "$20",
          suffixZh: "",
          suffixEn: "",
          saveZh: "",
          saveEn: "",
          rate: "",
          ctaZh: "",
          ctaEn: "",
          tint: "mint",
          featuresZh: [],
          featuresEn: [],
          priceAmount: 20,
          requiredQuota: 10_000_000,
          quotaLabelZh: "$20",
          quotaLabelEn: "$20",
          periodLabelZh: "每月",
          periodLabelEn: "Monthly",
          resetLabelZh: "每月重置",
          resetLabelEn: "Monthly reset",
          paymentLabelZh: "在线支付",
          paymentLabelEn: "Online payment",
        }}
        purchaseCount={0}
        selectedEpayMethod=""
        status={{ quota_per_unit: 500_000 }}
        topupInfo={null}
        userQuota={20_000_000}
      />
    </LanguageContext.Provider>,
    { container: root },
  );

  const dialog = screen.getByRole("dialog", {
    name: "Purchase subscription",
  });
  const heading = dialog.querySelector(".purchase-head");
  const body = dialog.querySelector(".purchase-dialog-body");

  expect(heading).toBeTruthy();
  expect(body).toBeTruthy();
  expect(heading?.nextElementSibling).toBe(body);
});

test("purchase progress keeps steps and actions in the scrollable body", () => {
  const root = createRoot();

  render(
    <LanguageContext.Provider
      value={{
        language: "en",
        setLanguage: () => undefined,
        translationVersion: 0,
      }}
    >
      <PurchaseProgressDialog
        onClose={() => undefined}
        onLaunch={() => undefined}
        progress={{
          planName: "Pro",
          steps: {
            order: "done",
            paymentInfo: "done",
            launch: "done",
          },
          message: "Payment page ready",
          canClose: true,
          launch: { type: "url", url: "https://example.com" },
        }}
      />
    </LanguageContext.Provider>,
    { container: root },
  );

  const dialog = screen.getByRole("dialog", { name: "Payment page ready" });
  const body = dialog.querySelector(".purchase-dialog-body");

  expect(body).toBeTruthy();
  expect(body?.querySelector(".purchase-steps")).toBeTruthy();
  expect(body?.querySelector(".purchase-actions")).toBeTruthy();
});
