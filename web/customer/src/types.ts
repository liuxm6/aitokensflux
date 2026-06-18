import type { LucideIcon } from "lucide-react";

import type { ReactNode } from "react";

export type Language = "zh" | "zh-TW" | "en" | "ru";

export type PageKey =
  | "home"
  | "dashboard"
  | "topup"
  | "usage"
  | "apikeys"
  | "invite"
  | "settings"
  | "atfSwitchConnect"
  | "subscribe"
  | "setup"
  | "signin"
  | "signup"
  | "oauthCallback"
  | "userAgreement"
  | "privacyPolicy"
  | "notFound";

export type NavItem = {
  page: PageKey;
  path: string;
  labelId: string;
  icon: LucideIcon;
};

export type DualTextProps = {
  zh: ReactNode;
  en: ReactNode;
};

export type TranslationValues = Record<string, string | number>;

export type TranslationKeyProps = {
  id: string;
  values?: TranslationValues;
};

export type LanguageOption = {
  value: Language;
  label: string;
  shortLabel: string;
};

export type AuthMode = "login" | "register";

export type AuthLoginMethod = "password" | "emailCode";

export type CustomerUser = {
  id: number;
  username: string;
  display_name?: string;
  email?: string;
  role: number;
  status?: number;
  group?: string;
  quota?: number;
  used_quota?: number;
  request_count?: number;
  aff_code?: string;
  aff_count?: number;
  aff_quota?: number;
  aff_history_quota?: number;
  inviter_id?: number;
  linux_do_id?: string;
  wechat_id?: string;
  telegram_id?: string;
};

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  status?: number;
};

export type LoginData = CustomerUser & {
  require_2fa?: boolean;
};

export type CustomerToken = {
  id: number;
  name: string;
  key: string;
  status: number;
  created_time?: number;
  accessed_time?: number;
  expired_time?: number;
  remain_quota?: number;
  used_quota?: number;
  unlimited_quota?: boolean;
};

export type ATFSwitchConnectData = {
  app: string;
  label: string;
  name: string;
  endpoint: string;
  model: string;
  token_id: number;
  token_name: string;
  created: boolean;
  api_key: string;
  access_token?: string;
  accessToken?: string;
  user_id: string;
  email?: string;
  accountEmail?: string;
  account_email?: string;
  userEmail?: string;
  user_email?: string;
  username?: string;
  displayName?: string;
  display_name?: string;
  deep_link: string;
};

export type PageData<T> = {
  items?: T[];
  total?: number;
  page?: number;
  page_size?: number;
};

export type CustomerLogStats = {
  quota?: number;
  rpm?: number;
  tpm?: number;
};

export type UsageLog = {
  id: number;
  created_at: number;
  type: number;
  content: string;
  username?: string;
  token_name?: string;
  model_name?: string;
  quota?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
  use_time?: number;
  is_stream?: boolean;
  channel?: number;
  channel_name?: string;
  token_id?: number;
  group?: string;
  ip?: string;
  request_id?: string;
  upstream_request_id?: string;
  other?: string;
};

export type TopupRecord = {
  id: number;
  amount: number;
  money: number;
  trade_no: string;
  payment_method?: string;
  payment_provider?: string;
  create_time: number;
  complete_time?: number;
  status: string;
};

export type TopupPaymentMethod = {
  name?: string;
  type?: string;
  min_topup?: number | string;
  color?: string;
  icon?: string;
};

export type CreemProduct = {
  productId?: string;
  product_id?: string;
  name?: string;
  price?: number;
  currency?: string;
  quota?: number;
};

export type WaffoPayMethod = {
  name?: string;
  icon?: string;
  payMethodType?: string;
  payMethodName?: string;
};

export type SubscriptionPlan = {
  id: number;
  title: string;
  subtitle?: string;
  price_amount: number;
  currency?: string;
  duration_unit?: string;
  duration_value?: number;
  custom_seconds?: number;
  enabled?: boolean;
  sort_order?: number;
  total_amount?: number;
  quota_reset_period?: string;
  quota_reset_custom_seconds?: number;
  allow_balance_pay?: boolean;
  stripe_price_id?: string;
  creem_product_id?: string;
  waffo_pancake_product_id?: string;
  max_purchase_per_user?: number;
  upgrade_group?: string;
};

