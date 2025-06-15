/**
 * Constants Index for TestFusion-Enterprise
 * 
 * This module provides a centralized export of all constants used throughout
 * the test framework. It consolidates API, web, test data, and validation
 * constants into a single import source for better maintainability.
 * 
 * Usage:
 * ```typescript
 * import { API_CONSTANTS, WEB_CONSTANTS, TEST_DATA } from './constants';
 * ```
 * 
 * @file index.ts
 * @author TestFusion-Enterprise Team
 * @version 1.0.0
 */

// Core constants exports
export * from './api-constants';
export * from './web-constants';
export * from './validation-constants';

// Export test constants with specific naming to avoid conflicts
export {
  API_CONSTANTS,
  WEB_CONSTANTS,
  TEST_DATA,
  VALIDATION_CONSTANTS,
  ENVIRONMENT,
  UTILS,
} from './test-constants';

// Convenient re-exports with namespace prefixes for clarity
export { API_ENDPOINTS as API_URLS } from './api-constants';
export { WEB_URLS as WEB_PATHS } from './web-constants';
export { VALIDATION_PATTERNS as VALIDATORS } from './validation-constants';

/**
 * Quick access constants for common use cases
 */
export const FRAMEWORK_CONSTANTS = {
  /** Current framework version */
  VERSION: '1.0.0',
  
  /** Framework name */
  NAME: 'TestFusion-Enterprise',
  
  /** Default timeout values (in milliseconds) */
  TIMEOUTS: {
    SHORT: 5000,
    MEDIUM: 10000,
    LONG: 30000,
    VERY_LONG: 60000,
  },
  
  /** Common HTTP status codes */
  HTTP_STATUS: {
    SUCCESS: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500,
  },
  
  /** Test result statuses */
  TEST_STATUS: {
    PASSED: 'PASSED',
    FAILED: 'FAILED',
    SKIPPED: 'SKIPPED',
    PENDING: 'PENDING',
  },
  
  /** Common environment names */
  ENVIRONMENTS: {
    DEVELOPMENT: 'development',
    STAGING: 'staging',
    PRODUCTION: 'production',
    TEST: 'test',
  },
} as const;
