import { readFileSync } from "node:fs";
import { expect, test } from "bun:test";

const customerRoot = new URL("../", import.meta.url);

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

test("styles.css remains the only stylesheet imported by the entrypoint", async () => {
  const entrypoint = await Bun.file(
    new URL("src/main.tsx", customerRoot),
  ).text();
  expect(entrypoint.match(/import\s+["'][^"']+\.css["']/g)).toEqual([
    'import "./styles.css"',
  ]);
});

test("homepage source scopes polish and observes minimal navigation", () => {
  const homeSource = readFileSync(
    new URL("../src/pages/Home/index.tsx", import.meta.url),
    "utf8",
  );
  const headerSource = readFileSync(
    new URL("../src/components/layout/MarketingHeader.tsx", import.meta.url),
    "utf8",
  );

  expect(homeSource).toContain('<main className="home-page">');
  expect(headerSource).toContain('className="minimal-nav-sentinel"');
  expect(headerSource).toContain("IntersectionObserver");
  expect(headerSource).not.toContain('window.addEventListener("scroll"');
});
