import {
  Activity,
  BookOpen,
  CircleDollarSign,
  Gauge,
  Play,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  type ComponentType,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AppLink } from "../../components/common/AppLink";
import { EmptyState } from "../../components/common/EmptyState";
import {
  FathersDayGifts,
  FathersDayGiftEntry,
} from "../../components/common/FathersDayGifts";
import { Pill } from "../../components/common/Pill";
import { Footer } from "../../components/layout/Footer";
import { SupportChannelGrid } from "../../components/support/SupportChannels";
import { PaygTopupSection } from "../../components/topup/PaygTopupSection";
import { PriceCard } from "../../components/topup/PriceCard";
import { AuthContext } from "../../context/Auth";
import { T } from "../../context/Language";
import { navigateTo } from "../../helpers/navigation";
import { recordsToPricePlans } from "../../helpers/plans";
import {
  fetchCustomerStatus,
  fetchModelPricing,
  fetchPublicPlans,
  fetchTopupInfo,
} from "../../services/customer-api";
import type {
  CustomerStatus,
  ModelPricingData,
  PricingModel,
  SubscriptionPlanRecord,
  TopupInfo,
} from "../../types";

function AppleLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 384 512"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8c-18.8-26.9-47.2-41.7-84.7-44.6c-35.5-2.8-74.3 20.7-88.5 20.7c-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2c25.2-.6 43-17.9 75.8-17.9c31.8 0 48.3 17.9 76.4 17.9c48.6-.7 90.4-82.5 102.6-119.3c-65.2-30.7-61.7-90-61.7-91.9m-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5c-24.1 1.4-52 16.4-67.9 34.9c-17.5 19.8-27.8 44.3-25.6 71.9c26.1 2 49.9-11.4 69.5-34.3"
        fill="currentColor"
      />
    </svg>
  );
}

function WindowsLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 448 512"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="m0 93.7l183.6-25.3v177.4H0zm0 324.6l183.6 25.3V268.4H0zm203.8 28L448 480V268.4H203.8zm0-380.6v180.1H448V32z"
        fill="currentColor"
      />
    </svg>
  );
}

function LinuxLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 448 512"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M220.8 123.3c1 .5 1.8 1.7 3 1.7c1.1 0 2.8-.4 2.9-1.5c.2-1.4-1.9-2.3-3.2-2.9c-1.7-.7-3.9-1-5.5-.1c-.4.2-.8.7-.6 1.1c.3 1.3 2.3 1.1 3.4 1.7m-21.9 1.7c1.2 0 2-1.2 3-1.7c1.1-.6 3.1-.4 3.5-1.6c.2-.4-.2-.9-.6-1.1c-1.6-.9-3.8-.6-5.5.1c-1.3.6-3.4 1.5-3.2 2.9c.1 1 1.8 1.5 2.8 1.4M420 403.8c-3.6-4-5.3-11.6-7.2-19.7c-1.8-8.1-3.9-16.8-10.5-22.4c-1.3-1.1-2.6-2.1-4-2.9c-1.3-.8-2.7-1.5-4.1-2c9.2-27.3 5.6-54.5-3.7-79.1c-11.4-30.1-31.3-56.4-46.5-74.4c-17.1-21.5-33.7-41.9-33.4-72C311.1 85.4 315.7.1 234.8 0C132.4-.2 158 103.4 156.9 135.2c-1.7 23.4-6.4 41.8-22.5 64.7c-18.9 22.5-45.5 58.8-58.1 96.7c-6 17.9-8.8 36.1-6.2 53.3c-6.5 5.8-11.4 14.7-16.6 20.2c-4.2 4.3-10.3 5.9-17 8.3s-14 6-18.5 14.5c-2.1 3.9-2.8 8.1-2.8 12.4c0 3.9.6 7.9 1.2 11.8c1.2 8.1 2.5 15.7.8 20.8c-5.2 14.4-5.9 24.4-2.2 31.7c3.8 7.3 11.4 10.5 20.1 12.3c17.3 3.6 40.8 2.7 59.3 12.5c19.8 10.4 39.9 14.1 55.9 10.4c11.6-2.6 21.1-9.6 25.9-20.2c12.5-.1 26.3-5.4 48.3-6.6c14.9-1.2 33.6 5.3 55.1 4.1c.6 2.3 1.4 4.6 2.5 6.7v.1c8.3 16.7 23.8 24.3 40.3 23c16.6-1.3 34.1-11 48.3-27.9c13.6-16.4 36-23.2 50.9-32.2c7.4-4.5 13.4-10.1 13.9-18.3c.4-8.2-4.4-17.3-15.5-29.7M223.7 87.3c9.8-22.2 34.2-21.8 44-.4c6.5 14.2 3.6 30.9-4.3 40.4c-1.6-.8-5.9-2.6-12.6-4.9c1.1-1.2 3.1-2.7 3.9-4.6c4.8-11.8-.2-27-9.1-27.3c-7.3-.5-13.9 10.8-11.8 23c-4.1-2-9.4-3.5-13-4.4c-1-6.9-.3-14.6 2.9-21.8M183 75.8c10.1 0 20.8 14.2 19.1 33.5c-3.5 1-7.1 2.5-10.2 4.6c1.2-8.9-3.3-20.1-9.6-19.6c-8.4.7-9.8 21.2-1.8 28.1c1 .8 1.9-.2-5.9 5.5c-15.6-14.6-10.5-52.1 8.4-52.1m-13.6 60.7c6.2-4.6 13.6-10 14.1-10.5c4.7-4.4 13.5-14.2 27.9-14.2c7.1 0 15.6 2.3 25.9 8.9c6.3 4.1 11.3 4.4 22.6 9.3c8.4 3.5 13.7 9.7 10.5 18.2c-2.6 7.1-11 14.4-22.7 18.1c-11.1 3.6-19.8 16-38.2 14.9c-3.9-.2-7-1-9.6-2.1c-8-3.5-12.2-10.4-20-15c-8.6-4.8-13.2-10.4-14.7-15.3q-2.1-7.35 4.2-12.3m3.3 334c-2.7 35.1-43.9 34.4-75.3 18c-29.9-15.8-68.6-6.5-76.5-21.9c-2.4-4.7-2.4-12.7 2.6-26.4v-.2c2.4-7.6.6-16-.6-23.9c-1.2-7.8-1.8-15 .9-20c3.5-6.7 8.5-9.1 14.8-11.3c10.3-3.7 11.8-3.4 19.6-9.9c5.5-5.7 9.5-12.9 14.3-18c5.1-5.5 10-8.1 17.7-6.9c8.1 1.2 15.1 6.8 21.9 16l19.6 35.6c9.5 19.9 43.1 48.4 41 68.9m-1.4-25.9c-4.1-6.6-9.6-13.6-14.4-19.6c7.1 0 14.2-2.2 16.7-8.9c2.3-6.2 0-14.9-7.4-24.9c-13.5-18.2-38.3-32.5-38.3-32.5c-13.5-8.4-21.1-18.7-24.6-29.9s-3-23.3-.3-35.2c5.2-22.9 18.6-45.2 27.2-59.2c2.3-1.7.8 3.2-8.7 20.8c-8.5 16.1-24.4 53.3-2.6 82.4c.6-20.7 5.5-41.8 13.8-61.5c12-27.4 37.3-74.9 39.3-112.7c1.1.8 4.6 3.2 6.2 4.1c4.6 2.7 8.1 6.7 12.6 10.3c12.4 10 28.5 9.2 42.4 1.2c6.2-3.5 11.2-7.5 15.9-9c9.9-3.1 17.8-8.6 22.3-15c7.7 30.4 25.7 74.3 37.2 95.7c6.1 11.4 18.3 35.5 23.6 64.6c3.3-.1 7 .4 10.9 1.4c13.8-35.7-11.7-74.2-23.3-84.9c-4.7-4.6-4.9-6.6-2.6-6.5c12.6 11.2 29.2 33.7 35.2 59c2.8 11.6 3.3 23.7.4 35.7c16.4 6.8 35.9 17.9 30.7 34.8c-2.2-.1-3.2 0-4.2 0c3.2-10.1-3.9-17.6-22.8-26.1c-19.6-8.6-36-8.6-38.3 12.5c-12.1 4.2-18.3 14.7-21.4 27.3c-2.8 11.2-3.6 24.7-4.4 39.9c-.5 7.7-3.6 18-6.8 29c-32.1 22.9-76.7 32.9-114.3 7.2m257.4-11.5c-.9 16.8-41.2 19.9-63.2 46.5c-13.2 15.7-29.4 24.4-43.6 25.5s-26.5-4.8-33.7-19.3c-4.7-11.1-2.4-23.1 1.1-36.3c3.7-14.2 9.2-28.8 9.9-40.6c.8-15.2 1.7-28.5 4.2-38.7c2.6-10.3 6.6-17.2 13.7-21.1c.3-.2.7-.3 1-.5c.8 13.2 7.3 26.6 18.8 29.5c12.6 3.3 30.7-7.5 38.4-16.3c9-.3 15.7-.9 22.6 5.1c9.9 8.5 7.1 30.3 17.1 41.6c10.6 11.6 14 19.5 13.7 24.6M173.3 148.7c2 1.9 4.7 4.5 8 7.1c6.6 5.2 15.8 10.6 27.3 10.6c11.6 0 22.5-5.9 31.8-10.8c4.9-2.6 10.9-7 14.8-10.4s5.9-6.3 3.1-6.6s-2.6 2.6-6 5.1c-4.4 3.2-9.7 7.4-13.9 9.8c-7.4 4.2-19.5 10.2-29.9 10.2s-18.7-4.8-24.9-9.7c-3.1-2.5-5.7-5-7.7-6.9c-1.5-1.4-1.9-4.6-4.3-4.9c-1.4-.1-1.8 3.7 1.7 6.5"
        fill="currentColor"
      />
    </svg>
  );
}

function ClaudeLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"
        fill="currentColor"
      />
    </svg>
  );
}

function OpenAILogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.0201 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4926 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1686a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
        fill="currentColor"
      />
    </svg>
  );
}

function FeatureColumn({
  icon: Icon,
  titleId,
  textId,
}: {
  icon: LucideIcon;
  titleId: string;
  textId: string;
}) {
  return (
    <div className="fc">
      <Icon className="gi" />
      <h3>
        <T id={titleId} />
      </h3>
      <p>
        <T id={textId} />
      </p>
    </div>
  );
}

function FaqSection() {
  return (
    <section className="section faq-section">
      <div className="wrap narrow">
        <h2 className="h-sec center">FAQ</h2>
        <div className="faq">
          <details open>
            <summary>
              <T id="Will aitokensflux change my existing tools?" />
              <span>+</span>
            </summary>
            <p>
              <T id="No. It only reroutes at the request layer. Your Claude Code, Codex and VS Code workflows stay intact." />
            </p>
          </details>
          <details>
            <summary>
              <T id="Do credits expire?" />
              <span>+</span>
            </summary>
            <p>
              <T id="Pay-as-you-go credits never expire. Subscription plans reset each billing cycle." />
            </p>
          </details>
          <details>
            <summary>
              <T id="Which models are supported?" />
              <span>+</span>
            </summary>
            <p>
              <T id="Equivalent APIs for frontier models including Claude Sonnet 4.6, Claude Opus 4.7 and GPT-5.5." />
            </p>
          </details>
          <details>
            <summary>
              <T id="Is my code and data safe?" />
              <span>+</span>
            </summary>
            <p>
              <T id="Keys are self-managed and revocable anytime; the gateway retains no request content." />
            </p>
          </details>
        </div>
      </div>
    </section>
  );
}

function SupportSection() {
  return (
    <section className="section support-section" id="support">
      <div className="wrap">
        <div className="support-head">
          <div>
            <Pill>
              <T id="Support & community" />
            </Pill>
            <h2 className="h-sec">
              <T id="Choose the support channel that works for you." />
            </h2>
          </div>
          <p>
            <T id="Support groups are best for real-time help. Email is best for account, order, and security issues." />
          </p>
        </div>
        <SupportChannelGrid />
      </div>
    </section>
  );
}

type PricingGroup = "claude" | "codex";

type PriceRow = {
  name: string;
  input: number | null;
  output: number | null;
  cacheRead: number | null;
  perCall: number | null;
};

type GroupPricingRows = {
  ratio: number;
  rows: PriceRow[];
};

const RATIO_TO_USD_PER_M = 2;
const PRICING_GROUP_ORDER: PricingGroup[] = ["claude", "codex"];

