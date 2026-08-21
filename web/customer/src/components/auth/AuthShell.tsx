import type { ReactNode, RefObject } from "react";
import { AppLink } from "../common/AppLink";
import { Brand } from "../common/Brand";
import { AccessibleDialog } from "../common/ui/Dialog";
import { LanguageButton } from "../layout/LanguageButton";
import { T } from "../../context/Language";

export function AuthShell({
  modal,
  label,
  isClosing,
  closeLabel,
  initialFocusRef,
  showSignInAction = false,
  extra,
  onClose,
  children,
}: {
  modal: boolean;
  label: string;
  isClosing: boolean;
  closeLabel: string;
  initialFocusRef: RefObject<HTMLButtonElement | null>;
  showSignInAction?: boolean;
  extra?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}) {
  if (modal) {
    return (
      <AccessibleDialog
        ariaLabel={label}
        backdropClassName="auth-overlay-backdrop"
        className={`auth-overlay${isClosing ? " closing" : ""}`}
        closeDisabled={isClosing}
        closeLabel={closeLabel}
        initialFocusRef={initialFocusRef}
        panelClassName="auth-overlay-panel"
        onClose={onClose}
      >
        {children}
        {extra}
      </AccessibleDialog>
    );
  }

  return (
    <main className="auth-page">
      <div className="auth-top">
        <Brand />
        <div className="auth-actions">
          <LanguageButton />
          {showSignInAction ? (
            <AppLink className="btn btn-ghost btn-sm" href="/sign-in">
              <T id="Sign in / Register" />
            </AppLink>
          ) : null}
        </div>
      </div>
      <div className="auth-bg" aria-hidden="true">
        <h1>Claude Code / OpenAI Codex</h1>
      </div>
      <div className="auth-scrim" />
      {children}
      {extra}
    </main>
  );
}
