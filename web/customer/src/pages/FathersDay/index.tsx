import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../../components/common/EmptyState";
import { Footer } from "../../components/layout/Footer";
import { PriceCard } from "../../components/topup/PriceCard";
import { FATHERS_DAY_PLAN_ID } from "../../constants/seasonal";
import { T } from "../../context/Language";
import { recordToPricePlan, recordsToPricePlans } from "../../helpers/plans";
import { usePlanPurchase } from "../../hooks/usePlanPurchase";
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

type MarketingHeaderComponent = ComponentType<{ minimal?: boolean }>;
type TopupDialogComponent = ComponentType<{ onClose: () => void }>;

export function createFathersDayPage({
  MarketingHeader,
}: {
  MarketingHeader: MarketingHeaderComponent;
  // Accepted for a consistent page-factory signature; not used on this page.
  TopupDialog: TopupDialogComponent;
}) {
  return function FathersDayPage() {
    const [status, setStatus] = useState<CustomerStatus | null>(null);
    const [plans, setPlans] = useState<SubscriptionPlanRecord[]>([]);
    const [topupInfo, setTopupInfo] = useState<TopupInfo | null>(null);
    const [loading, setLoading] = useState(true);

    const purchase = usePlanPurchase({ status, topupInfo });

    useEffect(() => {
      let mounted = true;
      setLoading(true);
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
        setLoading(false);
      });
      return () => {
        mounted = false;
      };
    }, []);

    const displayPlans = useMemo(
      () => recordsToPricePlans(plans, status),
      [plans, status],
    );

    const featuredPlan = useMemo(() => {
      // Pin to the configured plan id by looking it up in the raw record list,
      // since recordsToPricePlans may filter it out (it is not an AI coding
      // plan). Fall back to the first visible plan if the id is missing.
      if (FATHERS_DAY_PLAN_ID != null) {
        const record = plans.find(
          (item) => item.plan?.id === FATHERS_DAY_PLAN_ID,
        );
        if (record) return recordToPricePlan(record, status);
      }
      return displayPlans[0] ?? null;
    }, [plans, displayPlans, status]);

    return (
      <>
        <MarketingHeader minimal />
        <main className="section fathers-day-page">
          <article className="wrap narrow fathers-day-letter">
            <div className="fathers-day-letter-mark" aria-hidden="true">
              🎁
            </div>
            <p className="fathers-day-eyebrow">
              <T
                zh="AI Tokens Flux 运营团队 · 致每一位写代码的父亲"
                en="From the AI Tokens Flux Team · To Every Father Who Writes Code"
              />
            </p>
            <h1 className="fathers-day-title">
              <T zh="致，写代码的父亲" en="To the Fathers Who Write Code" />
            </h1>

            <div className="fathers-day-body">
              <p>
                <T
                  zh="此刻，也许你正盯着一段报错，光标在深夜里一闪一闪。公司的工位上，只剩你这一盏屏还亮着，家里的人早已睡下，而你还在为一次上线、一个 deadline，一个人撑着。"
                  en="Right now, maybe you're staring at a stack trace, the cursor blinking into the small hours. Yours is the last screen still glowing in the office, your family long asleep at home — and you're still holding the line alone, for one more release, one more deadline."
                />
              </p>
              <p>
                <T
                  zh="你能记住成百上千行代码的逻辑，能在一堆日志里一眼揪出那个 bug，却常常想不起：孩子上一次扑进你怀里、喊你「爸爸快看」，到底是哪一天。"
                  en="You can hold thousands of lines of logic in your head and spot the one bug buried in a wall of logs — yet you often can't recall the last time your child ran into your arms and shouted, 'Daddy, look!'"
                />
              </p>
              <p>
                <T
                  zh="你为这个世界搭过那么多系统，扛过那么多从 0 到 1。可你心里真正放不下、最想守护好的那个「项目」，从来都是家。"
                  en="You've built so many systems for the world, carried so many things from zero to one. But the one 'project' you can never put down — the one you most want to keep safe — has always been home."
                />
              </p>
              <p>
                <T
                  zh="那些通宵、那些 on-call 的凌晨、那些悄悄变白的头发，都被你轻描淡写成一句「还行，不累」。可我们都懂——你拼的从来不只是代码，而是想给他们一个更稳一点的明天。"
                  en="The all-nighters, the 3 a.m. on-call pages, the hair that quietly turned grey — you brush it all off with a simple 'I'm fine, not tired.' But we understand: you were never just fighting for the code. You were building them a steadier tomorrow."
                />
              </p>
              <p className="fathers-day-closing">
                <T
                  zh="今天，请把进度条交给我们守一会儿。父亲节快乐——敬每一位用代码，扛起一整个家的父亲。"
                  en="Today, let us watch the progress bar for a while. Happy Father's Day — to every father who carries a whole family on his code."
                />
              </p>
            </div>

            <p className="fathers-day-signoff">
              <T
                zh="—— AI Tokens Flux 运营团队 敬上"
                en="— With respect, the AI Tokens Flux Team"
              />
            </p>
            <div className="fathers-day-sign" aria-hidden="true">
              ❤️
            </div>
          </article>

          <section className="wrap fathers-day-offer">
            <div className="center">
              <h2 className="h-sec">
                <T
                  zh="这个父亲节，给自己一份稳稳的支持"
                  en="This Father's Day, give yourself some steady backup"
                />
              </h2>
              <p className="lead">
                <T
                  zh="少熬一个通宵，多陪一次家人。让这份父亲节方案，替你分担一点深夜里的重量。"
                  en="One fewer all-nighter, one more evening with family. Let this Father's Day plan carry a little of the late-night weight for you."
                />
              </p>
            </div>
            {loading ? (
              <EmptyState id="Loading plans" />
            ) : featuredPlan ? (
              <div className="fathers-day-plan">
                <PriceCard
                  plan={featuredPlan}
                  disabled={purchase.buyingPlanId !== null}
                  disabledLabelId={
                    purchase.buyingPlanId !== null ? "Processing" : undefined
                  }
                  onBuy={purchase.openPurchase}
                />
              </div>
            ) : (
              <EmptyState id="No available plans" />
            )}
          </section>
        </main>
        {purchase.dialogs}
        <Footer />
      </>
    );
  };
}
