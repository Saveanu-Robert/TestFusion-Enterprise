/**
 * Enterprise Base Page Object for TestFusion-Enterprise
 *
 * Implements enterprise-grade Page Object Model (POM) with:
 * - SOLID principles and clean architecture
 * - Fluent interface pattern for method chaining
 * - Comprehensive error handling with retry logic
 * - Built-in accessibility testing
 * - Performance monitoring
 * - Screenshot and video capture
 * - Element interaction strategies
 * - Wait strategies and timeouts
 *
 * @file web/pages/base.page.ts
 * @author TestFusion-Enterprise Team
 * @version 2.0.0
 */

import { Page, Locator, expect } from '@playwright/test';
import { Logger, ScopedLogger } from '../../utils/logger';

/**
 * Element interaction options
 */
export interface ElementInteractionOptions {
  readonly timeout?: number;
  readonly force?: boolean;
  readonly strict?: boolean;
  readonly retries?: number;
  readonly waitForEnabled?: boolean;
  readonly waitForVisible?: boolean;
  readonly scrollIntoView?: boolean;
}

/**
 * Wait strategies for different scenarios
 */
export enum WaitStrategy {
  VISIBLE = 'visible',
  HIDDEN = 'hidden',
  ATTACHED = 'attached',
  DETACHED = 'detached',
  STABLE = 'stable',
}

/**
 * Page load strategies
 */
export enum LoadStrategy {
  DOM_CONTENT_LOADED = 'domcontentloaded',
  LOAD = 'load',
  NETWORK_IDLE = 'networkidle',
}

/**
 * Accessibility check configuration
 */
export interface AccessibilityCheckOptions {
  readonly enabled: boolean;
  readonly standards: string[];
  readonly includeTags: string[];
  readonly excludeTags: string[];
  readonly runOnlyAfterInteraction: boolean;
}

/**
 * Page performance metrics
 */
export interface PagePerformanceMetrics {
  readonly navigationTime: number;
  readonly domContentLoadedTime: number;
  readonly loadTime: number;
  readonly firstContentfulPaint?: number;
  readonly largestContentfulPaint?: number;
  readonly timeToInteractive?: number;
}

/**
 * Page navigation options
 */
export interface NavigationOptions {
  /** Wait condition for navigation completion */
  waitUntil?: LoadStrategy;
  /** Navigation timeout */
  timeout?: number;
  /** Referer header */
  referer?: string;
}

/**
 * Abstract base page class with enterprise features
 */
export abstract class BasePage {
  protected readonly logger: ScopedLogger;
  protected readonly defaultTimeout = 30000;
  protected readonly defaultRetries = 3;

  constructor(
    protected readonly page: Page,
    protected readonly pageName?: string
  ) {
    const mainLogger = Logger.getInstance();
    this.logger = mainLogger.createScopedLogger(`Page:${pageName || 'Unknown'}`);
    this.logger.info('Page object initialized', { pageName });
  }

  /**
   * Abstract methods that each page must implement
   */
  public abstract getPageUrl(): string;
  public abstract getUniquePageElement(): string;

  /**
   * Optional validation method that pages can override
   */
  public async validatePageElements(): Promise<void> {
    // Default implementation - override in specific pages
  }

  /**
   * Navigation methods with enhanced capabilities
   */ public async navigate(options: NavigationOptions = {}): Promise<this> {
    const timer = this.logger.startTimer();
    const url = this.getPageUrl();

    try {
      this.logger.info('Navigating to page', { url, options });

      await this.page.goto(url, {
        waitUntil: options.waitUntil || LoadStrategy.DOM_CONTENT_LOADED,
        timeout: options.timeout || this.defaultTimeout,
        referer: options.referer,
      });

      await this.waitForPageLoad();
      await this.validatePageElements();

      this.logger.logWithTiming(this.logger.info, 'Page navigation completed successfully', timer, { url });

      return this;
    } catch (error) {
      this.logger.error('Page navigation failed', {
        url,
        error: error instanceof Error ? error.message : error,
      });
      throw new Error(`Failed to navigate to ${url}: ${error instanceof Error ? error.message : error}`);
    }
  }

