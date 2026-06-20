import { useContext, useMemo } from "react";
import {
  FATHERS_DAY_GIFTS_ENABLED,
  FATHERS_DAY_GIFT_LINK,
} from "../../constants/seasonal";
import { LanguageContext } from "../../context/Language";
import { navigateTo } from "../../helpers/navigation";
import { localizeKey } from "../../i18n/localization";

// Festive glyphs for the Father's Day drop — mostly gift boxes, with a few
// ribbons / sparkles mixed in for variety.
const GIFT_GLYPHS = ["🎁", "🎁", "🎁", "🎀", "✨", "🧧"];

const GIFT_COUNT = 14;

interface Gift {
  id: number;
  glyph: string;
  left: number; // horizontal start, in vw
  size: number; // font size, in rem
  delay: number; // start delay, in s
  duration: number; // fall duration, in s
  drift: number; // horizontal sway amplitude, in px
  spin: number; // total rotation, in deg
  opacity: number;
}

function buildGifts(): Gift[] {
  return Array.from({ length: GIFT_COUNT }, (_, id) => {
    const r = (min: number, max: number) => min + Math.random() * (max - min);
    return {
      id,
      glyph: GIFT_GLYPHS[Math.floor(Math.random() * GIFT_GLYPHS.length)],
      left: r(2, 96),
      size: r(1.4, 2.6),
      delay: r(0, 8),
      duration: r(7, 13),
      drift: r(-40, 40),
      spin: r(-180, 180),
      opacity: r(0.7, 1),
    };
  });
}

/**
 * Father's Day seasonal effect: gift boxes gently falling from the top of the
 * page. Rendered as a fixed, click-through overlay so it never interferes with
 * the underlying page. Disabled when the user prefers reduced motion (CSS).
 */
export function FathersDayGifts() {
  const gifts = useMemo(buildGifts, []);

  if (!FATHERS_DAY_GIFTS_ENABLED) return null;

  return (
    <div className="fathers-day-gifts" aria-hidden="true">
      {gifts.map((gift) => (
        <span
          key={gift.id}
          className="fdg-item"
          style={{
            left: `${gift.left}vw`,
            fontSize: `${gift.size}rem`,
            animationDelay: `${gift.delay}s`,
            animationDuration: `${gift.duration}s`,
            // Consumed by the keyframes via custom properties.
            ["--fdg-drift" as string]: `${gift.drift}px`,
            ["--fdg-spin" as string]: `${gift.spin}deg`,
            ["--fdg-opacity" as string]: gift.opacity,
          }}
        >
          {gift.glyph}
        </span>
      ))}
    </div>
  );
}

/**
 * Fixed Father's Day gift entry that hangs from the top of the page. Clicking it
 * navigates to FATHERS_DAY_GIFT_LINK (internal path or external URL). When the
 * link is empty the gift stays visible but does nothing on click.
 */
export function FathersDayGiftEntry() {
  const { language } = useContext(LanguageContext);

  if (!FATHERS_DAY_GIFTS_ENABLED) return null;

  const link = FATHERS_DAY_GIFT_LINK.trim();
  const isExternal = /^https?:\/\//i.test(link);
  const label = localizeKey(language, "Father's Day gift");

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!link) {
      event.preventDefault();
      return;
    }
    if (!isExternal) {
      event.preventDefault();
      navigateTo(link);
    }
  };

  return (
    <a
      className="fdg-entry"
      href={link || undefined}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      onClick={handleClick}
      aria-label={label}
      title={label}
    >
      <span className="fdg-entry-swing" aria-hidden="true">
        <span className="fdg-entry-cord" />
        <span className="fdg-entry-badge">🎁</span>
      </span>
    </a>
  );
}
