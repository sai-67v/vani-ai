# Testing & Quality

## Test Suite (Backend)
- **Framework**: Jest (`jest`).
- **Main Test Specs**: `src/index.test.js` and `src/lib/callStore.test.js`.
- **Integration/E2E Framework**: Playwright (`@playwright/test`).
- **API Testing**: Supertest (`supertest`).
- **Execution**: Run using `npm test` from the root directory.

## Quality Audits & Workflows
- **Frontend Audits**: Lighthouse CI is configured via `.github/workflows/lighthouse.yml` and `lighthouserc.cjs`.
- **Validation Gates**: Zod schemas ensure API inputs and WebSocket payloads meet expected shapes before processing.
