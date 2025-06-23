import { APIRequestContext, expect, TestInfo } from '@playwright/test';
import { ApiClient } from '../clients/api-client';
import { ApiReporter } from '../utils/api-reporter';
import { ConfigurationManager } from '../config/configuration-manager';
import { baseTest, BaseTestFixtures, BaseWorkerFixtures } from './base-fixtures';

export interface ApiTestFixtures extends BaseTestFixtures {
  apiClient: ApiClient;
  apiReporter: ApiReporter;
}

export interface ApiWorkerFixtures extends BaseWorkerFixtures {
  apiRequestContext: APIRequestContext;
  apiConfig: ReturnType<ConfigurationManager['getApiConfig']>;
}

export const test = baseTest.extend<ApiTestFixtures, ApiWorkerFixtures>({
  // Worker-scoped fixture to cache configuration
  apiConfig: [
    async ({ configManager }, use: (config: ReturnType<ConfigurationManager['getApiConfig']>) => Promise<void>) => {
      const apiConfig = configManager.getApiConfig();
      await use(apiConfig);
    },
    { scope: 'worker' },
  ],

  apiRequestContext: [
    async ({ playwright, apiConfig }, use: (context: APIRequestContext) => Promise<void>) => {
      const requestContext = await playwright.request.newContext({
        baseURL: apiConfig.baseUrl,
        extraHTTPHeaders: {
          ...apiConfig.headers,
          Accept: 'application/json',
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

  apiClient: async ({ apiRequestContext, apiConfig, apiReporter }, use: (client: ApiClient) => Promise<void>) => {
    const client = new ApiClient(apiRequestContext, apiConfig.baseUrl, apiReporter);
    await use(client);
  },

  apiReporter: async ({}, use: (reporter: ApiReporter) => Promise<void>, testInfo: TestInfo) => {
    const reporter = new ApiReporter(testInfo);
    await use(reporter);
  },
});

export { expect };
