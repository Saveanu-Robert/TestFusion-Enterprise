/**
 * Test Constants for TestFusion-Enterprise
 * Centralizes all test constants using the configuration manager
 * This provides a single source of truth for all test constants
 */

import { ConfigurationManager } from '../config/configuration-manager';

const config = ConfigurationManager.getInstance();

// ===========================================
// API CONSTANTS
// ===========================================

export const API_CONSTANTS = {
  // Base Configuration
  BASE_URL: config.getApiConfig().baseUrl,
  TIMEOUT: config.getApiConfig().timeout,
  RETRY_ATTEMPTS: config.getApiConfig().retryAttempts,
  
  // Endpoints
  ENDPOINTS: config.getApiConfig().endpoints,
  
  // HTTP Status Codes
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
  } as const,
  
  // HTTP Methods
  METHODS: {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE',
  } as const,
  
  // Content Types
  CONTENT_TYPES: {
    JSON: 'application/json',
    XML: 'application/xml',
    FORM_DATA: 'multipart/form-data',
    URL_ENCODED: 'application/x-www-form-urlencoded',
    TEXT: 'text/plain',
  } as const,
} as const;

// ===========================================
// WEB CONSTANTS
// ===========================================

export const WEB_CONSTANTS = {
  // Base Configuration
  BASE_URL: config.getWebConfig().baseUrl,
  TIMEOUTS: config.getWebConfig().timeout,
  RETRY_ATTEMPTS: config.getWebConfig().retryAttempts,
  
  // Browser Configuration
  BROWSER: config.getWebConfig().browsers,
  
  // Page Paths
  PAGES: config.getWebConfig().pages,
  
  // Common Selectors
  SELECTORS: config.getWebConfig().selectors,
  
  // Additional Common Selectors
  COMMON_SELECTORS: {
    // Form Elements
    INPUT: 'input',
    BUTTON: 'button',
    FORM: 'form',
    SELECT: 'select',
    TEXTAREA: 'textarea',
    CHECKBOX: 'input[type="checkbox"]',
    RADIO: 'input[type="radio"]',
    
    // Navigation Elements
    NAV: 'nav',
    MENU: '[role="menu"]',
    MENU_ITEM: '[role="menuitem"]',
    BREADCRUMB: '[role="breadcrumb"]',
    
    // Content Elements
    MAIN: 'main',
    ARTICLE: 'article',
    SECTION: 'section',
    HEADER: 'header',
    FOOTER: 'footer',
    
    // Interactive Elements
    LINK: 'a',
    MODAL: '[role="dialog"]',
    TOOLTIP: '[role="tooltip"]',
    ALERT: '[role="alert"]',
    TAB: '[role="tab"]',
    TAB_PANEL: '[role="tabpanel"]',
    
    // Table Elements
    TABLE: 'table',
    TABLE_ROW: 'tr',
    TABLE_CELL: 'td',
    TABLE_HEADER: 'th',
    
    // List Elements
    LIST: 'ul, ol',
    LIST_ITEM: 'li',
  } as const,
  
  // Browser Events
  EVENTS: {
    CLICK: 'click',
    DOUBLE_CLICK: 'dblclick',
    HOVER: 'hover',
    FOCUS: 'focus',
    BLUR: 'blur',
    KEY_PRESS: 'keypress',
    KEY_DOWN: 'keydown',
    KEY_UP: 'keyup',
    SCROLL: 'scroll',
    RESIZE: 'resize',
  } as const,
  
  // Keyboard Keys
  KEYS: {
    ENTER: 'Enter',
    ESCAPE: 'Escape',
    TAB: 'Tab',
    SPACE: ' ',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End',
    PAGE_UP: 'PageUp',
    PAGE_DOWN: 'PageDown',
    DELETE: 'Delete',
    BACKSPACE: 'Backspace',
  } as const,
  
  // Wait Conditions
  WAIT_CONDITIONS: {
    VISIBLE: 'visible',
    HIDDEN: 'hidden',
    ATTACHED: 'attached',
    DETACHED: 'detached',
    STABLE: 'stable',
  } as const,
} as const;

// ===========================================
// TEST DATA CONSTANTS
// ===========================================

