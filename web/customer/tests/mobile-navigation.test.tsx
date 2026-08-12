import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CustomerShell } from "../src/components/layout/CustomerShell";
import { LanguageContext } from "../src/context/Language";

test("mobile navigation moves focus, makes content inert, and closes on Escape", async () => {
  const user = userEvent.setup({ document });
  render(
    <LanguageContext.Provider
      value={{
        language: "en",
        setLanguage: () => undefined,
        translationVersion: 0,
      }}
    >
      <CustomerShell crumbId="Dashboard" page="dashboard">
        <h1>Dashboard content</h1>
      </CustomerShell>
    </LanguageContext.Provider>,
  );

  const trigger = screen.getByRole("button", { name: "Open navigation" });
  const main = screen.getByRole("main");
  const applicationMain = main.closest(".main");
  await user.click(trigger);

  const closeButton = screen.getByRole("button", { name: "Close navigation" });
  expect(applicationMain?.hasAttribute("inert")).toBe(true);
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  expect(document.activeElement).toBe(closeButton);

  await user.keyboard("{Escape}");
  expect(applicationMain?.hasAttribute("inert")).toBe(false);
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(document.activeElement).toBe(trigger);
});

test("mobile navigation keeps Tab inside the open drawer", async () => {
  const user = userEvent.setup({ document });
  render(
    <LanguageContext.Provider
      value={{
        language: "en",
        setLanguage: () => undefined,
        translationVersion: 0,
      }}
    >
      <CustomerShell crumbId="Dashboard" page="dashboard">
        <h1>Dashboard content</h1>
      </CustomerShell>
    </LanguageContext.Provider>,
  );

  await user.click(screen.getByRole("button", { name: "Open navigation" }));

  const drawer = screen.getByRole("complementary", {
    name: "Customer navigation",
  });
  const focusable = Array.from(
    drawer.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  last.focus();
  await user.tab();
  expect(document.activeElement).toBe(first);

  await user.tab({ shift: true });
  expect(document.activeElement).toBe(last);
});
