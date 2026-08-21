import { LoaderCircle } from "lucide-react";

export function AuthSubmitButton({
  loading,
  disabled,
  label,
  loadingLabel,
  spinnerSize = 18,
  type = "submit",
  onClick,
}: {
  loading: boolean;
  disabled?: boolean;
  label: string;
  loadingLabel?: string;
  spinnerSize?: number;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  return (
    <button
      aria-busy={loading || undefined}
      aria-label={loading && loadingLabel ? loadingLabel : label}
      className="auth-submit"
      disabled={disabled}
      type={type}
      onClick={onClick}
    >
      {loading ? (
        <>
          <LoaderCircle
            aria-hidden="true"
            className="spin"
            size={spinnerSize}
          />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}
