import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Tracks the "copied" confirmation that every copy button shows briefly before
 * reverting to `idleValue`. The revert timer is cancelled on unmount so a
 * copy performed right before navigation cannot update a gone component.
 */
export function useCopyFeedback<T>(idleValue: T, revertDelay: number) {
  const [copiedValue, setCopiedValue] = useState<T>(idleValue);
  const revertTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (revertTimerRef.current !== null) {
        window.clearTimeout(revertTimerRef.current);
      }
    },
    [],
  );

  const markCopied = useCallback(
    (value: T) => {
      setCopiedValue(value);
      if (revertTimerRef.current !== null) {
        window.clearTimeout(revertTimerRef.current);
      }
      revertTimerRef.current = window.setTimeout(() => {
        revertTimerRef.current = null;
        setCopiedValue(idleValue);
      }, revertDelay);
    },
    [idleValue, revertDelay],
  );

  return [copiedValue, markCopied] as const;
}
