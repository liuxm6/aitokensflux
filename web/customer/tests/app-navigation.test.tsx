import { describe, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Component, type ReactNode, Suspense, useState } from "react";
import { RouteFocus } from "../src/components/common/RouteFocus";
import { LanguageButton } from "../src/components/layout/LanguageButton";
import { LanguageContext } from "../src/context/Language";
import {
  getPageKey,
  isInternalPath,
  shouldPreserveScroll,
} from "../src/helpers/navigation";
import { scrollToPosition } from "../src/helpers/motion";
import {
  createLazyPage,
  isLazyPageKey,
  RouteLoadingState,
} from "../src/pages/lazy-pages";
import type { Language } from "../src/types";

class RootCrashBoundary extends Component<
  { children: ReactNode },
  { crashed: boolean }
> {
  state = { crashed: false };

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  render() {
    if (this.state.crashed) return <div role="alert">Application crashed</div>;
    return this.props.children;
  }
}

function LanguageRouteHarness() {
  const [language, setLanguage] = useState<Language>("en");

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, translationVersion: 0 }}
    >
      <LanguageButton />
      <RouteFocus focusRoute language={language} page="usage">
        <main>
          <h1>{language === "zh" ? "用量明细" : "Usage details"}</h1>
        </main>
      </RouteFocus>
    </LanguageContext.Provider>
  );
}

describe("customer route contract", () => {
  test("maps public, protected, alias, and unknown routes", () => {
    expect(getPageKey("/")).toBe("home");
    expect(getPageKey("/dashboard")).toBe("dashboard");
    expect(getPageKey("/dashboard/billing")).toBe("topup");
    expect(getPageKey("/dashboard/usage")).toBe("usage");
    expect(getPageKey("/dashboard/api-key")).toBe("apikeys");
    expect(getPageKey("/dashboard/invite-record")).toBe("invite");
    expect(getPageKey("/dashboard/settings")).toBe("settings");
    expect(getPageKey("/pricing/")).toBe("subscribe");
    expect(getPageKey("/docs")).toBe("setup");
    expect(getPageKey("/oauth/github")).toBe("oauthCallback");
    expect(getPageKey("/missing-page")).toBe("notFound");
  });

  test("preserves scroll only for overlay-style routes", () => {
    expect(shouldPreserveScroll("/sign-in")).toBe(true);
    expect(shouldPreserveScroll("/register/")).toBe(true);
    expect(shouldPreserveScroll("/setup")).toBe(true);
    expect(shouldPreserveScroll("/dashboard")).toBe(false);
  });

  test("recognizes only same-origin links as internal", () => {
    expect(isInternalPath("/dashboard")).toBe(true);
    expect(isInternalPath(`${window.location.origin}/setup`)).toBe(true);
    expect(isInternalPath("https://example.com/dashboard")).toBe(false);
  });
});

describe("route focus and metadata", () => {
  test("updates page metadata, focuses the heading, and exposes a skip target", async () => {
    render(
      <RouteFocus focusRoute language="en" page="usage">
        <main>
          <h1>Usage details</h1>
        </main>
      </RouteFocus>,
    );

    const heading = screen.getByRole("heading", { name: "Usage details" });
    const main = screen.getByRole("main");
    expect(document.title).toBe("Usage · AI Tokens Flux");
    expect(
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content"),
    ).toBe("Review request usage, token counts, and billing details.");
    expect(main.id).toBe("main-content");
    expect(document.activeElement).toBe(heading);

    await userEvent
      .setup({ document })
      .click(screen.getByRole("link", { name: "Skip to content" }));
    expect(document.activeElement).toBe(main);
  });

  test("uses instant scrolling when reduced motion is enabled", () => {
    const originalMatchMedia = window.matchMedia;
    const originalScrollTo = window.scrollTo;
    const scrollTo = mock(() => undefined);
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: () => ({ matches: true }),
    });
    window.scrollTo = scrollTo;

    scrollToPosition(120);

    expect(scrollTo).toHaveBeenCalledWith({ top: 120, behavior: "auto" });
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: originalMatchMedia,
    });
    window.scrollTo = originalScrollTo;
  });

  test("language selection localizes metadata without stealing route focus", async () => {
    const user = userEvent.setup({ document });
    render(<LanguageRouteHarness />);
    const languageTrigger = screen.getByRole("button", { name: "Language" });

    await user.click(languageTrigger);
    await user.click(screen.getByRole("menuitem", { name: "简体中文" }));

    expect(document.title).toBe("用量明细 · AI Tokens Flux");
    expect(document.activeElement?.tagName).toBe("BUTTON");
    expect(document.activeElement?.getAttribute("class")).toBe("lang-btn");
  });
});

describe("route code splitting", () => {
  test("keeps Home eager and marks non-home routes for lazy loading", () => {
    expect(isLazyPageKey("home")).toBe(false);
    expect(isLazyPageKey("dashboard")).toBe(true);
    expect(isLazyPageKey("signin")).toBe(true);
  });

  test("shows a localized route loading state while a page module resolves", () => {
    const PendingPage = createLazyPage(
      () => new Promise<never>(() => undefined),
    );
    render(
      <LanguageContext.Provider
        value={{
          language: "en",
          setLanguage: () => undefined,
          translationVersion: 0,
        }}
      >
        <Suspense fallback={<RouteLoadingState />}>
          <PendingPage />
        </Suspense>
      </LanguageContext.Provider>,
    );

    expect(screen.getByRole("status").textContent).toContain("Loading page");
  });

  test("retries a rejected route with a fresh lazy loader", async () => {
    let attempts = 0;
    const RecoveringPage = createLazyPage(() => {
      attempts += 1;
      if (attempts === 1) return Promise.reject(new Error("chunk unavailable"));
      return Promise.resolve({
        default: () => (
          <main>
            <h1>Recovered route</h1>
          </main>
        ),
      });
    });
    const originalConsoleError = console.error;
    console.error = mock(() => undefined);

    try {
      render(
        <LanguageContext.Provider
          value={{
            language: "en",
            setLanguage: () => undefined,
            translationVersion: 0,
          }}
        >
          <RootCrashBoundary>
            <Suspense fallback={<RouteLoadingState />}>
              <RecoveringPage />
            </Suspense>
          </RootCrashBoundary>
        </LanguageContext.Provider>,
      );

      expect((await screen.findByRole("alert")).textContent).toContain(
        "Failed to load page",
      );
      expect(attempts).toBe(1);

      await userEvent
        .setup({ document })
        .click(screen.getByRole("button", { name: "Try again" }));

      expect(
        await screen.findByRole("heading", { name: "Recovered route" }),
      ).toBeTruthy();
      expect(attempts).toBe(2);
      expect(screen.queryByText("Application crashed")).toBeNull();
    } finally {
      console.error = originalConsoleError;
    }
  });
});
