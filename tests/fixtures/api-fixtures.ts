import { test as base, APIRequestContext, expect, TestInfo } from '@playwright/test';
import { ApiClient } from '../clients/api-client';
import { Logger, LogLevel } from '../utils/logger';
import { ConfigurationManager } from '../config/configuration-manager';
import { ApiReporter } from '../utils/api-reporter';

export interface ApiTestFixtures {
  apiClient: ApiClient;
  logger: Logger;
  apiReporter: ApiReporter;
}

export interface ApiWorkerFixtures {
  apiRequestContext: APIRequestContext;
  apiConfig: ReturnType<ConfigurationManager['getApiConfig']>;
}

export const test = base.extend<ApiTestFixtures, ApiWorkerFixtures>({
  // Worker-scoped fixture to cache configuration
  apiConfig: [
    async ({}, use) => {
      const config = ConfigurationManager.getInstance();
      const apiConfig = config.getApiConfig();
      await use(apiConfig);
    },
    { scope: 'worker' },
  ],
  
  apiRequestContext: [
    async ({ playwright, apiConfig }, use) => {
      const requestContext = await playwright.request.newContext({
        baseURL: apiConfig.baseUrl,
        extraHTTPHeaders: {
          ...apiConfig.headers,
          'Accept': 'application/json',
        },
        timeout: apiConfig.timeout,
      });

      try {
        await use(requestContext);
      } finally {
        await requestContext.dispose();
      }
    },
    { scope: 'worker' },
  ],
  apiClient: async ({ apiRequestContext, apiConfig, apiReporter }, use) => {
    const client = new ApiClient(apiRequestContext, apiConfig.baseUrl, apiReporter);
    await use(client);
  },
  
  logger: async ({}, use) => {
    const logger = Logger.getInstance();
    logger.setLogLevel(LogLevel.INFO);
    await use(logger);
  },
  apiReporter: async ({}, use: (r: ApiReporter) => Promise<void>, testInfo: TestInfo) => {
    const reporter = new ApiReporter(testInfo);
    await use(reporter);
  },
});

export { expect };
