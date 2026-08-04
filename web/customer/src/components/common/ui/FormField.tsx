import {
  cloneElement,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
  useId,
} from "react";

export function FormField({
  action,
  children,
  className = "form-field",
  controlClassName = "form-field-control",
  error,
  helperText,
  inputRef,
  label,
  prefix,
}: {
  action?: ReactNode;
  children: ReactElement<InputHTMLAttributes<HTMLInputElement>>;
  className?: string;
  controlClassName?: string;
  error?: string;
  helperText?: ReactNode;
  inputRef?: Ref<HTMLInputElement>;
  label: ReactNode;
  prefix?: ReactNode;
}) {
  const generatedId = useId();
  const inputId = children.props.id ?? `${generatedId}-input`;
  const helperId = helperText ? `${generatedId}-help` : undefined;
  const errorId = error ? `${generatedId}-error` : undefined;
  const describedBy = [children.props["aria-describedby"], helperId, errorId]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <label htmlFor={inputId}>{label}</label>
      <div className={controlClassName}>
        {prefix}
        {cloneElement(children, {
          "aria-describedby": describedBy || undefined,
          "aria-invalid": error ? true : children.props["aria-invalid"],
          id: inputId,
          ref: inputRef,
        } as InputHTMLAttributes<HTMLInputElement> & {
          ref?: Ref<HTMLInputElement>;
        })}
        {action}
      </div>
      {helperText ? (
        <div className="form-field-help" id={helperId}>
          {helperText}
        </div>
      ) : null}
      {error ? (
        <div className="form-field-error" id={errorId} role="alert">
          {error}
        </div>
      ) : null}
    </div>
  );
}
