import { LoaderCircle, X } from "lucide-react";
import { useContext, useId, useRef, useState } from "react";
import { AccessibleDialog } from "./ui/Dialog";
import { LanguageContext } from "../../context/Language";
import { localizeKey } from "../../i18n/localization";
import type { ConfirmActionConfig } from "../../types";

export function ConfirmActionDialog({
  config,
  onClose,
}: {
  config: ConfirmActionConfig;
  onClose: () => void;
}) {
  const { language } = useContext(LanguageContext);
  const [submitting, setSubmitting] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await config.onConfirm();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };
  const cancelText = config.cancelText ?? { id: "Cancel" };
  const confirmText = config.confirmText ?? { id: "Confirm" };

  return (
    <AccessibleDialog
      ariaDescribedBy={descriptionId}
      ariaLabelledBy={titleId}
      backdropClassName="confirm-dialog-backdrop"
      className="confirm-dialog"
      closeDisabled={submitting}
      closeLabel={localizeKey(language, "Close")}
      initialFocusRef={closeRef}
      panelClassName="confirm-dialog-panel"
      onClose={onClose}
    >
      <button
        ref={closeRef}
        aria-label={localizeKey(language, "Close")}
        className="confirm-dialog-close"
        disabled={submitting}
        type="button"
        onClick={onClose}
      >
        <X size={20} />
      </button>
      <h2 id={titleId}>
        {localizeKey(language, config.title.id, config.title.values)}
      </h2>
      <p id={descriptionId}>
        {localizeKey(language, config.message.id, config.message.values)}
      </p>
      <div className="confirm-dialog-actions">
        <button
          className="confirm-dialog-cancel"
          disabled={submitting}
          type="button"
          onClick={onClose}
        >
          {localizeKey(language, cancelText.id, cancelText.values)}
        </button>
        <button
          className="confirm-dialog-confirm"
          disabled={submitting}
          type="button"
          onClick={() => void handleConfirm()}
        >
          {submitting ? <LoaderCircle className="spin" size={18} /> : null}
          {localizeKey(language, confirmText.id, confirmText.values)}
        </button>
      </div>
    </AccessibleDialog>
  );
}
