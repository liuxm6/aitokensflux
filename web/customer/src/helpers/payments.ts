import { formatCurrencyAmount, formatQuotaTokens } from "./format";
import { localizeKey } from "../i18n/localization";
import type {
  ApiResponse,
  CreemProduct,
  CustomerStatus,
  Language,
  PurchaseLaunch,
  SubscriptionPaymentResponse,
  TopupInfo,
  TopupPaymentMethod,
  TopupPaymentOption,
  TopupPaymentProvider,
  TopupPaymentResponse,
} from "../types";

export function getTopupStatusLabel(status: string, language: Language) {
  const normalized = status.toLowerCase();
  if (normalized === "success") return localizeKey(language, "Success");
  if (normalized === "pending") return localizeKey(language, "Pending");
  if (normalized === "expired") return localizeKey(language, "Expired");
  if (normalized === "failed") return localizeKey(language, "Failed");
  return status || "-";
}

export function getSubscriptionStatusLabel(status: string, language: Language) {
  const normalized = status.toLowerCase();
  if (normalized === "active") return localizeKey(language, "Active");
  if (normalized === "expired") return localizeKey(language, "Expired");
  if (normalized === "cancelled" || normalized === "canceled") {
    return localizeKey(language, "Cancelled");
  }
  if (normalized === "pending") return localizeKey(language, "Pending");
  return status || "-";
}

export function getSubscriptionSourceLabel(
  source: string | undefined,
  language: Language,
) {
  const normalized = (source || "").toLowerCase();
  if (normalized === "balance") return localizeKey(language, "Balance");
  if (normalized === "admin") return localizeKey(language, "Admin grant");
  if (normalized === "order") return localizeKey(language, "Online payment");
  return source || "-";
}

export function isSubscriptionPaymentSuccess(
  response: SubscriptionPaymentResponse,
) {
  return response.success === true || response.message === "success";
}

export function isApiSuccess(response: ApiResponse<unknown>) {
  return response.success === true || response.message === "success";
}

export function getSubscriptionPaymentError(
  response: SubscriptionPaymentResponse,
  language: Language,
) {
  if (typeof response.data === "string") return response.data;
  return response.message || localizeKey(language, "Payment failed");
}

export function getApiPaymentError(
  response: ApiResponse<unknown>,
  language: Language,
  fallbackKey = "Payment failed",
) {
  if (typeof response.data === "string") return response.data;
  return response.message || localizeKey(language, fallbackKey);
}

function toPositiveNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getProviderMinTopup(
  provider: TopupPaymentProvider,
  topupInfo?: TopupInfo | null,
) {
  if (provider === "stripe")
    return toPositiveNumber(topupInfo?.stripe_min_topup, 1);
  if (provider === "waffo")
    return toPositiveNumber(topupInfo?.waffo_min_topup, 1);
  if (provider === "waffoPancake") {
    return toPositiveNumber(topupInfo?.waffo_pancake_min_topup, 1);
  }
  return toPositiveNumber(topupInfo?.min_topup, 1);
}

function getMethodMinTopup(
  method: TopupPaymentMethod | undefined,
  provider: TopupPaymentProvider,
  topupInfo?: TopupInfo | null,
) {
  return toPositiveNumber(
    method?.min_topup,
    getProviderMinTopup(provider, topupInfo),
  );
}

