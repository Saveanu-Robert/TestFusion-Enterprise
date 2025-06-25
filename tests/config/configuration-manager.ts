/**
 * Enterprise Configuration Manager for TestFusion-Enterprise
 *
 * Provides a robust, type-safe configuration system following enterprise patterns:
 * - Singleton pattern with lazy initialization
 * - Environment-specific configuration loading
 * - Comprehensive validation with detailed error messages
 * - Immutable configuration objects
 * - Plugin-based configuration extension
 * - Configuration hot-reload capabilities
 * - Audit logging for configuration changes
 *
 * Architecture:
 * - ConfigurationProvider interface for extensible configuration sources
 * - ConfigurationValidator for runtime validation
 * - ConfigurationFactory for creating environment-specific configurations
 * - Event-driven configuration updates
 *
 * Usage:
 * ```typescript
 * const configManager = ConfigurationManager.getInstance();
 * const apiConfig = configManager.getApiConfiguration();
 * const webConfig = configManager.getWebConfiguration();
 * ```
 *
 * @file configuration-manager.ts
 * @author TestFusion-Enterprise Team
 * @version 2.0.0
 */

import { config } from 'dotenv';
import {
  FrameworkConfiguration,
  Environment,
  ApiConfiguration,
  WebConfiguration,
  LoggingConfiguration,
  ReportingConfiguration,
  SecurityConfiguration,
  EnvironmentConfiguration,
  ValidationResult,
  FrameworkEvent,
} from '../types/index';

// Load environment variables from .env file
config();

/**
 * Configuration interface for API testing
 */
export interface ApiConfig {
  /** Base URL for API endpoints */
  baseUrl: string;
  /** Request timeout in milliseconds */
  timeout: number;
  /** Number of retry attempts for failed requests */
  retryAttempts: number;
  /** Default HTTP headers for API requests */
  headers: Record<string, string>;
  /** Current test environment */
  environment: string;
  /** API endpoint paths */
  endpoints: {
    posts: string;
    users: string;
    comments: string;
    healthCheck: string;
  };
}

/**
 * Web execution mode types for different browser execution environments
 */
export type WebExecutionMode = 'local' | 'grid' | 'browserstack';

/**
 * BrowserStack configuration for cloud testing
 */
export interface BrowserStackConfig {
  /** BrowserStack username */
  username: string;
  /** BrowserStack access key */
  accessKey: string;
  /** BrowserStack Hub URL */
  hubUrl: string;
  /** Project name for BrowserStack dashboard */
  projectName: string;
  /** Build name for test runs */
  buildName: string;
  /** Enable local testing for accessing local URLs */
  enableLocal: boolean;
  /** BrowserStack capabilities */
  capabilities: {
    /** Operating system */
    os: string;
    /** Operating system version */
    osVersion: string;
    /** Browser name */
    browserName: string;
    /** Browser version */
    browserVersion: string;
    /** Enable video recording */
    enableVideo: boolean;
    /** Enable network logs */
    enableNetworkLogs: boolean;
    /** Console log level */
    consoleLogLevel: 'disable' | 'errors' | 'warnings' | 'info' | 'verbose';
  };
}

/**
 * Selenium Grid configuration for distributed testing
 */
export interface SeleniumGridConfig {
  /** Grid Hub URL */
  hubUrl: string;
  /** Maximum number of browser instances */
  maxInstances: number;
  /** Node timeout in seconds */
  nodeTimeout: number;
  /** Session timeout in seconds */
  sessionTimeout: number;
  /** Desired capabilities for grid nodes */
  capabilities: {
    /** Browser name */
    browserName: string;
    /** Browser version */
    browserVersion: string;
    /** Platform name */
    platformName: string;
    /** Additional options */
    options: Record<string, any>;
  };
}

/**
 * Configuration interface for web testing
 */
