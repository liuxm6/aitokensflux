import { readFileSync } from "node:fs";
import { expect, test } from "bun:test";
import {
  HERO_MODELS,
  HOME_DESTINATIONS,
  HOME_HERO_COPY,
  HOME_PRICING_LAYOUT,
  HOME_SECTION_HEADINGS,
  HOME_SECTION_ORDER,
} from "../src/pages/Home";

test("homepage keeps the approved section and provider order", () => {
  expect(HOME_SECTION_ORDER).toEqual([
    "hero",
    "support-benefit",
    "capabilities",
    "model-rates",
    "plans-balance",
    "cta",
    "support",
    "faq",
    "footer",
  ]);
  expect(HERO_MODELS.map((model) => model.label)).toEqual([
    "Claude Code",
    "OpenAI Codex",
    "Grok Code",
    "Google Gemini",
  ]);
});

test("homepage destinations and original presentation copy remain stable", () => {
  expect(HOME_DESTINATIONS).toEqual({
    dashboard: "/dashboard",
    onboarding: "/sign-in",
    plans: "/subscribe",
    setup: "/setup",
    support: "/#support",
  });
  expect(HOME_HERO_COPY).toEqual({
    title: "Get started, effortlessly",
    tagline: "A stable AI coding solution",
    setupCta: "Setup guide",
    primaryCta: "Start now",
  });
  expect(HOME_SECTION_HEADINGS.modelRates).toBe(
    "Pay only for the tokens you use",
  );
  expect(HOME_SECTION_HEADINGS.plansBalance).toBe(
    "Transparent pricing that scales down",
  );
  expect(HOME_SECTION_HEADINGS.modelRates).not.toBe(
    HOME_SECTION_HEADINGS.plansBalance,
  );
});

test("homepage pricing layout adapts table height and empty plan spacing", () => {
  expect(HOME_PRICING_LAYOUT).toEqual({
    tableClassName: "mp-table-wrap mp-table-wrap-adaptive",
    emptyPlansClassName: "pricing-section-empty",
  });
});

test("only the homepage requests the compact desktop marketing header", () => {
  const homeSource = readFileSync(
    new URL("../src/pages/Home/index.tsx", import.meta.url),
    "utf8",
  );
  const connectSource = readFileSync(
    new URL("../src/pages/ATFSwitchConnect/index.tsx", import.meta.url),
    "utf8",
  );
  const fathersDaySource = readFileSync(
    new URL("../src/pages/FathersDay/index.tsx", import.meta.url),
    "utf8",
  );

  expect(homeSource).toContain("<MarketingHeader minimal homePage />");
  expect(connectSource).toContain("<MarketingHeader minimal />");
  expect(connectSource).not.toContain("homePage");
  expect(fathersDaySource).toContain("<MarketingHeader minimal />");
  expect(fathersDaySource).not.toContain("homePage");
});
