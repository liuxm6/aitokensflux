import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { Footer } from "../src/components/layout/Footer";
import { LanguageContext } from "../src/context/Language";

test("footer exposes distinct server and model status destinations", () => {
  render(
    <LanguageContext.Provider
      value={{
        language: "en",
        setLanguage: () => undefined,
        translationVersion: 0,
      }}
    >
      <Footer />
    </LanguageContext.Provider>,
  );

  expect(
    screen.getByRole("link", { name: "Service status" }).getAttribute("href"),
  ).toBe("https://status.aitokensflux.com");
  expect(
    screen.getByRole("link", { name: "Model status" }).getAttribute("href"),
  ).toBe("https://check.aitokensflux.com/group/TokenFlux");
  expect(screen.getByRole("link", { name: "Terms" }).getAttribute("href")).toBe(
    "/en/user-agreement",
  );
  expect(
    screen.getByRole("link", { name: "Features" }).getAttribute("href"),
  ).toBe("/en#features");
  expect(screen.getByRole("link", { name: "About" }).getAttribute("href")).toBe(
    "/en",
  );
  expect(screen.queryByRole("link", { name: "Usage" })).toBeNull();
  expect(screen.queryByRole("link", { name: "API keys" })).toBeNull();
  expect(document.querySelector(".footer-domain")).toBeNull();
});

test("footer uses the shortened Chinese labels", () => {
  render(
    <LanguageContext.Provider
      value={{
        language: "zh",
        setLanguage: () => undefined,
        translationVersion: 0,
      }}
    >
      <Footer />
    </LanguageContext.Provider>,
  );

  expect(screen.getByRole("link", { name: "服务状态" })).toBeTruthy();
  expect(screen.getByRole("link", { name: "服务条款" })).toBeTruthy();
  expect(screen.getByRole("link", { name: "特性" }).getAttribute("href")).toBe(
    "/#features",
  );
  expect(
    screen.getByRole("link", { name: "关于我们" }).getAttribute("href"),
  ).toBe("/");
  expect(screen.queryByRole("link", { name: "用量明细" })).toBeNull();
  expect(screen.queryByRole("link", { name: "API 密钥" })).toBeNull();
});
