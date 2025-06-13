/**
 * Configuration Manager for API Testing
 * Handles environment-specific configurations and properties
 */

import { config } from 'dotenv';

// Load environment variables from .env file
config();

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  headers: Record<string, string>;
  environment: string;
}

export interface TestConfig {
  api: ApiConfig;
  logging: {
    level: string;
    enableRequestLogging: boolean;
    enableResponseLogging: boolean;
  };
  reporting: {
    enableScreenshots: boolean;
    enableVideos: boolean;
    enableTracing: boolean;
  };
}

export class ConfigurationManager {
  private static instance: ConfigurationManager;
  private config: TestConfig;

  private constructor() {
    this.config = this.loadConfiguration();
  }

  public static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }
  private loadConfiguration(): TestConfig {
    // Validate required environment variables
    this.validateRequiredConfig();
    
    return {
      api: {
        baseUrl: this.getRequiredEnvVar('API_BASE_URL'),
        timeout: this.getNumberEnvVar('API_TIMEOUT'),
        retryAttempts: this.getNumberEnvVar('API_RETRY_ATTEMPTS'),
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'TestFusion-Enterprise/1.0.0',
          ...(process.env.API_KEY && { 'Authorization': `Bearer ${process.env.API_KEY}` }),
        },
        environment: this.getRequiredEnvVar('TEST_ENV'),
      },
      logging: {
        level: this.getRequiredEnvVar('LOG_LEVEL'),
        enableRequestLogging: this.getBooleanEnvVar('ENABLE_REQUEST_LOGGING'),
        enableResponseLogging: this.getBooleanEnvVar('ENABLE_RESPONSE_LOGGING'),
      },
      reporting: {
        enableScreenshots: this.getBooleanEnvVar('ENABLE_SCREENSHOTS'),
        enableVideos: this.getBooleanEnvVar('ENABLE_VIDEOS'),
        enableTracing: this.getBooleanEnvVar('ENABLE_TRACING'),
      },
    };
  }

  public getApiConfig(): ApiConfig {
    return this.config.api;
  }

  public getTestConfig(): TestConfig {
    return this.config;
  }

  public updateApiConfig(updates: Partial<ApiConfig>): void {
    this.config.api = { ...this.config.api, ...updates };
  }

  public getProperty(key: string, defaultValue?: any): any {
    const keys = key.split('.');
    let value: any = this.config;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    return value !== undefined ? value : defaultValue;
  }

  public setProperty(key: string, value: any): void {
    const keys = key.split('.');
    const lastKey = keys.pop()!;
    let target: any = this.config;
    
    for (const k of keys) {
      if (!(k in target)) target[k] = {};
      target = target[k];
    }
    
    target[lastKey] = value;
  }

  private validateRequiredConfig(): void {
    const requiredVars = [
      'API_BASE_URL',
      'API_TIMEOUT', 
      'API_RETRY_ATTEMPTS',
      'TEST_ENV',
      'LOG_LEVEL',
      'ENABLE_REQUEST_LOGGING',
      'ENABLE_RESPONSE_LOGGING',
      'ENABLE_SCREENSHOTS'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}. ` +
        'Please ensure all required variables are set in your .env file.'
      );
    }
  }

  private getRequiredEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
      throw new Error(`Required environment variable ${name} is not set`);
    }
    return value;
  }

  private getNumberEnvVar(name: string): number {
    const value = this.getRequiredEnvVar(name);
    const numValue = Number(value);
    if (isNaN(numValue)) {
      throw new Error(`Environment variable ${name} must be a valid number, got: ${value}`);
    }
    return numValue;
  }

  private getBooleanEnvVar(name: string): boolean {
    const value = this.getRequiredEnvVar(name);
    return value.toLowerCase() === 'true';
  }
}
