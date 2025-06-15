/**
 * Browser Provider Factory for TestFusion-Enterprise
 * 
 * This module implements the Factory pattern and Strategy pattern to provide
 * different browser execution strategies for web testing. It supports:
 * - Local browser execution
 * - Remote Selenium Grid execution
 * - BrowserStack cloud execution
 * 
 * The factory follows SOLID principles:
 * - Single Responsibility: Each provider handles one execution strategy
 * - Open/Closed: Easy to extend with new providers without modifying existing code
 * - Liskov Substitution: All providers implement the same interface
 * - Interface Segregation: Providers only implement methods they need
 * - Dependency Inversion: Depends on abstractions, not concrete implementations
 * 
 * @file browser-provider-factory.ts
 * @author TestFusion-Enterprise Team
 * @version 1.0.0
 */

import { Browser, BrowserContext, LaunchOptions, Page } from '@playwright/test';
import { ConfigurationManager, WebConfig, WebExecutionMode } from '../config/configuration-manager';
import { Logger } from '../utils/logger';

/**
 * Interface for browser providers following Strategy pattern
 */
export interface IBrowserProvider {
  /**
   * Initializes the browser provider with configuration
   * @param config - Web configuration for the provider
   */
  initialize(config: WebConfig): Promise<void>;

  /**
   * Creates a new browser instance
   * @returns Promise resolving to Browser instance
   */
  createBrowser(): Promise<Browser>;

  /**
   * Creates a new browser context with configuration
   * @param browser - Browser instance to create context from
   * @returns Promise resolving to BrowserContext instance
   */
  createContext(browser: Browser): Promise<BrowserContext>;

  /**
   * Creates a new page from context
   * @param context - BrowserContext to create page from
   * @returns Promise resolving to Page instance
   */
  createPage(context: BrowserContext): Promise<Page>;

  /**
   * Cleans up resources used by the provider
   */
  cleanup(): Promise<void>;

  /**
   * Gets the provider name for logging and identification
   * @returns Provider name string
   */
  getProviderName(): string;
}

/**
 * Local browser provider for running tests on local machine
 */
export class LocalBrowserProvider implements IBrowserProvider {
  private logger: Logger;
  private config: WebConfig | null = null;

  constructor() {
    this.logger = Logger.getInstance();
  }

  async initialize(config: WebConfig): Promise<void> {
    this.config = config;
    this.logger.info(`🖥️ Initializing ${this.getProviderName()} browser provider`, {
      headless: config.browsers.headless,
      viewport: config.browsers.viewport,
      slowMo: config.browsers.slowMo,
    });
  }

  async createBrowser(): Promise<Browser> {
    if (!this.config) {
      throw new Error('LocalBrowserProvider not initialized. Call initialize() first.');
    }

    const { chromium } = await import('@playwright/test');
    
    const launchOptions: LaunchOptions = {
      headless: this.config.browsers.headless,
      slowMo: this.config.browsers.slowMo,
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--allow-running-insecure-content',
      ],
    };

    this.logger.debug('🚀 Launching local browser', { options: launchOptions });
    const browser = await chromium.launch(launchOptions);
    
    this.logger.info('✅ Local browser launched successfully');
    return browser;
  }

  async createContext(browser: Browser): Promise<BrowserContext> {
    if (!this.config) {
      throw new Error('LocalBrowserProvider not initialized. Call initialize() first.');
    }

    const contextOptions = {
      viewport: this.config.browsers.viewport,
      ignoreHTTPSErrors: true,
      acceptDownloads: true,
      recordVideo: this.shouldRecordVideo() ? {
        dir: './test-results/videos/',
        size: this.config.browsers.viewport,
      } : undefined,
    };

    this.logger.debug('🎭 Creating browser context', { options: contextOptions });
    const context = await browser.newContext(contextOptions);
    
    this.logger.info('✅ Browser context created successfully');
    return context;
  }

  async createPage(context: BrowserContext): Promise<Page> {
    const page = await context.newPage();
    
    if (this.config) {
      // Set timeouts from configuration
      page.setDefaultTimeout(this.config.timeout.element);
      page.setDefaultNavigationTimeout(this.config.timeout.navigation);
    }

    this.logger.info('📄 New page created successfully');
    return page;
  }

  async cleanup(): Promise<void> {
    this.logger.info('🧹 Cleaning up LocalBrowserProvider resources');
    // Local provider doesn't need special cleanup
  }

  getProviderName(): string {
    return 'Local';
  }

  /**
   * Determines if video recording should be enabled based on configuration
   * @returns True if video should be recorded
   */
  private shouldRecordVideo(): boolean {
    const configManager = ConfigurationManager.getInstance();
    const reportingConfig = configManager.getTestConfig().reporting;
    return reportingConfig.enableVideos && reportingConfig.videoMode !== 'off';
  }
}

