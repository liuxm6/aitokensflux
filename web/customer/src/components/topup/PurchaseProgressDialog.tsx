import { Check, LoaderCircle, Play, X } from "lucide-react";
import { useContext, useId, useRef } from "react";
import { AccessibleDialog } from "../common/ui/Dialog";
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
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();
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

  return (
    <AccessibleDialog
      ariaDescribedBy={descriptionId}
      ariaLabelledBy={titleId}
      backdropClassName="purchase-backdrop"
      className="purchase-dialog"
      closeDisabled={!progress.canClose}
      closeLabel={localizeKey(language, "Close")}
      closeOnBackdrop={false}
      initialFocusRef={progress.canClose ? closeButtonRef : undefined}
      panelClassName="purchase-panel"
      onClose={onClose}
    >
      {progress.canClose ? (
        <button
          ref={closeButtonRef}
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
        <h2 id={titleId}>{title}</h2>
        <p id={descriptionId}>{progress.message}</p>
      </div>
      <div className="purchase-dialog-body purchase-progress-body">
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
    </AccessibleDialog>
  );
}