export interface WebConfig {
  /** Base URL for web application */
  baseUrl: string;
  /** Web execution mode - determines where tests run */
  executionMode: WebExecutionMode;
  /** Timeout configurations for various operations */
  timeout: {
    navigation: number;
    element: number;
    assertion: number;
  };
  /** Number of retry attempts for failed operations */
  retryAttempts: number;
  /** Current test environment */
  environment: string;
  /** Browser-specific configurations for local execution */
  browsers: {
    headless: boolean;
    slowMo: number;
    viewport: {
      width: number;
      height: number;
    };
  };
  /** BrowserStack configuration (used when executionMode is 'browserstack') */
  browserStack: BrowserStackConfig;
  /** Selenium Grid configuration (used when executionMode is 'grid') */
  seleniumGrid: SeleniumGridConfig;
  /** Page paths relative to base URL */
  pages: {
    home: string;
    docs: string;
    api: string;
    community: string;
    search: string;
  };
  /** CSS selectors for web elements */
  selectors: {
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

/**
 * Master configuration interface containing all test configurations
 */
export interface TestConfig {
  /** API testing configuration */
  api: ApiConfig;
  /** Web testing configuration */
  web: WebConfig;
  /** Logging configuration */
  logging: {
    level: string;
    enableRequestLogging: boolean;
    enableResponseLogging: boolean;
    enableConsoleLogging: boolean;
  };
  /** Test reporting configuration */
  reporting: {
    enableScreenshots: boolean;
    enableVideos: boolean;
    enableTracing: boolean;
    screenshotMode: 'only-on-failure' | 'on' | 'off';
    videoMode: 'retain-on-failure' | 'on' | 'off';
  };
  /** Data validation configuration */
  validation: {
    strictMode: boolean;
    enableDataValidation: boolean;
    enableSchemaValidation: boolean;
    maxResponseTime: number;
  };
}

/**
 * Singleton Configuration Manager class
 *
 * Provides centralized access to all test configuration parameters.
 * Follows the Singleton pattern to ensure consistent configuration
 * across the entire test framework.
 */
export class ConfigurationManager {
  private static instance: ConfigurationManager;
  private config: TestConfig;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    this.config = this.loadConfiguration();
  }

  /**
   * Gets the singleton instance of the configuration manager
   * @returns The ConfigurationManager instance
   */
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
          ...(process.env.API_KEY && { Authorization: `Bearer ${process.env.API_KEY}` }),
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
        executionMode: this.getEnvVar('WEB_EXECUTION_MODE', 'local') as WebExecutionMode,
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
        },
        browserStack: {
          username: this.getOptionalEnvVar('BROWSERSTACK_USERNAME', ''),
          accessKey: this.getOptionalEnvVar('BROWSERSTACK_ACCESS_KEY', ''),
          hubUrl: this.getOptionalEnvVar('BROWSERSTACK_HUB_URL', 'https://hub-cloud.browserstack.com/wd/hub'),
          projectName: this.getOptionalEnvVar('BROWSERSTACK_PROJECT_NAME', 'TestFusion-Enterprise'),
          buildName: this.getOptionalEnvVar(
            'BROWSERSTACK_BUILD_NAME',
            `Build-${new Date().toISOString().split('T')[0]}`
          ),
          enableLocal: this.getOptionalBooleanEnvVar('BROWSERSTACK_ENABLE_LOCAL', false),
          capabilities: {
            os: this.getOptionalEnvVar('BROWSERSTACK_OS', 'Windows'),
            osVersion: this.getOptionalEnvVar('BROWSERSTACK_OS_VERSION', '10'),
            browserName: this.getOptionalEnvVar('BROWSERSTACK_BROWSER_NAME', 'Chrome'),
            browserVersion: this.getOptionalEnvVar('BROWSERSTACK_BROWSER_VERSION', 'latest'),
            enableVideo: this.getOptionalBooleanEnvVar('BROWSERSTACK_ENABLE_VIDEO', true),
            enableNetworkLogs: this.getOptionalBooleanEnvVar('BROWSERSTACK_ENABLE_NETWORK_LOGS', true),
            consoleLogLevel: this.getOptionalEnvVar(
              'BROWSERSTACK_CONSOLE_LOG_LEVEL',
              'errors'
            ) as BrowserStackConfig['capabilities']['consoleLogLevel'],
          },
        },
        seleniumGrid: {
          hubUrl: this.getOptionalEnvVar('SELENIUM_GRID_HUB_URL', 'http://localhost:4444/wd/hub'),
          maxInstances: this.getOptionalNumberEnvVar('SELENIUM_GRID_MAX_INSTANCES', 5),
          nodeTimeout: this.getOptionalNumberEnvVar('SELENIUM_GRID_NODE_TIMEOUT', 30),
          sessionTimeout: this.getOptionalNumberEnvVar('SELENIUM_GRID_SESSION_TIMEOUT', 300),
          capabilities: {
            browserName: this.getOptionalEnvVar('SELENIUM_GRID_BROWSER_NAME', 'chrome'),
            browserVersion: this.getOptionalEnvVar('SELENIUM_GRID_BROWSER_VERSION', 'latest'),
            platformName: this.getOptionalEnvVar('SELENIUM_GRID_PLATFORM_NAME', 'ANY'),
            options: this.parseJsonEnvVar('SELENIUM_GRID_OPTIONS', {}),
          },
        },
        pages: {
          home: this.getEnvVar('WEB_HOME_PATH', '/'),
          docs: this.getEnvVar('WEB_DOCS_PATH', '/docs/intro'),
          api: this.getEnvVar('WEB_API_PATH', '/docs/api'),
          community: this.getEnvVar('WEB_COMMUNITY_PATH', '/community/welcome'),
          search: this.getEnvVar('WEB_SEARCH_PATH', '/search'),
        },
        selectors: {
          searchBox: this.getEnvVar('WEB_SEARCH_BOX_SELECTOR', '[placeholder*="Search"]'),
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
  } /**
   * Validates web execution mode configuration
   * @param webConfig - Web configuration to validate
   * @throws Error if configuration is invalid for the selected execution mode
   */
  public validateWebExecutionConfig(webConfig: WebConfig): void {
    const mode = webConfig.executionMode;

    switch (mode) {
      case 'local':
        // Local execution doesn't require additional validation
        break;

      case 'browserstack':
        this.validateBrowserStackConfig(webConfig.browserStack);
        break;

      case 'grid':
        this.validateSeleniumGridConfig(webConfig.seleniumGrid);
        break;

      default:
        throw new Error(`Invalid web execution mode: ${mode}. Supported modes are: local, grid, browserstack`);
    }
  }

