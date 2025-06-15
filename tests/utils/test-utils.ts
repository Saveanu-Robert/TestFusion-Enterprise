/**
 * Test Utilities for TestFusion-Enterprise
 * 
 * This module provides utility functions and helpers for test execution,
 * data generation, and common test operations across the framework.
 * 
 * @file test-utils.ts
 * @author TestFusion-Enterprise Team
 * @version 1.0.0
 */

import { Logger } from './logger';
import { VALIDATION_PATTERNS } from '../constants/validation-constants';

/**
 * Utility class for common test operations and data generation
 */
export class TestUtils {
  private static logger = Logger.getInstance();

  /**
   * Generates a random string of specified length
   * @param length - Length of the string to generate (default: 10)
   * @param includeNumbers - Include numbers in the string (default: true)
   * @param includeSymbols - Include symbols in the string (default: false)
   * @returns Generated random string
   */
  static generateRandomString(
    length: number = 10, 
    includeNumbers: boolean = true, 
    includeSymbols: boolean = false,
  ): string {
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    
    if (includeNumbers) {
      chars += '0123456789';
    }
    
    if (includeSymbols) {
      chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    }
    
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    this.logger.debug('🎲 Generated random string', { length, includeNumbers, includeSymbols });
    return result;
  }

  /**
   * Generates a random valid email address
   * @param domain - Domain to use (default: example.com)
   * @returns Generated email address
   */
  static generateRandomEmail(domain: string = 'example.com'): string {
    const username = this.generateRandomString(8).toLowerCase();
    const email = `test${username}@${domain}`;
    
    // Validate the generated email against our patterns
    if (!VALIDATION_PATTERNS.EMAIL.test(email)) {
      this.logger.warn('Generated email failed validation', { email });
    }
    
    return email;
  }

  /**
   * Generates a random phone number in a valid format
   * @param format - Format style ('us', 'international', 'simple')
   * @returns Generated phone number
   */
  static generateRandomPhone(format: 'us' | 'international' | 'simple' = 'us'): string {
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const exchange = Math.floor(Math.random() * 900) + 100;
    const number = Math.floor(Math.random() * 9000) + 1000;
    
    switch (format) {
    case 'us':
      return `(${areaCode}) ${exchange}-${number}`;
    case 'international':
      return `+1-${areaCode}-${exchange}-${number}`;
    case 'simple':
      return `${areaCode}${exchange}${number}`;
    default:
      return `${areaCode}-${exchange}-${number}`;
    }
  }

  /**
   * Waits for a specified amount of time
   * @param ms - Milliseconds to wait
   * @returns Promise that resolves after the specified time
   */
  static async wait(ms: number): Promise<void> {
    this.logger.debug(`⏱️ Waiting for ${ms}ms`);
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Formats a date to ISO string or custom format
   * @param date - Date to format
   * @param format - Format type ('iso', 'date-only', 'time-only', 'display')
   * @returns Formatted date string
   */
  static formatDate(date: Date, format: 'iso' | 'date-only' | 'time-only' | 'display' = 'iso'): string {
    switch (format) {
    case 'iso':
      return date.toISOString();
    case 'date-only':
      return date.toISOString().split('T')[0];
    case 'time-only':
      return date.toTimeString().split(' ')[0];
    case 'display':
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
      });
    default:
      return date.toISOString();
    }
  }

  /**
   * Generates test data with random values
   * @param template - Template object with field types
   * @returns Object with generated test data
   */
  static generateTestData(template: Record<string, string>): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [key, type] of Object.entries(template)) {
      switch (type.toLowerCase()) {
      case 'string':
        result[key] = this.generateRandomString(10);
        break;
      case 'email':
        result[key] = this.generateRandomEmail();
        break;
      case 'phone':
        result[key] = this.generateRandomPhone();
        break;
      case 'number':
        result[key] = Math.floor(Math.random() * 1000) + 1;
        break;
      case 'boolean':
        result[key] = Math.random() > 0.5;
        break;
      case 'date':
        result[key] = this.formatDate(new Date());
        break;
      default:
        result[key] = `test_${type}_${this.generateRandomString(5)}`;
      }
    }
    
    this.logger.debug('🏭 Generated test data from template', { template, result });
    return result;
  }

  /**
   * Validates data against expected patterns
   * @param data - Data to validate
   * @param validationRules - Validation rules to apply
   * @returns Validation results
   */
  static validateData(
    data: Record<string, any>, 
    validationRules: Record<string, RegExp | ((value: any) => boolean)>,
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    for (const [field, rule] of Object.entries(validationRules)) {
      const value = data[field];
      
      if (rule instanceof RegExp) {
        if (!rule.test(String(value))) {
          errors.push(`Field '${field}' failed pattern validation`);
        }
      } else if (typeof rule === 'function') {
        if (!rule(value)) {
          errors.push(`Field '${field}' failed custom validation`);
        }
      }
    }
    
    const isValid = errors.length === 0;
    this.logger.debug('🔍 Data validation completed', { isValid, errors });
    
    return { isValid, errors };
  }

  /**
   * Retries an operation with exponential backoff
   * @param operation - Function to retry
   * @param maxRetries - Maximum number of retries (default: 3)
   * @param baseDelay - Base delay in milliseconds (default: 1000)
   * @returns Result of the operation
   */
  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        this.logger.debug(`🔄 Attempting operation (attempt ${attempt}/${maxRetries + 1})`);
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt <= maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1);
          this.logger.warn(`⚠️ Operation failed, retrying in ${delay}ms`, { 
            attempt, 
            error: lastError.message, 
          });
          await this.wait(delay);
        }
      }
    }
    
    this.logger.error(`❌ Operation failed after ${maxRetries + 1} attempts`, { 
      error: lastError!.message, 
    });
    throw lastError!;
  }

  /**
   * Measures execution time of an operation
   * @param operation - Function to measure
   * @param operationName - Name for logging purposes
   * @returns Object with result and duration
   */
  static async measureExecutionTime<T>(
    operation: () => Promise<T>,
    operationName: string = 'operation',
  ): Promise<{ result: T; duration: number }> {
    const startTime = Date.now();
    
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      this.logger.info(`⏱️ ${operationName} completed in ${duration}ms`, { 
        operationName, 
        duration, 
      });
      
      return { result, duration };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`❌ ${operationName} failed after ${duration}ms`, { 
        operationName, 
        duration, 
        error: error instanceof Error ? error.message : String(error), 
      });
      throw error;
    }
  }
}
