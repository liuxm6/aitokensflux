export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function getDialogExitDelay(animatedMs = 150) {
  return prefersReducedMotion() ? 0 : animatedMs;
}

export function getAuthModeExitDelay() {
  return prefersReducedMotion() ? 0 : 90;
}

export function getAuthModeEnterDelay() {
  return prefersReducedMotion() ? 0 : 170;
}

export function scrollToPosition(top: number) {
  window.scrollTo({
    top,
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
}

export function scrollElementIntoView(element: Element) {
  element.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "start",
  });
}

export function scrollToHash(hash: string, attempts = 12) {
  if (!hash || hash === "#") return;

  const tryScroll = (left: number) => {
    const target = document.querySelector(hash);
    if (target) {
      scrollElementIntoView(target);
      return;
    }
    if (left <= 0) return;
    window.requestAnimationFrame(() => tryScroll(left - 1));
  };

  tryScroll(attempts);
}