function classifyFallbackGroup(
  modelName: string,
  vendorName?: string,
  ownerBy?: string,
): PricingGroup | null {
  const vendor = `${vendorName ?? ""} ${ownerBy ?? ""}`.toLowerCase();
  if (vendor.includes("anthropic")) return "claude";
  if (vendor.includes("openai")) return "codex";
  const name = modelName.toLowerCase();
  if (name.includes("claude")) return "claude";
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
  if (enableGroups.includes(group) || enableGroups.includes("all")) {
    return true;
  }
  if (enableGroups.length > 0) return false;
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

function formatUsd(value: number | null): string {
  if (value == null) return "—";
  if (value === 0) return "$0";
  const digits = value < 0.01 ? 4 : 2;
  return `$${value.toFixed(digits)}`;
}

function TokenPrice({ value }: { value: number | null }) {
  if (value == null) return <>—</>;
  return (
    <span className="mp-price">
      <span>{formatUsd(value)}</span>
      <span className="mp-unit">/M</span>
    </span>
  );
}

function comparePriceRows(a: PriceRow, b: PriceRow) {
  return (b.input ?? -1) - (a.input ?? -1) || a.name.localeCompare(b.name);
}

const DEV_SAMPLE_PRICING: ModelPricingData = {
  group_ratio: { claude: 1, codex: 0.6 },
  vendors: [
    { id: 1, name: "Anthropic" },
    { id: 2, name: "OpenAI" },
  ],
  data: [
    {
      model_name: "Claude Opus 4.8",
      quota_type: 0,
      model_ratio: 2.5,
      model_price: 0,
      completion_ratio: 5,
      cache_ratio: 0.1,
      vendor_id: 1,
      enable_groups: ["claude"],
    },
    {
      model_name: "Claude Sonnet 4.6",
      quota_type: 0,
      model_ratio: 1.5,
      model_price: 0,
      completion_ratio: 5,
      cache_ratio: 0.1,
      vendor_id: 1,
      enable_groups: ["claude"],
    },
    {
      model_name: "Claude Haiku 4.5",
      quota_type: 0,
      model_ratio: 0.5,
      model_price: 0,
      completion_ratio: 5,
      cache_ratio: 0.1,
      vendor_id: 1,
      enable_groups: ["claude"],
    },
    {
      model_name: "GPT-5.5",
      quota_type: 0,
      model_ratio: 0.625,
      model_price: 0,
      completion_ratio: 8,
      cache_ratio: 0.1,
      vendor_id: 2,
      enable_groups: ["codex"],
    },
    {
      model_name: "GPT-5.5 mini",
      quota_type: 0,
      model_ratio: 0.125,
      model_price: 0,
      completion_ratio: 8,
      cache_ratio: 0.1,
      vendor_id: 2,
      enable_groups: ["codex"],
    },
    {
      model_name: "o4-mini",
      quota_type: 0,
      model_ratio: 0.55,
      model_price: 0,
      completion_ratio: 4,
      cache_ratio: 0.25,
      vendor_id: 2,
      enable_groups: ["codex"],
    },
  ],
};

const GROUP_META: Record<
  PricingGroup,
  {
    label: string;
    Logo: ComponentType<{ className?: string }>;
  }
> = {
  claude: {
    label: "claude",
    Logo: ClaudeLogo,
  },
  codex: { label: "codex", Logo: OpenAILogo },
};

function formatGroupMultiplier(value: number): string {
  if (!Number.isFinite(value)) return "1x";
  return `${Number(value.toFixed(4))}x`;
}

function groupPricing(
  source: ModelPricingData,
): Record<PricingGroup, GroupPricingRows> {
  const vendorName = new Map<number, string>();
  for (const vendor of source.vendors ?? [])
    vendorName.set(vendor.id, vendor.name);
  const grouped: Record<PricingGroup, GroupPricingRows> = {
    claude: { ratio: source.group_ratio?.claude ?? 1, rows: [] },
    codex: { ratio: source.group_ratio?.codex ?? 1, rows: [] },
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

function ModelPricingSection() {
  const [grouped, setGrouped] = useState<Record<
    PricingGroup,
    GroupPricingRows
  > | null>(null);
  const [tab, setTab] = useState<PricingGroup>("claude");

  useEffect(() => {
    let mounted = true;
    void fetchModelPricing()
      .then((res) => {
        if (!mounted) return;
        const hasData = res.success && (res.data?.length ?? 0) > 0;
        const next = groupPricing(
          hasData
            ? {
                data: res.data,
                vendors: res.vendors,
                group_ratio: res.group_ratio,
              }
            : import.meta.env.DEV
              ? DEV_SAMPLE_PRICING
              : {},
        );
        setGrouped(next);
      })
      .catch(() => {
        if (!mounted || !import.meta.env.DEV) return;
        setGrouped(groupPricing(DEV_SAMPLE_PRICING));
      });
    return () => {
      mounted = false;
    };
  }, []);

  const providers = useMemo(
    () =>
      PRICING_GROUP_ORDER.filter(
        (group) => (grouped?.[group]?.rows.length ?? 0) > 0,
      ),
    [grouped],
  );

  useEffect(() => {
    if (providers.length > 0 && !providers.includes(tab)) {
      setTab(providers[0]);
    }
  }, [providers, tab]);

  if (!grouped) return null;
  if (providers.length === 0) return null;

  const rows = grouped[tab]?.rows ?? [];

  return (
    <section className="section model-pricing-section" id="model-pricing">
      <div className="wrap">
        <div className="center">
          <Pill>
            <T id="Model pricing" />
          </Pill>
          <h2 className="h-sec">
            <T id="Pay only for the tokens you use" />
          </h2>
        </div>

        <div className="mp-panel">
          <div className="mp-panel-top">
            <div className="mp-tabs" role="tablist">
              {providers.map((provider) => {
                const { label, Logo } = GROUP_META[provider];
                const multiplier = formatGroupMultiplier(
                  grouped[provider].ratio,
                );
                return (
                  <button
                    key={provider}
                    type="button"
                    role="tab"
                    aria-selected={tab === provider}
                    className={`mp-tab${tab === provider ? " active" : ""}`}
                    onClick={() => setTab(provider)}
                  >
                    <Logo className={`mp-tab-logo ${provider}`} />
                    <span>{label}</span>
                    <span className="mp-tab-rate">{multiplier}</span>
                  </button>
                );
              })}
            </div>
            <div className="mp-panel-unit">
              <span aria-hidden="true" />
              <span>1M tokens</span>
            </div>
          </div>

          <div className="mp-table-wrap">
            <table className="mp-table">
              <thead>
                <tr>
                  <th className="mp-col-model">
                    <T id="Model" />
                  </th>
                  <th>
                    <T id="Input" />
                  </th>
                  <th>
                    <T id="Output" />
                  </th>
                  <th>
                    <T id="Cache read" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.name}>
                    <td className="mp-col-model">
                      <span className="mp-model-cell">
                        <span className="mp-model-mark" aria-hidden="true">
                          {row.name.slice(0, 1)}
                        </span>
                        <span className="mp-model-name">{row.name}</span>
                      </span>
                    </td>
                    {row.perCall != null ? (
                      <td className="mp-percall" colSpan={3}>
                        <span className="mp-price">
                          <span>{formatUsd(row.perCall)}</span>
                          <span className="mp-unit">
                            <T id="per request" />
                          </span>
                        </span>
                      </td>
                    ) : (
                      <>
                        <td>
                          <TokenPrice value={row.input} />
                        </td>
                        <td>
                          <TokenPrice value={row.output} />
                        </td>
                        <td className="mp-muted">
                          <TokenPrice value={row.cacheRead} />
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

export function createHomePage({
  MarketingHeader,
  TopupDialog,
}: {
  MarketingHeader: ComponentType<{ minimal?: boolean }>;
  TopupDialog: ComponentType<{ onClose: () => void }>;
}) {
  return function HomePage() {
    const { user } = useContext(AuthContext);
    const [status, setStatus] = useState<CustomerStatus | null>(null);
    const [plans, setPlans] = useState<SubscriptionPlanRecord[]>([]);
    const [topupInfo, setTopupInfo] = useState<TopupInfo | null>(null);
    const [plansLoading, setPlansLoading] = useState(true);
    const [topupDialogOpen, setTopupDialogOpen] = useState(false);

    useEffect(() => {
      let mounted = true;
      setPlansLoading(true);
      void Promise.all([
        fetchCustomerStatus(),
        fetchPublicPlans(),
        fetchTopupInfo(),
      ]).then(([statusRes, plansRes, topupInfoRes]) => {
        if (!mounted) return;
        if (statusRes.success && statusRes.data) setStatus(statusRes.data);
        setPlans(plansRes.success && plansRes.data ? plansRes.data : []);
        if (topupInfoRes.success && topupInfoRes.data) {
          setTopupInfo(topupInfoRes.data);
        }
        setPlansLoading(false);
      });
      return () => {
        mounted = false;
      };
    }, []);

    const displayPlans = useMemo(
      () => recordsToPricePlans(plans, status),
      [plans, status],
    );

    const handleOpenTopup = () => {
      if (!user?.id) {
        navigateTo("/sign-in");
        return;
      }
      setTopupDialogOpen(true);
    };

    return (
      <>
        <FathersDayGifts />
        <FathersDayGiftEntry />
        <MarketingHeader minimal />
        <main>
          <section className="hero-mesh home-hero">
            <div className="wrap hero-inner center">
              <h1>
                <T id="Get started, effortlessly" />
              </h1>
              <div className="hero-sub hero-brands">
                <span className="brand-group">
                  <ClaudeLogo className="brand-logo claude" />
                  <span>Claude Code</span>
                </span>
                <span className="brand-sep" aria-hidden="true">
                  /
                </span>
                <span className="brand-group">
                  <OpenAILogo className="brand-logo openai" />
                  <span>OpenAI Codex</span>
                </span>
              </div>
              <p className="hero-tagline">
                <T id="A stable AI coding solution" />
              </p>
              <div className="os-icons" aria-label="macOS Windows Linux">
                <span className="os-icon" aria-label="macOS">
                  <AppleLogo className="os-svg apple" />
                </span>
                <span className="os-icon" aria-label="Windows">
                  <WindowsLogo className="os-svg" />
                </span>
                <span className="os-icon" aria-label="Linux">
                  <LinuxLogo className="os-svg linux" />
                </span>
              </div>
              <div className="hero-cta">
                <AppLink className="btn btn-ghost btn-lg" href="/setup">
                  <BookOpen size={18} />
                  <T id="Setup guide" />
                </AppLink>
                <AppLink
                  className="btn btn-flux btn-lg"
                  href={user ? "/dashboard" : "/sign-in"}
                >
                  <Play size={18} />
                  <T id={user ? "Open dashboard" : "Start now"} />
                </AppLink>
              </div>
            </div>
          </section>

          <section className="section home-features" id="features">
            <div className="wrap">
              <div className="center">
                <Pill>
                  <T id="Why aitokensflux" />
                </Pill>
                <h2 className="h-sec">
                  <T id="Keep your workflow. Bill it smarter." />
                </h2>
              </div>
              <div className="feat-cols">
                <FeatureColumn
                  icon={Gauge}
                  titleId="One-key switch"
                  textId="One command reroutes your CLI traffic. Scripts untouched."
                />
                <FeatureColumn
                  icon={CircleDollarSign}
                  titleId="Usage-based"
                  textId="Top up any amount. Zero minimum. Credits never expire."
                />
                <FeatureColumn
                  icon={Activity}
                  titleId="Visual usage"
                  textId="Heatmaps and per-request cost make spending transparent."
                />
                <FeatureColumn
                  icon={ShieldCheck}
                  titleId="Secure"
                  textId="Self-managed keys, instant revocation, no content retained."
                />
              </div>
            </div>
          </section>

          <ModelPricingSection />

          <section className="section surface-band pricing-section">
            <div className="wrap">
              <div className="pricing-section-head">
                <div className="pricing-title center">
                  <Pill>
                    <T id="Pricing" />
                  </Pill>
                  <h2 className="h-sec">
                    <T id="Transparent pricing that scales down" />
                  </h2>
                </div>
                <AppLink
                  className="btn btn-ghost pricing-all-link"
                  href="/subscribe"
                >
                  <T id="See all plans" />
                </AppLink>
              </div>
              {plansLoading ? (
                <EmptyState id="Loading plans" />
              ) : displayPlans.length > 0 ? (
                <div className="price-grid">
                  {displayPlans.map((plan) => (
                    <PriceCard key={plan.planId ?? plan.name} plan={plan} />
                  ))}
                </div>
              ) : (
                <EmptyState id="No available plans" />
              )}
              {!plansLoading ? (
                <PaygTopupSection
                  status={status}
                  topupInfo={topupInfo}
                  onTopup={handleOpenTopup}
                />
              ) : null}
            </div>
          </section>

          <section className="wrap cta-wrap">
            <div className="cta-banner">
              <h2>
                <T id="Plug in in 5 minutes. Start saving today." />
              </h2>
              <p>
                <T id="Sign up for free trial credits, follow the guide once, and your Claude Code runs on aitokensflux." />
              </p>
              <div>
                <AppLink
                  className="btn btn-flux btn-lg"
                  href={user ? "/dashboard" : "/sign-in"}
                >
                  <T id={user ? "Open dashboard" : "Sign in / Register"} />
                </AppLink>
                <AppLink className="btn btn-ghost btn-lg dark" href="/setup">
                  <T id="Read docs" />
                </AppLink>
              </div>
            </div>
          </section>

          <SupportSection />

          <FaqSection />
        </main>
        {topupDialogOpen ? (
          <TopupDialog onClose={() => setTopupDialogOpen(false)} />
        ) : null}
        <Footer />
      </>
    );
  };
}