/**
 * BrowserStack cloud browser provider for remote testing
 */
export class BrowserStackProvider implements IBrowserProvider {
  private logger: Logger;
  private config: WebConfig | null = null;

  constructor() {
    this.logger = Logger.getInstance();
  }

  async initialize(config: WebConfig): Promise<void> {
    this.config = config;
    
    // Validate BrowserStack configuration
    const configManager = ConfigurationManager.getInstance();
    configManager.validateWebExecutionConfig(config);
    
    this.logger.info(`☁️ Initializing ${this.getProviderName()} browser provider`, {
      project: config.browserStack.projectName,
      build: config.browserStack.buildName,
      browser: config.browserStack.capabilities.browserName,
      os: `${config.browserStack.capabilities.os} ${config.browserStack.capabilities.osVersion}`,
    });
  }

  async createBrowser(): Promise<Browser> {
    if (!this.config) {
      throw new Error('BrowserStackProvider not initialized. Call initialize() first.');
    }

    const { chromium } = await import('@playwright/test');    const { browserStack } = this.config;    // BrowserStack WebDriver endpoint
    const caps = this.encodeBrowserStackCapabilities();
    const baseUrl = `wss://${browserStack.username}:${browserStack.accessKey}@cdp.browserstack.com/playwright`;
    const endpoint = `${baseUrl}?caps=${caps}`;
    const connectOptions = {
      wsEndpoint: endpoint,
    };

    this.logger.debug('🌐 Connecting to BrowserStack', { 
      project: browserStack.projectName,
      build: browserStack.buildName,
    });

    const browser = await chromium.connect(connectOptions.wsEndpoint);
    
    this.logger.info('✅ Connected to BrowserStack successfully', {
      browserName: browserStack.capabilities.browserName,
      browserVersion: browserStack.capabilities.browserVersion,
    });
    
    return browser;
  }

  async createContext(browser: Browser): Promise<BrowserContext> {
    if (!this.config) {
      throw new Error('BrowserStackProvider not initialized. Call initialize() first.');
    }

    // For BrowserStack, we typically use the default context
    // or create a new one with minimal options since capabilities
    // are set at the browser level
    const context = await browser.newContext({
      viewport: this.config.browsers.viewport,
      ignoreHTTPSErrors: true,
    });

    this.logger.info('✅ BrowserStack context created successfully');
    return context;
  }

  async createPage(context: BrowserContext): Promise<Page> {
    const page = await context.newPage();
    
    if (this.config) {
      // Set timeouts from configuration
      page.setDefaultTimeout(this.config.timeout.element);
      page.setDefaultNavigationTimeout(this.config.timeout.navigation);
    }

    this.logger.info('📄 BrowserStack page created successfully');
    return page;
  }

  async cleanup(): Promise<void> {
    this.logger.info('🧹 Cleaning up BrowserStackProvider resources');
    // BrowserStack handles cleanup automatically
  }

  getProviderName(): string {
    return 'BrowserStack';
  }

  /**
   * Encodes BrowserStack capabilities for the WebDriver endpoint
   * @returns Base64 encoded capabilities string
   */
  private encodeBrowserStackCapabilities(): string {
    if (!this.config) {
      throw new Error('BrowserStackProvider not initialized');
    }

    const { browserStack } = this.config;
    const capabilities = {
      'bstack:options': {
        os: browserStack.capabilities.os,
        osVersion: browserStack.capabilities.osVersion,
        browserVersion: browserStack.capabilities.browserVersion,
        projectName: browserStack.projectName,
        buildName: browserStack.buildName,
        sessionName: `TestFusion-Enterprise-${new Date().toISOString()}`,
        local: browserStack.enableLocal,
        video: browserStack.capabilities.enableVideo,
        networkLogs: browserStack.capabilities.enableNetworkLogs,
        consoleLogs: browserStack.capabilities.consoleLogLevel,
        resolution: `${this.config.browsers.viewport.width}x${this.config.browsers.viewport.height}`,
      },
      browserName: browserStack.capabilities.browserName,
    };

    return Buffer.from(JSON.stringify(capabilities)).toString('base64');
  }
}

/**
 * Selenium Grid browser provider for distributed testing
 */
export class SeleniumGridProvider implements IBrowserProvider {
  private logger: Logger;
  private config: WebConfig | null = null;

  constructor() {
    this.logger = Logger.getInstance();
  }

