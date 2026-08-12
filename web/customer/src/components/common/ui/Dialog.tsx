import { type ReactNode, type RefObject, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  getFocusableElements,
  keepTabFocusWithin,
} from "../../../helpers/focus";

let openDialogCount = 0;
let rootAriaHidden: string | null = null;
let rootWasInert = false;
let scrollLockCount = 0;
let scrollLockSnapshot: {
  bodyOverflow: string;
  bodyOverscroll: string;
  rootOverflow: string;
  rootOverscroll: string;
} | null = null;
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

function lockPageScroll() {
  const body = document.body;
  const root = document.documentElement;
  if (scrollLockCount === 0) {
    scrollLockSnapshot = {
      bodyOverflow: body.style.overflow,
      bodyOverscroll: body.style.overscrollBehavior,
      rootOverflow: root.style.overflow,
      rootOverscroll: root.style.overscrollBehavior,
    };
    body.style.overflow = "hidden";
    root.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    root.style.overscrollBehavior = "none";
  }
  scrollLockCount += 1;
}

function unlockPageScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount > 0 || !scrollLockSnapshot) return;
  document.body.style.overflow = scrollLockSnapshot.bodyOverflow;
  document.documentElement.style.overflow = scrollLockSnapshot.rootOverflow;
  document.body.style.overscrollBehavior = scrollLockSnapshot.bodyOverscroll;
  document.documentElement.style.overscrollBehavior =
    scrollLockSnapshot.rootOverscroll;
  scrollLockSnapshot = null;
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
    lockPageScroll();

    const panel = panelRef.current;
    const focusTarget =
      initialFocusRef?.current ??
      (panel ? getFocusableElements(panel)[0] : null) ??
      panel;
    focusTarget?.focus();

    return () => {
      const stackIndex = dialogStack.findIndex(
        (layer) => layer.id === dialogId,
      );
      if (stackIndex >= 0) {
        const [removedLayer] = dialogStack.splice(stackIndex, 1);
        if (removedLayer) restoreDialogLayer(removedLayer);
        syncDialogLayers();
      }
      unlockPageScroll();
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
      keepTabFocusWithin(event, panelRef.current);
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
