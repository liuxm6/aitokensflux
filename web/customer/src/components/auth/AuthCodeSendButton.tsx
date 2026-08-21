import { LoaderCircle } from "lucide-react";

export function AuthCodeSendButton({
  loading,
  disabled,
  label,
  ariaLabel,
  onClick,
}: {
  loading: boolean;
  disabled: boolean;
  label: string;
  ariaLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
      disabled={disabled}
      type="button"
      onClick={onClick}
    >
      {loading ? (
        <LoaderCircle aria-hidden="true" className="spin" size={16} />
      ) : (
        label
      )}
    </button>
  );
}
