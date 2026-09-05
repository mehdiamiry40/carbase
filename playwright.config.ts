import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "line",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    launchOptions: process.env.CARBASE_DEPLOY_BROWSER_CONFIG
      ? JSON.parse(process.env.CARBASE_DEPLOY_BROWSER_CONFIG)
      : undefined,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run start -- -H 127.0.0.1 -p 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    // Browser regressions always use mocked delivery, including during a
    // production build. Never give this local test server provider credentials.
    env: {
      RESEND_API_KEY: "",
      BLOB_READ_WRITE_TOKEN: "",
      CRON_SECRET: "",
      QUOTE_RATE_LIMIT_MODE: "off",
      QUOTE_OUTBOX_RECOVERY_MODE: "observe",
    },
  },
});
