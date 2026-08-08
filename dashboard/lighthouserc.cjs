/**
 * Lighthouse CI configuration — Core Web Vitals budgets for Vaani AI.
 *
 * Enforces Google's mobile Core Web Vitals thresholds (median-of-3 runs):
 *   - Largest Contentful Paint (LCP) ≤ 4000 ms (mobile slow-4G)
 *   - Cumulative Layout Shift (CLS)  ≤ 0.1
 *   - Total Blocking Time (TBT)      ≤ 500 ms (mobile slow-4G)
 */

const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

const AUDITED_URLS = [
    `${BASE_URL}/`,
    `${BASE_URL}/login`,
];

module.exports = {
    ci: {
        collect: {
            startServerCommand: `npm run start -- -p ${PORT}`,
            startServerReadyPattern: "Ready in",
            startServerReadyTimeout: 120_000,
            url: AUDITED_URLS,
            numberOfRuns: 3,
            settings: {
                chromeFlags: "--headless --no-sandbox --disable-gpu --disable-dev-shm-usage",
                preset:
                    process.env.LHCI_FORM_FACTOR === "desktop"
                        ? "desktop"
                        : undefined,
                onlyCategories: [
                    "performance",
                    "seo",
                    "accessibility",
                    "best-practices",
                ],
            },
        },
        assert: {
            aggregationMethod: "median-run",
            assertions: {
                /* ── Core Web Vitals ───────────────────────────────────── */
                "largest-contentful-paint": [
                    "error",
                    { maxNumericValue: 4000 },
                ],
                "cumulative-layout-shift": [
                    "error",
                    { maxNumericValue: 0.1 },
                ],
                "total-blocking-time": [
                    "error",
                    { maxNumericValue: 500 },
                ],

                /* ── Category Floors ───────────────────────────────────── */
                "categories:performance": ["error", { minScore: 0.80 }],
                "categories:seo": ["error", { minScore: 0.90 }],
                "categories:accessibility": ["error", { minScore: 0.90 }],
                "categories:best-practices": [
                    "error",
                    { minScore: 0.85 },
                ],
            },
        },
        upload: {
            target: "filesystem",
            outputDir: "./.lighthouseci",
        },
    },
};
