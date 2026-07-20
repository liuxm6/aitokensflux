import { type ReactNode, useContext } from "react";
import { LanguageContext } from "../../../context/Language";
import { localizeKey, localizePairNode } from "../../../i18n/localization";
import type { Language, TranslationKeyProps } from "../../../types";

type StateText = TranslationKeyProps | { en: string; zh: string };
type StateProps = StateText & { action?: ReactNode };

function renderStateText(language: Language, props: StateText) {
  return "id" in props
    ? localizeKey(language, props.id, props.values)
    : localizePairNode(language, props.zh, props.en);
}

export function LoadingState(props: StateText & { lines?: number }) {
  const { language } = useContext(LanguageContext);
  const lines = props.lines ?? 3;

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="async-state loading-state"
      role="status"
    >
      <span className="sr-only">{renderStateText(language, props)}</span>
      <div aria-hidden="true" className="state-skeleton">
        {Array.from({ length: lines }, (_, index) => (
          <span className="state-skeleton-line" key={index} />
        ))}
      </div>
    </div>
  );
}

export function EmptyState(props: StateProps) {
  const { language } = useContext(LanguageContext);

  return (
    <div className="empty async-state empty-state" role="status">
      <span>{renderStateText(language, props)}</span>
      {props.action ? (
        <div className="async-state-action">{props.action}</div>
      ) : null}
    </div>
  );
}

export function ErrorState({
  onRetry,
  retryId = "Try again",
  ...props
}: StateText & { onRetry?: () => void; retryId?: string }) {
  const { language } = useContext(LanguageContext);

  return (
    <div className="async-state error-state" role="alert">
      <span>{renderStateText(language, props)}</span>
      {onRetry ? (
        <button className="btn btn-soft btn-sm" type="button" onClick={onRetry}>
          {localizeKey(language, retryId)}
        </button>
      ) : null}
    </div>
  );
}
