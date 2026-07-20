import { describe, expect, test } from "bun:test";
import {
  getPageKey,
  isInternalPath,
  shouldPreserveScroll,
} from "../src/helpers/navigation";

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
