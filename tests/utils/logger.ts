/**
 * Professional Logger for API Testing
 * Provides structured logging with different levels and formatting
 */

import { randomUUID } from 'crypto';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  data?: any;
  testCase?: string;
  requestId?: string;
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 1000; // Cap to prevent memory leaks

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  public debug(message: string, data?: any, testCase?: string): void {
    this.log(LogLevel.DEBUG, message, data, testCase);
  }

  public info(message: string, data?: any, testCase?: string): void {
    this.log(LogLevel.INFO, message, data, testCase);
  }

  public warn(message: string, data?: any, testCase?: string): void {
    this.log(LogLevel.WARN, message, data, testCase);
  }

  public error(message: string, data?: any, testCase?: string): void {
    this.log(LogLevel.ERROR, message, data, testCase);
  }

  public logRequest(method: string, url: string, data?: any, requestId?: string): void {
    this.info(`API Request: ${method} ${url}`, {
      method,
      url,
      requestData: data,
      requestId,
    });
  }
  public logResponse(statusCode: number, responseData?: any, requestId?: string): void {
    this.info(`API Response: ${statusCode}`, {
      statusCode,
      responseData,
      requestId,
    });
  }

  public logValidation(field: string, expectedValue: any, actualValue: any, isValid: boolean): void {
    const message = `Validation ${isValid ? 'PASSED' : 'FAILED'}: ${field}`;
    const data = {
      field,
      expected: expectedValue,
      actual: actualValue,
      isValid,
    };
    
    if (isValid) {
      this.info(message, data);
    } else {
      this.error(message, data);
    }
  }

  private log(level: LogLevel, message: string, data?: any, testCase?: string): void {
    if (level < this.logLevel) return;

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      message,
      data,
      testCase,
      requestId: this.generateRequestId()    };

    this.logs.push(logEntry);
    
    // Cap logs to prevent memory leaks
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }
    
    this.outputLog(logEntry);
  }

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
  private generateRequestId(): string {
    // RFC 4122 v4 UUID
    return randomUUID();
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public getLogsForTestCase(testCase: string): LogEntry[] {
    return this.logs.filter(log => log.testCase === testCase);
  }
}
