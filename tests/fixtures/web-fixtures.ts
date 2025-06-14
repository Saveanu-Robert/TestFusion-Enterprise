/**
 * Web Testing Fixtures for TestFusion-Enterprise
 * Provides shared setup and teardown for web tests
 * Uses centralized configuration and follows API fixtures pattern
 */

import { test as base, Page, expect } from '@playwright/test';
import { Logger } from '../utils/logger';
import { ConfigurationManager } from '../config/configuration-manager';
import { WebClient } from '../clients/web-client';

export interface WebTestFixtures {
  webClient: WebClient;
  logger: Logger;
  webPage: Page;
  webConfig: ReturnType<ConfigurationManager['getWebConfig']>;
}

export interface WebWorkerFixtures {
  configManager: ConfigurationManager;
}

export const test = base.extend<WebTestFixtures, WebWorkerFixtures>({
  // Worker-scoped fixture to cache configuration manager
  configManager: [
    async ({}, use) => {
      const config = ConfigurationManager.getInstance();
      await use(config);
    },
    { scope: 'worker' },
  ],

  // Web configuration fixture
  webConfig: async ({ configManager }, use) => {
    await use(configManager.getWebConfig());
  },

  // Enhanced page fixture with centralized configuration
  webPage: async ({ browser, webConfig }, use) => {
    const context = await browser.newContext({
      viewport: {
        width: webConfig.browsers.viewport.width,
        height: webConfig.browsers.viewport.height,
      },
      ignoreHTTPSErrors: true,
      acceptDownloads: true,
    });

    const page = await context.newPage();

    // Set default timeouts from centralized configuration
    page.setDefaultTimeout(webConfig.timeout.element);
    page.setDefaultNavigationTimeout(webConfig.timeout.navigation);

    // Enable logging based on centralized configuration
    const config = ConfigurationManager.getInstance();
    const loggingConfig = config.getTestConfig().logging;

    if (loggingConfig.enableRequestLogging) {
      page.on('request', request => {
        console.log(`[WEB REQUEST] ${request.method()} ${request.url()}`);
      });
    }

    if (loggingConfig.enableResponseLogging) {
      page.on('response', response => {
        console.log(`[WEB RESPONSE] ${response.status()} ${response.url()}`);
      });
    }

    if (loggingConfig.enableConsoleLogging) {
      page.on('console', msg => {
        console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
      });
    }

    // Add error handling
    page.on('pageerror', error => {
      console.log(`[BROWSER ERROR] ${error.message}`);
    });

    await use(page);
    await context.close();
  },

  // Web client fixture
  webClient: async ({ webPage, configManager }, use) => {
    const webClient = new WebClient(webPage, configManager);
    await use(webClient);
  },

  // Logger fixture
  logger: async ({}, use) => {
    const logger = Logger.getInstance();
    await use(logger);
  },
});

export { expect };