export const TEST_DATA = {
  // User Test Data
  USERS: {
    VALID_USER: {
      name: 'Test User',
      username: 'testuser',
      email: 'testuser@example.com',
      phone: '555-123-4567',
      website: 'testuser.example.com',
      address: {
        street: '123 Test Street',
        suite: 'Apt 456',
        city: 'Test City',
        zipcode: '12345-678',
        geo: {
          lat: '40.7128',
          lng: '-74.0060'
        }
      },
      company: {
        name: 'Test Company',
        catchPhrase: 'Testing Excellence',
        bs: 'quality test solutions'
      }
    },
    INVALID_USER: {
      name: '',
      email: 'invalid-email',
      phone: 'invalid-phone'
    }
  },
  
  // Post Test Data
  POSTS: {
    VALID_POST: {
      title: 'Test Post Title',
      body: 'This is a test post body content that contains meaningful information for testing purposes.',
      userId: 1
    },
    INVALID_POST: {
      title: '',
      body: '',
      userId: 'invalid'
    }
  },
  
  // Comment Test Data
  COMMENTS: {
    VALID_COMMENT: {
      name: 'Test Comment',
      email: 'testcommenter@example.com',
      body: 'This is a test comment body content',
      postId: 1
    },
    INVALID_COMMENT: {
      name: '',
      email: 'invalid-email',
      body: ''
    }
  },
  
  // Common Test Values
  COMMON: {
    VALID_EMAILS: [
      'test@example.com',
      'user.test@domain.co.uk',
      'test+label@example.org'
    ],
    INVALID_EMAILS: [
      'invalid-email',
      '@example.com',
      'test@',
      'test..test@example.com'
    ],
    VALID_PHONE_NUMBERS: [
      '555-123-4567',
      '+1-555-123-4567',
      '(555) 123-4567'
    ],
    INVALID_PHONE_NUMBERS: [
      '123',
      'invalid-phone',
      '555-123-456789'
    ],
    SEARCH_TERMS: [
      'automation',
      'testing',
      'playwright',
      'javascript'
    ]
  }
} as const;

// ===========================================
// VALIDATION CONSTANTS
// ===========================================

export const VALIDATION_CONSTANTS = {
  // Response Time Thresholds
  RESPONSE_TIME: {
    FAST: 500,
    ACCEPTABLE: config.getProperty('validation.maxResponseTime', 5000),
    SLOW: 10000,
  },
  
  // Data Validation Rules
  RULES: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^\+?[\d\s\-\(\)]+$/,
    URL: /^https?:\/\/.+/,
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  },
  
  // String Length Limits
  LENGTH_LIMITS: {
    NAME: { min: 1, max: 100 },
    EMAIL: { min: 5, max: 254 },
    PHONE: { min: 10, max: 20 },
    TITLE: { min: 1, max: 200 },
    BODY: { min: 1, max: 5000 },
    USERNAME: { min: 3, max: 50 },
  },
  
  // Numeric Ranges
  NUMERIC_RANGES: {
    USER_ID: { min: 1, max: 10000 },
    POST_ID: { min: 1, max: 100000 },
    COMMENT_ID: { min: 1, max: 500000 },
  },
} as const;

// ===========================================
// ENVIRONMENT CONSTANTS
// ===========================================

export const ENVIRONMENT = {
  CURRENT: config.getApiConfig().environment,
  TYPES: {
    DEVELOPMENT: 'development',
    STAGING: 'staging',
    PRODUCTION: 'production',
    TEST: 'test',
  } as const,
} as const;

// ===========================================
// UTILITY CONSTANTS
// ===========================================

export const UTILS = {
  // Wait Times (in milliseconds)
  WAIT_TIMES: {
    SHORT: 1000,
    MEDIUM: 3000,
    LONG: 5000,
    VERY_LONG: 10000,
  },
  
  // Common Messages
  MESSAGES: {
    SUCCESS: 'Operation completed successfully',
    ERROR: 'An error occurred',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Validation failed',
    TIMEOUT_ERROR: 'Operation timed out',
  },
  
  // Date Formats
  DATE_FORMATS: {
    ISO: 'YYYY-MM-DDTHH:mm:ss.sssZ',
    DATE_ONLY: 'YYYY-MM-DD',
    TIME_ONLY: 'HH:mm:ss',
    DISPLAY: 'MMM DD, YYYY',
  },
} as const;

// Export legacy HTTP_STATUS_CODES for backwards compatibility
export const HTTP_STATUS_CODES = API_CONSTANTS.STATUS_CODES;
