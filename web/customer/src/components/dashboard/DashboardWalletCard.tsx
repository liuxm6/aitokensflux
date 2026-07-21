import { CircleDollarSign } from "lucide-react";
import { T } from "../../context/Language";

export function DashboardWalletCard({
  balanceLabel,
  todayUsedLabel,
  requestCount,
  onTopup,
}: {
  balanceLabel: string;
  todayUsedLabel: string;
  requestCount: number;
  onTopup: () => void;
}) {
  return (
    <section
      aria-labelledby="dashboard-wallet-title"
      className="panel dashboard-wallet-card"
      id="dashboard-wallet"
    >
      <div className="dashboard-wallet-primary">
        <div className="dashboard-wallet-balance">
          <h2 id="dashboard-wallet-title">
            <T id="Wallet balance" />
          </h2>
          <strong className="mono">{balanceLabel}</strong>
        </div>
        <button className="btn btn-flux btn-sm" type="button" onClick={onTopup}>
          <CircleDollarSign size={15} />
          <T id="Top up now" />
        </button>
      </div>
      <dl className="dashboard-wallet-metrics">
        <div>
          <dt>
            <T id="Today used" />
          </dt>
          <dd className="mono">{todayUsedLabel}</dd>
        </div>
        <div>
          <dt>
            <T id="Request count" />
          </dt>
          <dd className="mono">{requestCount}</dd>
        </div>
      </dl>
      <p className="wallet-settlement-note">
        <T id="CNY and USD are settled 1:1." />
      </p>
    </section>
  );
}
