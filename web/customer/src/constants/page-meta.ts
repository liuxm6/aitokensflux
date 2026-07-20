import type { PageKey } from "../types";

export type PageMeta = {
  descriptionId: string;
  titleId: string;
};

export const pageMeta: Record<PageKey, PageMeta> = {
  home: {
    titleId: "AI API gateway",
    descriptionId:
      "Unified access to Claude, Codex, Grok, and Gemini with one balance.",
  },
  dashboard: {
    titleId: "Dashboard",
    descriptionId:
      "View your balance, subscription, usage, and account shortcuts.",
  },
  topup: {
    titleId: "Billing",
    descriptionId:
      "Manage plans, balance top-ups, payments, and billing records.",
  },
  usage: {
    titleId: "Usage",
    descriptionId: "Review request usage, token counts, and billing details.",
  },
  apikeys: {
    titleId: "API Keys",
    descriptionId: "Create and manage API keys for your applications.",
  },
  invite: {
    titleId: "Referrals",
    descriptionId: "Track invitations, rewards, and referral records.",
  },
  settings: {
    titleId: "Settings",
    descriptionId: "Manage language, account security, and profile settings.",
  },
  atfSwitchConnect: {
    titleId: "Connect ATF Switch",
    descriptionId:
      "Authorize the desktop app without copying an API key manually.",
  },
  subscribe: {
    titleId: "Plans",
    descriptionId: "Compare available plans and choose how to add balance.",
  },
  fathersDay: {
    titleId: "Father's Day special",
    descriptionId: "View the current seasonal offer and purchase options.",
  },
  setup: {
    titleId: "Setup guide",
    descriptionId: "Configure Claude Code or Codex for the unified gateway.",
  },
  signin: {
    titleId: "Sign in",
    descriptionId: "Sign in to manage your gateway account and API access.",
  },
  signup: {
    titleId: "Register",
    descriptionId: "Create an account for gateway access and usage billing.",
  },
  oauthCallback: {
    titleId: "Sign-in callback",
    descriptionId: "Complete the external account sign-in process.",
  },
  resetPassword: {
    titleId: "Reset password",
    descriptionId: "Confirm a password reset request for your account.",
  },
  userAgreement: {
    titleId: "User Agreement",
    descriptionId: "Review the terms that apply to this service.",
  },
  privacyPolicy: {
    titleId: "Privacy Policy",
    descriptionId: "Review how account and usage data are handled.",
  },
  notFound: {
    titleId: "Page not found",
    descriptionId: "The requested customer portal page could not be found.",
  },
};
