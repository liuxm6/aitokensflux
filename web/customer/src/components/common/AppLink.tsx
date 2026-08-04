import {
  forwardRef,
  useContext,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { LanguageContext } from "../../context/Language";
import { isInternalPath, shouldPreserveScroll } from "../../helpers/navigation";
import { scrollElementIntoView, scrollToPosition } from "../../helpers/motion";
import { localizePublicHref } from "../../seo/metadata";

type AppLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "children" | "href"
> & {
  href: string;
  children: ReactNode;
  onNavigate?: () => void;
};

export const AppLink = forwardRef<HTMLAnchorElement, AppLinkProps>(
  function AppLink(
    { href, className, children, onClick, onNavigate, ...anchorProps },
    ref,
  ) {
    const { language } = useContext(LanguageContext);
    const resolvedHref = localizePublicHref(href, language);

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);
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
          const target = document.querySelector(url.hash);
          if (target) scrollElementIntoView(target);
        });
      } else if (!shouldPreserveScroll(url.pathname)) {
        scrollToPosition(0);
      }
      onNavigate?.();
    };

    return (
      <a
        {...anchorProps}
        className={className}
        href={resolvedHref}
        ref={ref}
        onClick={handleClick}
      >
        {children}
      </a>
    );
  },
);
