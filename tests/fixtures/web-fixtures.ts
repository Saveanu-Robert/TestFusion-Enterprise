/**
 * Web Testing Fixtures for TestFusion-Enterprise
 * Provides shared setup and teardown for web tests
 * Uses centralized configuration and supports multiple execution modes:
 * - Local browser execution
 * - Remote Selenium Grid execution
 * - BrowserStack cloud execution
 */

import { Page, expect, Browser } from '@playwright/test';
import { WebClient } from '../clients/web-client';
import { ConfigurationManager } from '../config/configuration-manager';
import { BrowserProviderFactory, IBrowserProvider } from '../config/browser-provider-factory';
import { WebReporter } from '../utils/web-reporter';
import { Logger } from '../utils/logger';
import { baseTest, BaseTestFixtures, BaseWorkerFixtures } from './base-fixtures';

export interface WebTestFixtures extends BaseTestFixtures {
  webClient: WebClient;
  webPage: Page;
  webConfig: ReturnType<ConfigurationManager['getWebConfig']>;
  browserProvider: IBrowserProvider;
  webReporter: WebReporter;
}

export interface WebWorkerFixtures extends BaseWorkerFixtures {
  sharedBrowser: Browser;
}

export const test = baseTest.extend<WebTestFixtures, WebWorkerFixtures>({
  // Worker-scoped shared browser for better resource management
  sharedBrowser: [
    async ({ configManager }, use: (browser: Browser) => Promise<void>) => {
      const webConfig = configManager.getWebConfig();
      const factory = BrowserProviderFactory.getInstance();
      const provider = factory.createProvider(webConfig.executionMode);

      // Initialize the provider with configuration
      await provider.initialize(webConfig);

      // Create browser instance
      const browser = await provider.createBrowser();

      await use(browser);

      // Cleanup browser
      await browser.close();
      await provider.cleanup();
    },
    { scope: 'worker' },
  ],

  // Web configuration fixture
  webConfig: async (
    { configManager },
    use: (config: ReturnType<ConfigurationManager['getWebConfig']>) => Promise<void>,
  ) => {
    await use(configManager.getWebConfig());
  },

  // Browser provider fixture
  browserProvider: async ({ configManager }, use: (provider: IBrowserProvider) => Promise<void>) => {
    const webConfig = configManager.getWebConfig();
    const factory = BrowserProviderFactory.getInstance();
    const provider = factory.createProvider(webConfig.executionMode);

    // Initialize the provider
    await provider.initialize(webConfig);

    await use(provider);

    // Cleanup provider
    await provider.cleanup();
  },

  // Enhanced page fixture with support for different execution modes
  webPage: async ({ sharedBrowser, webConfig, configManager }, use: (page: Page) => Promise<void>) => {
    const factory = BrowserProviderFactory.getInstance();
    const provider = factory.createProvider(webConfig.executionMode);

    // Initialize provider if not already done
    await provider.initialize(webConfig);

    // Create context with appropriate configuration
    const context = await provider.createContext(sharedBrowser);

    // Create page
    const page = await provider.createPage(context);

    // Enable logging based on centralized configuration
    const loggingConfig = configManager.getTestConfig().logging;

    if (loggingConfig.enableRequestLogging) {
      page.on('request', request => {
        Logger.getInstance().debug(`🌐 Web Request: ${request.method()} ${request.url()}`, {
          method: request.method(),
          url: request.url(),
          executionMode: webConfig.executionMode,
        });
      });
    }

    if (loggingConfig.enableResponseLogging) {
      page.on('response', response => {
        Logger.getInstance().debug(`📡 Web Response: ${response.status()} ${response.url()}`, {
          status: response.status(),
          url: response.url(),
          executionMode: webConfig.executionMode,
        });
      });
    }

    if (loggingConfig.enableConsoleLogging) {
      page.on('console', msg => {
        Logger.getInstance().debug(`🖥️ Browser Console [${msg.type()}]: ${msg.text()}`, {
          type: msg.type(),
          text: msg.text(),
          executionMode: webConfig.executionMode,
        });
      });
    }

    // Add error handling
    page.on('pageerror', error => {
      Logger.getInstance().error(`💥 Browser Page Error: ${error.message}`, {
        error: error.message,
        executionMode: webConfig.executionMode,
      });
    });

    await use(page);
    await context.close();
  },

  // Web client fixture
  webClient: async ({ webPage, configManager }, use: (client: WebClient) => Promise<void>) => {
    const webClient = new WebClient(webPage, configManager);
    await use(webClient);
  },

  // Web reporter fixture for backward compatibility
  webReporter: async ({ webPage }, use: (reporter: WebReporter) => Promise<void>, testInfo) => {
    const webReporter = new WebReporter(webPage, testInfo);
    webReporter.startPerformanceTracking();
    await use(webReporter);
  },
});

export { expect };
