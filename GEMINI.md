# Antigravity Workspace Guidelines: NodeFlow Architecture Studio

## 1. Network Failure & Retry Policy
- **Automatic Retries**: All network-bound operations (AI queries, remote Git sync, external schema imports) must use resilient retry strategies with exponential backoff (initial delay 500ms, factor 2, max 3 attempts).
- **Graceful Degradation**: If network drops or DNS resolution fails (`lookup oauth2.googleapis.com: no such host`, `connection reset`), immediately alert with friendly status and fall back to local offline capabilities (local IndexedDB, offline deterministic generators, WebAssembly compilers).

## 2. Code Quality & Standards
- Maintain 100% test pass rate across unit tests (`npm run test:unit`) and diagram syntax tests (`npm test`).
- Ensure no layout shift or overflow on any viewport width (mobile 390px through UHD 4K).
- Strictly adhere to local-first privacy: secrets, tokens, and model keys remain in browser storage.
