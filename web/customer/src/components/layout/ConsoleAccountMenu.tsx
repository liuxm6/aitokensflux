import { ChevronDown, House, Lock, LogOut, Mail } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { AccountActionDialog } from "../account/AccountActionDialog";
import { AppLink } from "../common/AppLink";
import { DropdownMenu } from "../common/ui/DropdownMenu";
import { AuthContext } from "../../context/Auth";
import { LanguageContext, T } from "../../context/Language";
import { getUserLabel } from "../../helpers/account";
import { localizeKey } from "../../i18n/localization";
import type { AccountDialogMode } from "../../types";

export function ConsoleAccountMenu() {
  const { user, authChecking, setUser, signOut } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<AccountDialogMode | null>(null);

  useEffect(() => {
    if (user && !authChecking) return;
    setMenuOpen(false);
    setDialogMode(null);
  }, [authChecking, user]);

  if (!user || authChecking) return null;

  const label = getUserLabel(user);
  const avatar = label.trim().slice(0, 1).toUpperCase() || "A";

  return (
    <>
      <DropdownMenu
        className="account-menu-wrap console-account-wrap"
        menuClassName="account-menu console-account-menu"
        menuLabel={localizeKey(language, "Account")}
        open={menuOpen}
        triggerAriaLabel={localizeKey(language, "Account")}
        triggerClassName="account-trigger console-account-trigger"
        triggerContent={
          <>
            <span className="account-avatar console-account-avatar">
              {avatar}
            </span>
            <span className="account-label console-account-label">{label}</span>
            <ChevronDown size={15} />
          </>
        }
        onOpenChange={setMenuOpen}
      >
        <AppLink className="account-menu-item console-account-item" href="/">
          <House size={17} />
          <T id="Home" />
        </AppLink>
        <button
          className="account-menu-item console-account-item"
          type="button"
          onClick={() => setDialogMode("password")}
        >
          <Lock size={17} />
          <T id="Change password" />
        </button>
        <button
          className="account-menu-item console-account-item"
          type="button"
          onClick={() => setDialogMode("email")}
        >
          <Mail size={17} />
          <T id="Change email" />
        </button>
        <button
          className="account-menu-item console-account-item danger"
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
          user={user}
          onClose={() => setDialogMode(null)}
          onUserChange={setUser}
        />
      ) : null}
    </>
  );
}
