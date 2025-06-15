/**
 * Web Testing Fixtures for TestFusion-Enterprise
 * Provides shared setup and teardown for web tests
 * Uses centralized configuration and supports multiple execution modes:
 * - Local browser execution
 * - Remote Selenium Grid execution  
 * - BrowserStack cloud execution
 */

import { test as base, Page, expect, Browser } from '@playwright/test';
import { Logger } from '../utils/logger';
import { ConfigurationManager } from '../config/configuration-manager';
import { WebClient } from '../clients/web-client';
import { BrowserProviderFactory, IBrowserProvider } from '../config/browser-provider-factory';
import { WebReporter } from '../utils/web-reporter';

export interface WebTestFixtures {
  webClient: WebClient;
  logger: Logger;
  webPage: Page;
  webConfig: ReturnType<ConfigurationManager['getWebConfig']>;
  browserProvider: IBrowserProvider;
  webReporter: WebReporter;
}

export interface WebWorkerFixtures {
  configManager: ConfigurationManager;
  sharedBrowser: Browser;
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

  // Worker-scoped shared browser for better resource management
  sharedBrowser: [
    async ({ configManager }, use) => {
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
  webConfig: async ({ configManager }, use) => {
    await use(configManager.getWebConfig());
  },

  // Browser provider fixture
  browserProvider: async ({ configManager }, use) => {
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
  webPage: async ({ sharedBrowser, webConfig, configManager }, use) => {
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
  webClient: async ({ webPage, configManager }, use) => {
    const webClient = new WebClient(webPage, configManager);
    await use(webClient);
  },

  // Web reporter fixture for backward compatibility
  webReporter: async ({ webPage }, use, testInfo) => {
    const webReporter = new WebReporter(webPage, testInfo);
    webReporter.startPerformanceTracking();
    await use(webReporter);
  },

  // Logger fixture
  logger: async ({}, use) => {
    const logger = Logger.getInstance();
    await use(logger);
  },
});

export { expect };
