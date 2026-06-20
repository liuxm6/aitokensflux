import {
  formatCurrencyAmount,
  formatQuotaMoney,
  getQuotaPerUnit,
} from "./format";
import type {
  CustomerPricePlan,
  CustomerStatus,
  SubscriptionPlan,
  SubscriptionPlanRecord,
} from "../types";

const MAX_VISIBLE_SUBSCRIPTION_PLANS = 4;

type CodingPlanPreset = {
  variant: NonNullable<CustomerPricePlan["variant"]>;
  rank: number;
  priceZh?: string;
  priceEn?: string;
  hideSuffix?: boolean;
  originalPrice?: number;
  savePercent?: number;
  saveZh?: string;
  saveEn?: string;
  ctaZh: string;
  ctaEn: string;
  tone: string;
  featuresZh: string[];
  featuresEn: string[];
};

const CODING_PLAN_PRESETS: Record<
  "payg" | "pro" | "max" | "ultra",
  CodingPlanPreset
> = {
  payg: {
    variant: "payg",
    rank: 0,
    ctaZh: "立即购买",
    ctaEn: "Buy now",
    tone: "",
    featuresZh: [
      "用多少储多少，弹性不浪费",
      "永久有效，无需续费",
      "输入 Token 按模型定价折算为等效输出 Token",
    ],
    featuresEn: [
      "Top up as needed without waste",
      "Never expires, no renewal required",
      "Input tokens are converted to equivalent output tokens by model pricing",
    ],
  },
  pro: {
    variant: "pro",
    rank: 1,
    originalPrice: 30,
    savePercent: 30,
    ctaZh: "购买 Pro 版",
    ctaEn: "Buy Pro",
    tone: "",
    featuresZh: [
      "约 450 次程序开发任务",
      "约 900 次程序码对话",
      "轻量开发首选",
      "输入 Token 按模型定价折算为等效输出 Token",
    ],
    featuresEn: [
      "About 450 coding tasks",
      "About 900 coding chats",
      "Best for light development",
      "Input tokens are converted to equivalent output tokens by model pricing",
    ],
  },
  max: {
    variant: "max",
    rank: 2,
    originalPrice: 80,
    savePercent: 40,
    ctaZh: "购买 Max 版",
    ctaEn: "Buy Max",
    tone: "feat",
    featuresZh: [
      "约 1200 次程序开发任务",
      "约 2400 次程序码对话",
      "全职开发者标配",
      "输入 Token 按模型定价折算为等效输出 Token",
    ],
    featuresEn: [
      "About 1200 coding tasks",
      "About 2400 coding chats",
      "Standard pick for full-time developers",
      "Input tokens are converted to equivalent output tokens by model pricing",
    ],
  },
  ultra: {
    variant: "ultra",
    rank: 3,
    originalPrice: 300,
    savePercent: 50,
    ctaZh: "购买 Ultra 版",
    ctaEn: "Buy Ultra",
    tone: "tint-cream",
    featuresZh: [
      "约 4500 次程序开发任务",
      "约 9000 次程序码对话",
      "重度使用者最佳选择",
      "输入 Token 按模型定价折算为等效输出 Token",
    ],
    featuresEn: [
      "About 4500 coding tasks",
      "About 9000 coding chats",
      "Best for heavy users",
      "Input tokens are converted to equivalent output tokens by model pricing",
    ],
  },
};

function getCodingPlanPreset(title: string): CodingPlanPreset | null {
  const normalized = title.toLowerCase();
  if (!normalized.includes("ai coding")) return null;
  if (normalized.includes("ultra")) return CODING_PLAN_PRESETS.ultra;
  if (normalized.includes("max")) return CODING_PLAN_PRESETS.max;
  if (normalized.includes("pro")) return CODING_PLAN_PRESETS.pro;
  if (
    normalized.includes("payg") ||
    normalized.includes("pay as you go") ||
    normalized.includes("token") ||
    normalized.includes("储值") ||
    normalized.includes("儲值") ||
    normalized.includes("按量")
  ) {
    return CODING_PLAN_PRESETS.payg;
  }
  return null;
}

function getCodingPlanRank(plan: CustomerPricePlan) {
  if (plan.variant === "payg") return CODING_PLAN_PRESETS.payg.rank;
  if (plan.variant === "pro") return CODING_PLAN_PRESETS.pro.rank;
  if (plan.variant === "max") return CODING_PLAN_PRESETS.max.rank;
  if (plan.variant === "ultra") return CODING_PLAN_PRESETS.ultra.rank;
  return Number.MAX_SAFE_INTEGER;
}

