import { ChevronDown, LayoutDashboard, Lock, LogOut, Mail } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { AccountActionDialog } from "../account/AccountActionDialog";
import { AppLink } from "../common/AppLink";
import { Brand } from "../common/Brand";
import { LanguageButton } from "./LanguageButton";
import { AuthContext } from "../../context/Auth";
import { LanguageContext, T } from "../../context/Language";
import { buildSupportMailto, getUserLabel } from "../../helpers/account";
import { localizeKey } from "../../i18n/localization";
import type { AccountDialogMode, CustomerUser } from "../../types";

export function MarketingHeader({ minimal = false }: { minimal?: boolean }) {
  const { user, authChecking, setUser, signOut } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<AccountDialogMode | null>(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userLabel = getUserLabel(user);
  const avatarText = userLabel.trim().slice(0, 1).toUpperCase() || "A";
  const showAccountMenu = Boolean(user && !authChecking);

  useEffect(() => {
    if (!minimal) return;
    const handleScroll = () => setNavScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [minimal]);

  useEffect(() => {
    if (!menuOpen) return;
    const handlePointerDown = (event: globalThis.MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [menuOpen]);

  useEffect(() => {
    if (showAccountMenu) return;
    setMenuOpen(false);
    setDialogMode(null);
  }, [showAccountMenu]);

  return (
    <header
      className={`nav${minimal ? " minimal-nav" : ""}${navScrolled ? " nav-scrolled" : ""}`}
    >
      <div className="nav-inner">
        <Brand />
        {minimal ? null : (
          <nav
            className="nav-links"
            aria-label={localizeKey(language, "Primary navigation")}
          >
            <AppLink href="/#features">
              <T id="Features" />
            </AppLink>
            <AppLink href="/subscribe">
              <T id="Pricing" />
            </AppLink>
            <AppLink href="/setup">
              <T id="Docs" />
            </AppLink>
            <a href="https://check.aitokensflux.com/group/TokenFlux">
              <T id="Service status" />
            </a>
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
              <div className="account-menu-wrap" ref={menuRef}>
                <button
                  className="account-trigger"
                  type="button"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((value) => !value)}
                >
                  <span className="account-avatar">{avatarText}</span>
                  <span className="account-label">{userLabel}</span>
                  <ChevronDown size={15} />
                </button>
                {menuOpen ? (
                  <div className="account-menu" role="menu">
                    <AppLink
                      className="account-menu-item"
                      href="/dashboard"
                      onNavigate={() => setMenuOpen(false)}
                    >
                      <LayoutDashboard size={17} />
                      Dashboard
                    </AppLink>
                    <button
                      className="account-menu-item"
                      type="button"
                      onClick={() => {
                        setDialogMode("password");
                        setMenuOpen(false);
                      }}
                    >
                      <Lock size={17} />
                      <T id="Change password" />
                    </button>
                    <button
                      className="account-menu-item"
                      type="button"
                      onClick={() => {
                        setDialogMode("email");
                        setMenuOpen(false);
                      }}
                    >
                      <Mail size={17} />
                      <T id="Change email" />
                    </button>
                    <a
                      className="account-menu-item"
                      href={buildSupportMailto("aitokensflux support")}
                      onClick={() => setMenuOpen(false)}
                    >
                      <Mail size={17} />
                      <T id="Contact us" />
                    </a>
                    <button
                      className="account-menu-item danger"
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        void signOut();
                      }}
                    >
                      <LogOut size={17} />
                      <T id="Sign out" />
                    </button>
                  </div>
                ) : null}
              </div>
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
  );
}
