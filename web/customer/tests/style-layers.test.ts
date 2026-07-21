import { readFileSync } from "node:fs";
import { expect, test } from "bun:test";

const customerRoot = new URL("../", import.meta.url);

function readCustomerStyleSurface() {
  const entryUrl = new URL("src/styles.css", customerRoot);
  const entry = readFileSync(entryUrl, "utf8");
  const imports = Array.from(
    entry.matchAll(/@import\s+["']([^"']+)["'];/g),
    ([, path]) => readFileSync(new URL(path, entryUrl), "utf8"),
  );
  return [entry, ...imports].join("\n");
}

function getCssBlock(source: string, marker: string) {
  const markerStart = source.indexOf(marker);
  if (markerStart < 0) return "";
  const blockStart = source.indexOf("{", markerStart);
  if (blockStart < 0) return "";

  let depth = 0;
  for (let index = blockStart; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    else if (source[index] === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(blockStart + 1, index);
    }
  }
  return "";
}

test("customer styles load semantic token, base, and dialog layers in order", async () => {
  const entry = await Bun.file(new URL("src/styles.css", customerRoot)).text();
  expect(
    entry.indexOf('@import "./styles/tokens.css";'),
  ).toBeGreaterThanOrEqual(0);
  expect(entry.indexOf('@import "./styles/base.css";')).toBeGreaterThan(
    entry.indexOf('@import "./styles/tokens.css";'),
  );
  expect(entry.indexOf('@import "./styles/dialogs.css";')).toBeGreaterThan(
    entry.indexOf('@import "./styles/base.css";'),
  );
  expect(entry.indexOf('@import "./styles/marketing.css";')).toBeGreaterThan(
    entry.indexOf('@import "./styles/dialogs.css";'),
  );

  const tokens = await Bun.file(
    new URL("src/styles/tokens.css", customerRoot),
  ).text();
  expect(tokens).toContain("--customer-accent: #0fb477");
  expect(tokens).toContain("--customer-panel: #ffffff");
  expect(tokens).toContain("--customer-focus:");
  expect(tokens).toContain("--customer-radius-dialog:");
});

test("nested auth dialog stays above the account overlay", () => {
  const customerStyles = readCustomerStyleSurface();
  const accountOverlayStyles = getCssBlock(customerStyles, "\n.auth-overlay {");
  const nestedDialogStyles = getCssBlock(customerStyles, "\n.auth-dialog {");
  const accountOverlayZIndex = Number(
    accountOverlayStyles.match(/z-index:\s*(\d+)/)?.[1],
  );
  const nestedDialogZIndex = Number(
    nestedDialogStyles.match(/z-index:\s*(\d+)/)?.[1],
  );

  expect(accountOverlayZIndex).toBeGreaterThan(0);
  expect(nestedDialogZIndex).toBeGreaterThan(accountOverlayZIndex);
});

test("styles.css remains the only stylesheet imported by the entrypoint", async () => {
  const entrypoint = await Bun.file(
    new URL("src/main.tsx", customerRoot),
  ).text();
  expect(entrypoint.match(/import\s+["'][^"']+\.css["']/g)).toEqual([
    'import "./styles.css"',
  ]);
});