function getPlanVisualTint(index: number) {
  if (index % 3 === 1) return "tint-mint";
  if (index % 3 === 2) return "tint-cream";
  return "";
}

function formatDurationSeconds(seconds?: number | null) {
  const value = Number(seconds ?? 0);
  if (!Number.isFinite(value) || value <= 0) {
    return { zh: "自定义周期", en: "Custom period" };
  }
  if (value >= 86400) {
    const days = Math.floor(value / 86400);
    return { zh: `${days} 天`, en: `${days} day${days > 1 ? "s" : ""}` };
  }
  if (value >= 3600) {
    const hours = Math.floor(value / 3600);
    return { zh: `${hours} 小时`, en: `${hours} hour${hours > 1 ? "s" : ""}` };
  }
  if (value >= 60) {
    const minutes = Math.floor(value / 60);
    return {
      zh: `${minutes} 分钟`,
      en: `${minutes} minute${minutes > 1 ? "s" : ""}`,
    };
  }
  return { zh: `${Math.floor(value)} 秒`, en: `${Math.floor(value)} seconds` };
}

export function formatSubscriptionPeriod(plan?: SubscriptionPlan) {
  if (!plan) return { zh: "-", en: "-" };
  const value = plan.duration_value || 1;
  const unit = plan.duration_unit || "month";
  if (unit === "custom") return formatDurationSeconds(plan.custom_seconds);
  const zhUnits: Record<string, string> = {
    year: "年",
    month: "月",
    day: "天",
    hour: "小时",
  };
  const enUnits: Record<string, string> = {
    year: "year",
    month: "month",
    day: "day",
    hour: "hour",
  };
  const zhUnit = zhUnits[unit] || unit;
  const enUnit = enUnits[unit] || unit;
  return {
    zh: `${value} ${zhUnit}`,
    en: `${value} ${enUnit}${value > 1 ? "s" : ""}`,
  };
}

function formatPlanQuota(
  plan: SubscriptionPlan,
  status?: CustomerStatus | null,
) {
  const total = Number(plan.total_amount ?? 0);
  if (total > 0) {
    const label = formatQuotaMoney(total, status);
    return { zh: label, en: label };
  }
  return { zh: "不限额度", en: "Unlimited" };
}

export function formatPlanResetPeriod(plan: SubscriptionPlan) {
  const period = plan.quota_reset_period || "never";
  if (period === "daily") return { zh: "每日重置", en: "Daily reset" };
  if (period === "weekly") return { zh: "每周重置", en: "Weekly reset" };
  if (period === "monthly") return { zh: "每月重置", en: "Monthly reset" };
  if (period === "custom") {
    const duration = formatDurationSeconds(plan.quota_reset_custom_seconds);
    return {
      zh: `每 ${duration.zh} 重置`,
      en: `Resets every ${duration.en}`,
    };
  }
  return { zh: "不自动重置", en: "No automatic reset" };
}

function formatPlanPaymentLabel(plan: SubscriptionPlan) {
  const allowBalance = plan.allow_balance_pay !== false;
  const hasExternal =
    Boolean(plan.stripe_price_id) ||
    Boolean(plan.creem_product_id) ||
    Boolean(plan.waffo_pancake_product_id);
  if (allowBalance && hasExternal) {
    return { zh: "支持余额 / 在线支付", en: "Balance / online payment" };
  }
  if (allowBalance) return { zh: "支持余额支付", en: "Balance payment" };
  if (hasExternal) return { zh: "支持在线支付", en: "Online payment" };
  return { zh: "需管理员配置支付", en: "Payment needs configuration" };
}

function getPlanSummary(
  plan: SubscriptionPlan,
  quota: { zh: string; en: string },
) {
  if (plan.subtitle?.trim()) {
    return { zh: plan.subtitle.trim(), en: plan.subtitle.trim() };
  }
  return {
    zh: `到账金额 ${quota.zh}`,
    en: `Received amount ${quota.en}`,
  };
}

