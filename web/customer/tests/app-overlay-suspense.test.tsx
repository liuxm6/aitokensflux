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