test("console hierarchy and subscription polish stay scoped and responsive", async () => {
  const styles = await Bun.file(new URL("src/styles.css", customerRoot)).text();
  const walletCardStyles = getCssBlock(styles, ".dashboard-wallet-card {");
  const walletPrimaryStyles = getCssBlock(
    styles,
    ".dashboard-wallet-primary {",
  );
  const walletLabelRowStyles = getCssBlock(
    styles,
    ".dashboard-wallet-label-row {",
  );

  expect(styles).toContain(".console-topbar {");
  expect(styles).toContain(".console-page-header {");
  expect(styles).toContain(".console-summary {");
  expect(styles).toContain(".subscription-page {");
  expect(styles).toContain(".subscription-page .pricing-title {");
  expect(styles).toContain(".subscription-page .price.feat {");
  expect(styles).toContain(".dashboard-wallet-card {");
  expect(styles).toContain(".dashboard-wallet-balance > strong {");
  expect(styles).not.toContain(".dashboard-quick-actions {");
  expect(styles).toContain(".dashboard-plan-disclosure {");
  expect(styles).toContain(".dashboard-plans-more {");
  expect(styles).toContain(
    ".console-app .dashboard-plan-list .dashboard-plan-disclosure-card {",
  );
  expect(walletCardStyles).toContain("padding: 18px 22px");
  expect(walletPrimaryStyles).toContain(
    "grid-template-columns: minmax(220px, 1fr) minmax(280px, 0.9fr) auto",
  );
  expect(walletLabelRowStyles).toContain("display: flex");
  expect(walletLabelRowStyles).toContain("flex-wrap: wrap");
  expect(styles).toMatch(
    /@media \(max-width: 680px\) \{[\s\S]*?\.subscription-page \.price \.price-cta/,
  );
  expect(styles).toMatch(
    /@media \(max-width: 680px\) \{[\s\S]*?\.dashboard-wallet-primary[\s\S]*?\.dashboard-plan-disclosure/,
  );
  expect(styles).toMatch(
    /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\.state-skeleton-line/,
  );
  expect(styles).toMatch(
    /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\.dashboard-plan-disclosure > svg/,
  );
  expect(styles).toMatch(
    /@media \(max-width: 980px\) \{[\s\S]*?\.mobile-topbar[\s\S]*?display: flex/,
  );
});

test("homepage source scopes polish and observes minimal navigation", () => {
  const homeSource = readFileSync(
    new URL("../src/pages/Home/index.tsx", import.meta.url),
    "utf8",
  );
  const marketingStyles = readFileSync(
    new URL("../src/styles/marketing.css", import.meta.url),
    "utf8",
  );
  const headerSource = readFileSync(
    new URL("../src/components/layout/MarketingHeader.tsx", import.meta.url),
    "utf8",
  );

  expect(homeSource).toContain('<main className="home-page">');
  expect(marketingStyles).toContain(".home-page .home-hero");
  expect(marketingStyles).toContain(".home-page .support-reward-callout");
  expect(marketingStyles).toContain(".home-page .home-features");
  expect(marketingStyles).toContain(".home-page .cta-banner");
  expect(marketingStyles).toContain(".home-page .support-card");
  expect(marketingStyles).toContain(".home-page .faq details");
  expect(marketingStyles).toContain(
    '.home-page ~ [data-home-section="footer"] .footer',
  );
  expect(marketingStyles).toContain("@media (prefers-reduced-motion: reduce)");
  expect(headerSource).toContain('className="minimal-nav-sentinel"');
  expect(headerSource).toContain("IntersectionObserver");
  expect(headerSource).not.toContain('window.addEventListener("scroll"');
  expect(homeSource).toMatch(
    /MarketingHeader:\s*ComponentType<\{\s*minimal\?: boolean;\s*homePage\?: boolean;\s*\}>;/,
  );
  expect(homeSource).toContain("<MarketingHeader minimal homePage />");
  expect(headerSource).toContain("homePage = false");
  expect(headerSource).toContain('homePage ? " home-nav" : ""');
});

test("homepage and loading motion use only transform or opacity", () => {
  const marketingStyles = readFileSync(
    new URL("../src/styles/marketing.css", import.meta.url),
    "utf8",
  );
  const customerStyles = readCustomerStyleSurface();
  const modelTabStyles = getCssBlock(customerStyles, ".mp-tab {");
  const skeletonStyles = getCssBlock(customerStyles, ".state-skeleton-line {");
  const skeletonAnimation = skeletonStyles.match(
    /animation:\s*([a-z][a-z0-9-]*)\b/,
  )?.[1];
  const skeletonKeyframes = skeletonAnimation
    ? getCssBlock(customerStyles, `@keyframes ${skeletonAnimation}`)
    : "";
  const transitionDeclarations = Array.from(
    `${marketingStyles}\n${modelTabStyles}`.matchAll(/transition:\s*([^;]+);/g),
    ([, declaration]) => declaration.replace(/\s+/g, " ").trim(),
  );
  const transitionViolations = transitionDeclarations.flatMap((declaration) =>
    declaration
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "none" && !/^(transform|opacity)\b/.test(item))
      .map((item) => `transition: ${item}`),
  );
  const keyframeViolations = Array.from(
    skeletonKeyframes.matchAll(/^\s*([a-z-]+)\s*:/gm),
    ([, property]) => property,
  )
    .filter((property) => property !== "transform" && property !== "opacity")
    .map((property) => `${skeletonAnimation}: ${property}`);

  expect(marketingStyles).toContain("min-height: 100dvh");
  expect(marketingStyles).toContain("width: min(720px, 100%)");
  expect(marketingStyles).toContain("@media (max-width: 900px)");
  expect(marketingStyles).toContain("@media (max-width: 560px)");
  expect(modelTabStyles).toBeTruthy();
  expect(skeletonAnimation).toBeTruthy();
  expect(skeletonKeyframes).toBeTruthy();
  expect([...transitionViolations, ...keyframeViolations]).toEqual([]);
  expect(transitionDeclarations).toHaveLength(3);
  expect(transitionDeclarations.at(-1)).toBe("none");
});

test("homepage green actions bind accessible ink to scoped selectors", () => {
  const marketingStyles = readFileSync(
    new URL("../src/styles/marketing.css", import.meta.url),
    "utf8",
  );

  expect(marketingStyles).toMatch(
    /\.home-page \.btn-flux,\s*\.home-page \.support-reward-action\s*\{\s*color:\s*var\(--accent-ink\);\s*\}/,
  );
  expect(marketingStyles).toMatch(
    /\.home-page \.btn-flux:hover\s*\{\s*color:\s*var\(--ink\);\s*\}/,
  );
});

test("desktop homepage frame binds nav height and hero top padding", () => {
  const marketingStyles = readFileSync(
    new URL("../src/styles/marketing.css", import.meta.url),
    "utf8",
  );

  expect(marketingStyles).toMatch(
    /\.home-page \.home-hero \.hero-inner\s*\{\s*padding-top:\s*96px;\s*\}/,
  );

  const desktopMediaStart = marketingStyles.indexOf(
    "@media (min-width: 681px) {",
  );
  expect(desktopMediaStart).toBeGreaterThanOrEqual(0);
  const desktopMediaOpen = marketingStyles.indexOf("{", desktopMediaStart);
  expect(desktopMediaOpen).toBeGreaterThan(desktopMediaStart);

  let depth = 0;
  let desktopMediaEnd = -1;
  for (
    let index = desktopMediaOpen;
    index < marketingStyles.length;
    index += 1
  ) {
    if (marketingStyles[index] === "{") {
      depth += 1;
    } else if (marketingStyles[index] === "}") {
      depth -= 1;
      if (depth === 0) {
        desktopMediaEnd = index + 1;
        break;
      }
    }
  }

  expect(desktopMediaEnd).toBeGreaterThan(desktopMediaOpen);
  const desktopMedia = marketingStyles.slice(
    desktopMediaStart,
    desktopMediaEnd,
  );
  expect(desktopMedia).toMatch(
    /\.nav\.minimal-nav\.home-nav \.nav-inner\s*\{\s*height:\s*80px;\s*\}/,
  );
  expect(desktopMedia).not.toMatch(/\.nav\.minimal-nav \.nav-inner/);
});

test("adaptive pricing table releases its max height at 760px and below", () => {
  const marketingStyles = readFileSync(
    new URL("../src/styles/marketing.css", import.meta.url),
    "utf8",
  );
  const mobileMediaStart = marketingStyles.indexOf("@media (max-width: 760px)");

  expect(mobileMediaStart).toBeGreaterThanOrEqual(0);
  const mobileMediaOpen = marketingStyles.indexOf("{", mobileMediaStart);
  expect(mobileMediaOpen).toBeGreaterThan(mobileMediaStart);

  let depth = 0;
  let mobileMediaEnd = -1;
  for (
    let index = mobileMediaOpen;
    index < marketingStyles.length;
    index += 1
  ) {
    if (marketingStyles[index] === "{") {
      depth += 1;
    } else if (marketingStyles[index] === "}") {
      depth -= 1;
      if (depth === 0) {
        mobileMediaEnd = index + 1;
        break;
      }
    }
  }

  expect(mobileMediaEnd).toBeGreaterThan(mobileMediaOpen);
  expect(marketingStyles.slice(mobileMediaStart, mobileMediaEnd)).toMatch(
    /\.home-page \.mp-table-wrap-adaptive\s*\{\s*max-height:\s*none;\s*\}/,
  );
});
