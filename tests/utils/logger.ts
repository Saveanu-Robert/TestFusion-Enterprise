/**
 * Professional Logger for TestFusion-Enterprise
 * 
 * Provides structured logging with multiple severity levels, request correlation,
 * and memory-safe log management for test automation scenarios.
 * 
 * Features:
 * - Singleton pattern for consistent logging across the framework
 * - Request correlation IDs for API testing traceability
 * - Memory-safe log storage with automatic rotation
 * - Structured log entries with timestamps and metadata
 * - Test case association for better debugging
 * 
 * @file logger.ts
 * @author TestFusion-Enterprise Team
 * @version 1.0.0
 */

import { randomUUID } from 'crypto';
import { ConfigurationManager } from '../config/configuration-manager';

/**
 * Available log levels in order of severity
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Structured log entry interface
 */
export interface LogEntry {
  /** ISO timestamp when the log entry was created */
  timestamp: string;
  /** String representation of the log level */
  level: string;
  /** Primary log message */
  message: string;
  /** Additional structured data */
  data?: any;
  /** Associated test case name for debugging */
  testCase?: string;
  /** Unique identifier for request correlation */
  requestId?: string;
}

/**
 * Singleton logger class for centralized logging functionality
 */
export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 1000; // Prevent memory leaks in long test suites
  private configManager: ConfigurationManager;

  private constructor() {
    this.configManager = ConfigurationManager.getInstance();
    this.initializeLogLevel();
  }

  /**
   * Gets the singleton instance of the logger
   * @returns The Logger instance
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Initializes log level from configuration
   */
  private initializeLogLevel(): void {
    const configLogLevel = this.configManager.getProperty('logging.level', 'INFO').toUpperCase();
    this.logLevel = LogLevel[configLogLevel as keyof typeof LogLevel] ?? LogLevel.INFO;
  }

  /**
   * Sets the minimum log level for output
   * @param level - The minimum log level to display
   */
  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Logs a debug message (development/troubleshooting information)
   * @param message - The debug message
   * @param data - Additional context data
   * @param testCase - Associated test case name
   */
  public debug(message: string, data?: any, testCase?: string): void {
    this.log(LogLevel.DEBUG, `🔍 ${message}`, data, testCase);
  }

  /**
   * Logs an informational message (general application flow)
   * @param message - The informational message
   * @param data - Additional context data
   * @param testCase - Associated test case name
   */
  public info(message: string, data?: any, testCase?: string): void {
    this.log(LogLevel.INFO, `ℹ️  ${message}`, data, testCase);
  }

  /**
   * Logs a warning message (potential issues that don't break functionality)
   * @param message - The warning message
   * @param data - Additional context data
   * @param testCase - Associated test case name
   */
  public warn(message: string, data?: any, testCase?: string): void {
    this.log(LogLevel.WARN, `⚠️  ${message}`, data, testCase);
  }

  /**
   * Logs an error message (critical issues that affect functionality)
   * @param message - The error message
   * @param data - Additional context data
   * @param testCase - Associated test case name
   */
  public error(message: string, data?: any, testCase?: string): void {
    this.log(LogLevel.ERROR, `❌ ${message}`, data, testCase);
  }

  /**
   * Logs HTTP request details for API testing traceability
   * @param method - HTTP method (GET, POST, etc.)
   * @param url - Request URL
   * @param data - Request payload
   * @param requestId - Unique request identifier
   */
  public logRequest(method: string, url: string, data?: any, requestId?: string): void {
    const correlationId = requestId || this.generateRequestId();
    this.info(`🌐 API Request initiated: ${method.toUpperCase()} ${url}`, {
      method: method.toUpperCase(),
      url,
      requestData: data,
      requestId: correlationId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Logs HTTP response details for API testing traceability
   * @param statusCode - HTTP status code
   * @param responseData - Response payload
   * @param requestId - Unique request identifier for correlation
   * @param duration - Request duration in milliseconds
   */
  public logResponse(statusCode: number, responseData?: any, requestId?: string, duration?: number): void {
    const statusEmoji = this.getStatusEmoji(statusCode);
    const durationText = duration ? ` (${duration}ms)` : '';
    
    this.info(`${statusEmoji} API Response received: ${statusCode}${durationText}`, {
      statusCode,
      responseData,
      requestId,
      duration,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Logs validation results for test assertions
   * @param field - Field being validated
   * @param expectedValue - Expected value
   * @param actualValue - Actual value received
   * @param isValid - Whether validation passed
   */
  public logValidation(field: string, expectedValue: any, actualValue: any, isValid: boolean): void {
    const resultEmoji = isValid ? '✅' : '❌';
    const message = `${resultEmoji} Validation ${isValid ? 'PASSED' : 'FAILED'}: ${field}`;
    const data = {
      field,
      expected: expectedValue,
      actual: actualValue,
      isValid,
      timestamp: new Date().toISOString(),
    };
    
    if (isValid) {
      this.info(message, data);
    } else {
      this.error(message, data);
    }
  }

  /**
   * Logs test execution start
   * @param testName - Name of the test being executed
   * @param description - Test description or additional context
   */
  public logTestStart(testName: string, description?: string): void {
    this.info(`🚀 Test execution started: ${testName}`, {
      testName,
      description,
      startTime: new Date().toISOString(),
    });
  }

  /**
   * Logs test execution completion
   * @param testName - Name of the completed test
   * @param status - Test result status
   * @param duration - Test execution duration in milliseconds
   */
  public logTestEnd(testName: string, status: 'PASSED' | 'FAILED' | 'SKIPPED', duration?: number): void {
    const statusEmoji = status === 'PASSED' ? '✅' : status === 'FAILED' ? '❌' : '⏭️';
    const durationText = duration ? ` (${duration}ms)` : '';
    
    this.info(`${statusEmoji} Test execution completed: ${testName} - ${status}${durationText}`, {
      testName,
      status,
      duration,
      endTime: new Date().toISOString(),
    });
  }

  /**
   * Core logging method that handles all log entries
   * @param level - Log level
   * @param message - Log message
   * @param data - Additional data
   * @param testCase - Associated test case
   */
  private log(level: LogLevel, message: string, data?: any, testCase?: string): void {
    if (level < this.logLevel) return;

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      message,
      data,
      testCase,
      requestId: this.generateRequestId(),
    };

    this.logs.push(logEntry);
    
    // Rotate logs to prevent memory leaks
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }
    
    this.outputLog(logEntry);
  }

  /**
   * Outputs log entry to console with appropriate formatting
   * @param entry - Log entry to output
   */
  private outputLog(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.level}]`;
    const testInfo = entry.testCase ? ` [${entry.testCase}]` : '';
    const logMessage = `${prefix}${testInfo} ${entry.message}`;

    switch (entry.level) {
    case 'DEBUG':
      console.debug(logMessage, entry.data || '');
      break;
    case 'INFO':
      console.log(logMessage, entry.data || '');
      break;
    case 'WARN':
      console.warn(logMessage, entry.data || '');
      break;
    case 'ERROR':
      console.error(logMessage, entry.data || '');
      break;
    }
  }

  /**
   * Generates a unique request ID for correlation
   * @returns RFC 4122 v4 UUID
   */
  private generateRequestId(): string {
    return randomUUID();
  }

  /**
   * Gets appropriate emoji for HTTP status code
   * @param statusCode - HTTP status code
   * @returns Emoji representation
   */
  private getStatusEmoji(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) return '✅';
    if (statusCode >= 300 && statusCode < 400) return '↪️';
    if (statusCode >= 400 && statusCode < 500) return '❌';
    if (statusCode >= 500) return '💥';
    return '❓';
  }

  /**
   * Retrieves all stored log entries
   * @returns Array of log entries
   */
  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clears all stored log entries
   */
  public clearLogs(): void {
    this.logs = [];
    this.info('🧹 Log history cleared');
  }

  /**
   * Retrieves log entries for a specific test case
   * @param testCase - Test case name to filter by
   * @returns Filtered array of log entries
   */
  public getLogsForTestCase(testCase: string): LogEntry[] {
    return this.logs.filter(log => log.testCase === testCase);
  }

  /**
   * Gets current log level
   * @returns Current log level
   */
  public getLogLevel(): LogLevel {
    return this.logLevel;
  }

  /**
   * Exports logs to JSON format for external processing
   * @returns JSON string of all logs
   */
  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}
