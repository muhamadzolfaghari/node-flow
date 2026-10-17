/**
 * Universal Resilient Network Client with Exponential Backoff & Jitter
 * Handles transient network dropouts, DNS failures, 429 rate limits, and 5xx server errors.
 */

export async function fetchWithRetry(url, options = {}, config = {}) {
  const {
    maxRetries = 3,
    initialDelayMs = 600,
    maxDelayMs = 5000,
    backoffFactor = 2,
    retryOnStatuses = [408, 429, 500, 502, 503, 504],
    onRetry = null,
  } = config;

  let attempt = 0;
  let delay = initialDelayMs;

  while (true) {
    try {
      const response = await fetch(url, options);

      // If response is successful or not in retryable status codes, return it
      if (response.ok || !retryOnStatuses.includes(response.status)) {
        return response;
      }

      attempt++;
      if (attempt > maxRetries) {
        return response;
      }

      // If server provides a Retry-After header, respect it
      const retryAfterHeader = response.headers?.get?.("Retry-After");
      let waitTime = delay;
      if (retryAfterHeader) {
        const seconds = parseInt(retryAfterHeader, 10);
        if (!isNaN(seconds)) {
          waitTime = Math.min(seconds * 1000, maxDelayMs);
        }
      } else {
        // Exponential backoff with full jitter
        const jitter = Math.random() * 200;
        waitTime = Math.min(delay + jitter, maxDelayMs);
        delay *= backoffFactor;
      }

      if (typeof onRetry === "function") {
        onRetry({ attempt, maxRetries, waitTime, status: response.status });
      }

      await new Promise((resolve) => setTimeout(resolve, waitTime));
    } catch (networkError) {
      attempt++;
      if (attempt > maxRetries) {
        throw networkError;
      }

      const jitter = Math.random() * 250;
      const waitTime = Math.min(delay + jitter, maxDelayMs);
      delay *= backoffFactor;

      if (typeof onRetry === "function") {
        onRetry({
          attempt,
          maxRetries,
          waitTime,
          error: networkError.message || "Network Error",
        });
      }

      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
}
