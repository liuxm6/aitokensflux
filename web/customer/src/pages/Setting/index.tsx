import { FileText, Globe2, Lock, LogOut, Mail } from "lucide-react";
import type { ComponentType } from "react";
import { useContext, useState } from "react";
import { SectionLabel } from "../../components/common/SectionLabel";
import { Panel } from "../../components/common/ui/Panel";
import {
  ConsolePageTitle,
  CustomerShell,
} from "../../components/layout/CustomerShell";
import { AuthContext } from "../../context/Auth";
import { LanguageContext } from "../../context/Language";
import {
  SUPPORT_EMAIL,
  buildSupportMailto,
  getUserLabel,
} from "../../helpers/account";
import { localizeKey } from "../../i18n/localization";
import { languageOptions } from "../../i18n/languages";
import type { AccountDialogMode, CustomerUser } from "../../types";
import type { LucideIcon } from "lucide-react";

type AccountActionDialogComponent = ComponentType<{
  mode: AccountDialogMode;
  user: CustomerUser;
  onClose: () => void;
  onUserChange: (user: CustomerUser | null) => void;
}>;

export function createSettingsPage({
  AccountActionDialog,
}: {
  AccountActionDialog: AccountActionDialogComponent;
}) {
  return function SettingsPage() {
    const { user, setUser, signOut } = useContext(AuthContext);
    const { language, setLanguage } = useContext(LanguageContext);
    const [dialogMode, setDialogMode] = useState<AccountDialogMode | null>(
      null,
    );
    const userLabel = getUserLabel(user);
    const currentLanguage =
      languageOptions.find((item) => item.value === language) ??
      languageOptions[0];
    const switchLanguage = () => {
      const currentIndex = languageOptions.findIndex(
        (item) => item.value === language,
      );
      const nextIndex = currentIndex >= 0 ? currentIndex + 1 : 1;
      setLanguage(languageOptions[nextIndex % languageOptions.length].value);
    };
    const openReceiptEmail = () => {
      const account = user?.email || userLabel;
      window.location.href = buildSupportMailto(
        localizeKey(language, "API receipt request"),
        localizeKey(language, "Account: {{account}}\nBilling month:\nNotes:", {
          account,
        }),
      );
    };
    const openContactEmail = () => {
      window.location.href = buildSupportMailto(
        localizeKey(language, "Customer support"),
        localizeKey(language, "Account: {{account}}\nIssue:", {
          account: user?.email || userLabel,
        }),
      );
    };

    return (
      <CustomerShell crumbId="Settings" page="settings">
        <ConsolePageTitle id="Account security" />
        <Panel className="settings-list">
          <SettingsRow
            actionId="Edit"
            icon={Mail}
            labelId="Email"
            onAction={() => setDialogMode("email")}
            value={user?.email || userLabel}
          />
          <SettingsRow
            actionId="Edit"
            icon={Lock}
            labelId="Password"
            onAction={() => setDialogMode("password")}
            value={localizeKey(language, "Password set")}
          />
        </Panel>

        <SectionLabel id="Preferences" />
        <Panel className="settings-list">
          <SettingsRow
            actionId="Switch"
            icon={Globe2}
            labelId="Language"
            onAction={switchLanguage}
            value={currentLanguage.label}
          />
        </Panel>

        <SectionLabel id="Finance" />
        <Panel className="settings-list">
          <SettingsRow
            actionId="Apply"
            icon={FileText}
            labelId="API receipt"
            onAction={openReceiptEmail}
            value={localizeKey(
              language,
              "Request a receipt for a specific month",
            )}
          />
        </Panel>

        <SectionLabel id="Support" />
        <Panel className="settings-list">
          <SettingsRow
            actionId="Send email"
            icon={Mail}
            labelId="Contact us"
            onAction={openContactEmail}
            value={SUPPORT_EMAIL}
          />
        </Panel>

        <SectionLabel id="Account" />
        <Panel className="settings-list">
          <SettingsRow
            actionId="Sign out"
            danger
            icon={LogOut}
            labelId="Sign out"
            onAction={() => void signOut()}
            value={localizeKey(
              language,
              "Sign in again to continue after signing out",
            )}
          />
        </Panel>
        {dialogMode && user ? (
          <AccountActionDialog
            mode={dialogMode}
            user={user}
            onClose={() => setDialogMode(null)}
            onUserChange={setUser}
          />
        ) : null}
      </CustomerShell>
    );
  };
}

function SettingsRow({
  icon: Icon,
  labelId,
  value,
  actionId,
  onAction,
  danger = false,
}: {
  icon: LucideIcon;
  labelId: string;
  value: string;
  actionId?: string;
  onAction?: () => void;
  danger?: boolean;
}) {
  const { language } = useContext(LanguageContext);

  return (
    <div className={`set-item${danger ? " danger" : ""}`}>
      <Icon className="si" size={20} />
      <span className="sk">{localizeKey(language, labelId)}</span>
      <span className="sv">{value}</span>
      {onAction ? (
        <button
          className="btn btn-soft btn-sm"
          type="button"
          onClick={onAction}
        >
          {localizeKey(language, actionId ?? "Edit")}
        </button>
      ) : null}
    </div>
  );
}
