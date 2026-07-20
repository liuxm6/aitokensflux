import type { LucideIcon } from "lucide-react";
import type { InputHTMLAttributes, ReactNode, Ref } from "react";
import { FormField } from "../common/ui/FormField";

export function AuthInput({
  label,
  value,
  placeholder,
  onChange,
  type = "text",
  autoComplete,
  icon: Icon,
  button,
  error,
  helperText,
  inputProps,
  inputRef,
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
  error?: string;
  helperText?: ReactNode;
  inputProps?: Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "autoComplete" | "maxLength" | "onChange" | "placeholder" | "type" | "value"
  >;
  inputRef?: Ref<HTMLInputElement>;
  maxLength?: number;
}) {
  return (
    <FormField
      action={button}
      className="auth-field"
      controlClassName={button ? "auth-input with-action" : "auth-input"}
      error={error}
      helperText={helperText}
      inputRef={inputRef}
      label={label}
      prefix={Icon ? <Icon size={17} /> : null}
    >
      <input
        {...inputProps}
        autoComplete={autoComplete}
        maxLength={maxLength}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </FormField>
  );
}
