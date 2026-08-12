const CLAUDE_DEFAULT_MODELS = {
  model: "claude-sonnet-4.6",
  haikuModel: "claude-haiku-4-5-20251001",
  sonnetModel: "claude-sonnet-4.6",
  opusModel: "claude-opus-4-8",
};

export const CC_SWITCH_APP_CONFIGS = {
  claude: {
    label: "Claude",
    defaultName: "My Claude",
    defaultModels: CLAUDE_DEFAULT_MODELS,
    modelFields: [
      { key: "model", labelId: "Primary Model", required: true },
      { key: "haikuModel", labelId: "Haiku Model", required: false },
      { key: "sonnetModel", labelId: "Sonnet Model", required: false },
      { key: "opusModel", labelId: "Opus Model", required: false },
    ],
  },
  codex: {
    label: "Codex",
    defaultName: "My Codex",
    defaultModels: { model: "gpt-5.5" },
    modelFields: [{ key: "model", labelId: "Primary Model", required: true }],
  },
  gemini: {
    label: "Gemini",
    defaultName: "My Gemini",
    defaultModels: { model: "gemini-2.5-pro" },
    modelFields: [{ key: "model", labelId: "Primary Model", required: true }],
  },
} as const;

export type CCSwitchApp = keyof typeof CC_SWITCH_APP_CONFIGS;

export function buildDefaultCcSwitchModels(app: CCSwitchApp) {
  return { ...CC_SWITCH_APP_CONFIGS[app].defaultModels };
}

export function buildCcSwitchUrl({
  app,
  name,
  models,
  apiKey,
  serverAddress,
  openaiBaseUrl,
}: {
  app: CCSwitchApp;
  name: string;
  models: Record<string, string>;
  apiKey: string;
  serverAddress: string;
  openaiBaseUrl: string;
}) {
  const endpoint = app === "codex" ? openaiBaseUrl : serverAddress;
  const primaryModel = models.model?.trim() || "";
  const params = new URLSearchParams();
  params.set("resource", "provider");
  params.set("app", app);
  params.set("name", name);
  params.set("endpoint", endpoint);
  params.set("apiKey", apiKey);
  for (const [key, value] of Object.entries(models)) {
    const trimmed = value.trim();
    if (trimmed) params.set(key, trimmed);
  }
  params.set("homepage", serverAddress);
  params.set("notes", primaryModel ? `${name} · ${primaryModel}` : name);
  params.set("icon", "atf");
  params.set("enabled", "true");
  params.set("usageEnabled", "true");
  params.set("usageApiKey", apiKey);
  params.set("usageBaseUrl", serverAddress);
  params.set("usageAutoInterval", "5");
  params.set("usageScript", encodeBase64(buildCcSwitchUsageScript()));
  return `ccswitch://v1/import?${params.toString()}`;
}

function buildCcSwitchUsageScript() {
  return `({
  request: {
    url: "{{baseUrl}}/api/usage/token/",
    method: "GET",
    headers: {
      "Authorization": "Bearer {{apiKey}}",
      "User-Agent": "cc-switch/1.0"
    }
  },
  extractor: function(response) {
    if (!response || (response.code !== true && response.success !== true) || !response.data) {
      return {
        isValid: false,
        invalidMessage: response && response.message ? response.message : "Failed to load usage",
        remaining: 0,
        unit: "USD"
      };
    }

    var data = response.data;
    var quotaPerUnit = 500000;
    var toNumber = function(value) {
      var number = Number(value);
      return Number.isFinite(number) ? number : 0;
    };
    var toUSD = function(quota) {
      return toNumber(quota) / quotaPerUnit;
    };
    var walletQuota = toNumber(data.wallet_quota !== undefined ? data.wallet_quota : data.user_quota);
    var walletUsedQuota = toNumber(data.wallet_used_quota !== undefined ? data.wallet_used_quota : data.user_used_quota);
    var keyAvailable = data.unlimited_quota ? walletQuota : toNumber(data.total_available);
    var keyUsed = toNumber(data.total_used);
    var keyTotal = data.unlimited_quota ? keyAvailable + keyUsed : toNumber(data.total_granted);

    return [
      {
        planName: data.name || "API key quota",
        remaining: toUSD(keyAvailable),
        used: toUSD(keyUsed),
        total: toUSD(keyTotal),
        unit: "USD",
        isValid: true
      },
      {
        planName: "Wallet balance",
        remaining: toUSD(walletQuota),
        used: toUSD(walletUsedQuota),
        total: toUSD(walletQuota + walletUsedQuota),
        unit: "USD",
        isValid: true
      }
    ];
  }
})`;
}

function encodeBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary);
}
