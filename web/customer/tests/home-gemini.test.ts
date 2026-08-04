import { describe, expect, test } from "bun:test";
import {
  classifyFallbackGroup,
  groupPricing,
  HERO_MODEL_PAIRS,
  HERO_MODELS,
} from "../src/pages/Home";
import type { ModelPricingData } from "../src/types";

describe("homepage Gemini pricing group", () => {
  test("classifies Gemini without grouping unrelated Google models", () => {
    expect(classifyFallbackGroup("gemini-2.5-pro", "Google")).toBe("gemini");
    expect(classifyFallbackGroup("gemini-2.5-flash")).toBe("gemini");
    expect(classifyFallbackGroup("google-embedding-001", "Google")).toBeNull();
  });

  test("uses explicit Gemini membership, multiplier, and group note", () => {
    const source: ModelPricingData = {
      group_ratio: { gemini: 0.8 },
      usable_group: { gemini: "gm-Pro" },
      vendors: [
        { id: 1, name: "OpenAI" },
        { id: 4, name: "Google" },
      ],
      data: [
        {
          model_name: "gemini-2.5-pro",
          quota_type: 0,
          model_ratio: 0.625,
          model_price: 0,
          completion_ratio: 4,
          cache_ratio: 0.1,
          vendor_id: 4,
          enable_groups: ["gemini"],
        },
        {
          model_name: "gemini-explicit",
          quota_type: 0,
          model_ratio: 0.5,
          model_price: 0,
          completion_ratio: 2,
          vendor_id: 1,
          enable_groups: ["gemini"],
        },
      ],
    };

    const grouped = groupPricing(source);

    expect(grouped.gemini.ratio).toBe(0.8);
    expect(grouped.gemini.note).toBe("gm-Pro");
    expect(grouped.gemini.rows.map((row) => row.name)).toEqual([
      "gemini-2.5-pro",
      "gemini-explicit",
    ]);
    expect(grouped.gemini.rows[0]?.input).toBe(1);
    expect(grouped.codex.rows).toHaveLength(0);
  });

  test("falls back to provider grouping for backend business groups", () => {
    const source: ModelPricingData = {
      vendors: [
        { id: 1, name: "Anthropic" },
        { id: 2, name: "OpenAI" },
      ],
      data: [
        {
          model_name: "claude-opus-4-8",
          quota_type: 0,
          model_ratio: 2.5,
          model_price: 0,
          completion_ratio: 5,
          vendor_id: 1,
          enable_groups: ["default"],
        },
        {
          model_name: "gpt-4.1",
          quota_type: 0,
          model_ratio: 1,
          model_price: 0,
          completion_ratio: 2,
          vendor_id: 2,
          enable_groups: ["vip"],
        },
      ],
    };

    const grouped = groupPricing(source);

    expect(grouped.claude.rows.map((row) => row.name)).toEqual([
      "claude-opus-4-8",
    ]);
    expect(grouped.codex.rows.map((row) => row.name)).toEqual(["gpt-4.1"]);
  });
});

describe("homepage Gemini hero rotation", () => {
  test("places Google Gemini after Grok", () => {
    expect(HERO_MODELS.map(({ id, label }) => [id, label])).toEqual([
      ["claude", "Claude Code"],
      ["openai", "OpenAI Codex"],
      ["grok", "Grok Code"],
      ["gemini", "Google Gemini"],
    ]);
  });

  test("cycles through the four approved adjacent pairs", () => {
    expect(HERO_MODEL_PAIRS.map((pair) => pair.map(({ id }) => id))).toEqual([
      ["claude", "openai"],
      ["openai", "grok"],
      ["grok", "gemini"],
      ["gemini", "claude"],
    ]);
  });
});
