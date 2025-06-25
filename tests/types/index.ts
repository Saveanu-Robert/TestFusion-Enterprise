/**
 * Type definitions for TestFusion-Enterprise framework
 */

/**
 * Environment enum
 */
export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test',
}

/**
 * API Configuration interface
 */
export interface ApiConfiguration {
  baseUrl: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  rateLimiting: {
    enabled: boolean;
    maxRequests: number;
    perMilliseconds: number;
  };
}

/**
 * Web Configuration interface
 */
export interface WebConfiguration {
  baseUrl: string;
  timeout: number;
  headless: boolean;
  viewport: {
    width: number;
    height: number;
  };
  slowMo: number;
}

/**
 * Logging Configuration interface
 */
export interface LoggingConfiguration {
  level: 'debug' | 'info' | 'warn' | 'error';
  enableConsole: boolean;
  enableFile: boolean;
  filePath?: string;
  format: 'json' | 'text';
}

/**
 * Reporting Configuration interface
 */
export interface ReportingConfiguration {
  enabled: boolean;
  outputDir: string;
  formats: Array<'html' | 'json' | 'junit'>;
  attachScreenshots: boolean;
  attachTraces: boolean;
}

/**
 * Security Configuration interface
 */
export interface SecurityConfiguration {
  enableHttps: boolean;
  certificateValidation: boolean;
  authTokens: {
    apiKey?: string;
    bearerToken?: string;
  };
}

/**
 * Environment Configuration interface
 */
export interface EnvironmentConfiguration {
  name: string;
  api: ApiConfiguration;
  web: WebConfiguration;
  logging: LoggingConfiguration;
  reporting: ReportingConfiguration;
  security: SecurityConfiguration;
}

/**
 * Framework Configuration interface
 */
export interface FrameworkConfiguration {
  environment: Environment;
  api: ApiConfiguration;
  web: WebConfiguration;
  logging: LoggingConfiguration;
  reporting: ReportingConfiguration;
  security: SecurityConfiguration;
  validation: {
    strict: boolean;
    enableTypeChecking: boolean;
  };
}

/**
 * Validation Result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Framework Event interface
 */
export interface FrameworkEvent {
  type: string;
  timestamp: string;
  data: any;
  context?: string;
}
