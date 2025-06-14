/**
 * Web Client for TestFusion-Enterprise
 * Provides high-level web automation capabilities
 * Uses centralized configuration and follows API client pattern
 */

import { Page, expect, Locator } from '@playwright/test';
import { ConfigurationManager } from '../config/configuration-manager';
import { Logger, LogLevel } from '../utils/logger';

export interface NavigationOptions {
  waitForSelector?: string;
  waitForTimeout?: number;
  waitForNetworkIdle?: boolean;
}

export interface ElementOptions {
  timeout?: number;
  force?: boolean;
  strict?: boolean;
}

export interface FormData {
  [key: string]: string | number | boolean;
}

export class WebClient {
  private readonly config: ReturnType<ConfigurationManager['getWebConfig']>;
  private readonly logger: Logger;

  constructor(
    private readonly page: Page,
    configManager: ConfigurationManager
  ) {
    this.config = configManager.getWebConfig();
    this.logger = Logger.getInstance();
  }

  /**
   * Navigation Methods
   */
  async navigateTo(url: string, options: NavigationOptions = {}): Promise<void> {
    this.logger.info(`Navigating to: ${url}`);
    
    await this.page.goto(url, {
      timeout: options.waitForTimeout || this.config.timeout.navigation,
      waitUntil: options.waitForNetworkIdle ? 'networkidle' : 'domcontentloaded'
    });

    if (options.waitForSelector) {
      await this.waitForElement(options.waitForSelector);
    }

    this.logger.info(`Successfully navigated to: ${url}`);
  }

  async navigateToBaseUrl(path: string = '', options: NavigationOptions = {}): Promise<void> {
    const fullUrl = `${this.config.baseUrl}${path}`;
    await this.navigateTo(fullUrl, options);
  }

  async reload(options: NavigationOptions = {}): Promise<void> {
    this.logger.info('Reloading page');
    await this.page.reload({
      timeout: options.waitForTimeout || this.config.timeout.navigation,
      waitUntil: options.waitForNetworkIdle ? 'networkidle' : 'domcontentloaded'
    });
  }

  /**
   * Element Interaction Methods
   */
  async waitForElement(selector: string, options: ElementOptions = {}): Promise<Locator> {
    this.logger.info(`Waiting for element: ${selector}`);
    const element = this.page.locator(selector);
    await element.waitFor({
      timeout: options.timeout || this.config.timeout.element,
      state: 'visible'
    });
    return element;
  }

  async clickElement(selector: string, options: ElementOptions = {}): Promise<void> {
    this.logger.info(`Clicking element: ${selector}`);
    const element = await this.waitForElement(selector, options);
    await element.click({
      timeout: options.timeout || this.config.timeout.element,
      force: options.force
    });
  }

  async fillInput(selector: string, value: string, options: ElementOptions = {}): Promise<void> {
    this.logger.info(`Filling input ${selector} with value: ${value}`);
    const element = await this.waitForElement(selector, options);
    await element.clear();
    await element.fill(value);
  }

  async selectOption(selector: string, value: string, options: ElementOptions = {}): Promise<void> {
    this.logger.info(`Selecting option ${value} in: ${selector}`);
    const element = await this.waitForElement(selector, options);
    await element.selectOption(value);
  }

  async uploadFile(selector: string, filePath: string, options: ElementOptions = {}): Promise<void> {
    this.logger.info(`Uploading file to ${selector}: ${filePath}`);
    const element = await this.waitForElement(selector, options);
    await element.setInputFiles(filePath);
  }

  /**
   * Form Handling Methods
   */
  async fillForm(formData: FormData, selectorPrefix: string = ''): Promise<void> {
    this.logger.info('Filling form with data');
    
    for (const [field, value] of Object.entries(formData)) {
      const selector = selectorPrefix ? `${selectorPrefix} [name="${field}"]` : `[name="${field}"]`;
      
      if (typeof value === 'string') {
        await this.fillInput(selector, value);
      } else if (typeof value === 'boolean') {
        const checkbox = await this.waitForElement(selector);
        const isChecked = await checkbox.isChecked();
        if (isChecked !== value) {
          await this.clickElement(selector);
        }
      }
    }
  }
  async submitForm(formSelector: string = 'form', submitButtonSelector?: string): Promise<void> {
    this.logger.info('Submitting form');
    
    if (submitButtonSelector) {
      await this.clickElement(submitButtonSelector);
    } else {
      const form = await this.waitForElement(formSelector);
      await form.evaluate((form: any) => form.submit());
    }
  }

  /**
   * Data Extraction Methods
   */
  async getText(selector: string, options: ElementOptions = {}): Promise<string> {
    const element = await this.waitForElement(selector, options);
    const text = await element.textContent();
    return text?.trim() || '';
  }

