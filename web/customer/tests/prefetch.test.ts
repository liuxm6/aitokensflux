import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { getPrefetchPageKey } from "../src/helpers/prefetch";

test("prefetch warms overlay and console destinations, not the homepage", () => {
  expect(getPrefetchPageKey("/sign-in")).toBe("signin");
  expect(getPrefetchPageKey("/register")).toBe("signup");
  expect(getPrefetchPageKey("/docs")).toBe("setup");
  expect(getPrefetchPageKey("/en/docs")).toBe("setup");
  expect(getPrefetchPageKey("/pricing")).toBe("subscribe");
  expect(getPrefetchPageKey("/dashboard")).toBe("dashboard");
  expect(getPrefetchPageKey("/dashboard/api-key")).toBe("apikeys");
  expect(getPrefetchPageKey("/")).toBeNull();
  expect(getPrefetchPageKey("/#features")).toBeNull();
  expect(getPrefetchPageKey("https://example.com/docs")).toBeNull();
});

test("internal links prefetch their destination before navigation", () => {
  const appLinkSource = readFileSync(
    new URL("../src/components/common/AppLink.tsx", import.meta.url),
    "utf8",
  );
  const homeSource = readFileSync(
    new URL("../src/pages/Home/index.tsx", import.meta.url),
    "utf8",
  );

  expect(appLinkSource).toContain("prefetchHref(resolvedHref)");
  expect(appLinkSource).toContain("onPointerEnter");
  expect(homeSource).toContain("prefetchLikelyNextPages");
});
