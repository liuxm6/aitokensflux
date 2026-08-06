import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { App } from "../src/App";
import {
  CUSTOMER_LANGUAGE_SOURCE_MANUAL,
  CUSTOMER_LANGUAGE_SOURCE_STORAGE_KEY,
  CUSTOMER_LANGUAGE_STORAGE_KEY,
} from "../src/i18n/languages";

const originalFetch = globalThis.fetch;

beforeEach(() => {
  window.localStorage.setItem(CUSTOMER_LANGUAGE_STORAGE_KEY, "en");
  window.localStorage.setItem(
    CUSTOMER_LANGUAGE_SOURCE_STORAGE_KEY,
    CUSTOMER_LANGUAGE_SOURCE_MANUAL,
  );
  globalThis.fetch = mock(
    () => new Promise<Response>(() => undefined),
  ) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  window.localStorage.removeItem("customer-user");
  window.localStorage.removeItem("uid");
});

test("keeps the homepage visible while the sign-in overlay chunk loads", async () => {
  window.history.replaceState(null, "", "/sign-in");

  const { container } = render(<App />);
  const routeLoadingVisible = Array.from(
    container.querySelectorAll(".loading-state .sr-only"),
  ).some((element) => element.textContent === "Loading page");

  expect(Boolean(container.querySelector(".home-page"))).toBe(true);
  expect(routeLoadingVisible).toBe(false);
  expect(await screen.findByRole("dialog")).toBeTruthy();
});

test("keeps the homepage visible while the setup overlay chunk loads", async () => {
  window.history.replaceState(null, "", "/setup");

  const { container } = render(<App />);
  const routeLoadingVisible = Array.from(
    container.querySelectorAll(".loading-state .sr-only"),
  ).some((element) => element.textContent === "Loading page");

  expect(Boolean(container.querySelector(".home-page"))).toBe(true);
  expect(routeLoadingVisible).toBe(false);
  expect(await screen.findByRole("dialog")).toBeTruthy();
});

test("keeps a console-colored route surface while protected content loads", async () => {
  window.localStorage.setItem(
    "customer-user",
    JSON.stringify({
      id: 1,
      username: "operator",
      email: "ops@example.com",
      role: 1,
    }),
  );
  window.history.replaceState(null, "", "/dashboard");

  const { container } = render(<App />);
  const routeSurface = container.querySelector(".customer-route-surface");

  expect(routeSurface).toBeTruthy();
  expect(routeSurface?.classList.contains("console-route-surface")).toBe(true);
  expect(
    await screen.findByRole("heading", { level: 1, name: "Dashboard" }),
  ).toBeTruthy();
});