  async getAttribute(selector: string, attribute: string, options: ElementOptions = {}): Promise<string | null> {
    const element = await this.waitForElement(selector, options);
    return await element.getAttribute(attribute);
  }

  async getValue(selector: string, options: ElementOptions = {}): Promise<string> {
    const element = await this.waitForElement(selector, options);
    return await element.inputValue();
  }

  async isVisible(selector: string): Promise<boolean> {
    return await this.page.locator(selector).isVisible();
  }

  async isEnabled(selector: string): Promise<boolean> {
    return await this.page.locator(selector).isEnabled();
  }

  async isChecked(selector: string): Promise<boolean> {
    return await this.page.locator(selector).isChecked();
  }

  /**
   * Waiting and Timing Methods
   */
  async waitForUrl(url: string | RegExp, timeout?: number): Promise<void> {
    this.logger.info(`Waiting for URL: ${url}`);
    await this.page.waitForURL(url, {
      timeout: timeout || this.config.timeout.navigation
    });
  }

  async waitForResponse(urlPattern: string | RegExp, timeout?: number): Promise<void> {
    this.logger.info(`Waiting for response: ${urlPattern}`);
    await this.page.waitForResponse(urlPattern, {
      timeout: timeout || this.config.timeout.element
    });
  }

  async waitForLoadState(state: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded'): Promise<void> {
    await this.page.waitForLoadState(state);
  }

  async sleep(milliseconds: number): Promise<void> {
    await this.page.waitForTimeout(milliseconds);
  }

  /**
   * Screenshot and Debugging Methods
   */
  async takeScreenshot(name?: string): Promise<Buffer> {
    const screenshot = await this.page.screenshot({
      fullPage: true,
      path: name ? `screenshots/${name}.png` : undefined
    });
    this.logger.info(`Screenshot taken${name ? `: ${name}` : ''}`);
    return screenshot;
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Assertion Helpers
   */
  async assertElementVisible(selector: string, message?: string): Promise<void> {
    const element = this.page.locator(selector);
    await expect(element, message).toBeVisible();
  }

  async assertElementHidden(selector: string, message?: string): Promise<void> {
    const element = this.page.locator(selector);
    await expect(element, message).toBeHidden();
  }

  async assertElementEnabled(selector: string, message?: string): Promise<void> {
    const element = this.page.locator(selector);
    await expect(element, message).toBeEnabled();
  }

  async assertElementDisabled(selector: string, message?: string): Promise<void> {
    const element = this.page.locator(selector);
    await expect(element, message).toBeDisabled();
  }

  async assertElementText(selector: string, expectedText: string | RegExp, message?: string): Promise<void> {
    const element = this.page.locator(selector);
    await expect(element, message).toHaveText(expectedText);
  }

  async assertElementContainsText(selector: string, expectedText: string | RegExp, message?: string): Promise<void> {
    const element = this.page.locator(selector);
    await expect(element, message).toContainText(expectedText);
  }

  async assertPageTitle(expectedTitle: string | RegExp, message?: string): Promise<void> {
    await expect(this.page, message).toHaveTitle(expectedTitle);
  }

  async assertPageUrl(expectedUrl: string | RegExp, message?: string): Promise<void> {
    await expect(this.page, message).toHaveURL(expectedUrl);
  }

  /**
   * Browser Console and Network Methods
   */
  async getConsoleMessages(): Promise<string[]> {
    const messages: string[] = [];
    this.page.on('console', msg => messages.push(msg.text()));
    return messages;
  }

  async clearBrowserData(): Promise<void> {
    await this.page.context().clearCookies();
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  /**
   * Advanced Interaction Methods
   */
  async dragAndDrop(sourceSelector: string, targetSelector: string): Promise<void> {
    this.logger.info(`Dragging from ${sourceSelector} to ${targetSelector}`);
    const source = await this.waitForElement(sourceSelector);
    const target = await this.waitForElement(targetSelector);
    await source.dragTo(target);
  }

  async hover(selector: string, options: ElementOptions = {}): Promise<void> {
    this.logger.info(`Hovering over element: ${selector}`);
    const element = await this.waitForElement(selector, options);
    await element.hover();
  }

  async doubleClick(selector: string, options: ElementOptions = {}): Promise<void> {
    this.logger.info(`Double-clicking element: ${selector}`);
    const element = await this.waitForElement(selector, options);
    await element.dblclick();
  }

  async rightClick(selector: string, options: ElementOptions = {}): Promise<void> {
    this.logger.info(`Right-clicking element: ${selector}`);
    const element = await this.waitForElement(selector, options);
    await element.click({ button: 'right' });
  }

  async pressKey(key: string): Promise<void> {
    this.logger.info(`Pressing key: ${key}`);
    await this.page.keyboard.press(key);
  }

  async typeText(text: string, delay?: number): Promise<void> {
    this.logger.info(`Typing text: ${text}`);
    await this.page.keyboard.type(text, { delay });
  }
}
