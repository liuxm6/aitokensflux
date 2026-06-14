import { Menu, X } from "lucide-react";
import type { ReactNode } from "react";
import { useContext, useState } from "react";
import { AppLink } from "../common/AppLink";
import { sidebarItems } from "../../constants/navigation";
import { LanguageContext } from "../../context/Language";
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

  return (
    <div className="app console-app">
      <button
        aria-label={localizeKey(language, "Close navigation")}
        className={`side-backdrop${sidebarOpen ? " show" : ""}`}
        type="button"
        onClick={() => setSidebarOpen(false)}
      />
      <aside className={`side${sidebarOpen ? " open" : ""}`}>
        <div className="side-brand">
          <ConsoleLogo />
        </div>
        <nav aria-label={localizeKey(language, "Customer navigation")}>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <AppLink
                key={item.page}
                className={page === item.page ? "active" : ""}
                href={item.path}
                onNavigate={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                {localizeKey(language, item.labelId)}
              </AppLink>
            );
          })}
        </nav>
      </aside>
      <div className="main">
        <div className="mobile-topbar">
          <button
            className="menu-btn"
            type="button"
            onClick={() => setSidebarOpen((value) => !value)}
            aria-label={localizeKey(language, "Open navigation")}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <strong>{localizeKey(language, crumbId)}</strong>
        </div>
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

export function ConsolePageTitle({ id }: { id: string }) {
  const { language } = useContext(LanguageContext);

  return <h1 className="console-page-title">{localizeKey(language, id)}</h1>;
}
