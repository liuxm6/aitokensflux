import { Menu, X } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppLink } from "../common/AppLink";
import { ConsoleAccountMenu } from "./ConsoleAccountMenu";
import { LanguageButton } from "./LanguageButton";
import { sidebarItems } from "../../constants/navigation";
import { LanguageContext } from "../../context/Language";
import { keepTabFocusWithin } from "../../helpers/focus";
import { localizeKey } from "../../i18n/localization";
import type { PageKey } from "../../types";

const brandLockupUrl = new URL(
  "../../assets/brand/lockup-horizontal-flux-light.svg",
  import.meta.url,
).href;

export function CustomerShell({
  page,
  children,
  crumbId,
}: {
  page: PageKey;
  children: ReactNode;
  crumbId: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { language } = useContext(LanguageContext);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const restoreFocusRef = useRef(false);

  const closeSidebar = useCallback((restoreFocus = true) => {
    restoreFocusRef.current = restoreFocus;
    setSidebarOpen(false);
  }, []);

  useEffect(() => {
    if (!sidebarOpen) {
      if (restoreFocusRef.current) menuButtonRef.current?.focus();
      restoreFocusRef.current = false;
      return;
    }

    const main = mainRef.current;
    const previousAriaHidden = main?.getAttribute("aria-hidden") ?? null;
    main?.setAttribute("aria-hidden", "true");
    main?.setAttribute("inert", "");
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSidebar();
        return;
      }
      if (event.key !== "Tab" || !sidebarRef.current) return;
      keepTabFocusWithin(event, sidebarRef.current);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      main?.removeAttribute("inert");
      if (previousAriaHidden === null) main?.removeAttribute("aria-hidden");
      else main?.setAttribute("aria-hidden", previousAriaHidden);
    };
  }, [closeSidebar, sidebarOpen]);

  return (
    <div className="app console-app">
      <button
        aria-hidden="true"
        className={`side-backdrop${sidebarOpen ? " show" : ""}`}
        tabIndex={-1}
        type="button"
        onClick={() => closeSidebar()}
      />
      <aside
        ref={sidebarRef}
        aria-label={localizeKey(language, "Customer navigation")}
        className={`side${sidebarOpen ? " open" : ""}`}
        id="customer-sidebar"
      >
        <div className="side-brand">
          <ConsoleLogo />
          <button
            ref={closeButtonRef}
            aria-label={localizeKey(language, "Close navigation")}
            className="side-close"
            type="button"
            onClick={() => closeSidebar()}
          >
            <X size={18} />
          </button>
        </div>
        <nav aria-label={localizeKey(language, "Customer navigation")}>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const current = page === item.page;
            return (
              <AppLink
                key={item.page}
                aria-current={current ? "page" : undefined}
                className={current ? "active" : ""}
                href={item.path}
                onNavigate={() => closeSidebar(false)}
              >
                <Icon size={18} />
                {localizeKey(language, item.labelId)}
              </AppLink>
            );
          })}
        </nav>
      </aside>
      <div className="main" ref={mainRef}>
        <header className="console-topbar">
          <button
            ref={menuButtonRef}
            aria-controls="customer-sidebar"
            aria-expanded={sidebarOpen}
            aria-label={localizeKey(
              language,
              sidebarOpen ? "Close navigation" : "Open navigation",
            )}
            className="menu-btn"
            type="button"
            onClick={() => setSidebarOpen((value) => !value)}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <strong className="console-topbar-title">
            {localizeKey(language, crumbId)}
          </strong>
          <div className="console-topbar-actions">
            <LanguageButton />
            <ConsoleAccountMenu />
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}

function ConsoleLogo() {
  return (
    <AppLink className="console-logo" href="/">
      <img src={brandLockupUrl} alt="aitokensflux" />
    </AppLink>
  );
}
