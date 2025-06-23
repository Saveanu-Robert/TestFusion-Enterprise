import { defineConfig, devices } from '@playwright/test';

/**
 * Professional Playwright Configuration for TestFusion-Enterprise
 *
 * Features:
 * - Multi-project setup for API and Web testing
 * - Environment-based configuration
 * - Professional reporting with multiple formats
 * - CI/CD optimizations
 * - Performance monitoring
 * - Retry strategies
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',

  /* Global test settings */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  /* Global timeout configurations */
  timeout: 30 * 1000, // 30 seconds per test
  expect: {
    timeout: 10 * 1000, // 10 seconds for assertions
  },

  /* Output directories */
  outputDir: 'test-results/',
  /* Reporter configuration - multiple formats for different needs */
  reporter: [
    // HTML report for detailed analysis
    [
      'html',
      {
        outputFolder: 'playwright-report',
        open: process.env.CI ? 'never' : 'on-failure',
        host: 'localhost',
        port: 9323,
      },
    ],

    // Compact dot reporter for CI
    ['dot'],

    // JUnit XML for CI integration
    ['junit', { outputFile: 'test-results/junit-results.xml' }],

    // JSON report for programmatic analysis
    ['json', { outputFile: 'test-results/test-results.json' }],

    // GitHub Actions reporter when in CI
    ...(process.env.GITHUB_ACTIONS ? [['github'] as const] : []),

    // Qase test management integration
    [
      'playwright-qase-reporter',
      {
        mode: process.env.QASE_MODE || 'off',
        debug: process.env.QASE_DEBUG === 'true',
        verbose: false,
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
    ] as const,
  ],

  /* Global test configuration */
  use: {
    /* Tracing and debugging */
    trace: process.env.CI ? 'retain-on-failure' : 'on-first-retry',
    screenshot: process.env.CI ? 'only-on-failure' : 'only-on-failure',
    video: process.env.CI ? 'retain-on-failure' : 'retain-on-failure',

    /* Performance monitoring */
    actionTimeout: 10 * 1000,
    navigationTimeout: 30 * 1000,

    /* Accept downloads and handle popups */
    acceptDownloads: true,

    /* Ignore HTTPS errors for testing */
    ignoreHTTPSErrors: true,

    /* Viewport for consistent testing */
    viewport: { width: 1280, height: 720 },

    /* Locale and timezone */
    locale: 'en-US',
    timezoneId: 'America/New_York',

    /* User agent */
    userAgent: 'TestFusion-Enterprise/1.0.0 (Test Automation)',
  },

  /* Test projects for different execution contexts */
  projects: [
    // API Testing Project
    {
      name: 'api',
      testDir: './tests/api',
      testMatch: '**/*.spec.ts',
      use: {
        baseURL: process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com',
        extraHTTPHeaders: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'TestFusion-Enterprise-API/1.0.0',
        },
      },
      metadata: {
        type: 'api',
        environment: process.env.TEST_ENV || 'development',
      },
    },

    // Desktop Browser Testing
    {
      name: 'chromium',
      testDir: './tests/web',
      testMatch: '**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.WEB_BASE_URL || 'https://playwright.dev',
        // Use bundled Chromium instead of system Chrome
      },
      metadata: {
        type: 'web',
        browser: 'chromium',
        environment: process.env.TEST_ENV || 'development',
      },
    },

    {
      name: 'firefox',
      testDir: './tests/web',
      testMatch: '**/*.spec.ts',
      use: {
        ...devices['Desktop Firefox'],
        baseURL: process.env.WEB_BASE_URL || 'https://playwright.dev',
      },
      metadata: {
        type: 'web',
        browser: 'firefox',
        environment: process.env.TEST_ENV || 'development',
      },
    },

    {
      name: 'webkit',
      testDir: './tests/web',
      testMatch: '**/*.spec.ts',
      use: {
        ...devices['Desktop Safari'],
        baseURL: process.env.WEB_BASE_URL || 'https://playwright.dev',
      },
      metadata: {
        type: 'web',
        browser: 'webkit',
        environment: process.env.TEST_ENV || 'development',
      },
    },

    // Mobile Testing Projects
    {
      name: 'mobile-chrome',
      testDir: './tests/web',
      testMatch: '**/*.mobile.spec.ts',
      use: {
        ...devices['Pixel 5'],
        baseURL: process.env.WEB_BASE_URL || 'https://playwright.dev',
      },
      metadata: {
        type: 'mobile',
        browser: 'chromium',
        device: 'pixel5',
      },
    },

    {
      name: 'mobile-safari',
      testDir: './tests/web',
      testMatch: '**/*.mobile.spec.ts',
      use: {
        ...devices['iPhone 12'],
        baseURL: process.env.WEB_BASE_URL || 'https://playwright.dev',
      },
      metadata: {
        type: 'mobile',
        browser: 'webkit',
        device: 'iphone12',
      },
    },

    // Performance Testing Project
    {
      name: 'performance',
      testDir: './tests/performance',
      testMatch: '**/*.perf.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.WEB_BASE_URL || 'https://playwright.dev',
      },
      metadata: {
        type: 'performance',
        purpose: 'load-testing',
      },
    },

    // Accessibility Testing Project
    {
      name: 'accessibility',
      testDir: './tests/accessibility',
      testMatch: '**/*.a11y.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.WEB_BASE_URL || 'https://playwright.dev',
      },
      metadata: {
        type: 'accessibility',
        purpose: 'a11y-validation',
      },
    },

    // Cross-Browser Edge Testing
    {
      name: 'edge',
      testDir: './tests/web',
      testMatch: '**/*.spec.ts',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
        baseURL: process.env.WEB_BASE_URL || 'https://playwright.dev',
      },
      metadata: {
        type: 'web',
        browser: 'edge',
      },
    },

    // BrowserStack Cloud Testing
    {
      name: 'browserstack',
      testDir: './tests/web',
      testMatch: '**/*.spec.ts',
      use: {
        baseURL: process.env.WEB_BASE_URL || 'https://playwright.dev',
        // BrowserStack configuration will be handled by browser provider factory
      },
      metadata: {
        type: 'cloud',
        provider: 'browserstack',
      },
    },
  ],

  /* Development server for local testing */
  webServer: process.env.START_DEV_SERVER
    ? {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    }
    : undefined,

  /* Global setup and teardown */
  globalSetup: require.resolve('./tests/config/global-setup.ts'),
  globalTeardown: require.resolve('./tests/config/global-teardown.ts'),
});
