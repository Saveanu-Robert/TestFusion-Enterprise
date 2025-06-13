/**
 * Validation constants and patterns
 */

/**
 * Email validation patterns - more strict than the basic ones
 */
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Username validation pattern - alphanumeric with optional dots, dashes, underscores
 */
export const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,20}$/;

/**
 * Phone validation pattern - stricter format (includes extensions)
 */
export const PHONE_REGEX = /^\+?[\d\s\-\(\)x]{10,}$/;

/**
 * Website validation pattern - stricter format
 */
export const WEBSITE_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Legacy patterns for backward compatibility - consider migrating to stricter versions above
 */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_PATTERN = /^[\d\-\s\(\)\+x]+$/;
export const WEBSITE_PATTERN = /^[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}$/;
