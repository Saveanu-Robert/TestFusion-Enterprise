/**
 * Configuration Manager for API Testing
 * Handles environment-specific configurations and properties
 */

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
    const environment = process.env.TEST_ENV || 'development';
    
    return {
      api: {
        baseUrl: process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com',
        timeout: parseInt(process.env.API_TIMEOUT || '30000'),
        retryAttempts: parseInt(process.env.API_RETRY_ATTEMPTS || '3'),
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'TestFusion-Enterprise/1.0.0',
          ...(process.env.API_KEY && { 'Authorization': `Bearer ${process.env.API_KEY}` }),
        },
        environment,
      },
      logging: {
        level: process.env.LOG_LEVEL || 'INFO',
        enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING !== 'false',
        enableResponseLogging: process.env.ENABLE_RESPONSE_LOGGING !== 'false',
      },
      reporting: {
        enableScreenshots: process.env.ENABLE_SCREENSHOTS !== 'false',
        enableVideos: process.env.ENABLE_VIDEOS !== 'false',
        enableTracing: process.env.ENABLE_TRACING !== 'false',
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
}
