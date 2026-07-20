import { describe, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouteFocus } from "../src/components/common/RouteFocus";
import {
  getPageKey,
  isInternalPath,
  shouldPreserveScroll,
} from "../src/helpers/navigation";
import { scrollToPosition } from "../src/helpers/motion";

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
});
