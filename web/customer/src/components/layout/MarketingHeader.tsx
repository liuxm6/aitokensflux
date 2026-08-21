import { ChevronDown, LayoutDashboard, Lock, LogOut, Mail } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { AccountActionDialog } from "../account/AccountActionDialog";
import { AppLink } from "../common/AppLink";
import { Brand } from "../common/Brand";
import { DropdownMenu } from "../common/ui/DropdownMenu";
import { LanguageButton } from "./LanguageButton";
import { AuthContext } from "../../context/Auth";
import { LanguageContext, T } from "../../context/Language";
import { buildSupportMailto, getUserLabel } from "../../helpers/account";
import { getMarketingNavCurrent } from "../../helpers/navigation";
import { localizeKey } from "../../i18n/localization";
import type { AccountDialogMode, CustomerUser } from "../../types";

export function MarketingHeader({
  minimal = false,
  homePage = false,
}: {
  minimal?: boolean;
  homePage?: boolean;
}) {
  const { user, authChecking, setUser, signOut } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<AccountDialogMode | null>(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const [hash, setHash] = useState(() => window.location.hash);
  const userLabel = getUserLabel(user);
  const avatarText = userLabel.trim().slice(0, 1).toUpperCase() || "A";
  const showAccountMenu = Boolean(user && !authChecking);
  const currentNav = getMarketingNavCurrent(pathname, hash);

  useEffect(() => {
    if (!minimal) return;
    const sentinel = document.querySelector(".minimal-nav-sentinel");
    if (!sentinel || typeof IntersectionObserver === "undefined") {
      setNavScrolled(window.scrollY > 12);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setNavScrolled(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [minimal]);

  useEffect(() => {
    if (showAccountMenu) return;
    setMenuOpen(false);
    setDialogMode(null);
  }, [showAccountMenu]);

  useEffect(() => {
    const syncLocation = () => {
      setPathname(window.location.pathname);
      setHash(window.location.hash);
    };
    window.addEventListener("popstate", syncLocation);
    window.addEventListener("hashchange", syncLocation);
    return () => {
      window.removeEventListener("popstate", syncLocation);
      window.removeEventListener("hashchange", syncLocation);
    };
  }, []);

  const minimalSentinel = minimal ? (
    <span aria-hidden="true" className="minimal-nav-sentinel" />
  ) : null;

  return (
    <>
      {minimalSentinel}
      <header
        className={`nav${minimal ? " minimal-nav" : ""}${homePage ? " home-nav" : ""}${navScrolled ? " nav-scrolled" : ""}`}
      >
        <div className="nav-inner">
          <Brand />
          {minimal ? null : (
            <nav
              className="nav-links"
              aria-label={localizeKey(language, "Primary navigation")}
            >
              <AppLink
                aria-current={currentNav === "features" ? "page" : undefined}
                href="/#features"
              >
                <T id="Features" />
              </AppLink>
              <AppLink
                aria-current={currentNav === "pricing" ? "page" : undefined}
                href="/pricing"
              >
                <T id="Pricing" />
              </AppLink>
              <AppLink
                aria-current={currentNav === "docs" ? "page" : undefined}
                href="/docs"
              >
                <T id="Docs" />
              </AppLink>
            </nav>
          )}
          <div className="nav-right">
            <LanguageButton />
            {authChecking ? null : showAccountMenu ? (
              <>
                {minimal ? null : (
                  <AppLink
                    className="btn btn-soft btn-sm nav-invite"
                    href="/dashboard/invite-record"
                  >
                    <T id="My invites" />
                  </AppLink>
                )}
                <DropdownMenu
                  className="account-menu-wrap"
                  menuClassName="account-menu"
                  menuLabel={localizeKey(language, "Account")}
                  open={menuOpen}
                  triggerAriaLabel={localizeKey(language, "Account")}
                  triggerClassName="account-trigger"
                  triggerContent={
                    <>
                      <span className="account-avatar">{avatarText}</span>
                      <span className="account-label">{userLabel}</span>
                      <ChevronDown size={15} />
                    </>
                  }
                  onOpenChange={setMenuOpen}
                >
                  <AppLink className="account-menu-item" href="/dashboard">
                    <LayoutDashboard size={17} />
                    <T id="Dashboard" />
                  </AppLink>
                  <button
                    className="account-menu-item"
                    type="button"
                    onClick={() => setDialogMode("password")}
                  >
                    <Lock size={17} />
                    <T id="Change password" />
                  </button>
                  <button
                    className="account-menu-item"
                    type="button"
                    onClick={() => setDialogMode("email")}
                  >
                    <Mail size={17} />
                    <T id="Change email" />
                  </button>
                  <a
                    className="account-menu-item"
                    href={buildSupportMailto("aitokensflux support")}
                  >
                    <Mail size={17} />
                    <T id="Contact us" />
                  </a>
                  <button
                    className="account-menu-item danger"
                    type="button"
                    onClick={() => void signOut()}
                  >
                    <LogOut size={17} />
                    <T id="Sign out" />
                  </button>
                </DropdownMenu>
                {dialogMode ? (
                  <AccountActionDialog
                    mode={dialogMode}
                    user={user as CustomerUser}
                    onClose={() => setDialogMode(null)}
                    onUserChange={setUser}
                  />
                ) : null}
              </>
            ) : (
              <>
                <AppLink className="btn btn-ghost btn-sm" href="/sign-in">
                  <T id="Sign in / Register" />
                </AppLink>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
