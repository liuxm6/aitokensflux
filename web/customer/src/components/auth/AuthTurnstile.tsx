import type { ComponentProps } from "react";
import Turnstile from "react-turnstile";

type TurnstileProps = ComponentProps<typeof Turnstile>;

export function AuthTurnstile({
  enabled,
  siteKey,
  appearance,
  size,
  onToken,
}: {
  enabled: boolean;
  siteKey?: string;
  appearance?: TurnstileProps["appearance"];
  size?: TurnstileProps["size"];
  onToken: (token: string) => void;
}) {
  if (!enabled || !siteKey) return null;

  return (
    <div className="auth-turnstile">
      <Turnstile
        sitekey={siteKey}
        {...(appearance ? { appearance } : {})}
        {...(size ? { size } : {})}
        onError={() => onToken("")}
        onExpire={() => onToken("")}
        onVerify={onToken}
      />
    </div>
  );
}
