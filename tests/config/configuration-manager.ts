/**
 * Centralized Configuration Manager for TestFusion-Enterprise
 * Provides unified configuration for API and Web testing
 * Users can easily customize all testing parameters from this single source
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
  endpoints: {
    posts: string;
    users: string;
    comments: string;
    healthCheck: string;
  };
}

export interface WebConfig {
  baseUrl: string;
  timeout: {
    navigation: number;
    element: number;
    assertion: number;
  };
  retryAttempts: number;
  environment: string;
  browsers: {
    headless: boolean;
    slowMo: number;
    viewport: {
      width: number;
      height: number;
    };
  };  pages: {
    home: string;
    docs: string;
    api: string;
    community: string;
    search: string;
  };  selectors: {
    searchBox: string;
    searchButton: string;
    docsLink: string;
    apiLink: string;
    communityLink: string;
    getStartedButton: string;
    mainNavigation: string;
    heroContainer: string;
    mainContainer: string;
  };
}

export interface TestConfig {
  api: ApiConfig;
  web: WebConfig;
  logging: {
    level: string;
    enableRequestLogging: boolean;
    enableResponseLogging: boolean;
    enableConsoleLogging: boolean;
  };
  reporting: {
    enableScreenshots: boolean;
    enableVideos: boolean;
    enableTracing: boolean;
    screenshotMode: 'only-on-failure' | 'on' | 'off';
    videoMode: 'retain-on-failure' | 'on' | 'off';
  };
  validation: {
    strictMode: boolean;
    enableDataValidation: boolean;
    enableSchemaValidation: boolean;
    maxResponseTime: number;
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
  }  private loadConfiguration(): TestConfig {
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
        endpoints: {
          posts: this.getEnvVar('API_POSTS_ENDPOINT', '/posts'),
          users: this.getEnvVar('API_USERS_ENDPOINT', '/users'),
          comments: this.getEnvVar('API_COMMENTS_ENDPOINT', '/comments'),
          healthCheck: this.getEnvVar('API_HEALTH_ENDPOINT', '/health'),
        },
      },
      web: {
        baseUrl: this.getRequiredEnvVar('WEB_BASE_URL'),
        timeout: {
          navigation: this.getNumberEnvVar('WEB_NAVIGATION_TIMEOUT'),
          element: this.getNumberEnvVar('WEB_ELEMENT_TIMEOUT'),
          assertion: this.getNumberEnvVar('WEB_ASSERTION_TIMEOUT'),
        },
        retryAttempts: this.getNumberEnvVar('WEB_RETRY_ATTEMPTS'),
        environment: this.getRequiredEnvVar('TEST_ENV'),
        browsers: {
          headless: this.getBooleanEnvVar('WEB_HEADLESS'),
          slowMo: this.getNumberEnvVar('WEB_SLOW_MO'),
          viewport: {
            width: this.getNumberEnvVar('WEB_VIEWPORT_WIDTH'),
            height: this.getNumberEnvVar('WEB_VIEWPORT_HEIGHT'),
          },
        },        pages: {
          home: this.getEnvVar('WEB_HOME_PATH', '/'),
          docs: this.getEnvVar('WEB_DOCS_PATH', '/docs/intro'),
          api: this.getEnvVar('WEB_API_PATH', '/docs/api'),
          community: this.getEnvVar('WEB_COMMUNITY_PATH', '/community/welcome'),
          search: this.getEnvVar('WEB_SEARCH_PATH', '/search'),
        },        selectors: {
          searchBox: this.getEnvVar('WEB_SEARCH_BOX_SELECTOR', '[placeholder="Search docs"]'),
          searchButton: this.getEnvVar('WEB_SEARCH_BUTTON_SELECTOR', 'button[type="submit"]'),
          docsLink: this.getEnvVar('WEB_DOCS_LINK_SELECTOR', 'a[href="/docs/intro"]'),
          apiLink: this.getEnvVar('WEB_API_LINK_SELECTOR', 'a[href="/docs/api"]'),
          communityLink: this.getEnvVar('WEB_COMMUNITY_LINK_SELECTOR', 'a[href="/community/welcome"]'),
          getStartedButton: this.getEnvVar('WEB_GET_STARTED_BUTTON_SELECTOR', '.hero__subtitle a[href="/docs/intro"]'),
          mainNavigation: this.getEnvVar('WEB_MAIN_NAVIGATION_SELECTOR', '.navbar'),
          heroContainer: this.getEnvVar('WEB_HERO_CONTAINER_SELECTOR', 'h1'),
          mainContainer: this.getEnvVar('WEB_MAIN_CONTAINER_SELECTOR', 'main'),
        },
      },
      logging: {
        level: this.getRequiredEnvVar('LOG_LEVEL'),
        enableRequestLogging: this.getBooleanEnvVar('ENABLE_REQUEST_LOGGING'),
        enableResponseLogging: this.getBooleanEnvVar('ENABLE_RESPONSE_LOGGING'),
        enableConsoleLogging: this.getBooleanEnvVar('ENABLE_CONSOLE_LOGGING'),
      },
      reporting: {
        enableScreenshots: this.getBooleanEnvVar('ENABLE_SCREENSHOTS'),
        enableVideos: this.getBooleanEnvVar('ENABLE_VIDEOS'),
        enableTracing: this.getBooleanEnvVar('ENABLE_TRACING'),
        screenshotMode: this.getEnvVar('SCREENSHOT_MODE', 'only-on-failure') as 'only-on-failure' | 'on' | 'off',
        videoMode: this.getEnvVar('VIDEO_MODE', 'retain-on-failure') as 'retain-on-failure' | 'on' | 'off',
      },
      validation: {
        strictMode: this.getBooleanEnvVar('VALIDATION_STRICT_MODE'),
        enableDataValidation: this.getBooleanEnvVar('ENABLE_DATA_VALIDATION'),
        enableSchemaValidation: this.getBooleanEnvVar('ENABLE_SCHEMA_VALIDATION'),
        maxResponseTime: this.getNumberEnvVar('MAX_RESPONSE_TIME'),
      },
    };
  }
  public getApiConfig(): ApiConfig {
    return this.config.api;
  }

  public getWebConfig(): WebConfig {
    return this.config.web;
  }

  public getTestConfig(): TestConfig {
    return this.config;
  }

  public updateApiConfig(updates: Partial<ApiConfig>): void {
    this.config.api = { ...this.config.api, ...updates };
  }

  public updateWebConfig(updates: Partial<WebConfig>): void {
    this.config.web = { ...this.config.web, ...updates };
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
      // API Configuration
      'API_BASE_URL',
      'API_TIMEOUT', 
      'API_RETRY_ATTEMPTS',
      'TEST_ENV',
      // Web Configuration
      'WEB_BASE_URL',
      'WEB_NAVIGATION_TIMEOUT',
      'WEB_ELEMENT_TIMEOUT',
      'WEB_ASSERTION_TIMEOUT',
      'WEB_RETRY_ATTEMPTS',
      'WEB_HEADLESS',
      'WEB_SLOW_MO',
      'WEB_VIEWPORT_WIDTH',
      'WEB_VIEWPORT_HEIGHT',
      // Logging Configuration
      'LOG_LEVEL',
      'ENABLE_REQUEST_LOGGING',
      'ENABLE_RESPONSE_LOGGING',
      'ENABLE_CONSOLE_LOGGING',
      // Reporting Configuration
      'ENABLE_SCREENSHOTS',
      'ENABLE_VIDEOS',
      'ENABLE_TRACING',
      // Validation Configuration
      'VALIDATION_STRICT_MODE',
      'ENABLE_DATA_VALIDATION',
      'ENABLE_SCHEMA_VALIDATION',
      'MAX_RESPONSE_TIME',
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}. ` +
        'Please ensure all required variables are set in your .env file.',
      );
    }
  }

  private getEnvVar(name: string, defaultValue: string): string {
    return process.env[name] || defaultValue;
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
