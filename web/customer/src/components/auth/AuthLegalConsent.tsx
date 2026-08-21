import type { AuthPageCopy } from "../../helpers/auth-copy";
import { AppLink } from "../common/AppLink";

export function AuthLegalConsent({
  agreed,
  copy,
  privacyEnabled,
  onAgreedChange,
}: {
  agreed: boolean;
  copy: AuthPageCopy;
  privacyEnabled: boolean;
  onAgreedChange: (agreed: boolean) => void;
}) {
  return (
    <label className="auth-terms">
      <input
        checked={agreed}
        type="checkbox"
        onChange={(event) => onAgreedChange(event.currentTarget.checked)}
      />
      <span>{copy.agreement}</span>
      <AppLink href="/user-agreement">{copy.userAgreement}</AppLink>
      {privacyEnabled ? <span>{copy.and}</span> : null}
      {privacyEnabled ? (
        <AppLink href="/privacy-policy">{copy.privacyPolicy}</AppLink>
      ) : null}
    </label>
  );
}