export type SubscriptionPlanRecord = {
  plan: SubscriptionPlan;
};

export type PricingModel = {
  model_name: string;
  quota_type: number;
  model_ratio: number;
  model_price: number;
  completion_ratio: number;
  cache_ratio?: number;
  owner_by?: string;
  vendor_id?: number;
  enable_groups?: string[];
};

export type PricingVendor = {
  id: number;
  name: string;
  icon?: string;
  description?: string;
};

export type ModelPricingData = {
  data?: PricingModel[];
  vendors?: PricingVendor[];
  group_ratio?: Record<string, number>;
};

export type CustomerSubscription = {
  id: number;
  user_id: number;
  plan_id: number;
  status: string;
  start_time: number;
  end_time: number;
  amount_total: number;
  amount_used: number;
  next_reset_time?: number;
  source?: string;
  created_at?: number;
  updated_at?: number;
};

export type CustomerSubscriptionRecord = {
  subscription: CustomerSubscription;
  plan?: SubscriptionPlan;
};

export type SelfSubscriptionData = {
  billing_preference?: string;
  subscriptions?: CustomerSubscriptionRecord[];
  all_subscriptions?: CustomerSubscriptionRecord[];
};

export type TopupInfo = {
  enable_online_topup?: boolean;
  enable_stripe_topup?: boolean;
  enable_creem_topup?: boolean;
  enable_waffo_topup?: boolean;
  enable_waffo_pancake_topup?: boolean;
  enable_redemption?: boolean;
  payment_compliance_confirmed?: boolean;
  payment_compliance_terms_version?: string;
  pay_methods?: TopupPaymentMethod[];
  waffo_pay_methods?: WaffoPayMethod[];
  creem_products?: string | CreemProduct[];
  amount_options?: number[];
  discount?: Record<number, number>;
  min_topup?: number;
  stripe_min_topup?: number;
  waffo_min_topup?: number;
  waffo_pancake_min_topup?: number;
  topup_link?: string;
};

export type SubscriptionPaymentData = Record<string, unknown> & {
  pay_link?: string;
  checkout_url?: string;
};

export type TopupPaymentProvider = "epay" | "stripe" | "waffo" | "waffoPancake";

export type BillingRecordType = "all" | "subscription" | "topup";

export type TopupPaymentOption = {
  id: string;
  name: string;
  provider: TopupPaymentProvider;
  paymentMethod?: string;
  minTopup: number;
  icon?: string;
  waffoIndex?: number;
};

export type TopupPaymentData = Record<string, unknown> & {
  pay_link?: string;
  checkout_url?: string;
  payment_url?: string;
};

export type TopupPaymentResponse = ApiResponse<TopupPaymentData | string> & {
  url?: string;
};

export type SubscriptionPaymentResponse =
  ApiResponse<SubscriptionPaymentData> & {
    url?: string;
  };

export type CustomerStatus = {
  setup?: boolean;
  system_name?: string;
  logo?: string;
  server_address?: string;
  serverAddress?: string;
  quota_per_unit?: number;
  quota_for_inviter?: number;
  quota_for_invitee?: number;
  quota_display_type?: string;
  display_in_currency?: boolean;
  custom_currency_symbol?: string;
  custom_currency_exchange_rate?: number;
  usd_exchange_rate?: number;
  price?: number;
  stripe_unit_price?: number;
  email_verification?: boolean;
  register_enabled?: boolean;
  password_login_enabled?: boolean;
  password_register_enabled?: boolean;
  turnstile_check?: boolean;
  turnstile_site_key?: string;
  user_agreement_enabled?: boolean;
  privacy_policy_enabled?: boolean;
  self_use_mode_enabled?: boolean;
  github_oauth?: boolean;
  github_client_id?: string;
  discord_oauth?: boolean;
  discord_client_id?: string;
  oidc_enabled?: boolean;
  oidc_authorization_endpoint?: string;
  oidc_client_id?: string;
  linuxdo_oauth?: boolean;
  linuxdo_client_id?: string;
  telegram_oauth?: boolean;
  telegram_bot_name?: string;
  passkey_login?: boolean;
  wechat_login?: boolean;
  wechat_qrcode?: string;
  wechat_qr_code?: string;
  wechat_qrcode_image_url?: string;
  wechat_qr_code_image_url?: string;
  wechat_account_qrcode_image_url?: string;
  WeChatAccountQRCodeImageURL?: string;
  custom_oauth_providers?: CustomOAuthProvider[];
};

