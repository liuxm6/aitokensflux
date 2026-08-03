import { useContext } from "react";
import type { MouseEvent, ReactNode } from "react";
import { LanguageContext } from "../../context/Language";
import { isInternalPath, shouldPreserveScroll } from "../../helpers/navigation";
import { localizePublicHref } from "../../seo/metadata";

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
  const { language } = useContext(LanguageContext);
  const resolvedHref = localizePublicHref(href, language);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey ||
      !isInternalPath(resolvedHref)
    ) {
      return;
    }

    const url = new URL(resolvedHref, window.location.origin);
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
    <a className={className} href={resolvedHref} onClick={handleClick}>
      {children}
    </a>
  );
}
