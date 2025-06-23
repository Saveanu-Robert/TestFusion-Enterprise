/**
 * Web Testing Constants - Centralized configuration for web UI testing
 */

export const WEB_URLS = {
  // Demo Applications for Testing
  DEMO_QA: 'https://demoqa.com',
  SAUCE_DEMO: 'https://www.saucedemo.com',
  AUTOMATION_PRACTICE: 'http://automationpractice.com/index.php',
  THE_INTERNET: 'https://the-internet.herokuapp.com',

  // Specific Page Paths
  PATHS: {
    LOGIN: '/login',
    ELEMENTS: '/elements',
    FORMS: '/forms',
    ALERTS: '/alerts-frame-windows',
    WIDGETS: '/widgets',
    INTERACTIONS: '/interaction',
    BOOKS: '/books',
    PROFILE: '/profile',
    BOOK_STORE: '/books',
  },
} as const;

/**
 * Test Data Configuration
 */
export const WEB_CONFIG = {
  TIMEOUTS: {
    DEFAULT: 10000,
    LONG: 30000,
    SHORT: 5000,
    NAVIGATION: 15000,
  },
  RETRY_ATTEMPTS: 3,
  BATCH_SIZE: 5,
  MAX_CONCURRENT_TESTS: 4,
} as const;

/**
 * User Credentials for Testing
 */
export const TEST_USERS = {
  STANDARD_USER: {
    username: 'standard_user',
    password: 'secret_sauce',
  },
  LOCKED_USER: {
    username: 'locked_out_user',
    password: 'secret_sauce',
  },
  PROBLEM_USER: {
    username: 'problem_user',
    password: 'secret_sauce',
  },
  PERFORMANCE_USER: {
    username: 'performance_glitch_user',
    password: 'secret_sauce',
  },
  DEMO_USER: {
    username: 'testuser@demo.com',
    password: 'Test123!',
    firstName: 'John',
    lastName: 'Doe',
    email: 'testuser@demo.com',
    phone: '+1234567890',
  },
} as const;

/**
 * Expected UI States and Messages
 */
export const UI_STATES = {
  SUCCESS_MESSAGES: {
    LOGIN_SUCCESS: 'Swag Labs',
    FORM_SUBMITTED: 'Thanks for submitting the form',
    REGISTRATION_SUCCESS: 'Registration successful',
  },
  ERROR_MESSAGES: {
    INVALID_CREDENTIALS: 'Username and password do not match any user in this service',
    LOCKED_USER: 'Sorry, this user has been locked out',
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
  },
  LOADING_STATES: {
    SPINNER: '[data-testid="loading-spinner"]',
    OVERLAY: '.loading-overlay',
  },
} as const;

/**
 * Common UI Selectors
 */
export const COMMON_SELECTORS = {
  BUTTONS: {
    PRIMARY: '[data-testid="primary-button"]',
    SECONDARY: '[data-testid="secondary-button"]',
    SUBMIT: '[type="submit"]',
    CANCEL: '[data-testid="cancel-button"]',
    CLOSE: '[data-testid="close-button"]',
  },
  FORMS: {
    INPUT: 'input',
    TEXTAREA: 'textarea',
    SELECT: 'select',
    CHECKBOX: 'input[type="checkbox"]',
    RADIO: 'input[type="radio"]',
  },
  NAVIGATION: {
    MENU: '[data-testid="navigation-menu"]',
    BREADCRUMB: '[data-testid="breadcrumb"]',
    PAGINATION: '[data-testid="pagination"]',
  },
  FEEDBACK: {
    SUCCESS: '[data-testid="success-message"]',
    ERROR: '[data-testid="error-message"]',
    WARNING: '[data-testid="warning-message"]',
    INFO: '[data-testid="info-message"]',
  },
} as const;

/**
 * Browser and Device Configurations
 */
export const BROWSER_CONFIG = {
  VIEWPORT_SIZES: {
    DESKTOP: { width: 1920, height: 1080 },
    TABLET: { width: 768, height: 1024 },
    MOBILE: { width: 375, height: 667 },
  },
  USER_AGENTS: {
    CHROME: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    FIREFOX: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101',
    SAFARI: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
  },
} as const;
