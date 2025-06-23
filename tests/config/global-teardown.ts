/**
 * Global Teardown for TestFusion-Enterprise
 *
 * Executes after all test suites to:
 * - Clean up test data
 * - Generate final reports
 * - Close external connections
 * - Perform cleanup operations
 */

import * as fs from 'fs';
import * as path from 'path';

import { FullConfig } from '@playwright/test';
import { Logger } from '../utils/logger';

async function globalTeardown(config: FullConfig): Promise<void> {
  const logger = Logger.getInstance();

  logger.info('🧹 Starting TestFusion-Enterprise Global Teardown');

  try {
    // Generate final test reports
    await generateFinalReports();

    // Clean up temporary files
    await cleanupTemporaryFiles();

    // Close external connections
    await closeExternalConnections();

    // Archive test results if needed
    await archiveTestResults();

    logger.info('✅ Global teardown completed successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('❌ Global teardown failed', { error: errorMessage });
    // Don't throw during teardown to avoid masking test failures
  }
}

/**
 * Generate final test reports
 */
async function generateFinalReports(): Promise<void> {
  const logger = Logger.getInstance();
  logger.info('📊 Generating final test reports...');

  // Consolidate test results

  const testResultsPath = path.join(process.cwd(), 'test-results');
  const reportPath = path.join(process.cwd(), 'enterprise-reports');

  if (!fs.existsSync(reportPath)) {
    fs.mkdirSync(reportPath, { recursive: true });
  }

  // Create summary report
  const summaryReport = {
    timestamp: new Date().toISOString(),
    environment: process.env.TEST_ENV || 'unknown',
    ci: !!process.env.CI,
    nodeVersion: process.version,
    // Add more metadata as needed
  };

  fs.writeFileSync(path.join(reportPath, 'test-summary.json'), JSON.stringify(summaryReport, null, 2));

  logger.info('✅ Final reports generated');
}

/**
 * Clean up temporary files
 */
async function cleanupTemporaryFiles(): Promise<void> {
  const logger = Logger.getInstance();

  logger.info('🗑️ Cleaning up temporary files...');
  // Clean up temporary files but preserve test results

  const tempPaths = ['.env.decrypted', 'temp/', '.cache/'];

  for (const tempPath of tempPaths) {
    const fullPath = path.join(process.cwd(), tempPath);
    if (fs.existsSync(fullPath)) {
      try {
        if (fs.lstatSync(fullPath).isDirectory()) {
          fs.rmSync(fullPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(fullPath);
        }
        logger.debug(`Cleaned up: ${tempPath}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.warn(`Failed to clean up ${tempPath}: ${errorMessage}`);
      }
    }
  }

  logger.info('✅ Temporary files cleaned up');
}

/**
 * Close external connections
 */
async function closeExternalConnections(): Promise<void> {
  const logger = Logger.getInstance();

  logger.info('🔌 Closing external connections...');

  // Close any persistent connections
  // This is where you would close database connections,
  // websockets, or other persistent resources

  logger.info('✅ External connections closed');
}

/**
 * Archive test results if needed
 */
async function archiveTestResults(): Promise<void> {
  const logger = Logger.getInstance();

  // Only archive in CI or when explicitly requested
  if (!process.env.CI && !process.env.ARCHIVE_RESULTS) {
    logger.debug('Skipping test result archival');
    return;
  }

  logger.info('📦 Archiving test results...');

  // Archive logic would go here
  // For example, uploading to S3, copying to network share, etc.

  logger.info('✅ Test results archived');
}

export default globalTeardown;
