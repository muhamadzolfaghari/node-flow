# Network Resilience & Retry Policy

## Antigravity Network & Execution Rules

1. **Automatic Network Retry Handling**:
   - When encountering transient network errors (`connection reset by peer`, `no such host`, `EOF`, HTTP 429, or HTTP 503), the agent should not fail immediately.
   - For all API operations, fetch calls, and AI model communications, implement and apply an exponential backoff retry policy (default 3 retries: 1s, 2s, 4s with random jitter).
   
2. **Offline-First & Local Fallbacks**:
   - If remote cloud endpoints are unreachable or down, gracefully fall back to local in-browser computation:
     - Fall back from remote LLM APIs to deterministic rule-based generators or local WebGPU/Ollama models.
     - Fall back from remote storage to client-side IndexedDB persistence.
   - Never block UI thread or drop user edits during network outages.

3. **IDE Connection Stability**:
   - For streaming completions, automatically reconnect and resume from the last known state without losing active workspace drafts.
