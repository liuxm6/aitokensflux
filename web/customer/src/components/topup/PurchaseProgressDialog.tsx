import { Check, LoaderCircle, Play, X } from "lucide-react";
import { useContext, useEffect } from "react";
import { LanguageContext, T } from "../../context/Language";
import { localizeKey } from "../../i18n/localization";
import type {
  Language,
  PurchaseLaunch,
  PurchaseProgress,
  PurchaseStepKey,
  PurchaseStepState,
} from "../../types";

const purchaseStepOrder: PurchaseStepKey[] = ["order", "paymentInfo", "launch"];

const purchaseStepLabels: Record<PurchaseStepKey, string> = {
  order: "Create order",
  paymentInfo: "Get payment details",
  launch: "Launch payment",
};

function getPurchaseStepStatusLabel(
  state: PurchaseStepState,
  language: Language,
) {
  if (state === "done") return localizeKey(language, "Done");
  if (state === "processing") return localizeKey(language, "Processing");
  if (state === "error") return localizeKey(language, "Failed");
  return localizeKey(language, "Waiting");
}

export function PurchaseProgressDialog({
  progress,
  onClose,
  onLaunch,
}: {
  progress: PurchaseProgress;
  onClose: () => void;
  onLaunch: (launch: PurchaseLaunch) => void;
}) {
  const { language } = useContext(LanguageContext);
  const isProcessing = Object.values(progress.steps).some(
    (state) => state === "processing",
  );
  const hasError = Object.values(progress.steps).some(
    (state) => state === "error",
  );
  const title = hasError
    ? localizeKey(language, "Payment needs attention")
    : isProcessing
      ? localizeKey(language, "Preparing payment")
      : progress.launch
        ? localizeKey(language, "Payment page ready")
        : localizeKey(language, "Purchase successful");

  useEffect(() => {
    if (!progress.canClose) return;
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, progress.canClose]);

  return (
    <div className="purchase-dialog" role="dialog" aria-modal="true">
      <div className="purchase-backdrop" />
      <div className="purchase-panel">
        {progress.canClose ? (
          <button
            aria-label={localizeKey(language, "Close")}
            className="purchase-close"
            type="button"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        ) : null}
        <div className="purchase-head">
          <span className="purchase-kicker">{progress.planName}</span>
          <h2>{title}</h2>
          <p>{progress.message}</p>
        </div>
        <div className="purchase-steps">
          {purchaseStepOrder.map((step) => {
            const state = progress.steps[step];
            const label = purchaseStepLabels[step];
            return (
              <div className={`purchase-step ${state}`} key={step}>
                <span className="purchase-step-icon">
                  {state === "done" ? <Check size={18} /> : null}
                  {state === "processing" ? <LoaderCircle size={18} /> : null}
                  {state === "error" ? <X size={18} /> : null}
                </span>
                <span className="purchase-step-label">
                  {localizeKey(language, label)}
                </span>
                <span className="purchase-step-state">
                  {getPurchaseStepStatusLabel(state, language)}
                </span>
              </div>
            );
          })}
        </div>
        {progress.error ? (
          <div className="purchase-error">{progress.error}</div>
        ) : null}
        {progress.launch && progress.canClose ? (
          <div className="purchase-actions">
            <button
              className="btn btn-dark btn-block"
              type="button"
              onClick={() => onLaunch(progress.launch as PurchaseLaunch)}
            >
              <Play size={16} />
              <T id="Open payment page" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