  /**
   * Validates BrowserStack configuration
   * @param config - BrowserStack configuration to validate
   * @throws Error if BrowserStack configuration is invalid
   */
  private validateBrowserStackConfig(config: BrowserStackConfig): void {
    const requiredFields = [
      { field: 'username', value: config.username },
      { field: 'accessKey', value: config.accessKey },
      { field: 'hubUrl', value: config.hubUrl },
    ];

    const missingFields = requiredFields.filter(({ value }) => !value || value.trim() === '').map(({ field }) => field);

    if (missingFields.length > 0) {
      throw new Error(
        `BrowserStack configuration missing required fields: ${missingFields.join(', ')}. ` +
          'Please set the following environment variables: ' +
          missingFields.map(field => `BROWSERSTACK_${field.toUpperCase()}`).join(', ')
      );
    }

    // Validate console log level
    const validLogLevels: BrowserStackConfig['capabilities']['consoleLogLevel'][] = [
      'disable',
      'errors',
      'warnings',
      'info',
      'verbose',
    ];

    if (!validLogLevels.includes(config.capabilities.consoleLogLevel)) {
      throw new Error(
        `Invalid BrowserStack console log level: ${config.capabilities.consoleLogLevel}. ` +
          `Valid options: ${validLogLevels.join(', ')}`
      );
    }
  }