export type CustomOAuthProvider = {
  id?: number;
  name: string;
  slug: string;
  icon?: string;
  client_id: string;
  authorization_endpoint: string;
  scopes?: string;
};

export type TelegramAuthPayload = {
  id?: number | string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date?: number | string;
  hash?: string;
  lang?: string;
};

export type AuthFormValues = {
  email: string;
  password: string;
  verificationCode: string;
  inviteCode: string;
};

export type AccountDialogMode = "password" | "email";

export type ConfirmActionConfig = {
  title: TranslationKeyProps;
  message: TranslationKeyProps;
  cancelText?: TranslationKeyProps;
  confirmText?: TranslationKeyProps;
  onConfirm: () => void | Promise<void>;
};

export type CustomerPricePlan = {
  name: string;
  price: string;
  priceZh?: string;
  priceEn?: string;
  suffixZh: string;
  suffixEn: string;
  hideSuffix?: boolean;
  saveZh: string;
  saveEn: string;
  promoZh?: string;
  promoEn?: string;
  originalPriceZh?: string;
  originalPriceEn?: string;
  descriptionZh?: string;
  descriptionEn?: string;
  hideDescription?: boolean;
  rate: string;
  ctaZh: string;
  ctaEn: string;
  tint: string;
  variant?: "payg" | "pro" | "max" | "ultra" | "default";
  featuresZh: string[];
  featuresEn: string[];
  planId?: number;
  allowBalancePay?: boolean;
  priceAmount: number;
  requiredQuota: number;
  quotaLabelZh: string;
  quotaLabelEn: string;
  periodLabelZh: string;
  periodLabelEn: string;
  resetLabelZh: string;
  resetLabelEn: string;
  paymentLabelZh: string;
  paymentLabelEn: string;
  stripePriceId?: string;
  creemProductId?: string;
  waffoPancakeProductId?: string;
  maxPurchasePerUser?: number;
  upgradeGroup?: string;
};

export type PurchaseStepKey = "order" | "paymentInfo" | "launch";

export type PurchaseStepState = "pending" | "processing" | "done" | "error";

export type PurchasePaymentProvider =
  | "balance"
  | "stripe"
  | "creem"
  | "waffoPancake"
  | "epay";

export type PurchaseLaunch =
  | {
      type: "url";
      url: string;
      target?: "newTab" | "currentTab";
    }
  | {
      type: "epay";
      url: string;
      params: Record<string, unknown>;
    };

export type PurchaseProgress = {
  planName: string;
  steps: Record<PurchaseStepKey, PurchaseStepState>;
  message: string;
  error?: string;
  canClose: boolean;
  launch?: PurchaseLaunch;
};

export type ApiKeyExpiryMode = "never" | "7d" | "30d" | "90d" | "custom";

export type ApiKeyCreateForm = {
  name: string;
  expiryMode: ApiKeyExpiryMode;
  expiryDate: string;
  quotaLimit: string;
  unlimitedQuota: boolean;
};

export type NodeBufferCtor = {
  from(input: string, encoding: string): { toString(encoding: string): string };
};

export type InviteRecordTab = "all" | "inviter" | "invitee";

export type SetupTool = "claude" | "codex";

export type SetupOs = "macos" | "linux" | "windows";

export type SetupStage = "tool" | "os" | "guide";

export type SetupChoice<T extends string> = {
  id: T;
  title: string;
  subtitleId: string;
  icon: () => ReactNode;
};

export type SetupCodeBlock = {
  labelId?: string;
  labelValues?: TranslationValues;
  value: string;
};

export type SetupGuideStep = {
  titleId: string;
  textId: string;
  textValues?: TranslationValues;
  action?: {
    href: string;
    labelId: string;
    labelValues?: TranslationValues;
  };
  callout?: {
    tone: "warning" | "success";
    titleId?: string;
    textId: string;
    textValues?: TranslationValues;
  };
  codeBlocks?: SetupCodeBlock[];
};
