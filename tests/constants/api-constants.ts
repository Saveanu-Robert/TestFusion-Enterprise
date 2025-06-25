/**
 * Enterprise API Constants - Centralized configuration for API testing
 *
 * Organized using namespace pattern for better structure:
 * - ApiEndpoints: API endpoint definitions
 * - HttpStatusCodes: HTTP status code constants
 * - ApiHeaders: Standard HTTP headers
 * - ContentTypes: MIME type constants
 * - RequestTimeouts: Timeout configurations
 * - ErrorMessages: Standardized error messages
 *
 * @file api-constants.ts
 * @author TestFusion-Enterprise Team
 * @version 2.0.0
 */

/**
 * API endpoint definitions with environment support
 */
export const ApiEndpoints = {
  // Core JSONPlaceholder API endpoints
  POSTS: '/posts',
  USERS: '/users',
  COMMENTS: '/comments',
  ALBUMS: '/albums',
  PHOTOS: '/photos',
  TODOS: '/todos',
  // Health and monitoring endpoints
  HEALTH: '/health',
  STATUS: '/status',
  METRICS: '/metrics',
  VERSION: '/version',
} as const;

/**
 * HTTP status codes with descriptive objects
 */
export const HttpStatusCodes = {
  // Success codes
  OK: { code: 200, message: 'OK' },
  CREATED: { code: 201, message: 'Created' },
  ACCEPTED: { code: 202, message: 'Accepted' },
  NO_CONTENT: { code: 204, message: 'No Content' },

  // Redirection codes
  MOVED_PERMANENTLY: { code: 301, message: 'Moved Permanently' },
  FOUND: { code: 302, message: 'Found' },
  NOT_MODIFIED: { code: 304, message: 'Not Modified' },

  // Client error codes
  BAD_REQUEST: { code: 400, message: 'Bad Request' },
  UNAUTHORIZED: { code: 401, message: 'Unauthorized' },
  FORBIDDEN: { code: 403, message: 'Forbidden' },
  NOT_FOUND: { code: 404, message: 'Not Found' },
  METHOD_NOT_ALLOWED: { code: 405, message: 'Method Not Allowed' },
  CONFLICT: { code: 409, message: 'Conflict' },
  UNPROCESSABLE_ENTITY: { code: 422, message: 'Unprocessable Entity' },
  TOO_MANY_REQUESTS: { code: 429, message: 'Too Many Requests' },

  // Server error codes
  INTERNAL_SERVER_ERROR: { code: 500, message: 'Internal Server Error' },
  NOT_IMPLEMENTED: { code: 501, message: 'Not Implemented' },
  BAD_GATEWAY: { code: 502, message: 'Bad Gateway' },
  SERVICE_UNAVAILABLE: { code: 503, message: 'Service Unavailable' },
  GATEWAY_TIMEOUT: { code: 504, message: 'Gateway Timeout' },
} as const;

/**
 * Request timeout configurations for different operation types
 */
export const RequestTimeouts = {
  /** Quick operations like health checks */
  FAST: 5000,
  /** Standard CRUD operations */
  STANDARD: 30000,
  /** Long-running operations like bulk imports */
  EXTENDED: 60000,
  /** File upload/download operations */
  FILE_TRANSFER: 120000,
} as const;

/**
 * Standard HTTP headers with proper naming
 */
export const ApiHeaders = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  USER_AGENT: 'User-Agent',
  ACCEPT: 'Accept',
  CACHE_CONTROL: 'Cache-Control',
  X_CORRELATION_ID: 'X-Correlation-ID',
  X_REQUEST_ID: 'X-Request-ID',
  X_API_VERSION: 'X-API-Version',
} as const;

/**
 * Common content types
 */
export const ContentTypes = {
  APPLICATION_JSON: 'application/json',
  APPLICATION_XML: 'application/xml',
  TEXT_PLAIN: 'text/plain',
  TEXT_HTML: 'text/html',
  MULTIPART_FORM_DATA: 'multipart/form-data',
  APPLICATION_FORM_URLENCODED: 'application/x-www-form-urlencoded',
} as const;

/**
 * API configuration constants
 */
export const ApiConfiguration = {
  /** Default batch size for bulk operations */
  DEFAULT_BATCH_SIZE: 10,
  /** Maximum retry attempts for failed requests */
  MAX_RETRY_ATTEMPTS: 3,
  /** Rate limit: requests per second */
  RATE_LIMIT_RPS: 10,
  /** Rate limit: burst capacity */
  RATE_LIMIT_BURST: 20,
  /** Default page size for pagination */
  DEFAULT_PAGE_SIZE: 20,
  /** Maximum page size allowed */
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Standardized error messages for API operations
 */
export const ApiErrorMessages = {
  INVALID_RESPONSE: 'Response validation failed',
  TIMEOUT_ERROR: 'Request timed out',
  NETWORK_ERROR: 'Network error occurred',
  AUTHENTICATION_FAILED: 'Authentication failed',
  AUTHORIZATION_DENIED: 'Authorization denied',
  RESOURCE_NOT_FOUND: 'Requested resource not found',
  VALIDATION_ERROR: 'Request validation failed',
  SERVER_ERROR: 'Internal server error occurred',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
} as const;

/**
 * Test data constants for consistent test scenarios
 */
export const TestDataConstants = {
  /** Valid user IDs for testing */
  VALID_USER_IDS: [1, 2, 3, 4, 5] as const,
  /** Invalid user IDs for negative testing */
  INVALID_USER_IDS: [0, -1, 999999, 'abc'] as const,
  /** Valid post IDs for testing */
  VALID_POST_IDS: [1, 2, 3, 4, 5] as const,
  /** Invalid post IDs for negative testing */
  INVALID_POST_IDS: [0, -1, 999999, 'abc'] as const,
  /** Sample test strings */
  SAMPLE_STRINGS: {
    SHORT: 'Test',
    MEDIUM: 'This is a medium length test string',
    LONG: 'This is a very long test string that might be used for testing various scenarios including edge cases and boundary conditions',
    EMPTY: '',
    UNICODE: '🚀 Test with émojis and üñíçödé',
  },
  /** Common test email domains */
  TEST_EMAIL_DOMAINS: ['example.com', 'test.org', 'sample.net'] as const,
} as const;
