import { X } from "lucide-react";
import type { RefObject } from "react";

export function AuthCloseButton({
  buttonRef,
  label,
  onClick,
}: {
  buttonRef?: RefObject<HTMLButtonElement | null>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      ref={buttonRef}
      aria-label={label}
      className="auth-close"
      type="button"
      onClick={onClick}
    >
      <X size={24} />
    </button>
  );
}
