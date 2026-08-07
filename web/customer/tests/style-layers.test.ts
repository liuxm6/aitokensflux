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

test("route surfaces keep public and console backgrounds stable during lazy loading", async () => {
  const styles = await Bun.file(new URL("src/styles.css", customerRoot)).text();
  const routeSurface = getCssBlock(styles, ".customer-route-surface {");
  const consoleRouteSurface = getCssBlock(
    styles,
    ".customer-route-surface.console-route-surface {",
  );

  expect(routeSurface).toContain("min-height: 100vh");
  expect(routeSurface).toContain("min-height: 100dvh");
  expect(routeSurface).toContain("background: var(--paper)");
  expect(consoleRouteSurface).toContain("background: var(--customer-bg)");
});

test("customer financial and usage values use tabular numerals", async () => {
  const styles = await Bun.file(new URL("src/styles.css", customerRoot)).text();
  const numericValues = getCssBlock(
    styles,
    '.console-summary-value,\n.table td[data-numeric="true"],\n.billing-balance b,\n.usage-token-count,\n.usage-cost-pill {',
  );

  expect(numericValues).toContain("font-variant-numeric: tabular-nums");
});

test("purchase dialogs scroll only their content body", async () => {
  const styles = await Bun.file(new URL("src/styles.css", customerRoot)).text();
  const purchasePanel = getCssBlock(styles, ".purchase-panel {");
  const purchaseBody = getCssBlock(styles, ".purchase-dialog-body {");

  expect(purchasePanel).toContain("overflow: hidden");
  expect(purchasePanel).toContain("max-height: calc(100dvh - 32px)");
  expect(purchaseBody).toContain("min-height: 0");
  expect(purchaseBody).toContain("overflow-y: auto");
  expect(purchaseBody).toContain("overscroll-behavior: contain");
});

