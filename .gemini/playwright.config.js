
// playwright.config.js
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'tests',
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: 'line',
  use: {
    baseURL: 'http://localhost:8081',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
