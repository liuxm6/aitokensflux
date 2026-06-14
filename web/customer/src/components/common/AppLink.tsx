import type { MouseEvent, ReactNode } from "react";
import { isInternalPath, shouldPreserveScroll } from "../../helpers/navigation";

export function AppLink({
  href,
  className,
  children,
  onNavigate,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  onNavigate?: () => void;
}) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey ||
      !isInternalPath(href)
    ) {
      return;
    }

    const url = new URL(href, window.location.origin);
    event.preventDefault();
    window.history.pushState(
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
    window.dispatchEvent(new PopStateEvent("popstate"));
    if (url.hash) {
      window.setTimeout(() => {
        document
          .querySelector(url.hash)
          ?.scrollIntoView({ behavior: "smooth" });
      });
    } else if (!shouldPreserveScroll(url.pathname)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    onNavigate?.();
  };

  return (
    <a className={className} href={href} onClick={handleClick}>
      {children}
    </a>
  );
}