function subscriptionPlanToPricePlan(
  record: SubscriptionPlanRecord,
  index: number,
  status?: CustomerStatus | null,
): CustomerPricePlan {
  const plan = record.plan;
  const codingPreset = getCodingPlanPreset(plan.title || "");
  const period = formatSubscriptionPeriod(plan);
  const quotaLabel = formatPlanQuota(plan, status);
  const resetLabel = formatPlanResetPeriod(plan);
  const paymentLabel = formatPlanPaymentLabel(plan);
  const summary = getPlanSummary(plan, quotaLabel);
  const subtitle = plan.subtitle?.trim() || "";
  const requiredQuota = Math.ceil(
    Number(plan.price_amount || 0) * getQuotaPerUnit(status),
  );
  const maxPurchase = Number(plan.max_purchase_per_user ?? 0);
  const upgradeGroup = (plan.upgrade_group || "").trim();
  const extraFeaturesZh = [
    maxPurchase > 0 ? `每个用户最多购买 ${maxPurchase} 次` : "",
    upgradeGroup ? `购买后升级到 ${upgradeGroup} 分组` : "",
  ].filter(Boolean);
  const extraFeaturesEn = [
    maxPurchase > 0
      ? `Max ${maxPurchase} purchase${maxPurchase > 1 ? "s" : ""} per user`
      : "",
    upgradeGroup ? `Upgrades group to ${upgradeGroup}` : "",
  ].filter(Boolean);
  return {
    name: plan.title || `Plan ${plan.id}`,
    price: formatCurrencyAmount(plan.price_amount, plan.currency),
    priceZh: codingPreset?.priceZh,
    priceEn: codingPreset?.priceEn,
    suffixZh: codingPreset ? "月" : period.zh,
    suffixEn: codingPreset ? "mo" : period.en,
    hideSuffix: codingPreset?.hideSuffix,
    saveZh:
      codingPreset?.saveZh ??
      (codingPreset?.savePercent
        ? `节省 ${codingPreset.savePercent}%`
        : summary.zh),
    saveEn:
      codingPreset?.saveEn ??
      (codingPreset?.savePercent
        ? `Save ${codingPreset.savePercent}%`
        : summary.en),
    promoZh: subtitle,
    promoEn: subtitle,
    originalPriceZh: codingPreset?.originalPrice
      ? `享原价 ${formatCurrencyAmount(codingPreset.originalPrice, plan.currency)}`
      : undefined,
    originalPriceEn: codingPreset?.originalPrice
      ? `Original ${formatCurrencyAmount(codingPreset.originalPrice, plan.currency)}`
      : undefined,
    hideDescription: Boolean(codingPreset),
    rate: "",
    ctaZh: codingPreset?.ctaZh ?? "立即购买",
    ctaEn: codingPreset?.ctaEn ?? "Buy now",
    tint: codingPreset?.tone ?? getPlanVisualTint(index),
    variant: codingPreset?.variant ?? "default",
    planId: plan.id,
    allowBalancePay: plan.allow_balance_pay !== false,
    priceAmount: Number(plan.price_amount || 0),
    requiredQuota,
    quotaLabelZh: quotaLabel.zh,
    quotaLabelEn: quotaLabel.en,
    periodLabelZh: period.zh,
    periodLabelEn: period.en,
    resetLabelZh: resetLabel.zh,
    resetLabelEn: resetLabel.en,
    paymentLabelZh: paymentLabel.zh,
    paymentLabelEn: paymentLabel.en,
    stripePriceId: plan.stripe_price_id,
    creemProductId: plan.creem_product_id,
    waffoPancakeProductId: plan.waffo_pancake_product_id,
    maxPurchasePerUser: maxPurchase,
    upgradeGroup,
    featuresZh: codingPreset?.featuresZh ?? [
      `到账金额 ${quotaLabel.zh}`,
      `周期 ${period.zh}`,
      resetLabel.zh,
      paymentLabel.zh,
      ...extraFeaturesZh,
    ],
    featuresEn: codingPreset?.featuresEn ?? [
      `Received amount ${quotaLabel.en}`,
      `Period ${period.en}`,
      resetLabel.en,
      paymentLabel.en,
      ...extraFeaturesEn,
    ],
  };
}

export function recordsToPricePlans(
  records: SubscriptionPlanRecord[],
  status?: CustomerStatus | null,
) {
  const plans = records.map((record, index) =>
    subscriptionPlanToPricePlan(record, index, status),
  );
  const codingPlans = plans
    .filter((plan) =>
      ["payg", "pro", "max", "ultra"].includes(plan.variant ?? ""),
    )
    .sort((a, b) => getCodingPlanRank(a) - getCodingPlanRank(b));
  const variants = new Set(codingPlans.map((plan) => plan.variant));
  const displayPlans = variants.size >= 4 ? codingPlans : plans;
  return displayPlans.slice(0, MAX_VISIBLE_SUBSCRIPTION_PLANS);
}

/**
 * Convert a single plan record to its UI shape, bypassing the visible-plans
 * filtering/slicing in recordsToPricePlans. Use when a page must feature one
 * specific plan by id (e.g. the pinned Father's Day plan), which may not be
 * among the "AI coding" plans that recordsToPricePlans surfaces.
 */
export function recordToPricePlan(
  record: SubscriptionPlanRecord,
  status?: CustomerStatus | null,
) {
  return subscriptionPlanToPricePlan(record, 0, status);
}
