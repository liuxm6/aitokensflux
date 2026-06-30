import { ExternalLink } from "lucide-react";
import { useContext, useState, type MouseEvent } from "react";
import { LanguageContext, T } from "../../context/Language";
import { useToast } from "../../context/Toast";
import { SUPPORT_EMAIL } from "../../helpers/account";
import { localizeKey } from "../../i18n/localization";

type SupportChannel = {
  name: string;
  description: string;
  href: string;
  className: string;
  logo?: string;
  copyValue?: string;
  copyPrefix?: string;
  copyLabel?: string;
  copiedMessage?: string;
};

export const supportChannels = [
  {
    name: "QQ support group",
    description: "ai token flux QQ group",
    href: "https://qm.qq.com/q/NjlkFe6La6",
    logo: "https://cdn.simpleicons.org/qq/12B7F5",
    className: "qq",
    copyValue: "826073513",
    copyPrefix: "ai token flux QQ group",
    copyLabel: "Copy QQ group number",
    copiedMessage: "QQ group number copied",
  },
  {
    name: "Telegram support group",
    description: "Real-time notices and international support",
    href: "#telegram-support",
    logo: "https://cdn.simpleicons.org/telegram/26A5E4",
    className: "telegram",
  },
  {
    name: "X",
    description: "Product updates and public announcements",
    href: "https://x.com/mr_liuxm",
    logo: "https://cdn.simpleicons.org/x/111111",
    className: "x",
  },
  {
    name: "Linux.do",
    description: "Community discussion and usage experience",
    href: "https://linux.do/u/liuxm6",
    className: "linuxdo",
  },
  {
    name: "Gmail",
    description: SUPPORT_EMAIL,
    href: `mailto:${SUPPORT_EMAIL}`,
    logo: "https://cdn.simpleicons.org/gmail/EA4335",
    className: "gmail",
    copyValue: SUPPORT_EMAIL,
    copyLabel: "Copy email address",
    copiedMessage: "Email address copied",
  },
] satisfies SupportChannel[];

const LINUXDO_LOGO_CLIP_ID = "customer-support-linuxdo-logo-clip";

function isExternalWebLink(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

function isMailLink(href: string) {
  return href.startsWith("mailto:");
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

function LinuxDoLogo() {
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden="true"
      focusable="false"
      className="linuxdo-logo"
    >
      <defs>
        <clipPath id={LINUXDO_LOGO_CLIP_ID}>
          <circle cx="60" cy="60" r="47" />
        </clipPath>
      </defs>
      <circle fill="#f0f0f0" cx="60" cy="60" r="50" />
      <rect
        fill="#1c1c1e"
        clipPath={`url(#${LINUXDO_LOGO_CLIP_ID})`}
        x="10"
        y="10"
        width="100"
        height="30"
      />
      <rect
        fill="#f0f0f0"
        clipPath={`url(#${LINUXDO_LOGO_CLIP_ID})`}
        x="10"
        y="40"
        width="100"
        height="40"
      />
      <rect
        fill="#ffb003"
        clipPath={`url(#${LINUXDO_LOGO_CLIP_ID})`}
        x="10"
        y="80"
        width="100"
        height="30"
      />
    </svg>
  );
}

export function SupportChannelGrid({ className = "" }: { className?: string }) {
  const { language } = useContext(LanguageContext);
  const notify = useToast();
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const copyValue = async (link: SupportChannel) => {
    if (!link.copyValue) return;
    try {
      await writeClipboard(link.copyValue);
      setCopiedValue(link.copyValue);
      notify({
        type: "success",
        message: localizeKey(language, link.copiedMessage ?? "Copied"),
      });
      window.setTimeout(() => setCopiedValue(null), 1500);
    } catch {
      notify({
        type: "error",
        message: localizeKey(language, "Copy failed"),
      });
    }
  };

  const openSupportLink = (
    event: MouseEvent<HTMLAnchorElement>,
    link: SupportChannel,
  ) => {
    if (!isMailLink(link.href)) return;
    event.preventDefault();
    window.location.href = link.href;
  };

  return (
    <div className={`support-grid${className ? ` ${className}` : ""}`}>
      {supportChannels.map((link) => (
        <div
          key={link.name}
          className={`support-card ${link.className}${link.copyValue ? " has-copy" : ""}`}
        >
          <a
            className="support-card-link"
            href={link.href}
            target={isExternalWebLink(link.href) ? "_blank" : undefined}
            rel={isExternalWebLink(link.href) ? "noreferrer" : undefined}
            onClick={(event) => openSupportLink(event, link)}
          >
            <span className="support-logo" aria-hidden="true">
              {link.logo ? (
                <img src={link.logo} alt="" loading="lazy" />
              ) : (
                <LinuxDoLogo />
              )}
            </span>
            <span className="support-copy">
              <strong>
                <T id={link.name} />
              </strong>
              {!link.copyValue ? (
                <span>
                  <T id={link.description} />
                </span>
              ) : null}
            </span>
            <ExternalLink className="support-arrow" size={16} />
          </a>
          {link.copyValue ? (
            <span className="support-copy-line">
              {link.copyPrefix ? (
                <span className="support-copy-prefix">
                  <T id={link.copyPrefix} />
                </span>
              ) : null}
              <button
                type="button"
                className={`support-copy-value${copiedValue === link.copyValue ? " copied" : ""}`}
                aria-label={localizeKey(language, link.copyLabel ?? "Copy")}
                onClick={() => void copyValue(link)}
              >
                {link.copyValue}
              </button>
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
