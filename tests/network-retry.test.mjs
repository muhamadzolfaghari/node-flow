import test from "node:test";
import assert from "node:assert/strict";
import { fetchWithRetry } from "../src/utils/network-retry.js";

test("fetchWithRetry succeeds on first attempt", async () => {
  let callCount = 0;
  const mockFetch = async () => {
    callCount++;
    return { ok: true, status: 200, json: async () => ({ success: true }) };
  };

  const originalFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;
  try {
    const res = await fetchWithRetry("https://api.example.com/data");
    assert.equal(res.status, 200);
    assert.equal(callCount, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("fetchWithRetry retries on transient 503 error and succeeds", async () => {
  let callCount = 0;
  const retryEvents = [];

  const mockFetch = async () => {
    callCount++;
    if (callCount < 2) {
      return { ok: false, status: 503, headers: new Headers() };
    }
    return { ok: true, status: 200, headers: new Headers() };
  };

  const originalFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;
  try {
    const res = await fetchWithRetry(
      "https://api.example.com/flaky",
      {},
      {
        initialDelayMs: 20,
        maxRetries: 3,
        onRetry: (e) => retryEvents.push(e),
      }
    );
    assert.equal(res.status, 200);
    assert.equal(callCount, 2);
    assert.equal(retryEvents.length, 1);
    assert.equal(retryEvents[0].attempt, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("fetchWithRetry retries on network drop / DNS failure", async () => {
  let callCount = 0;
  const mockFetch = async () => {
    callCount++;
    if (callCount === 1) {
      throw new Error("getaddrinfo ENOTFOUND daily-cloudcode-pa.googleapis.com");
    }
    return { ok: true, status: 200 };
  };

  const originalFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;
  try {
    const res = await fetchWithRetry(
      "https://api.example.com/network-drop",
      {},
      { initialDelayMs: 20, maxRetries: 2 }
    );
    assert.equal(res.status, 200);
    assert.equal(callCount, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("fetchWithRetry respects Retry-After header and returns response when max retries exceeded", async () => {
  let callCount = 0;
  const mockFetch = async () => {
    callCount++;
    const headers = new Map([["Retry-After", "1"]]);
    return { ok: false, status: 429, headers };
  };

  const originalFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;
  try {
    const res = await fetchWithRetry(
      "https://api.example.com/rate-limited",
      {},
      { initialDelayMs: 10, maxRetries: 1 }
    );
    assert.equal(res.status, 429);
    assert.equal(callCount, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("fetchWithRetry throws when network error exceeds maxRetries", async () => {
  const mockFetch = async () => {
    throw new Error("DNS lookup failed");
  };

  const originalFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;
  let retryNotified = false;
  try {
    await assert.rejects(
      async () => {
        await fetchWithRetry(
          "https://api.example.com/dead",
          {},
          {
            initialDelayMs: 5,
            maxRetries: 1,
            onRetry: (e) => {
              retryNotified = true;
              assert.ok(e.error);
            },
          }
        );
      },
      { message: "DNS lookup failed" }
    );
    assert.equal(retryNotified, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

