import type { ModelPricingData, PricingModel } from "../types";

export type PricingGroup = "claude" | "codex" | "grok" | "gemini";

export type PriceRow = {
  name: string;
  input: number | null;
  output: number | null;
  cacheRead: number | null;
  perCall: number | null;
};

export type GroupPricingRows = {
  ratio: number;
  note: string;
  rows: PriceRow[];
};

const RATIO_TO_USD_PER_M = 2;
export const PRICING_GROUP_ORDER: PricingGroup[] = [
  "claude",
  "codex",
  "grok",
  "gemini",
];

export function classifyFallbackGroup(
  modelName: string,
  vendorName?: string,
  ownerBy?: string,
): PricingGroup | null {
  const vendor = `${vendorName ?? ""} ${ownerBy ?? ""}`.toLowerCase();
  const name = modelName.toLowerCase();
  if (vendor.includes("anthropic")) return "claude";
  if (vendor.includes("openai")) return "codex";
  if (vendor.includes("xai") || vendor.includes("grok")) return "grok";
  if (
    vendor.includes("gemini") ||
    ((vendor.includes("google") || vendor.includes("deepmind")) &&
      name.includes("gemini"))
  ) {
    return "gemini";
  }
  if (name.includes("claude")) return "claude";
  if (name.includes("grok") || name.includes("xai")) return "grok";
  if (name.includes("gemini")) return "gemini";
  if (
    /^(gpt|chatgpt|codex|o1|o3|o4|text-embedding|dall-e|whisper|davinci|babbage|tts)/.test(
      name,
    )
  ) {
    return "codex";
  }
  return null;
}

function modelBelongsToGroup(
  model: PricingModel,
  group: PricingGroup,
  vendorName?: string,
): boolean {
  const enableGroups = Array.isArray(model.enable_groups)
    ? model.enable_groups
    : [];
  const explicitPricingGroups = enableGroups.filter(
    (value) =>
      value === "all" || PRICING_GROUP_ORDER.includes(value as PricingGroup),
  );
  if (
    explicitPricingGroups.includes(group) ||
    explicitPricingGroups.includes("all")
  ) {
    return true;
  }
  if (explicitPricingGroups.length > 0) return false;
  return (
    classifyFallbackGroup(model.model_name, vendorName, model.owner_by) ===
    group
  );
}

function toPriceRow(model: PricingModel, groupRatio: number): PriceRow {
  if (model.quota_type === 1) {
    return {
      name: model.model_name,
      input: null,
      output: null,
      cacheRead: null,
      perCall: model.model_price * groupRatio,
    };
  }
  const input = model.model_ratio * RATIO_TO_USD_PER_M * groupRatio;
  return {
    name: model.model_name,
    input,
    output: input * (model.completion_ratio || 0),
    cacheRead: model.cache_ratio != null ? input * model.cache_ratio : null,
    perCall: null,
  };
}

export function formatUsd(value: number | null): string {
  if (value == null) return "-";
  if (value === 0) return "$0";
  const digits = value < 0.01 ? 4 : 2;
  return `$${value.toFixed(digits)}`;
}

function comparePriceRows(a: PriceRow, b: PriceRow) {
  return (b.input ?? -1) - (a.input ?? -1) || a.name.localeCompare(b.name);
}

export function formatGroupMultiplier(value: number): string {
  if (!Number.isFinite(value)) return "1x";
  return `${Number(value.toFixed(4))}x`;
}

export function groupPricing(
  source: ModelPricingData,
): Record<PricingGroup, GroupPricingRows> {
  const vendorName = new Map<number, string>();
  for (const vendor of source.vendors ?? [])
    vendorName.set(vendor.id, vendor.name);
  const grouped: Record<PricingGroup, GroupPricingRows> = {
    claude: {
      ratio: source.group_ratio?.claude ?? 1,
      note: source.usable_group?.claude ?? "",
      rows: [],
    },
    codex: {
      ratio: source.group_ratio?.codex ?? 1,
      note: source.usable_group?.codex ?? "",
      rows: [],
    },
    grok: {
      ratio: source.group_ratio?.grok ?? 1,
      note: source.usable_group?.grok ?? "",
      rows: [],
    },
    gemini: {
      ratio: source.group_ratio?.gemini ?? 1,
      note: source.usable_group?.gemini ?? "",
      rows: [],
    },
  };
  for (const model of source.data ?? []) {
    const vendor =
      model.vendor_id != null ? vendorName.get(model.vendor_id) : undefined;
    for (const group of PRICING_GROUP_ORDER) {
      if (!modelBelongsToGroup(model, group, vendor)) continue;
      grouped[group].rows.push(toPriceRow(model, grouped[group].ratio));
    }
  }
  for (const group of PRICING_GROUP_ORDER) {
    grouped[group].rows = grouped[group].rows.sort(comparePriceRows);
  }
  return grouped;
}
