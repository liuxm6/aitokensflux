import {
  Check,
  Copy,
  FileText,
  Fingerprint,
  Globe2,
  Lock,
  LogOut,
  Mail,
  UserRound,
} from "lucide-react";
import type { ComponentType } from "react";
import { useContext, useState } from "react";
import { SectionLabel } from "../../components/common/SectionLabel";
import { Panel } from "../../components/common/ui/Panel";
import { CustomerShell } from "../../components/layout/CustomerShell";
import { ConsolePageHeader } from "../../components/layout/ConsolePageHeader";
import { pageMeta } from "../../constants/page-meta";
import { AuthContext } from "../../context/Auth";
import { LanguageContext } from "../../context/Language";
import {
  SUPPORT_EMAIL,
  buildSupportMailto,
  getAccountIdentifier,
  getBoundEmail,
} from "../../helpers/account";
import { useToast } from "../../context/Toast";
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
    const notify = useToast();
    const [dialogMode, setDialogMode] = useState<AccountDialogMode | null>(
      null,
    );
    const [copiedUserId, setCopiedUserId] = useState(false);
    const boundEmail = getBoundEmail(user);
    const accountIdentifier = getAccountIdentifier(user);
    const userId = user?.id ? String(user.id) : "-";
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
      window.location.href = buildSupportMailto(
        localizeKey(language, "API receipt request"),
        localizeKey(language, "Account: {{account}}\nBilling month:\nNotes:", {
          account: accountIdentifier,
        }),
      );
    };
    const openContactEmail = () => {
      window.location.href = buildSupportMailto(
        localizeKey(language, "Customer support"),
        localizeKey(language, "Account: {{account}}\nIssue:", {
          account: accountIdentifier,
        }),
      );
    };
    const copyUserId = async () => {
      if (!user?.id) return;
      try {
        await writeClipboard(String(user.id));
        setCopiedUserId(true);
        notify({
          type: "success",
          message: localizeKey(language, "User ID copied"),
        });
        window.setTimeout(() => setCopiedUserId(false), 1400);
      } catch {
        notify({
          type: "error",
          message: localizeKey(language, "Copy failed"),
        });
      }
    };

    return (
      <CustomerShell crumbId="Settings" page="settings">
        <ConsolePageHeader
          descriptionId={pageMeta.settings.descriptionId}
          titleId="Account security"
        />
        <Panel className="settings-list">
          <SettingsRow
            icon={UserRound}
            labelId="Username"
            value={user?.username || "-"}
          />
          <SettingsRow
            actionIcon={copiedUserId ? Check : Copy}
            actionId={copiedUserId ? "Copied" : "Copy"}
            icon={Fingerprint}
            labelId="User ID"
            onAction={() => void copyUserId()}
            value={userId}
          />
          <SettingsRow
            actionId={boundEmail ? "Edit" : "Bind"}
            icon={Mail}
            labelId="Email"
            onAction={() => setDialogMode("email")}
            value={boundEmail || localizeKey(language, "Not bound")}
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
  actionIcon: ActionIcon,
  onAction,
  danger = false,
}: {
  icon: LucideIcon;
  labelId: string;
  value: string;
  actionId?: string;
  actionIcon?: LucideIcon;
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
          {ActionIcon ? <ActionIcon size={15} /> : null}
          {localizeKey(language, actionId ?? "Edit")}
        </button>
      ) : null}
    </div>
  );
}

async function writeClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-1000px";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("copy failed");
}