export function getTopupPaymentOptions(
  topupInfo?: TopupInfo | null,
): TopupPaymentOption[] {
  const options: TopupPaymentOption[] = [];
  const specificWaffoMethods = topupInfo?.waffo_pay_methods ?? [];
  const hasSpecificWaffoMethods =
    Boolean(topupInfo?.enable_waffo_topup) && specificWaffoMethods.length > 0;

  for (const method of topupInfo?.pay_methods ?? []) {
    const type = (method.type || "").trim();
    if (!type || type === "creem") continue;
    if (type === "waffo" && hasSpecificWaffoMethods) continue;

    const provider: TopupPaymentProvider =
      type === "stripe"
        ? "stripe"
        : type === "waffo"
          ? "waffo"
          : type === "waffo_pancake"
            ? "waffoPancake"
            : "epay";

    if (provider === "stripe" && !topupInfo?.enable_stripe_topup) continue;
    if (provider === "waffo" && !topupInfo?.enable_waffo_topup) continue;
    if (provider === "waffoPancake" && !topupInfo?.enable_waffo_pancake_topup) {
      continue;
    }
    if (provider === "epay" && !topupInfo?.enable_online_topup) continue;

    options.push({
      id: type,
      name: method.name || type,
      provider,
      paymentMethod: type,
      minTopup: getMethodMinTopup(method, provider, topupInfo),
      icon: method.icon,
    });
  }

  if (
    topupInfo?.enable_stripe_topup &&
    !options.some((item) => item.provider === "stripe")
  ) {
    options.push({
      id: "stripe",
      name: "Stripe",
      provider: "stripe",
      paymentMethod: "stripe",
      minTopup: getProviderMinTopup("stripe", topupInfo),
    });
  }

  if (
    topupInfo?.enable_waffo_pancake_topup &&
    !options.some((item) => item.provider === "waffoPancake")
  ) {
    options.push({
      id: "waffo_pancake",
      name: "Waffo Pancake",
      provider: "waffoPancake",
      paymentMethod: "waffo_pancake",
      minTopup: getProviderMinTopup("waffoPancake", topupInfo),
    });
  }

  if (hasSpecificWaffoMethods) {
    specificWaffoMethods.forEach((method, index) => {
      options.push({
        id: `waffo:${index}`,
        name: method.name ? `Waffo ${method.name}` : `Waffo ${index + 1}`,
        provider: "waffo",
        minTopup: getProviderMinTopup("waffo", topupInfo),
        icon: method.icon,
        waffoIndex: index,
      });
    });
  } else if (
    topupInfo?.enable_waffo_topup &&
    !options.some((item) => item.provider === "waffo")
  ) {
    options.push({
      id: "waffo",
      name: "Waffo",
      provider: "waffo",
      paymentMethod: "waffo",
      minTopup: getProviderMinTopup("waffo", topupInfo),
    });
  }

  return options;
}

export function parseCreemProducts(value?: TopupInfo["creem_products"]) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? (parsed as CreemProduct[]) : [];
  } catch {
    return [];
  }
}

export function getDefaultTopupAmount(topupInfo?: TopupInfo | null) {
  const configuredAmounts = (topupInfo?.amount_options ?? [])
    .map((item) => toPositiveNumber(item))
    .filter((item) => item > 0)
    .sort((a, b) => a - b);
  if (configuredAmounts.length > 0) return configuredAmounts[0];
  const providers = getTopupPaymentOptions(topupInfo).map(
    (item) => item.minTopup,
  );
  const min =
    providers.length > 0
      ? Math.min(...providers)
      : toPositiveNumber(topupInfo?.min_topup, 1);
  return min > 0 ? min : 1;
}

export function getTopupPresetAmounts(topupInfo?: TopupInfo | null) {
  const configuredAmounts = (topupInfo?.amount_options ?? [])
    .map((item) => toPositiveNumber(item))
    .filter((item) => item > 0);
  if (configuredAmounts.length > 0) return configuredAmounts;
  const minAmount = getDefaultTopupAmount(topupInfo);
  return [1, 5, 10, 30, 50, 100, 300, 500].map(
    (multiplier) => minAmount * multiplier,
  );
}

export function getTopupDiscountRate(
  topupInfo: TopupInfo | null,
  amount: number,
) {
  const rate = Number(topupInfo?.discount?.[amount]);
  return Number.isFinite(rate) && rate > 0 ? rate : 1;
}

