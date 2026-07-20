import { describe, expect, test } from "bun:test";
import { classifyFallbackGroup, groupPricing } from "../src/pages/Home";
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
});
