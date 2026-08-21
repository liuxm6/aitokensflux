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
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppLink } from "../../components/common/AppLink";
import {
  AppleLogo,
  ClaudeLogo,
  GeminiLogo,
  GrokLogo,
  HERO_MODEL_PAIRS,
  LinuxLogo,
  OpenAILogo,
  SupportRewardMascot,
  WindowsLogo,
} from "../../components/home/HomeLogos";
export { HERO_MODEL_PAIRS, HERO_MODELS } from "../../components/home/HomeLogos";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components/common/ui/AsyncState";
import {
  FathersDayGifts,
  FathersDayGiftEntry,
} from "../../components/common/FathersDayGifts";
import { Pill } from "../../components/common/Pill";
import { TabList, TabPanel } from "../../components/common/ui/TabList";
import { Footer } from "../../components/layout/Footer";
import { SupportChannelGrid } from "../../components/support/SupportChannels";
import { PaygTopupSection } from "../../components/topup/PaygTopupSection";
import { PriceCard } from "../../components/topup/PriceCard";
import { AuthContext } from "../../context/Auth";
import { LanguageContext, T } from "../../context/Language";
import { navigateTo } from "../../helpers/navigation";
import { prefetchLikelyNextPages } from "../../helpers/prefetch";
import { scrollToHash } from "../../helpers/motion";
import {
  PRICING_GROUP_ORDER,
  formatGroupMultiplier,
  formatUsd,
  groupPricing,
} from "../../helpers/model-pricing";
import type {
  GroupPricingRows,
  PricingGroup,
} from "../../helpers/model-pricing";
import { recordsToPricePlans } from "../../helpers/plans";
import { localizeKey, localizeText } from "../../i18n/localization";
import seoPages from "../../seo/pages.json";
import {
  fetchCustomerStatus,
  fetchModelPricing,
  fetchPublicPlans,
  fetchTopupInfo,
} from "../../services/customer-api";
import type {
  CustomerStatus,
  SubscriptionPlanRecord,
  TopupInfo,
} from "../../types";

export {
  classifyFallbackGroup,
  groupPricing,
} from "../../helpers/model-pricing";
export const HOME_SECTION_ORDER = [
  "hero",
  "support-benefit",
  "capabilities",
  "model-rates",
  "plans-balance",
  "cta",
  "support",
  "faq",
  "footer",
] as const;

export const HOME_DESTINATIONS = {
  dashboard: "/dashboard",
  onboarding: "/sign-in",
  plans: "/pricing",
  setup: "/docs",
  support: "/#support",
} as const;

export const HOME_HERO_COPY = {
  title: "Unified Claude Code, Codex, Grok and Gemini API gateway",
  tagline: "A stable AI coding solution",
  setupCta: "Setup guide",
  primaryCta: "Start now",
} as const;

export const HOME_SECTION_HEADINGS = {
  modelRates: "Pay only for the tokens you use",
  plansBalance: "Transparent pricing that scales down",
} as const;

export const HOME_PRICING_LAYOUT = {
  tableClassName: "mp-table-wrap mp-table-wrap-adaptive",
  emptyPlansClassName: "pricing-section-empty",
} as const;