  async initialize(config: WebConfig): Promise<void> {
    this.config = config;
    
    // Validate Selenium Grid configuration
    const configManager = ConfigurationManager.getInstance();
    configManager.validateWebExecutionConfig(config);
    
    this.logger.info(`🔗 Initializing ${this.getProviderName()} browser provider`, {
      hubUrl: config.seleniumGrid.hubUrl,
      browserName: config.seleniumGrid.capabilities.browserName,
      platformName: config.seleniumGrid.capabilities.platformName,
      maxInstances: config.seleniumGrid.maxInstances,
    });
  }

  async createBrowser(): Promise<Browser> {
    if (!this.config) {
      throw new Error('SeleniumGridProvider not initialized. Call initialize() first.');
    }

    const { chromium } = await import('@playwright/test');
    const { seleniumGrid } = this.config;
    
    // Convert HTTP URL to WebSocket URL for Playwright
    const wsEndpoint = this.buildWebSocketEndpoint(seleniumGrid.hubUrl);
    
    this.logger.debug('🌐 Connecting to Selenium Grid', { 
      hubUrl: seleniumGrid.hubUrl,
      wsEndpoint: wsEndpoint,
    });

    const browser = await chromium.connect(wsEndpoint);
    
    this.logger.info('✅ Connected to Selenium Grid successfully', {
      browserName: seleniumGrid.capabilities.browserName,
      platformName: seleniumGrid.capabilities.platformName,
    });
    
    return browser;
  }

  async createContext(browser: Browser): Promise<BrowserContext> {
    if (!this.config) {
      throw new Error('SeleniumGridProvider not initialized. Call initialize() first.');
    }

    const context = await browser.newContext({
      viewport: this.config.browsers.viewport,
      ignoreHTTPSErrors: true,
      acceptDownloads: true,
    });

    this.logger.info('✅ Selenium Grid context created successfully');
    return context;
  }

  async createPage(context: BrowserContext): Promise<Page> {
    const page = await context.newPage();
    
    if (this.config) {
      // Set timeouts from configuration
      page.setDefaultTimeout(this.config.timeout.element);
      page.setDefaultNavigationTimeout(this.config.timeout.navigation);
    }

    this.logger.info('📄 Selenium Grid page created successfully');
    return page;
  }

  async cleanup(): Promise<void> {
    this.logger.info('🧹 Cleaning up SeleniumGridProvider resources');
    // Grid handles cleanup automatically
  }

  getProviderName(): string {
    return 'Selenium Grid';
  }

  /**
   * Builds WebSocket endpoint from HTTP URL for Playwright connection
   * @param httpUrl - HTTP URL of the Selenium Grid hub
   * @returns WebSocket endpoint URL
   */
  private buildWebSocketEndpoint(httpUrl: string): string {
    try {
      const url = new URL(httpUrl);
      const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${url.host}/ws`;
    } catch (error) {
      throw new Error(`Invalid Selenium Grid hub URL: ${httpUrl}`);
    }
  }
}

/**
 * Factory class for creating browser providers based on execution mode
 * Implements Factory pattern for provider creation
 */
export class BrowserProviderFactory {
  private static instance: BrowserProviderFactory;
  private logger: Logger;

  private constructor() {
    this.logger = Logger.getInstance();
  }

  /**
   * Gets the singleton instance of the factory
   * @returns BrowserProviderFactory instance
   */
  public static getInstance(): BrowserProviderFactory {
    if (!BrowserProviderFactory.instance) {
      BrowserProviderFactory.instance = new BrowserProviderFactory();
    }
    return BrowserProviderFactory.instance;
  }

  /**
   * Creates a browser provider based on execution mode
   * @param executionMode - The execution mode for browser testing
   * @returns Browser provider instance
   * @throws Error if execution mode is not supported
   */
  public createProvider(executionMode: WebExecutionMode): IBrowserProvider {
    this.logger.info(`🏭 Creating browser provider for execution mode: ${executionMode}`);

    switch (executionMode) {
    case 'local':
      return new LocalBrowserProvider();
        
    case 'browserstack':
      return new BrowserStackProvider();
        
    case 'grid':
      return new SeleniumGridProvider();
        
    default:
      throw new Error(
        `Unsupported execution mode: ${executionMode}. ` +
          'Supported modes: local, browserstack, grid',
      );
    }
  }

  /**
   * Gets all available provider types
   * @returns Array of supported execution modes
   */
  public getAvailableProviders(): WebExecutionMode[] {
    return ['local', 'browserstack', 'grid'];
  }

  /**
   * Validates if an execution mode is supported
   * @param mode - Execution mode to validate
   * @returns True if mode is supported
   */
  public isSupportedMode(mode: string): mode is WebExecutionMode {
    return this.getAvailableProviders().includes(mode as WebExecutionMode);
  }
}
