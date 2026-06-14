import { LoaderCircle, X } from "lucide-react";
import { useContext, useEffect, useState } from "react";
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

  useEffect(() => {
    if (submitting) return;
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, submitting]);

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
    <div className="confirm-dialog" role="dialog" aria-modal="true">
      <button
        aria-label={localizeKey(language, "Close")}
        className="confirm-dialog-backdrop"
        disabled={submitting}
        type="button"
        onClick={onClose}
      />
      <section className="confirm-dialog-panel">
        <button
          aria-label={localizeKey(language, "Close")}
          className="confirm-dialog-close"
          disabled={submitting}
          type="button"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <h2>{localizeKey(language, config.title.id, config.title.values)}</h2>
        <p>{localizeKey(language, config.message.id, config.message.values)}</p>
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
      </section>
    </div>
  );
}