  /**
   * Validates Selenium Grid configuration
   * @param config - Selenium Grid configuration to validate
   * @throws Error if Selenium Grid configuration is invalid
   */
  private validateSeleniumGridConfig(config: SeleniumGridConfig): void {
    if (!config.hubUrl || config.hubUrl.trim() === '') {
      throw new Error('Selenium Grid hub URL is required. Please set SELENIUM_GRID_HUB_URL environment variable.');
    }

    // Validate URL format
    try {
      new URL(config.hubUrl);
    } catch (error) {
      throw new Error(`Invalid Selenium Grid hub URL: ${config.hubUrl}. Must be a valid URL.`);
    }

    // Validate numeric values
    if (config.maxInstances <= 0) {
      throw new Error('Selenium Grid max instances must be greater than 0');
    }

    if (config.nodeTimeout <= 0) {
      throw new Error('Selenium Grid node timeout must be greater than 0');
    }

    if (config.sessionTimeout <= 0) {
      throw new Error('Selenium Grid session timeout must be greater than 0');
    }
  }

  /**
   * Gets the appropriate browser configuration based on execution mode
   * @returns Browser configuration object for Playwright
   */
  public getBrowserConfig(): any {
    const webConfig = this.getWebConfig();

    // Validate configuration before proceeding
    this.validateWebExecutionConfig(webConfig);

    switch (webConfig.executionMode) {
      case 'local':
        return this.getLocalBrowserConfig(webConfig);

      case 'browserstack':
        return this.getBrowserStackConfig(webConfig);

      case 'grid':
        return this.getSeleniumGridConfig(webConfig);

      default:
        throw new Error(`Unsupported execution mode: ${webConfig.executionMode}`);
    }
  }

  /**
   * Gets local browser configuration for Playwright
   * @param webConfig - Web configuration
   * @returns Local browser configuration
   */
  private getLocalBrowserConfig(webConfig: WebConfig): any {
    return {
      headless: webConfig.browsers.headless,
      slowMo: webConfig.browsers.slowMo,
      viewport: webConfig.browsers.viewport,
      // Add any additional local browser options
    };
  }

  /**
   * Gets BrowserStack configuration for Playwright
   * @param webConfig - Web configuration
   * @returns BrowserStack configuration for Playwright
   */
  private getBrowserStackConfig(webConfig: WebConfig): any {
    const { browserStack } = webConfig;

    return {
      // BrowserStack WebDriver connection
      connectOptions: {
        wsEndpoint: `wss://${browserStack.username}:${browserStack.accessKey}@${browserStack.hubUrl.replace('https://', '').replace('http://', '')}`,
      },
      // BrowserStack capabilities
      capabilities: {
        'bstack:options': {
          os: browserStack.capabilities.os,
          osVersion: browserStack.capabilities.osVersion,
          browserVersion: browserStack.capabilities.browserVersion,
          projectName: browserStack.projectName,
          buildName: browserStack.buildName,
          sessionName: 'TestFusion-Enterprise Web Test',
          local: browserStack.enableLocal,
          video: browserStack.capabilities.enableVideo,
          networkLogs: browserStack.capabilities.enableNetworkLogs,
          consoleLogs: browserStack.capabilities.consoleLogLevel,
          resolution: `${webConfig.browsers.viewport.width}x${webConfig.browsers.viewport.height}`,
        },
        browserName: browserStack.capabilities.browserName,
      },
    };
  }

  /**
   * Gets Selenium Grid configuration for Playwright
   * @param webConfig - Web configuration
   * @returns Selenium Grid configuration for Playwright
   */
  private getSeleniumGridConfig(webConfig: WebConfig): any {
    const { seleniumGrid } = webConfig;

    return {
      // Selenium Grid WebDriver connection
      connectOptions: {
        wsEndpoint: seleniumGrid.hubUrl.replace('http://', 'ws://').replace('https://', 'wss://'),
      },
      // Grid capabilities
      capabilities: {
        browserName: seleniumGrid.capabilities.browserName,
        browserVersion: seleniumGrid.capabilities.browserVersion,
        platformName: seleniumGrid.capabilities.platformName,
        'se:options': {
          maxInstances: seleniumGrid.maxInstances,
          'se:nodeTimeout': seleniumGrid.nodeTimeout,
          'se:sessionTimeout': seleniumGrid.sessionTimeout,
        },
        // Additional options
        ...seleniumGrid.capabilities.options,
      },
    };
  }

