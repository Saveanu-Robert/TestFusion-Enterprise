/**
 * API Constants - Centralized configuration for API testing
 */

export const API_ENDPOINTS = {
  // JSONPlaceholder API - Free testing API
  BASE_URL: 'https://jsonplaceholder.typicode.com',
  POSTS: '/posts',
  USERS: '/users',
  COMMENTS: '/comments',
  ALBUMS: '/albums',
  PHOTOS: '/photos',
  TODOS: '/todos',
} as const;

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const REQUEST_TIMEOUTS = {
  DEFAULT: 30000,
  LONG_RUNNING: 60000,
  SHORT: 10000,
} as const;

export const HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  APPLICATION_JSON: 'application/json',
  USER_AGENT: 'User-Agent',
  AUTHORIZATION: 'Authorization',
} as const;

export const TEST_TAGS = {
  API: '@api',
  SMOKE: '@smoke',
  REGRESSION: '@regression',
  POSTS: '@posts',
  USERS: '@users',
  COMMENTS: '@comments',
  CRUD: '@crud',
  VALIDATION: '@validation',
} as const;

export const ERROR_MESSAGES = {
  INVALID_RESPONSE: 'Response validation failed',
  TIMEOUT_ERROR: 'Request timed out',
  NETWORK_ERROR: 'Network error occurred',
  INVALID_STATUS_CODE: 'Unexpected status code received',
  MISSING_REQUIRED_FIELD: 'Required field is missing',
  INVALID_DATA_TYPE: 'Invalid data type received',
} as const;