export function getTopupAmountUnit(status?: CustomerStatus | null) {
  const type = status?.quota_display_type?.toUpperCase();
  if (type === "TOKENS") return "tokens";
  if (type === "CNY") return "CNY";
  if (type === "CUSTOM") return status?.custom_currency_symbol || "credits";
  return "USD";
}

export function formatTopupAmount(
  value: number,
  status?: CustomerStatus | null,
) {
  const unit = getTopupAmountUnit(status);
  if (unit === "tokens") return formatQuotaTokens(value);
  if (unit === "USD") return formatCurrencyAmount(value, "USD");
  if (unit === "CNY") return formatCurrencyAmount(value, "CNY");
  return `${unit}${Number(value || 0).toLocaleString()}`;
}

export function formatTopupPaymentAmount(
  amount: number | null,
  status?: CustomerStatus | null,
) {
  if (amount === null || !Number.isFinite(amount)) return "-";
  const type = status?.quota_display_type?.toUpperCase();
  if (type === "CNY") return formatCurrencyAmount(amount, "CNY");
  if (type === "CUSTOM") {
    return `${status?.custom_currency_symbol || ""}${amount.toFixed(2)}`;
  }
  return formatCurrencyAmount(amount, "USD");
}

function isSafeCheckoutUrl(url: string) {
  try {
    const parsed = new URL(url, window.location.href);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function getTopupLaunch(
  response: TopupPaymentResponse,
  provider: TopupPaymentProvider | "creem",
): PurchaseLaunch | null {
  const data =
    response.data && typeof response.data === "object" ? response.data : {};

  if (provider === "epay" && response.url) {
    return {
      type: "epay",
      url: response.url,
      params: data as Record<string, unknown>,
    };
  }

  const paymentUrl =
    typeof data.pay_link === "string" && data.pay_link
      ? data.pay_link
      : typeof data.checkout_url === "string" && data.checkout_url
        ? data.checkout_url
        : typeof data.payment_url === "string" && data.payment_url
          ? data.payment_url
          : "";

  if (!paymentUrl || !isSafeCheckoutUrl(paymentUrl)) return null;

  return {
    type: "url",
    url: paymentUrl,
    target: provider === "waffoPancake" ? "currentTab" : "newTab",
  };
}

export function getEpayMethods(topupInfo?: TopupInfo | null) {
  return (topupInfo?.pay_methods ?? []).filter((method) => {
    const type = method.type || "";
    return (
      type &&
      type !== "stripe" &&
      type !== "creem" &&
      type !== "waffo" &&
      type !== "waffo_pancake"
    );
  });
}

function submitEpayForm(url?: string, params?: Record<string, unknown>) {
  if (!url || !params) return false;
  const form = document.createElement("form");
  form.action = url;
  form.method = "POST";
  const isSafari =
    navigator.userAgent.includes("Safari") &&
    !navigator.userAgent.includes("Chrome");
  if (!isSafari) form.target = "_blank";
  for (const [key, value] of Object.entries(params)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = String(value ?? "");
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
  return true;
}

export function launchSubscriptionPayment(launch: PurchaseLaunch) {
  if (launch.type === "epay") {
    return submitEpayForm(launch.url, launch.params);
  }
  if (launch.target === "currentTab") {
    window.location.href = launch.url;
    return true;
  }
  return Boolean(window.open(launch.url, "_blank", "noopener,noreferrer"));
}

export function getPaymentLaunchMessage(
  launch: PurchaseLaunch,
  launched: boolean,
  language: Language,
) {
  if (!launched) {
    return localizeKey(
      language,
      "Payment page is ready. If it did not open automatically, use the button below to continue.",
    );
  }
  if (launch.type === "epay") {
    return localizeKey(
      language,
      "Payment started. Please finish it on the payment page.",
    );
  }
  if (launch.target === "currentTab") {
    return localizeKey(
      language,
      "Redirecting to the payment page. Please finish payment there.",
    );
  }
  return localizeKey(
    language,
    "Payment page opened. Please finish it in the new window.",
  );
}
