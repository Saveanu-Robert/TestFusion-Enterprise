/**
 * Main Entry Point for TestFusion-Enterprise
 *
 * Provides a centralized export for all test utilities, fixtures,
 * and configuration for external consumption.
 */

// Core fixtures and base functionality
export {
  baseTest,
  type BaseTestFixtures,
  type BaseWorkerFixtures,
  type BaseTestContext,
} from './fixtures/base-fixtures';
export { test as apiTest, type ApiTestFixtures, type ApiWorkerFixtures } from './fixtures/api-fixtures';
export { test as webTest, type WebTestFixtures, type WebWorkerFixtures } from './fixtures/web-fixtures';

// Configuration management
export { ConfigurationManager, type ApiConfig, type WebConfig, type TestConfig } from './config/configuration-manager';
export { BrowserProviderFactory, type IBrowserProvider } from './config/browser-provider-factory';

// Utilities
export { Logger, LogLevel } from './utils/logger';
export { ApiReporter } from './utils/api-reporter';
export { WebReporter } from './utils/web-reporter';

// Clients
export { ApiClient } from './clients/api-client';
export { WebClient } from './clients/web-client';

// Constants
export * from './constants';

// Test data and fixtures
export * from './fixtures/test-data';

// Validators
export * from './validators';

// Operations
export * from './operations';

// Re-export Playwright test utilities
export { expect } from '@playwright/test';
