import { type ReactNode, type RefObject, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

let openDialogCount = 0;
let rootAriaHidden: string | null = null;
let rootWasInert = false;
const dialogStack: Array<{
  ariaHidden: string | null;
  element: HTMLDivElement;
  id: symbol;
  wasInert: boolean;
}> = [];

function restoreDialogLayer(layer: (typeof dialogStack)[number]) {
  if (layer.ariaHidden === null) layer.element.removeAttribute("aria-hidden");
  else layer.element.setAttribute("aria-hidden", layer.ariaHidden);
  if (!layer.wasInert) layer.element.removeAttribute("inert");
}

function syncDialogLayers() {
  const topLayer = dialogStack.at(-1);
  for (const layer of dialogStack) {
    if (layer === topLayer) {
      restoreDialogLayer(layer);
      continue;
    }
    layer.element.setAttribute("aria-hidden", "true");
    layer.element.setAttribute("inert", "");
  }
}

function lockApplicationRoot() {
  const root = document.getElementById("root");
  if (!root) return;
  if (openDialogCount === 0) {
    rootAriaHidden = root.getAttribute("aria-hidden");
    rootWasInert = root.hasAttribute("inert");
    root.setAttribute("aria-hidden", "true");
    root.setAttribute("inert", "");
  }
  openDialogCount += 1;
}

function unlockApplicationRoot() {
  const root = document.getElementById("root");
  openDialogCount = Math.max(0, openDialogCount - 1);
  if (!root || openDialogCount > 0) return;
  if (rootAriaHidden === null) root.removeAttribute("aria-hidden");
  else root.setAttribute("aria-hidden", rootAriaHidden);
  if (!rootWasInert) root.removeAttribute("inert");
  rootAriaHidden = null;
  rootWasInert = false;
}

function getFocusableElements(panel: HTMLElement) {
  return Array.from(
    panel.querySelectorAll<HTMLElement>(focusableSelector),
  ).filter((element) => element.getAttribute("aria-hidden") !== "true");
}

export function AccessibleDialog({
  ariaDescribedBy,
  ariaLabel,
  ariaLabelledBy,
  backdropClassName,
  children,
  className,
  closeDisabled = false,
  closeLabel,
  closeOnBackdrop = true,
  initialFocusRef,
  panelClassName,
  onClose,
}: {
  ariaDescribedBy?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  backdropClassName: string;
  children: ReactNode;
  className: string;
  closeDisabled?: boolean;
  closeLabel: string;
  closeOnBackdrop?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  panelClassName: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const dialogIdRef = useRef(Symbol("accessible-dialog"));

  useLayoutEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const body = document.body;
    const root = document.documentElement;
    const previousBodyOverflow = body.style.overflow;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverscroll = body.style.overscrollBehavior;
    const previousRootOverscroll = root.style.overscrollBehavior;

    const dialogId = dialogIdRef.current;
    const dialog = dialogRef.current;
    if (dialog) {
      dialogStack.push({
        ariaHidden: dialog.getAttribute("aria-hidden"),
        element: dialog,
        id: dialogId,
        wasInert: dialog.hasAttribute("inert"),
      });
      syncDialogLayers();
    }
    lockApplicationRoot();
    body.style.overflow = "hidden";
    root.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    root.style.overscrollBehavior = "none";

    const panel = panelRef.current;
    const focusTarget =
      initialFocusRef?.current ??
      (panel ? getFocusableElements(panel)[0] : null) ??
      panel;
    focusTarget?.focus();

    return () => {
      const stackIndex = dialogStack.findIndex((layer) => layer.id === dialogId);
      if (stackIndex >= 0) {
        const [removedLayer] = dialogStack.splice(stackIndex, 1);
        if (removedLayer) restoreDialogLayer(removedLayer);
        syncDialogLayers();
      }
      body.style.overflow = previousBodyOverflow;
      root.style.overflow = previousRootOverflow;
      body.style.overscrollBehavior = previousBodyOverscroll;
      root.style.overscrollBehavior = previousRootOverscroll;
      unlockApplicationRoot();
      previouslyFocused?.focus();
    };
  }, [initialFocusRef]);

  useLayoutEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (dialogStack.at(-1)?.id !== dialogIdRef.current) return;
      if (event.key === "Escape") {
        if (closeDisabled) return;
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = getFocusableElements(panelRef.current);
      if (focusable.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!panelRef.current.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeDisabled, onClose]);

  return createPortal(
    <div
      aria-describedby={ariaDescribedBy}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-modal="true"
      className={className}
      ref={dialogRef}
      role="dialog"
    >
      {closeOnBackdrop ? (
        <button
          aria-label={closeLabel}
          className={backdropClassName}
          disabled={closeDisabled}
          type="button"
          onClick={onClose}
        />
      ) : (
        <div aria-hidden="true" className={backdropClassName} />
      )}
      <section className={panelClassName} ref={panelRef} tabIndex={-1}>
        {children}
      </section>
    </div>,
    document.body,
  );
}
