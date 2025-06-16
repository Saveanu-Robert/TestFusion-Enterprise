import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,  /* Reporter to use. See https://playwright.dev/docs/test-reporters */  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['dot'], // Less verbose than 'list' - shows dots for passed tests, details only for failures
    [
      'playwright-qase-reporter',
      {
        mode: process.env.QASE_MODE || 'off',
        debug: process.env.QASE_DEBUG === 'true', // Only enable debug when explicitly set to 'true'
        verbose: false, // Reduces Qase reporter output noise
        environment: process.env.QASE_ENVIRONMENT,
        testops: {
          api: {
            token: process.env.QASE_TESTOPS_API_TOKEN,
          },
          project: process.env.QASE_TESTOPS_PROJECT,
          uploadAttachments: true,
          run: {
            id: process.env.QASE_TESTOPS_RUN_ID,
            title: process.env.QASE_TESTOPS_RUN_TITLE,
            description: process.env.QASE_TESTOPS_RUN_DESCRIPTION,
            complete: true,
          },
        },
        framework: {
          browser: {
            addAsParameter: true,
            parameterName: 'browser',
          },
        },
      },
    ],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  /* Configure projects for different test types */
  projects: [
    // API Tests - No browser needed
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        // API tests don't need browser context
      },
    },    // Web/UI Tests - Browser required
    {
      name: 'chromium',
      testDir: './tests/web',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      testDir: './tests/web',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      testDir: './tests/web',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
