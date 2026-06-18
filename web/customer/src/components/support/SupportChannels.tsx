import { ExternalLink } from "lucide-react";
import { T } from "../../context/Language";
import { buildSupportMailto } from "../../helpers/account";

type SupportChannel = {
  name: string;
  description: string;
  href: string;
  className: string;
  logo?: string;
};

export const supportChannels = [
  {
    name: "QQ support group",
    description: "QQ group: 826073513",
    href: "mqqapi://card/show_pslcard?src_type=internal&version=1&uin=826073513&card_type=group&source=qrcode",
    logo: "https://cdn.simpleicons.org/qq/12B7F5",
    className: "qq",
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
    description: "mr.liuxm6@gmail.com",
    href: buildSupportMailto("aitokensflux support"),
    logo: "https://cdn.simpleicons.org/gmail/EA4335",
    className: "gmail",
  },
] satisfies SupportChannel[];

const LINUXDO_LOGO_CLIP_ID = "customer-support-linuxdo-logo-clip";

function isExternalWebLink(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
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
  return (
    <div className={`support-grid${className ? ` ${className}` : ""}`}>
      {supportChannels.map((link) => (
        <a
          key={link.name}
          className={`support-card ${link.className}`}
          href={link.href}
          target={isExternalWebLink(link.href) ? "_blank" : undefined}
          rel={isExternalWebLink(link.href) ? "noreferrer" : undefined}
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
            <span>
              <T id={link.description} />
            </span>
          </span>
          <ExternalLink className="support-arrow" size={16} />
        </a>
      ))}
    </div>
  );
}
