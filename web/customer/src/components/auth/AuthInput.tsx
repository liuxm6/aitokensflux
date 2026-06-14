import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function AuthInput({
  label,
  value,
  placeholder,
  onChange,
  type = "text",
  autoComplete,
  icon: Icon,
  button,
  maxLength,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  icon?: LucideIcon;
  button?: ReactNode;
  maxLength?: number;
}) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      <div className={button ? "auth-input with-action" : "auth-input"}>
        {Icon ? <Icon size={17} /> : null}
        <input
          autoComplete={autoComplete}
          maxLength={maxLength}
          placeholder={placeholder}
          type={type}
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
        {button}
      </div>
    </label>
  );
}
