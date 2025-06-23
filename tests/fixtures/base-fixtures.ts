/**
 * Base Test Fixtures for TestFusion-Enterprise
 *
 * Provides common functionality for all test types including:
 * - Centralized logging and metadata handling
 * - Test context attachment and reporting
 * - Common setup and teardown logic
 * - Unified test result tracking
 *
 * @author TestFusion-Enterprise Team
 * @version 1.0.0
 */

import {
  test as base,
  TestInfo,
  PlaywrightTestArgs,
  PlaywrightTestOptions,
  PlaywrightWorkerArgs,
  PlaywrightWorkerOptions,
} from '@playwright/test';
import { Logger, LogLevel } from '../utils/logger';
import { ConfigurationManager } from '../config/configuration-manager';

export interface BaseTestMetadata {
  test_suite: string;
  test_type: string;
  endpoint_category?: string;
  feature_category?: string;
  data_source?: string;
  test_environment: string;
  timestamp: string;
}

export interface TestResult {
  test_name: string;
  test_status: string | undefined;
  test_duration: number;
  test_file: string;
  retry_count: number;
  annotations: any[];
  timestamp: string;
}

export interface BaseTestFixtures {
  logger: Logger;
  testMetadata: BaseTestMetadata;
  testResult: TestResult;
  testContext: BaseTestContext;
}

export interface BaseWorkerFixtures {
  configManager: ConfigurationManager;
}

export interface BaseTestContext {
  attachTestContext(metadata: Partial<BaseTestMetadata>): Promise<void>;
  attachTestSummary(result: Partial<TestResult>): Promise<void>;
  logTestStart(message: string, data?: any): void;
  logTestEnd(message: string, data?: any): void;
  logInfo(message: string, data?: any): void;
  logError(message: string, data?: any): void;
  logDebug(message: string, data?: any): void;
}

export const baseTest = base.extend<BaseTestFixtures, BaseWorkerFixtures>({
  // Configuration manager - worker scoped for better performance
  configManager: [
    async ({}, use: (config: ConfigurationManager) => Promise<void>) => {
      const config = ConfigurationManager.getInstance();
      await use(config);
    },
    { scope: 'worker' },
  ],
  // Logger instance with configured log level
  logger: async ({ configManager }, use: (logger: Logger) => Promise<void>) => {
    const logger = Logger.getInstance();
    const testConfig = configManager.getTestConfig();

    // Set log level based on configuration
    if (testConfig.logging?.level) {
      switch (testConfig.logging.level.toLowerCase()) {
      case 'debug':
        logger.setLogLevel(LogLevel.DEBUG);
        break;
      case 'info':
        logger.setLogLevel(LogLevel.INFO);
        break;
      case 'warn':
        logger.setLogLevel(LogLevel.WARN);
        break;
      case 'error':
        logger.setLogLevel(LogLevel.ERROR);
        break;
      default:
        logger.setLogLevel(LogLevel.INFO);
      }
    } else {
      logger.setLogLevel(LogLevel.INFO);
    }

    await use(logger);
  },
  // Test metadata with default values
  testMetadata: async ({}, use: (metadata: BaseTestMetadata) => Promise<void>, testInfo: TestInfo) => {
    const metadata: BaseTestMetadata = {
      test_suite: testInfo.file.split(/[/\\]/).pop()?.replace('.spec.ts', '') || 'Unknown Suite',
      test_type: 'Integration Tests',
      test_environment: process.env.NODE_ENV || 'test',
      timestamp: new Date().toISOString(),
    };

    await use(metadata);
  },

  // Test result tracking
  testResult: async ({}, use: (result: TestResult) => Promise<void>, testInfo: TestInfo) => {
    const result: TestResult = {
      test_name: testInfo.title,
      test_status: testInfo.status,
      test_duration: testInfo.duration || 0,
      test_file: testInfo.file,
      retry_count: testInfo.retry,
      annotations: testInfo.annotations,
      timestamp: new Date().toISOString(),
    };

    await use(result);
  },

  // Test context utility for common operations
  testContext: async (
    { logger, testMetadata, testResult },
    use: (context: BaseTestContext) => Promise<void>,
    testInfo: TestInfo,
  ) => {
    const context: BaseTestContext = {
      async attachTestContext(metadata: Partial<BaseTestMetadata>): Promise<void> {
        const fullMetadata = { ...testMetadata, ...metadata };

        // Attach metadata to test info for reporting
        testInfo.annotations.push({
          type: 'test-metadata',
          description: JSON.stringify(fullMetadata),
        });

        logger.debug('📋 Test context attached', fullMetadata);
      },

      async attachTestSummary(result: Partial<TestResult>): Promise<void> {
        const fullResult = { ...testResult, ...result };

        // Update test result with current info
        fullResult.test_status = testInfo.status;
        fullResult.test_duration = testInfo.duration || 0;
        fullResult.retry_count = testInfo.retry;
        fullResult.annotations = testInfo.annotations;

        // Attach result to test info for reporting
        testInfo.annotations.push({
          type: 'test-result',
          description: JSON.stringify(fullResult),
        });

        logger.debug('📊 Test summary attached', fullResult);
      },

      logTestStart(message: string, data?: any): void {
        logger.info(`🚀 ${message}`, {
          test: testInfo.title,
          suite: testMetadata.test_suite,
          timestamp: new Date().toISOString(),
          ...data,
        });
      },

      logTestEnd(message: string, data?: any): void {
        logger.info(`🏁 ${message}`, {
          test: testInfo.title,
          status: testInfo.status,
          duration: testInfo.duration,
          retries: testInfo.retry,
          timestamp: new Date().toISOString(),
          ...data,
        });
      },

      logInfo(message: string, data?: any): void {
        logger.info(message, {
          test: testInfo.title,
          timestamp: new Date().toISOString(),
          ...data,
        });
      },

      logError(message: string, data?: any): void {
        logger.error(message, {
          test: testInfo.title,
          timestamp: new Date().toISOString(),
          ...data,
        });
      },

      logDebug(message: string, data?: any): void {
        logger.debug(message, {
          test: testInfo.title,
          timestamp: new Date().toISOString(),
          ...data,
        });
      },
    };

    await use(context);
  },
});

export { expect } from '@playwright/test';
