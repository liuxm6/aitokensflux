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
import { Pill } from "../../components/common/Pill";
import { Footer } from "../../components/layout/Footer";
import { PaygTopupSection } from "../../components/topup/PaygTopupSection";
import { PriceCard } from "../../components/topup/PriceCard";
import { AuthContext } from "../../context/Auth";
import { T } from "../../context/Language";
import { navigateTo } from "../../helpers/navigation";
import { recordsToPricePlans } from "../../helpers/plans";
import {
  fetchCustomerStatus,
  fetchPublicPlans,
  fetchTopupInfo,
} from "../../services/customer-api";
import type {
  CustomerStatus,
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
        <MarketingHeader minimal />
        <main>
          <section className="hero-mesh home-hero">
            <div className="wrap hero-inner center">
              <h1>
                <T id="Get started, effortlessly" />
              </h1>
              <div className="hero-sub">Claude Code / OpenAI Codex</div>
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

          <section className="section" id="features">
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

          <section className="section surface-band">
            <div className="wrap">
              <div className="section-head">
                <div>
                  <Pill>
                    <T id="Pricing" />
                  </Pill>
                  <h2 className="h-sec">
                    <T id="Transparent pricing that scales down" />
                  </h2>
                </div>
                <AppLink className="btn btn-ghost" href="/subscribe">
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
