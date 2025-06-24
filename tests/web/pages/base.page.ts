/**
 * Base Page Object for TestFusion-Enterprise
 * Provides common functionality for all page objects
 * Uses centralized configuration and professional patterns
 */

import { Page, Locator, expect } from '@playwright/test';
import { ConfigurationManager } from '../../config/configuration-manager';
import { Logger } from '../../utils/logger';

export interface ElementOptions {
  timeout?: number;
  force?: boolean;
  strict?: boolean;
}

export abstract class BasePage {
  protected readonly config: ReturnType<ConfigurationManager['getWebConfig']>;
  protected readonly logger: Logger;

  constructor(protected readonly page: Page) {
    this.config = ConfigurationManager.getInstance().getWebConfig();
    this.logger = Logger.getInstance();
  }

  /**
   * Abstract method that each page must implement to define its URL
   */
  abstract getPageUrl(): string;

  /**
   * Abstract method that each page must implement to define unique page elements
   */
  abstract getUniquePageElement(): string;

  /**
   * Navigation Methods
   */
  async navigate(): Promise<void> {
    const url = this.getPageUrl();
    this.logger.info(`Navigating to page: ${url}`);
    await this.page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: this.config.timeout.navigation,
    });
    await this.waitForPageLoad();
  }

  async waitForPageLoad(): Promise<void> {
    const uniqueElement = this.getUniquePageElement();
    if (uniqueElement) {
      await this.waitForElement(uniqueElement);
    }
    await this.page.waitForLoadState('domcontentloaded');
  }

  async isCurrentPage(): Promise<boolean> {
    try {
      const uniqueElement = this.getUniquePageElement();
      if (uniqueElement) {
        return await this.page.locator(uniqueElement).isVisible();
      }
      return this.page.url().includes(this.getPageUrl());
    } catch {
      return false;
    }
  }

  /**
   * Element Interaction Methods
   */  protected async waitForElement(selector: string, options: ElementOptions = {}): Promise<Locator> {
    const element = this.page.locator(selector);
    try {
      await element.waitFor({
        timeout: options.timeout || this.config.timeout.element,
        state: 'visible',
      });
      return element;
    } catch (error) {
      const currentUrl = this.page.url();
      const pageTitle = await this.page.title().catch(() => 'Unknown');
      const errorMessage = `Failed to find element with selector "${selector}" on page "${pageTitle}" (${currentUrl}). Original error: ${error instanceof Error ? error.message : error}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  protected async clickElement(selector: string, options: ElementOptions = {}): Promise<void> {
    this.logger.info(`Clicking element: ${selector}`);
    const element = await this.waitForElement(selector, options);
    await element.click({
      timeout: options.timeout || this.config.timeout.element,
      force: options.force,
    });
  }

  protected async fillInput(selector: string, value: string, options: ElementOptions = {}): Promise<void> {
    this.logger.info(`Filling input ${selector} with: ${value}`);
    const element = await this.waitForElement(selector, options);
    await element.clear();
    await element.fill(value);
  }

  protected async selectOption(selector: string, value: string, options: ElementOptions = {}): Promise<void> {
    this.logger.info(`Selecting option ${value} in: ${selector}`);
    const element = await this.waitForElement(selector, options);
    await element.selectOption(value);
  }

  protected async getText(selector: string, options: ElementOptions = {}): Promise<string> {
    const element = await this.waitForElement(selector, options);
    const text = await element.textContent();
    return text?.trim() || '';
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

  async waitForUrl(url: string | RegExp, timeout?: number): Promise<void> {
    this.logger.info(`Waiting for URL: ${url}`);
    await this.page.waitForURL(url, {
      timeout: timeout || this.config.timeout.navigation,
    });
  }

  async getAttribute(selector: string, attribute: string, options: ElementOptions = {}): Promise<string | null> {
    const element = await this.waitForElement(selector, options);
    return await element.getAttribute(attribute);
  }

  async pressKey(key: string): Promise<void> {
    this.logger.info(`Pressing key: ${key}`);
    await this.page.keyboard.press(key);
  }

  /**
   * Utility Methods
   */
  async takeScreenshot(name?: string): Promise<Buffer> {
    const screenshot = await this.page.screenshot({
      fullPage: true,
      path: name ? `screenshots/${name}.png` : undefined,
    });
    this.logger.info(`Screenshot taken${name ? `: ${name}` : ''}`);
    return screenshot;
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
}
