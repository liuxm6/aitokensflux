import { afterEach, expect, test } from "bun:test";
import { act, render, screen } from "@testing-library/react";
import { MarketingHeader } from "../src/components/layout/MarketingHeader";
import { AuthContext } from "../src/context/Auth";
import { LanguageContext } from "../src/context/Language";

const originalPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

function renderHeader() {
  return render(
    <AuthContext.Provider
      value={{
        user: null,
        authChecking: false,
        setUser: () => undefined,
        signOut: async () => undefined,
      }}
    >
      <LanguageContext.Provider
        value={{
          language: "en",
          setLanguage: () => undefined,
          translationVersion: 0,
        }}
      >
        <MarketingHeader />
      </LanguageContext.Provider>
    </AuthContext.Provider>,
  );
}

afterEach(() => {
  window.history.replaceState(null, "", originalPath);
});

test("marketing header marks the current public page", () => {
  window.history.replaceState(null, "", "/docs");
  renderHeader();

  expect(
    screen.getByRole("link", { name: "Docs" }).getAttribute("aria-current"),
  ).toBe("page");
  expect(
    screen.getByRole("link", { name: "Pricing" }).getAttribute("aria-current"),
  ).toBeNull();

  act(() => {
    window.history.pushState(null, "", "/pricing");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });

  expect(
    screen.getByRole("link", { name: "Pricing" }).getAttribute("aria-current"),
  ).toBe("page");
  expect(
    screen.getByRole("link", { name: "Docs" }).getAttribute("aria-current"),
  ).toBeNull();
});