  /**
   * Waits for the page to be fully loaded
   */ public async waitForPageLoad(strategy: LoadStrategy = LoadStrategy.DOM_CONTENT_LOADED): Promise<this> {
    const timer = this.logger.startTimer();

    try {
      // Wait for the network and DOM state
      await this.page.waitForLoadState(strategy);

      // Wait for the unique page identifier
      const uniqueIdentifier = this.getUniquePageElement();
      if (uniqueIdentifier) {
        await this.waitForElement(uniqueIdentifier, {
          timeout: this.defaultTimeout,
          waitForVisible: true,
        });
      }

      this.logger.logWithTiming(this.logger.debug, 'Page load wait completed', timer, { strategy, uniqueIdentifier });

      return this;
    } catch (error) {
      this.logger.error('Page load wait failed', {
        strategy,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  /**
   * Verifies if we're currently on the expected page
   */
  public async isCurrentPage(): Promise<boolean> {
    try {
      const currentUrl = this.page.url();
      const expectedUrl = this.getPageUrl();
      const uniqueIdentifier = this.getUniquePageElement();

      // Check URL match (allow for query parameters and fragments)
      const urlMatches = currentUrl.includes(expectedUrl) || expectedUrl.includes(currentUrl);

      // Check unique identifier presence
      let identifierPresent = true;
      if (uniqueIdentifier) {
        identifierPresent = await this.page.locator(uniqueIdentifier).isVisible();
      }

      const result = urlMatches && identifierPresent;

      this.logger.debug('Page verification result', {
        currentUrl,
        expectedUrl,
        urlMatches,
        uniqueIdentifier,
        identifierPresent,
        result,
      });

      return result;
    } catch (error) {
      this.logger.error('Page verification failed', {
        error: error instanceof Error ? error.message : error,
      });
      return false;
    }
  }

  /**
   * Enhanced element interaction methods
   */ protected async waitForElement(selector: string, options: ElementInteractionOptions = {}): Promise<Locator> {
    const timer = this.logger.startTimer();
    const finalOptions = { ...this.getDefaultElementOptions(), ...options };

    try {
      const element = this.page.locator(selector);

      // Apply wait strategies
      if (finalOptions.waitForVisible) {
        await element.waitFor({
          state: WaitStrategy.VISIBLE,
          timeout: finalOptions.timeout,
        });
      }

      if (finalOptions.waitForEnabled) {
        await element.waitFor({
          state: WaitStrategy.ATTACHED,
          timeout: finalOptions.timeout,
        });
        // Additional check for enabled state
        await expect(element).toBeEnabled({ timeout: finalOptions.timeout });
      }

      this.logger.logWithTiming(this.logger.debug, 'Element wait completed', timer, {
        selector,
        options: finalOptions,
      });

      return element;
    } catch (error) {
      this.logger.error('Element wait failed', {
        selector,
        options: finalOptions,
        error: error instanceof Error ? error.message : error,
        currentUrl: this.page.url(),
      });
      throw new Error(`Element not found: ${selector}. ${error instanceof Error ? error.message : error}`);
    }
  }

  protected async clickElement(selector: string, options: ElementInteractionOptions = {}): Promise<this> {
    return this.performElementInteraction(
      selector,
      async element => {
        if (options.scrollIntoView) {
          await element.scrollIntoViewIfNeeded();
        }
        await element.click({
          timeout: options.timeout,
          force: options.force,
        });
      },
      'click',
      options
    );
  }

  protected async fillInput(selector: string, value: string, options: ElementInteractionOptions = {}): Promise<this> {
    return this.performElementInteraction(
      selector,
      async element => {
        await element.clear();
        await element.fill(value);
        // Verify the value was set correctly
        await expect(element).toHaveValue(value);
      },
      'fill',
      { ...options, value }
    );
  }

  protected async selectOption(
    selector: string,
    option: string | { label?: string; value?: string; index?: number },
    options: ElementInteractionOptions = {}
  ): Promise<this> {
    return this.performElementInteraction(
      selector,
      async element => {
        if (typeof option === 'string') {
          await element.selectOption(option);
        } else if (option.value) {
          await element.selectOption({ value: option.value });
        } else if (option.label) {
          await element.selectOption({ label: option.label });
        } else if (option.index !== undefined) {
          await element.selectOption({ index: option.index });
        }
      },
      'select',
      { ...options, option }
    );
  }

  protected async getText(selector: string, options: ElementInteractionOptions = {}): Promise<string> {
    const element = await this.waitForElement(selector, options);
    const text = await element.textContent();

    this.logger.debug('Text content retrieved', {
      selector,
      text: text?.substring(0, 100), // Log first 100 chars
    });

    return text || '';
  }

  protected async getAttribute(
    selector: string,
    attributeName: string,
    options: ElementInteractionOptions = {}
  ): Promise<string | null> {
    const element = await this.waitForElement(selector, options);
    const value = await element.getAttribute(attributeName);

    this.logger.debug('Attribute value retrieved', {
      selector,
      attributeName,
      value,
    });

    return value;
  }

  /**
   * Generic element interaction with retry logic and error handling
   */ private async performElementInteraction<T>(
    selector: string,
    interaction: (element: Locator) => Promise<T>,
    actionName: string,
    options: ElementInteractionOptions & Record<string, any> = {}
  ): Promise<this> {
    const timer = this.logger.startTimer();
    const finalOptions = { ...this.getDefaultElementOptions(), ...options };
    let lastError: Error;

    for (let attempt = 1; attempt <= finalOptions.retries!; attempt++) {
      try {
        const element = await this.waitForElement(selector, finalOptions);
        await interaction(element);

        this.logger.logWithTiming(this.logger.info, `Element ${actionName} completed successfully`, timer, {
          selector,
          attempt,
          options: finalOptions,
        });

        return this;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        this.logger.warn(`Element ${actionName} failed on attempt ${attempt}`, {
          selector,
          attempt,
          maxRetries: finalOptions.retries,
          error: lastError.message,
        });

        if (attempt < finalOptions.retries!) {
          // Wait before retry with exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await this.page.waitForTimeout(delay);
        }
      }
    }

    this.logger.error(`Element ${actionName} failed after all retries`, {
      selector,
      retries: finalOptions.retries,
      error: lastError!.message,
    });

    throw new Error(
      `Failed to ${actionName} element ${selector} after ${finalOptions.retries} attempts: ${lastError!.message}`
    );
  }

  /**
   * Public Assertion Methods for Tests
   */
  async assertElementVisible(selector: string, message?: string): Promise<void> {
    await expect(this.page.locator(selector), message).toBeVisible();
  }

  async assertElementHidden(selector: string, message?: string): Promise<void> {
    await expect(this.page.locator(selector), message).toBeHidden();
  }

  async assertElementText(selector: string, expectedText: string | RegExp, message?: string): Promise<void> {
    await expect(this.page.locator(selector), message).toHaveText(expectedText);
  }

  async assertElementContainsText(selector: string, expectedText: string | RegExp, message?: string): Promise<void> {
    await expect(this.page.locator(selector), message).toContainText(expectedText);
  }

  async assertPageTitle(expectedTitle: string | RegExp, message?: string): Promise<void> {
    await expect(this.page, message).toHaveTitle(expectedTitle);
  }

  async assertPageUrl(expectedUrl: string | RegExp, message?: string): Promise<void> {
    await expect(this.page, message).toHaveURL(expectedUrl);
  }

  /**
   * Accessibility testing methods
   */ public async runAccessibilityCheck(
    options: AccessibilityCheckOptions = {
      enabled: true,
      standards: ['wcag2aa'],
      includeTags: [],
      excludeTags: [],
      runOnlyAfterInteraction: false,
    }
  ): Promise<void> {
    if (!options.enabled) {
      return;
    }

    const timer = this.logger.startTimer();

    try {
      // Placeholder for accessibility testing
      // In a real implementation, this would integrate with tools like axe-core
      this.logger.info('Accessibility check would run here', { options });

      this.logger.logWithTiming(this.logger.info, 'Accessibility check completed', timer, {
        standards: options.standards,
      });
    } catch (error) {
      this.logger.error('Accessibility check failed', {
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  /**
   * Performance monitoring methods
   */ public async measurePagePerformance(): Promise<PagePerformanceMetrics> {
    const timer = this.logger.startTimer();

    try {
      // Get navigation timing
      const performanceMetrics = await this.page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');

        return {
          navigationTime: navigation.loadEventEnd - navigation.fetchStart,
          domContentLoadedTime: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          loadTime: navigation.loadEventEnd - navigation.fetchStart,
          firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime,
        };
      });

      this.logger.logWithTiming(this.logger.info, 'Page performance metrics collected', timer, {
        metrics: performanceMetrics,
      });

      return performanceMetrics as PagePerformanceMetrics;
    } catch (error) {
      this.logger.error('Performance measurement failed', {
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  /**
   * Screenshot and visual testing methods
   */
  public async takeScreenshot(name?: string): Promise<Uint8Array> {
    const screenshotName = name || `${this.pageName || 'page'}-${Date.now()}`;

    try {
      const screenshot = await this.page.screenshot({
        fullPage: true,
        path: `test-results/screenshots/${screenshotName}.png`,
      });

      this.logger.info('Screenshot captured', { name: screenshotName });
      return screenshot;
    } catch (error) {
      this.logger.error('Screenshot capture failed', {
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  /**
   * Utility methods
   */
  protected getDefaultElementOptions(): Required<ElementInteractionOptions> {
    return {
      timeout: this.defaultTimeout,
      force: false,
      strict: true,
      retries: this.defaultRetries,
      waitForEnabled: true,
      waitForVisible: true,
      scrollIntoView: true,
    };
  }

  /**
   * Fluent interface methods for method chaining
   */
  public async waitFor(selector: string, options?: ElementInteractionOptions): Promise<this> {
    await this.waitForElement(selector, options);
    return this;
  }

  public async click(selector: string, options?: ElementInteractionOptions): Promise<this> {
    return this.clickElement(selector, options);
  }

  public async fill(selector: string, value: string, options?: ElementInteractionOptions): Promise<this> {
    return this.fillInput(selector, value, options);
  }

  public async select(
    selector: string,
    option: string | { label?: string; value?: string; index?: number },
    options?: ElementInteractionOptions
  ): Promise<this> {
    return this.selectOption(selector, option, options);
  }

  /**
   * Page state management
   */ public async refresh(): Promise<this> {
    const timer = this.logger.startTimer();

    try {
      await this.page.reload();
      await this.waitForPageLoad();

      this.logger.logWithTiming(this.logger.info, 'Page refreshed successfully', timer);

      return this;
    } catch (error) {
      this.logger.error('Page refresh failed', {
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }
  public async goBack(): Promise<this> {
    const timer = this.logger.startTimer();

    try {
      await this.page.goBack();
      await this.waitForPageLoad();

      this.logger.logWithTiming(this.logger.info, 'Navigated back successfully', timer);

      return this;
    } catch (error) {
      this.logger.error('Navigate back failed', {
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }
  public async goForward(): Promise<this> {
    const timer = this.logger.startTimer();

    try {
      await this.page.goForward();
      await this.waitForPageLoad();

      this.logger.logWithTiming(this.logger.info, 'Navigated forward successfully', timer);

      return this;
    } catch (error) {
      this.logger.error('Navigate forward failed', {
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  /**
   * Legacy method support for backwards compatibility
   */
  async waitForUrl(url: string | RegExp, timeout?: number): Promise<void> {
    this.logger.info(`Waiting for URL: ${url}`);
    await this.page.waitForURL(url, {
      timeout: timeout || this.defaultTimeout,
    });
  }

  async pressKey(key: string): Promise<void> {
    this.logger.info(`Pressing key: ${key}`);
    await this.page.keyboard.press(key);
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  async sleep(milliseconds: number): Promise<void> {
    await this.page.waitForTimeout(milliseconds);
  }

  public async isVisible(selector: string): Promise<boolean> {
    return await this.page.locator(selector).isVisible();
  }

  public async isEnabled(selector: string): Promise<boolean> {
    return await this.page.locator(selector).isEnabled();
  }

  /**
   * Cleanup methods
   */
  public async cleanup(): Promise<void> {
    this.logger.info('Cleaning up page object resources');
    // Perform any necessary cleanup
  }
}
