/**
 * Global Setup for TestFusion-Enterprise
 *
 * Executes before all test suites to:
 * - Validate environment configuration
 * - Initialize external services
 * - Set up test data
 * - Perform health checks
 */

import * as fs from 'fs';
import * as path from 'path';

import { FullConfig } from '@playwright/test';
import { ConfigurationManager } from './configuration-manager';
import { Logger } from '../utils/logger';

async function globalSetup(config: FullConfig): Promise<void> {
  const logger = Logger.getInstance();

  logger.info('🚀 Starting TestFusion-Enterprise Global Setup');

  try {
    // Initialize configuration manager
    const configManager = ConfigurationManager.getInstance();
    const testConfig = configManager.getTestConfig();

    logger.info('✅ Configuration Manager initialized', {
      environment: testConfig.api.environment,
      apiBaseUrl: testConfig.api.baseUrl,
      webBaseUrl: testConfig.web.baseUrl,
    });

    // Validate environment configuration
    await validateEnvironment(testConfig);

    // Initialize external services if needed
    await initializeExternalServices(testConfig);

    // Set up test data
    await setupTestData(testConfig);

    // Perform connectivity checks
    await performConnectivityChecks(testConfig);

    logger.info('✅ Global setup completed successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('❌ Global setup failed', { error: errorMessage });
    throw error;
  }
}

/**
 * Validate environment configuration
 */
async function validateEnvironment(testConfig: any): Promise<void> {
  const logger = Logger.getInstance();

  logger.info('🔍 Validating environment configuration...');

  // Check required environment variables
  const requiredVars = ['TEST_ENV', 'LOG_LEVEL'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Validate API configuration
  if (!testConfig.api.baseUrl) {
    throw new Error('API base URL not configured');
  }

  // Validate web configuration
  if (!testConfig.web.baseUrl) {
    throw new Error('Web base URL not configured');
  }

  logger.info('✅ Environment validation passed');
}

/**
 * Initialize external services
 */
async function initializeExternalServices(testConfig: any): Promise<void> {
  const logger = Logger.getInstance();

  logger.info('🔧 Initializing external services...');

  // Initialize browser providers if needed
  if (testConfig.web.executionMode === 'grid') {
    logger.info('🌐 Grid execution mode detected');
    // Additional grid setup if needed
  } else if (testConfig.web.executionMode === 'browserstack') {
    logger.info('☁️ BrowserStack execution mode detected');
    // Additional BrowserStack setup if needed
  }

  logger.info('✅ External services initialized');
}

/**
 * Set up test data
 */
async function setupTestData(testConfig: any): Promise<void> {
  const logger = Logger.getInstance();
  logger.info('📊 Setting up test data...');

  // Create test data directories if they don't exist

  const testDataDirs = ['test-results', 'playwright-report', 'enterprise-reports'];

  for (const dir of testDataDirs) {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      logger.debug(`Created directory: ${dir}`);
    }
  }

  logger.info('✅ Test data setup completed');
}

/**
 * Perform connectivity checks
 */
async function performConnectivityChecks(testConfig: any): Promise<void> {
  const logger = Logger.getInstance();

  logger.info('🌐 Performing connectivity checks...');

  // Check API connectivity
  try {
    const response = await fetch(testConfig.api.baseUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (response.ok || response.status < 500) {
      logger.info(`✅ API connectivity check passed: ${testConfig.api.baseUrl}`);
    } else {
      logger.warn(`⚠️ API returned status ${response.status}: ${testConfig.api.baseUrl}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.warn(`⚠️ API connectivity check failed: ${errorMessage}`);
    // Don't fail setup for connectivity issues unless critical
  }

  // Check web connectivity
  try {
    const response = await fetch(testConfig.web.baseUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (response.ok) {
      logger.info(`✅ Web connectivity check passed: ${testConfig.web.baseUrl}`);
    } else {
      logger.warn(`⚠️ Web returned status ${response.status}: ${testConfig.web.baseUrl}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.warn(`⚠️ Web connectivity check failed: ${errorMessage}`);
    // Don't fail setup for connectivity issues unless critical
  }

  logger.info('✅ Connectivity checks completed');
}

export default globalSetup;
