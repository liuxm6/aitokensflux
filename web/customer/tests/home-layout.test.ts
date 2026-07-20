import { expect, test } from "bun:test";
import {
  HERO_MODELS,
  HOME_DESTINATIONS,
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

test("homepage destinations and pricing headings remain distinct", () => {
  expect(HOME_DESTINATIONS).toEqual({
    dashboard: "/dashboard",
    onboarding: "/sign-in",
    plans: "/subscribe",
    setup: "/setup",
    support: "/#support",
  });
  expect(HOME_SECTION_HEADINGS.modelRates).toBe("Model rates");
  expect(HOME_SECTION_HEADINGS.plansBalance).toBe("Plans and balance");
  expect(HOME_SECTION_HEADINGS.modelRates).not.toBe(
    HOME_SECTION_HEADINGS.plansBalance,
  );
});