const MODEL_PRICING_TABS_ID = "model-pricing";

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
  const { language } = useContext(LanguageContext);
  const faq = seoPages.pages.find((page) => page.key === "home")?.faq ?? [];

  return (
    <section className="section faq-section" data-home-section="faq">
      <div className="wrap narrow">
        <h2 className="h-sec center">
          <T id="FAQ" />
        </h2>
        <div className="faq">
          {faq.map((item, index) => {
            const question = localizeText(
              language,
              item.question.zh,
              item.question.en,
            );
            const answer = localizeText(
              language,
              item.answer.zh,
              item.answer.en,
            );
            return (
              <details key={item.question.en} open={index === 0}>
                <summary>
                  {question}
                  <span className="faq-toggle-icon" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p>{answer}</p>
              </details>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SupportSection() {
  return (
    <section
      className="section support-section"
      data-home-section="support"
      id="support"
    >
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

function TokenPrice({ value }: { value: number | null }) {
  if (value == null) return <>-</>;
  return (
    <span className="mp-price">
      <span>{formatUsd(value)}</span>
      <span className="mp-unit">/M</span>
    </span>
  );
}

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
  codex: {
    label: "codex",
    Logo: OpenAILogo,
  },
  grok: {
    label: "grok",
    Logo: GrokLogo,
  },
  gemini: {
    label: "gemini",
    Logo: GeminiLogo,
  },
};

function ModelPricingSection() {
  const { language } = useContext(LanguageContext);
  const [grouped, setGrouped] = useState<Record<
    PricingGroup,
    GroupPricingRows
  > | null>(null);
  const [pricingError, setPricingError] = useState(false);
  const [tab, setTab] = useState<PricingGroup>("claude");
  const pricingRequestRef = useRef(0);

  const loadPricing = useCallback(() => {
    const requestId = pricingRequestRef.current + 1;
    pricingRequestRef.current = requestId;
    setGrouped(null);
    setPricingError(false);
    void fetchModelPricing()
      .then((res) => {
        if (pricingRequestRef.current !== requestId) return;
        if (!res.success) {
          setPricingError(true);
          return;
        }
        setGrouped(
          groupPricing({
            data: res.data,
            vendors: res.vendors,
            group_ratio: res.group_ratio,
            usable_group: res.usable_group,
          }),
        );
      })
      .catch(() => {
        if (pricingRequestRef.current !== requestId) return;
        setPricingError(true);
      });
  }, []);

  useEffect(() => {
    loadPricing();
    return () => {
      pricingRequestRef.current += 1;
    };
  }, [loadPricing]);

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

  if (!grouped) {
    return (
      <section
        className="section model-pricing-section"
        data-home-section="model-rates"
        id="model-pricing"
      >
        <div className="wrap">
          {pricingError ? (
            <ErrorState
              id="Failed to load model pricing"
              onRetry={loadPricing}
            />
          ) : (
            <LoadingState id="Loading model pricing" />
          )}
        </div>
      </section>
    );
  }
  if (providers.length === 0) {
    return (
      <section
        className="section model-pricing-section"
        data-home-section="model-rates"
        id="model-pricing"
      >
        <div className="wrap">
          <EmptyState id="No model pricing is available" />
        </div>
      </section>
    );
  }

  const rows = grouped[tab]?.rows ?? [];
  const groupNote = (grouped[tab]?.note ?? "").trim();
  const TabLogo = GROUP_META[tab].Logo;

  return (
    <section
      className="section model-pricing-section"
      data-home-section="model-rates"
      id="model-pricing"
    >
      <div className="wrap">
        <div className="center">
          <Pill>
            <T id="Model pricing" />
          </Pill>
          <h2 className="h-sec">
            <T id={HOME_SECTION_HEADINGS.modelRates} />
          </h2>
        </div>

        <div className="mp-panel">
          <div className="mp-panel-top">
            <TabList
              className="mp-tabs"
              idPrefix={MODEL_PRICING_TABS_ID}
              label={localizeKey(language, "Model provider")}
              tabClassName="mp-tab"
              tabs={providers.map((provider) => {
                const { label, Logo } = GROUP_META[provider];
                return {
                  value: provider,
                  label: (
                    <>
                      <Logo className={`mp-tab-logo ${provider}`} />
                      <span>{label}</span>
                      <span className="mp-tab-rate">
                        {formatGroupMultiplier(grouped[provider].ratio)}
                      </span>
                    </>
                  ),
                };
              })}
              value={tab}
              onChange={setTab}
            />
            <div className="mp-panel-meta">
              <div className="mp-panel-unit">
                <span aria-hidden="true" />
                <span>
                  <T id="1M = 1,000,000 tokens" />
                </span>
              </div>
              <a
                className="mp-meta-link"
                href="https://www.hvoy.ai"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ShieldCheck size={14} />
                <T id="Check authenticity" />
              </a>
              <a
                className="mp-meta-link"
                href="https://check.aitokensflux.com/group/TokenFlux"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Activity size={14} />
                <T id="Service monitor" />
              </a>
            </div>
          </div>

          <TabPanel idPrefix={MODEL_PRICING_TABS_ID} value={tab}>
            {groupNote ? (
              <div className="mp-group-note">
                <span className="mp-group-note-label">
                  <T id="Group note" />
                </span>
                <span>{groupNote}</span>
              </div>
            ) : null}

            <div
              aria-labelledby="model-pricing-caption"
              className={HOME_PRICING_LAYOUT.tableClassName}
              role="region"
              tabIndex={0}
            >
              <table className="mp-table">
                <caption className="sr-only" id="model-pricing-caption">
                  <T id="Model pricing" />
                </caption>
                <thead>
                  <tr>
                    <th className="mp-col-model" scope="col">
                      <T id="Model" />
                    </th>
                    <th scope="col">
                      <T id="Input" />
                    </th>
                    <th scope="col">
                      <T id="Output" />
                    </th>
                    <th scope="col">
                      <T id="Cache read" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.name}>
                      <td
                        className="mp-col-model"
                        data-label={localizeKey(language, "Model")}
                      >
                        <span className="mp-model-cell">
                          <span
                            className={`mp-model-mark ${tab}`}
                            aria-hidden="true"
                          >
                            <TabLogo className="mp-model-logo" />
                          </span>
                          <span className="mp-model-name">{row.name}</span>
                        </span>
                      </td>
                      {row.perCall != null ? (
                        <td
                          className="mp-percall"
                          colSpan={3}
                          data-label={localizeKey(language, "Price")}
                        >
                          <span className="mp-price">
                            <span>{formatUsd(row.perCall)}</span>
                            <span className="mp-unit">
                              <T id="per request" />
                            </span>
                          </span>
                        </td>
                      ) : (
                        <>
                          <td data-label={localizeKey(language, "Input")}>
                            <TokenPrice value={row.input} />
                          </td>
                          <td data-label={localizeKey(language, "Output")}>
                            <TokenPrice value={row.output} />
                          </td>
                          <td
                            className="mp-muted"
                            data-label={localizeKey(language, "Cache read")}
                          >
                            <TokenPrice value={row.cacheRead} />
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabPanel>
        </div>
      </div>
    </section>
  );
}

export function createHomePage({
  MarketingHeader,
  TopupDialog,
}: {
  MarketingHeader: ComponentType<{
    minimal?: boolean;
    homePage?: boolean;
  }>;
  TopupDialog: ComponentType<{ onClose: () => void }>;
}) {
  return function HomePage() {
    const { user } = useContext(AuthContext);
    const { language } = useContext(LanguageContext);
    const [status, setStatus] = useState<CustomerStatus | null>(null);
    const [plans, setPlans] = useState<SubscriptionPlanRecord[]>([]);
    const [topupInfo, setTopupInfo] = useState<TopupInfo | null>(null);
    const [plansLoading, setPlansLoading] = useState(true);
    const [plansError, setPlansError] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);
    const [topupDialogOpen, setTopupDialogOpen] = useState(false);
    const heroRef = useRef<HTMLElement>(null);

    useLayoutEffect(() => {
      scrollToHash(window.location.hash);
    }, []);

    useEffect(() => {
      const hero = heroRef.current;
      if (!hero || typeof IntersectionObserver === "undefined") return;

      let onscreen = true;
      const sync = () => {
        hero.classList.toggle("is-paused", !onscreen || document.hidden);
      };
      const observer = new IntersectionObserver(([entry]) => {
        onscreen = entry.isIntersecting;
        sync();
      });
      observer.observe(hero);
      document.addEventListener("visibilitychange", sync);
      return () => {
        observer.disconnect();
        document.removeEventListener("visibilitychange", sync);
      };
    }, []);

    useEffect(() => {
      const warm = () => prefetchLikelyNextPages();
      if (typeof requestIdleCallback === "function") {
        const idleId = requestIdleCallback(warm);
        return () => cancelIdleCallback(idleId);
      }
      const timeoutId = window.setTimeout(warm, 250);
      return () => window.clearTimeout(timeoutId);
    }, []);

    useEffect(() => {
      let mounted = true;
      setPlansLoading(true);
      setPlansError(false);
      void Promise.all([
        fetchCustomerStatus(),
        fetchPublicPlans(),
        fetchTopupInfo(),
      ]).then(([statusRes, plansRes, topupInfoRes]) => {
        if (!mounted) return;
        if (statusRes.success && statusRes.data) setStatus(statusRes.data);
        setPlans(plansRes.success && plansRes.data ? plansRes.data : []);
        setPlansError(!plansRes.success);
        if (topupInfoRes.success && topupInfoRes.data) {
          setTopupInfo(topupInfoRes.data);
        }
        setPlansLoading(false);
      });
      return () => {
        mounted = false;
      };
    }, [reloadKey]);

    const displayPlans = useMemo(
      () => recordsToPricePlans(plans, status),
      [plans, status],
    );
    const showEmptyPlans =
      !plansLoading && !plansError && displayPlans.length === 0;

    const handleOpenTopup = () => {
      if (!user?.id) {
        navigateTo(HOME_DESTINATIONS.onboarding);
        return;
      }
      setTopupDialogOpen(true);
    };

    return (
      <>
        <FathersDayGifts />
        <FathersDayGiftEntry />
        <MarketingHeader minimal homePage />
        <main className="home-page">
          <section
            className="hero-mesh home-hero"
            data-home-section="hero"
            ref={heroRef}
          >
            <div className="wrap hero-inner center">
              <h1 className="sr-only hero-seo-title">
                <T id={HOME_HERO_COPY.title} />
              </h1>
              <div
                aria-label={localizeKey(
                  language,
                  "Claude Code, OpenAI Codex, Grok Code, Google Gemini",
                )}
                className="hero-sub hero-model-switcher"
                role="group"
              >
                {HERO_MODEL_PAIRS.map((pair) => (
                  <span
                    aria-hidden="true"
                    className="hero-model-pair"
                    key={`${pair[0].id}-${pair[1].id}`}
                  >
                    {pair.map(({ id, label, Logo }, index) => (
                      <span className={`hero-model-item ${id}`} key={id}>
                        {index > 0 ? (
                          <span
                            className="hero-model-separator"
                            aria-hidden="true"
                          >
                            /
                          </span>
                        ) : null}
                        <Logo className={`brand-logo ${id}`} />
                        <span>{label}</span>
                      </span>
                    ))}
                  </span>
                ))}
              </div>
              <p className="hero-tagline">
                <T id={HOME_HERO_COPY.tagline} />
              </p>
              <div
                className="os-icons"
                aria-label={localizeKey(language, "macOS Windows Linux")}
              >
                <span
                  className="os-icon"
                  aria-label={localizeKey(language, "macOS")}
                >
                  <AppleLogo className="os-svg apple" />
                </span>
                <span
                  className="os-icon"
                  aria-label={localizeKey(language, "Windows")}
                >
                  <WindowsLogo className="os-svg" />
                </span>
                <span
                  className="os-icon"
                  aria-label={localizeKey(language, "Linux")}
                >
                  <LinuxLogo className="os-svg linux" />
                </span>
              </div>
              <div className="hero-cta">
                <AppLink
                  className="btn btn-ghost btn-lg"
                  href={HOME_DESTINATIONS.setup}
                >
                  <BookOpen size={18} />
                  <T id={HOME_HERO_COPY.setupCta} />
                </AppLink>
                <AppLink
                  className="btn btn-flux btn-lg"
                  href={
                    user
                      ? HOME_DESTINATIONS.dashboard
                      : HOME_DESTINATIONS.onboarding
                  }
                >
                  <Play size={18} />
                  <T id={user ? "Open dashboard" : HOME_HERO_COPY.primaryCta} />
                </AppLink>
              </div>
              <AppLink
                className="support-reward-callout"
                data-home-section="support-benefit"
                href={HOME_DESTINATIONS.support}
              >
                <span className="support-reward-mascot">
                  <SupportRewardMascot />
                </span>
                <span className="support-reward-copy">
                  <span className="support-reward-kicker">
                    <T id="Support group bonus" />
                  </span>
                  <strong>
                    <T id="Join the support group to claim benefits" />
                  </strong>
                  <span>
                    <T id="Check the group for support and benefit details." />
                  </span>
                </span>
                <span className="support-reward-action">
                  <T id="Go to support group" />
                </span>
              </AppLink>
            </div>
          </section>

          <section
            className="section home-features"
            data-home-section="capabilities"
            id="features"
          >
            <div className="wrap">
              <div className="home-section-head center">
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

          <section
            className={`section surface-band pricing-section${
              showEmptyPlans
                ? ` ${HOME_PRICING_LAYOUT.emptyPlansClassName}`
                : ""
            }`}
            data-home-section="plans-balance"
          >
            <div className="wrap">
              <div className="pricing-section-head">
                <div className="pricing-title home-section-head-left">
                  <h2 className="h-sec">
                    <T id={HOME_SECTION_HEADINGS.plansBalance} />
                  </h2>
                  <p className="pricing-note">
                    <T id="CNY and USD are settled 1:1." />
                  </p>
                </div>
                <AppLink
                  className="btn btn-ghost pricing-all-link"
                  href={HOME_DESTINATIONS.plans}
                >
                  <T id="See all plans" />
                </AppLink>
              </div>
              {plansLoading ? (
                <LoadingState id="Loading plans" />
              ) : plansError ? (
                <ErrorState
                  id="Failed to load plans"
                  onRetry={() => setReloadKey((value) => value + 1)}
                />
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

          <section className="wrap cta-wrap" data-home-section="cta">
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
                  href={
                    user
                      ? HOME_DESTINATIONS.dashboard
                      : HOME_DESTINATIONS.onboarding
                  }
                >
                  <T id={user ? "Open dashboard" : "Sign in / Register"} />
                </AppLink>
                <AppLink
                  className="btn btn-ghost btn-lg dark"
                  href={HOME_DESTINATIONS.setup}
                >
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
        <div data-home-section="footer">
          <Footer />
        </div>
      </>
    );
  };
}