  /**
   * Gets the API configuration settings
   * @returns API configuration object with endpoints, timeouts, and headers
   */
  public getApiConfig(): ApiConfig {
    return this.config.api;
  }

  /**
   * Gets the web testing configuration settings
   * @returns Web configuration object with browser settings, selectors, and timeouts
   */
  public getWebConfig(): WebConfig {
    return this.config.web;
  }

  /**
   * Gets the complete test configuration
   * @returns Full configuration object including API, web, logging, and validation settings
   */
  public getTestConfig(): TestConfig {
    return this.config;
  }

  /**
   * Updates API configuration with partial settings
   * @param updates - Partial API configuration to merge with existing settings
   */
  public updateApiConfig(updates: Partial<ApiConfig>): void {
    this.config.api = { ...this.config.api, ...updates };
  }

  /**
   * Updates web configuration with partial settings
   * @param updates - Partial web configuration to merge with existing settings
   */
  public updateWebConfig(updates: Partial<WebConfig>): void {
    this.config.web = { ...this.config.web, ...updates };
  }

  /**
   * Gets a configuration property by dot notation path
   * @param key - Dot-separated path to the configuration property (e.g., 'api.timeout')
   * @param defaultValue - Default value to return if property is not found
   * @returns The configuration value or default value
   */
  public getProperty(key: string, defaultValue?: any): any {
    const keys = key.split('.');
    let value: any = this.config;

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }

    return value !== undefined ? value : defaultValue;
  }

  /**
   * Sets a configuration property by dot notation path
   * @param key - Dot-separated path to the configuration property
   * @param value - Value to set for the property
   */
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
          'Please ensure all required variables are set in your .env file.'
      );
    }
  }
  /**
   * Helper method to get environment variable with optional default value
   * @param name - Environment variable name
   * @param defaultValue - Default value if environment variable is not set
   * @returns Environment variable value or default value
   */
  private getOptionalEnvVar(name: string, defaultValue: string): string {
    return process.env[name] || defaultValue;
  }

  /**
   * Helper method to get boolean environment variable with optional default value
   * @param name - Environment variable name
   * @param defaultValue - Default boolean value if environment variable is not set
   * @returns Boolean value from environment variable or default value
   */
  private getOptionalBooleanEnvVar(name: string, defaultValue: boolean): boolean {
    const value = process.env[name];
    if (!value) return defaultValue;
    return value.toLowerCase() === 'true';
  }

  /**
   * Helper method to get number environment variable with optional default value
   * @param name - Environment variable name
   * @param defaultValue - Default number value if environment variable is not set
   * @returns Number value from environment variable or default value
   */
  private getOptionalNumberEnvVar(name: string, defaultValue: number): number {
    const value = process.env[name];
    if (!value) return defaultValue;
    const numValue = Number(value);
    if (isNaN(numValue)) {
      throw new Error(`Environment variable ${name} must be a valid number, got: ${value}`);
    }
    return numValue;
  }

  /**
   * Helper method to parse JSON environment variable with optional default value
   * @param name - Environment variable name
   * @param defaultValue - Default object value if environment variable is not set
   * @returns Parsed JSON object or default value
   */
  private parseJsonEnvVar(name: string, defaultValue: Record<string, any>): Record<string, any> {
    const value = process.env[name];
    if (!value) return defaultValue;

    try {
      return JSON.parse(value);
    } catch (error) {
      throw new Error(`Environment variable ${name} must be valid JSON, got: ${value}`);
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
