import { type MouseEvent, type ReactNode, useLayoutEffect } from "react";
import { pageMeta } from "../../constants/page-meta";
import { scrollElementIntoView } from "../../helpers/motion";
import { localizeKey } from "../../i18n/localization";
import type { Language, PageKey } from "../../types";

function getMainContent() {
  return document.querySelector<HTMLElement>("main");
}

export function RouteFocus({
  children,
  focusRoute,
  language,
  page,
}: {
  children: ReactNode;
  focusRoute: boolean;
  language: Language;
  page: PageKey;
}) {
  useLayoutEffect(() => {
    const meta = pageMeta[page];
    const localizedTitle = localizeKey(language, meta.titleId);
    document.title =
      page === "home" ? "AI Tokens Flux" : `${localizedTitle} · AI Tokens Flux`;

    let description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (!description) {
      description = document.createElement("meta");
      description.name = "description";
      document.head.append(description);
    }
    description.content = localizeKey(language, meta.descriptionId);

    const main = getMainContent();
    if (!main) return;
    main.id = "main-content";
    main.tabIndex = -1;
    if (!focusRoute) return;

    const heading = main.querySelector<HTMLElement>("h1");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
      return;
    }
    main.focus({ preventScroll: true });
  }, [focusRoute, language, page]);

  const handleSkip = (event: MouseEvent<HTMLAnchorElement>) => {
    const main = getMainContent();
    if (!main) return;
    event.preventDefault();
    main.focus({ preventScroll: true });
    scrollElementIntoView(main);
  };

  return (
    <>
      <a className="skip-link" href="#main-content" onClick={handleSkip}>
        {localizeKey(language, "Skip to content")}
      </a>
      {children}
    </>
  );
}
