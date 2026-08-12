import { afterEach, beforeEach, expect, test } from "bun:test";
import { apiRequest, shouldClearStoredUser } from "../src/services/api";

const originalFetch = globalThis.fetch;

function respondWith(body: unknown, init: ResponseInit) {
  globalThis.fetch = (async () =>
    new Response(JSON.stringify(body), init)) as typeof fetch;
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("a handler failure behind a valid session does not sign the user out", async () => {
  respondWith(
    { success: false, message: "database error" },
    {
      status: 200,
      headers: { "Auth-Version": "864b7076dbcd0a3c01b5520316720ebf" },
    },
  );

  const response = await apiRequest("/api/user/self", { method: "GET" });

  expect(response.success).toBe(false);
  expect(response.authenticated).toBe(true);
  expect(shouldClearStoredUser(response)).toBe(false);
});

test("an auth rejection signs the user out whether it arrives as 200 or 401", async () => {
  respondWith({ success: false, message: "user banned" }, { status: 200 });
  const banned = await apiRequest("/api/user/self", { method: "GET" });

  expect(banned.authenticated).toBe(false);
  expect(shouldClearStoredUser(banned)).toBe(true);

  respondWith({ success: false, message: "not logged in" }, { status: 401 });
  const signedOut = await apiRequest("/api/user/self", { method: "GET" });

  expect(shouldClearStoredUser(signedOut)).toBe(true);
});

test("an unreachable backend leaves the stored session alone", async () => {
  globalThis.fetch = (async () => {
    throw new TypeError("Failed to fetch");
  }) as typeof fetch;

  const response = await apiRequest("/api/user/self", { method: "GET" });

  expect(response.success).toBe(false);
  expect(response.status).toBeUndefined();
  expect(shouldClearStoredUser(response)).toBe(false);
});
