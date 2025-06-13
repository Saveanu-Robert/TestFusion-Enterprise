import { test as base, APIRequestContext, expect } from '@playwright/test';
import { ApiClient } from '../clients/api-client';
import { Logger, LogLevel } from '../utils/logger';
import { ConfigurationManager } from '../config/configuration-manager';

export interface ApiTestFixtures {
  apiClient: ApiClient;
  logger: Logger;
}

export interface ApiWorkerFixtures {
  apiRequestContext: APIRequestContext;
}

export const test = base.extend<ApiTestFixtures, ApiWorkerFixtures>({
  apiRequestContext: [
    async ({ playwright }, use) => {
      const config = ConfigurationManager.getInstance();
      const apiConfig = config.getApiConfig();
      
      const requestContext = await playwright.request.newContext({
        baseURL: apiConfig.baseUrl,
        extraHTTPHeaders: {
          ...apiConfig.headers,
          'Accept': 'application/json'
        },
        timeout: apiConfig.timeout,
      });

      await use(requestContext);
      await requestContext.dispose();
    },
    { scope: 'worker' }
  ],

  apiClient: async ({ apiRequestContext }, use) => {
    const config = ConfigurationManager.getInstance();
    const apiConfig = config.getApiConfig();
    const client = new ApiClient(apiRequestContext, apiConfig.baseUrl);
    await use(client);  },
  logger: async ({} /* no worker fixtures needed */, use) => {
    const logger = Logger.getInstance();
    logger.setLogLevel(LogLevel.INFO);
    await use(logger);
  },
});

export { expect };