test("auth and setup surfaces preserve dynamic viewport sizing on mobile", async () => {
  const styles = await Bun.file(new URL("src/styles.css", customerRoot)).text();
  const authPage = getCssBlock(styles, ".auth-page {");
  const setupPage = getCssBlock(styles, ".setup-wizard-page {");

  expect(authPage).toContain("min-height: 100vh");
  expect(authPage).toContain("min-height: 100dvh");
  expect(setupPage).toContain("min-height: calc(100vh - 66px)");
  expect(setupPage).toContain("min-height: calc(100dvh - 66px)");
  expect(styles).toMatch(
    /@media \(max-width: 560px\) \{[\s\S]*?\.auth-overlay \.auth-modal \{\s*max-height: calc\(100vh - 82px\);\s*max-height: calc\(100dvh - 82px\);/,
  );
  expect(styles).toMatch(
    /@media \(max-width: 560px\) \{[\s\S]*?\.auth-modal \{\s*max-height: calc\(100vh - 80px\);\s*max-height: calc\(100dvh - 80px\);/,
  );
});

test("console typography and dashboard spacing use a compact hierarchy", async () => {
  const styles = await Bun.file(new URL("src/styles.css", customerRoot)).text();
  const pageTitle = getCssBlock(
    styles,
    ".console-page-header .console-page-title {",
  );
  const pageDescription = getCssBlock(styles, ".console-page-heading p {");
  const sectionTitle = getCssBlock(
    styles,
    "\n.console-section-title {\n  margin-top:",
  );
  const walletCard = getCssBlock(styles, ".dashboard-wallet-card {");
  const plansTitle = getCssBlock(
    styles,
    ".dashboard-plans-heading .console-section-title {",
  );
  const planFactLabel = getCssBlock(styles, ".plan-fact span {");
  const planFactValue = getCssBlock(styles, ".plan-fact strong {");
  const supportPanel = getCssBlock(styles, ".dashboard-support-panel {");
  const supportHeading = getCssBlock(
    styles,
    ".dashboard-support-head strong {",
  );
  const supportCardTitle = getCssBlock(
    styles,
    ".dashboard-support-panel .support-copy strong {",
  );
  const supportCardMeta = getCssBlock(
    styles,
    ".dashboard-support-panel .support-copy span {",
  );
  const tutorialPanel = getCssBlock(styles, ".tutorial-panel {");
  const mutedTitle = getCssBlock(styles, ".muted-title {");
  const tutorialTitle = getCssBlock(styles, ".tutorial-card strong {");
  const tutorialMeta = getCssBlock(
    styles,
    "\n.tutorial-card small {\n  margin-top:",
  );

  expect(pageTitle).toContain("font-size: 24px");
  expect(pageTitle).toContain("font-weight: 900");
  expect(pageTitle).toContain("letter-spacing: -0.02em");
  expect(pageDescription).toContain("font-size: 14px");
  expect(sectionTitle).toContain("margin-top: 22px");
  expect(walletCard).toContain("margin-bottom: 0");
  expect(plansTitle).toContain("margin-top: 18px");
  expect(plansTitle).toContain("margin-bottom: 12px");
  expect(planFactLabel).toContain("font-size: 12px");
  expect(planFactLabel).toContain("line-height: 1.35");
  expect(planFactValue).toContain("font-weight: 850");
  expect(planFactValue).toContain("line-height: 1.35");
  expect(supportPanel).toContain("padding: 18px 22px 20px");
  expect(supportHeading).toContain("font-size: 15px");
  expect(supportHeading).toContain("font-weight: 850");
  expect(supportCardTitle).toContain("font-weight: 850");
  expect(supportCardTitle).toContain("line-height: 1.35");
  expect(supportCardMeta).toContain("font-size: 12.5px");
  expect(tutorialPanel).toContain("padding: 18px 22px");
  expect(mutedTitle).toContain("font-weight: 800");
  expect(mutedTitle).toContain("line-height: 1.45");
  expect(tutorialTitle).toContain("font-weight: 850");
  expect(tutorialTitle).toContain("line-height: 1.35");
  expect(tutorialMeta).toContain("font-size: 12.5px");
  expect(tutorialMeta).toContain("line-height: 1.45");
});

test("customer-wide typography and mobile spacing stay coordinated", async () => {
  const styles = await Bun.file(new URL("src/styles.css", customerRoot)).text();
  const base = await Bun.file(
    new URL("src/styles/base.css", customerRoot),
  ).text();
  const headings = getCssBlock(base, "h1,\nh2,\nh3 {");
  const sectionHeading = getCssBlock(base, ".h-sec {");
  const lead = getCssBlock(base, ".lead {");
  const button = getCssBlock(styles, ".btn {");
  const navLink = getCssBlock(styles, ".nav-links a {");
  const panelTitle = getCssBlock(styles, ".panel-h h2,\n.section-title {");
  const consoleControl = getCssBlock(
    styles,
    ".console-input,\n.console-select {",
  );
  const tableHeading = getCssBlock(styles, ".usage-log-table th {");
  const settingLabel = getCssBlock(styles, ".settings-list .set-item .sk {");
  const settingValue = getCssBlock(styles, ".settings-list .set-item .sv {");
  const planTitle = getCssBlock(styles, ".price .tag {");
  const planFeature = getCssBlock(styles, ".price li {");
  const legalEmpty = getCssBlock(styles, ".legal-page .empty {");
  const setupTitle = getCssBlock(
    styles,
    ".setup-page-heading h1,\n.setup-picker h2 {",
  );
  const headerAction = getCssBlock(
    styles,
    ".nav-right > .btn,\n.auth-actions > .btn {",
  );

  expect(headings).toContain("letter-spacing: -0.018em");
  expect(headings).toContain("text-wrap: balance");
  expect(sectionHeading).toContain("line-height: 1.14");
  expect(lead).toContain("line-height: 1.65");
  expect(button).toContain("line-height: 1");
  expect(navLink).toContain("font-weight: 650");
  expect(panelTitle).toContain("font-weight: 800");
  expect(panelTitle).toContain("line-height: 1.35");
  expect(consoleControl).toContain("font-size: 14px");
  expect(tableHeading).toContain("line-height: 1.35");
  expect(settingLabel).toContain("font-size: 15px");
  expect(settingLabel).toContain("line-height: 1.35");
  expect(settingValue).toContain("line-height: 1.45");
  expect(planTitle).toContain("line-height: 1.25");
  expect(planFeature).toContain("line-height: 1.45");
  expect(legalEmpty).toContain("min-height: 120px");
  expect(setupTitle).toContain("letter-spacing: -0.018em");
  expect(headerAction).toContain("height: 44px");
  expect(styles).toMatch(
    /@media \(max-width: 680px\) \{[\s\S]*?\.subscription-page \.price\.has-promo \{[\s\S]*?padding-top: 58px/,
  );
  expect(styles).toMatch(
    /@media \(max-width: 560px\) \{[\s\S]*?\.auth-form-head \{[\s\S]*?padding-right: 40px[\s\S]*?\.auth-form h1 \{[\s\S]*?text-align: left/,
  );
  expect(styles).toMatch(
    /@media \(max-width: 760px\) \{[\s\S]*?\.billing-record-table \.table \{[\s\S]*?min-width: 0[\s\S]*?\.billing-record-table \.table td:nth-child\(n\) \{[\s\S]*?width: auto/,
  );
  expect(styles).toMatch(
    /@media \(max-width: 480px\) \{[\s\S]*?\.console-topbar \.lang-symbol \{[\s\S]*?display: inline/,
  );
});

test("customer mobile actions and compact panels remain complete", async () => {
  const styles = await Bun.file(new URL("src/styles.css", customerRoot)).text();
  const dataPanels = getCssBlock(styles, ".record-panel,\n.usage-panel {");

  expect(dataPanels).toContain("min-height: 0");
  expect(styles).toMatch(
    /@media \(max-width: 980px\) \{[\s\S]*?\.plan-head \{[\s\S]*?width: 100%[\s\S]*?justify-content: stretch/,
  );
  expect(styles).toMatch(
    /@media \(max-width: 680px\) \{[\s\S]*?\.nav-right \.btn-ghost \{[\s\S]*?display: inline-flex/,
  );
  expect(styles).toMatch(
    /@media \(max-width: 680px\) \{[\s\S]*?\.base-url-row > svg \{[\s\S]*?display: none/,
  );
  expect(styles).toMatch(
    /@media \(max-width: 680px\) \{[\s\S]*?\.base-url-copy \{[\s\S]*?display: inline-flex[\s\S]*?justify-content: flex-start[\s\S]*?gap: 6px/,
  );
  expect(styles).not.toMatch(
    /@media \(max-width: 680px\) \{[\s\S]*?\.base-url-row svg \{[\s\S]*?display: none/,
  );
  expect(styles).toMatch(
    /@media \(max-width: 380px\) \{[\s\S]*?\.nav \.brand-logo-lockup \{[\s\S]*?display: none[\s\S]*?\.nav \.brand-logo-icon \{[\s\S]*?display: block/,
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

test("homepage and loading motion reserve layout transitions for FAQ disclosure", () => {
  const marketingStyles = readFileSync(
    new URL("../src/styles/marketing.css", import.meta.url),
    "utf8",
  );
  const faqDetailsContent = getCssBlock(
    marketingStyles,
    ".home-page .faq details::details-content {",
  );
  const compositorMotionStyles = marketingStyles.replace(faqDetailsContent, "");
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
    `${compositorMotionStyles}\n${modelTabStyles}`.matchAll(
      /transition:\s*([^;]+);/g,
    ),
    ([, declaration]) => declaration.replace(/\s+/g, " ").trim(),
  );
  const faqTransitionViolations = Array.from(
    faqDetailsContent.matchAll(/transition:\s*([^;]+);/g),
    ([, declaration]) => declaration.replace(/\s+/g, " ").trim(),
  ).flatMap((declaration) =>
    declaration
      .split(",")
      .map((item) => item.trim())
      .filter((item) => !/^(height|opacity|content-visibility)\b/.test(item))
      .map((item) => `faq transition: ${item}`),
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
  expect([
    ...transitionViolations,
    ...faqTransitionViolations,
    ...keyframeViolations,
  ]).toEqual([]);
  expect(transitionDeclarations).toContain("none");
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
  const heroInner = getCssBlock(
    marketingStyles,
    ".home-page .home-hero .hero-inner {",
  );

  expect(heroInner).toContain("width: 100%");
  expect(heroInner).toContain("padding-top: 96px");

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

test("localized homepage hero titles stay on one line", () => {
  const marketingStyles = readFileSync(
    new URL("../src/styles/marketing.css", import.meta.url),
    "utf8",
  );
  const heroTitle = getCssBlock(marketingStyles, ".home-page .home-hero h1 {");

  expect(heroTitle).toContain("width: max-content");
  expect(heroTitle).toContain("max-width: 100%");
  expect(heroTitle).toContain("white-space: nowrap");
  expect(heroTitle).not.toContain("max-width: 14ch");
  expect(marketingStyles).toMatch(
    /@media \(max-width: 680px\) \{[\s\S]*?\.home-page \.home-hero h1:lang\(en\)[\s\S]*?font-size: clamp\(26px, 8\.2vw, 42px\)[\s\S]*?\.home-page \.home-hero h1:lang\(ru\)[\s\S]*?font-size: clamp\(23px, 7\.2vw, 38px\)/,
  );
});

test("homepage visual hero stays centered independently from its SEO heading", () => {
  const marketingStyles = readFileSync(
    new URL("../src/styles/marketing.css", import.meta.url),
    "utf8",
  );
  const heroInner = getCssBlock(
    marketingStyles,
    ".home-page .home-hero .hero-inner {",
  );
  const heroSwitcher = getCssBlock(
    marketingStyles,
    ".home-page .home-hero .hero-model-switcher {",
  );

  expect(heroInner).toContain("width: 100%");
  expect(heroSwitcher).toContain("min-width: 0");
  expect(heroSwitcher).toContain("width: 100%");
  expect(heroSwitcher).toContain("max-width: 100%");
});

test("model pricing header keeps metadata inside the panel", () => {
  const styles = readFileSync(
    new URL("../src/styles.css", import.meta.url),
    "utf8",
  );
  const panelTop = getCssBlock(styles, ".mp-panel-top {");
  const tabs = getCssBlock(styles, ".mp-tabs {");
  const panelMeta = getCssBlock(styles, ".mp-panel-meta {");

  expect(panelTop).toContain("flex-wrap: wrap");
  expect(tabs).toContain("min-width: 0");
  expect(tabs).toContain("max-width: 100%");
  expect(tabs).toContain("overflow-x: auto");
  expect(panelMeta).toContain("max-width: 100%");
  expect(panelMeta).toContain("margin-left: auto");
  expect(panelMeta).toContain("flex-wrap: wrap");
  expect(styles).toMatch(
    /@media \(max-width: 680px\) \{[\s\S]*?\.mp-panel-meta \{[\s\S]*?margin-left: 0/,
  );
  expect(styles).toMatch(
    /@media \(max-width: 680px\) \{[\s\S]*?\.mp-tabs \{[\s\S]*?max-width: 100%/,
  );
});

test("model pricing sticky header stays flush above scrolling rows", () => {
  const styles = readFileSync(
    new URL("../src/styles.css", import.meta.url),
    "utf8",
  );
  const tableWrap = getCssBlock(styles, ".mp-table-wrap {");
  const table = getCssBlock(styles, ".mp-table {");
  const tableHead = getCssBlock(styles, ".mp-table thead {");

  expect(tableWrap).toContain("padding: 0 12px 12px");
  expect(table).toContain("border-collapse: separate");
  expect(table).toContain("border-spacing: 0");
  expect(tableHead).toContain("position: sticky");
  expect(tableHead).toContain("top: 0");
  expect(tableHead).toContain("z-index: 2");
});

test("homepage polish preserves the locked hero shadow", () => {
  const marketingStyles = readFileSync(
    new URL("../src/styles/marketing.css", import.meta.url),
    "utf8",
  );
  const ghostButton = getCssBlock(
    marketingStyles,
    ".home-page .home-hero .hero-cta .btn-ghost {",
  );

  expect(ghostButton).toContain(
    "box-shadow: 0 12px 28px rgb(75 116 132 / 10%)",
  );
});

test("homepage polish preserves existing anchor landing positions", () => {
  const styles = readFileSync(
    new URL("../src/styles.css", import.meta.url),
    "utf8",
  );

  expect(styles).not.toContain("scroll-margin-top: 82px");
});

test("homepage payg features use balanced columns without changing shared layout", () => {
  const styles = readFileSync(
    new URL("../src/styles.css", import.meta.url),
    "utf8",
  );
  const marketingStyles = readFileSync(
    new URL("../src/styles/marketing.css", import.meta.url),
    "utf8",
  );
  const homeFeatures = getCssBlock(
    marketingStyles,
    ".home-page .payg-service-features {",
  );
  const homeFeature = getCssBlock(
    marketingStyles,
    ".home-page .payg-service-feature {",
  );

  expect(homeFeatures).toContain("column-count: 2");
  expect(homeFeatures).toContain("column-gap: 28px");
  expect(homeFeature).toContain("break-inside: avoid");
  expect(styles).not.toContain(
    ".payg-service-feature:last-child:nth-child(odd)",
  );
  expect(marketingStyles).toMatch(
    /@media \(max-width: 680px\) \{[\s\S]*?\.home-page \.payg-service-features \{[\s\S]*?column-count: 1/,
  );
});

test("homepage numeric polish stays scoped away from subscription pricing", () => {
  const styles = readFileSync(
    new URL("../src/styles.css", import.meta.url),
    "utf8",
  );
  const marketingStyles = readFileSync(
    new URL("../src/styles/marketing.css", import.meta.url),
    "utf8",
  );
  const sharedPlanAmount = getCssBlock(styles, ".price .amt {");
  const sharedPaygAmount = getCssBlock(styles, ".payg-service-amount {");
  const homeAmounts = getCssBlock(
    marketingStyles,
    ".home-page .price .amt,\n.home-page .payg-service-amount {",
  );

  expect(sharedPlanAmount).not.toContain("font-variant-numeric: tabular-nums");
  expect(sharedPaygAmount).not.toContain("font-variant-numeric: tabular-nums");
  expect(homeAmounts).toContain("font-variant-numeric: tabular-nums");
});

test("homepage faq animates height and respects reduced motion", () => {
  const marketingStyles = readFileSync(
    new URL("../src/styles/marketing.css", import.meta.url),
    "utf8",
  );
  const details = getCssBlock(marketingStyles, ".home-page .faq details {");
  const detailsContent = getCssBlock(
    marketingStyles,
    ".home-page .faq details::details-content {",
  );
  const openDetailsContent = getCssBlock(
    marketingStyles,
    ".home-page .faq details[open]::details-content {",
  );
  const reducedMotion = getCssBlock(
    marketingStyles,
    "@media (prefers-reduced-motion: reduce) {",
  );

  const usesIntrinsicSizeTransition =
    details.includes("interpolate-size: allow-keywords") &&
    detailsContent.includes("height: 0") &&
    openDetailsContent.includes("height: auto");
  const usesGridTrackTransition =
    detailsContent.includes("grid-template-rows: 0fr") &&
    openDetailsContent.includes("grid-template-rows: 1fr");

  expect(usesIntrinsicSizeTransition || usesGridTrackTransition).toBe(true);
  expect(detailsContent).toContain("transition:");
  expect(reducedMotion).toContain(".home-page .faq details::details-content");
  expect(reducedMotion).toContain("transition: none");
});

test("homepage faq uses a scoped decorative toggle", () => {
  const styles = readFileSync(
    new URL("../src/styles.css", import.meta.url),
    "utf8",
  );
  const marketingStyles = readFileSync(
    new URL("../src/styles/marketing.css", import.meta.url),
    "utf8",
  );
  const homeSource = readFileSync(
    new URL("../src/pages/Home/index.tsx", import.meta.url),
    "utf8",
  );
  const toggleIcon = getCssBlock(
    marketingStyles,
    ".home-page .faq .faq-toggle-icon {",
  );
  const summary = getCssBlock(styles, ".faq summary {");

  expect(toggleIcon).toContain("transition: transform 0.2s ease");
  expect(summary).not.toContain("user-select: none");
  expect(homeSource).toContain('className="faq-toggle-icon"');
  expect(homeSource).toContain('aria-hidden="true"');
});

test("coarse pointer footer links meet the minimum touch target", () => {
  const styles = readFileSync(
    new URL("../src/styles.css", import.meta.url),
    "utf8",
  );
  const coarsePointer = getCssBlock(styles, "@media (pointer: coarse) {");

  expect(coarsePointer).toContain(".footer a {");
  expect(coarsePointer).toContain("min-height: 44px");
});

test("coarse pointer console controls meet the minimum touch target", () => {
  const styles = readFileSync(
    new URL("../src/styles.css", import.meta.url),
    "utf8",
  );
  const coarsePointer = getCssBlock(styles, "@media (pointer: coarse) {");

  expect(coarsePointer).toContain(".console-app .btn");
  expect(coarsePointer).toContain(".console-app .side nav a");
  expect(coarsePointer).toContain(".usage-page-button");
  expect(coarsePointer).toContain(".inline-copy");
  expect(coarsePointer).toContain(".billing-preset");
  expect(coarsePointer).toContain(".payment-method-button");
  expect(coarsePointer).toContain(".payment-method-select");
  expect(coarsePointer).toContain(".topup-redemption-inline input");
  expect(coarsePointer).toContain("min-height: 44px");
  expect(coarsePointer).toContain("min-width: 44px");
  expect(styles.lastIndexOf("@media (pointer: coarse)")).toBeGreaterThan(
    styles.lastIndexOf("@media (max-width: 760px)"),
  );
});

test("homepage plan heading stays centered and compact", () => {
  const marketingStyles = readFileSync(
    new URL("../src/styles/marketing.css", import.meta.url),
    "utf8",
  );
  const pricingSection = getCssBlock(
    marketingStyles,
    ".home-page .pricing-section {",
  );
  const pricingHeading = getCssBlock(
    marketingStyles,
    ".home-page .pricing-section-head {",
  );
  const pricingLink = getCssBlock(
    marketingStyles,
    ".home-page .pricing-all-link {",
  );
  const pricingGrid = getCssBlock(
    marketingStyles,
    ".home-page .pricing-section .price-grid {",
  );

  expect(pricingSection).toContain("padding: 48px 0 60px");
  expect(pricingHeading).toContain(
    "grid-template-columns: minmax(0, 1fr) auto",
  );
  expect(pricingHeading).toContain("align-items: center");
  expect(pricingHeading).toContain("min-height: 0");
  expect(pricingHeading).toContain("margin-bottom: 28px");
  expect(pricingLink).toContain("position: static");
  expect(pricingLink).toContain("align-self: center");
  expect(pricingLink).toContain("justify-self: end");
  expect(pricingGrid).toContain("margin-top: 0");
  expect(marketingStyles).toMatch(
    /@media \(max-width: 680px\) \{[\s\S]*?\.home-page \.pricing-section-head \{[\s\S]*?grid-template-columns: 1fr[\s\S]*?\.home-page \.pricing-all-link \{[\s\S]*?justify-self: start/,
  );
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

test("mobile model pricing keeps model names visible in the value column", async () => {
  const styles = await Bun.file(new URL("src/styles.css", customerRoot)).text();

  expect(styles).toMatch(
    /@media \(max-width: 760px\) \{[\s\S]*?\.mp-table td\.mp-col-model,\s*\.mp-table td\.mp-percall\s*\{[^}]*width:\s*100%/,
  );
  expect(styles).toMatch(
    /@media \(max-width: 760px\) \{[\s\S]*?\.mp-model-cell\s*\{[\s\S]*?display:\s*grid[\s\S]*?width:\s*100%[\s\S]*?min-width:\s*0[\s\S]*?grid-template-columns:\s*26px minmax\(0, 1fr\)/,
  );
  expect(styles).toMatch(
    /@media \(max-width: 760px\) \{[\s\S]*?\.mp-model-name\s*\{[\s\S]*?overflow:\s*hidden[\s\S]*?overflow-wrap:\s*normal[\s\S]*?text-overflow:\s*ellipsis[\s\S]*?white-space:\s*nowrap[\s\S]*?word-break:\s*normal/,
  );
});
