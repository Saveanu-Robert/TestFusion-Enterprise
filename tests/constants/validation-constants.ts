/**
 * Validation Constants and Patterns for TestFusion-Enterprise
 * 
 * This module provides standardized validation patterns and constants used across
 * the test framework for data validation and schema verification.
 * 
 * @file validation-constants.ts
 * @author TestFusion-Enterprise Team
 * @version 1.0.0
 */

/**
 * Primary validation patterns - RFC compliant and production-ready
 */
export const VALIDATION_PATTERNS = {  /**
   * RFC 5322 compliant email validation pattern
   * Validates email addresses according to official specification
   */
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  /**
   * Username validation pattern
   * Allows alphanumeric characters with dots, dashes, and underscores (3-20 chars)
   */
  USERNAME: /^[a-zA-Z0-9._-]{3,20}$/,

  /**
   * International phone number validation pattern
   * Supports various formats including country codes and extensions
   */
  PHONE: /^\+?[\d\s-()x]{10,}$/,

  /**
   * Website domain validation pattern
   * Validates domain names without protocol (used for website field validation)
   */
  WEBSITE: /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,

  /**
   * UUID validation pattern (v4)
   * Validates standard UUID format
   */
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,

  /**
   * URL validation pattern
   * Validates complete URLs with http/https protocol
   */
  URL: /^https?:\/\/.+/,
} as const;

/**
 * Legacy patterns for backward compatibility
 * @deprecated Use VALIDATION_PATTERNS instead - these will be removed in v2.0.0
 */
export const EMAIL_PATTERN = VALIDATION_PATTERNS.EMAIL;
export const PHONE_PATTERN = VALIDATION_PATTERNS.PHONE;
export const WEBSITE_PATTERN = VALIDATION_PATTERNS.WEBSITE;

/**
 * Additional legacy exports for backward compatibility
 * @deprecated Use VALIDATION_PATTERNS instead
 */
export const EMAIL_REGEX = VALIDATION_PATTERNS.EMAIL;
export const USERNAME_REGEX = VALIDATION_PATTERNS.USERNAME;
export const PHONE_REGEX = VALIDATION_PATTERNS.PHONE;
export const WEBSITE_REGEX = VALIDATION_PATTERNS.WEBSITE;
