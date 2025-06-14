/**
 * Docs Page Object for Playwright.dev
 * Provides methods to interact with the documentation page
 */

import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { WEB_CONSTANTS } from '../../constants/test-constants';

export class DocsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  getPageUrl(): string {
    return `${this.config.baseUrl}${WEB_CONSTANTS.PAGES.docs}`;
  }

  getUniquePageElement(): string {
    return '.theme-doc-sidebar-container';
  }

  /**
   * Page Element Getters
   */
  get sidebar() {
    return this.page.locator('.theme-doc-sidebar-container');
  }

  get contentArea() {
    return this.page.locator('.theme-doc-markdown');
  }

  get searchBox() {
    return this.page.locator(WEB_CONSTANTS.SELECTORS.searchBox);
  }

  get tableOfContents() {
    return this.page.locator('.table-of-contents');
  }

  get nextPageLink() {
    return this.page.locator('.pagination-nav__link--next');
  }

  get previousPageLink() {
    return this.page.locator('.pagination-nav__link--prev');
  }

  get mainHeading() {
    return this.page.locator('h1').first();
  }

  /**
   * Public page accessor for tests
   */
  get pageInstance() {
    return this.page;
  }

  /**
   * Page Actions
   */
  async searchDocs(query: string): Promise<void> {
    this.logger.info(`Searching docs for: ${query}`);
    await this.fillInput(WEB_CONSTANTS.SELECTORS.searchBox, query);
    await this.pressKey('Enter');
  }

  async navigateToNextPage(): Promise<void> {
    this.logger.info('Navigating to next page');
    await this.clickElement('.pagination-nav__link--next');
  }

  async navigateToPreviousPage(): Promise<void> {
    this.logger.info('Navigating to previous page');
    await this.clickElement('.pagination-nav__link--prev');
  }

  async clickSidebarItem(text: string): Promise<void> {
    this.logger.info(`Clicking sidebar item: ${text}`);
    await this.clickElement(`text="${text}"`);
  }

  async expandSidebarSection(sectionName: string): Promise<void> {
    this.logger.info(`Expanding sidebar section: ${sectionName}`);
    const expandButton = this.page.locator(`text="${sectionName}"`).locator('..').locator('button');
    if (await expandButton.isVisible()) {
      await expandButton.click();
    }
  }

  /**
   * Page Validations
   */
  async validatePageLoaded(): Promise<void> {
    this.logger.info('Validating docs page loaded');
    await this.assertElementVisible('.theme-doc-sidebar-container', 'Sidebar should be visible');
    await this.assertElementVisible('.theme-doc-markdown', 'Content area should be visible');
    await this.assertPageUrl(/\/docs/, 'URL should contain /docs');
  }

  async validateSearchFunctionality(): Promise<void> {
    this.logger.info('Validating search functionality');
    await this.assertElementVisible(WEB_CONSTANTS.SELECTORS.searchBox, 'Search box should be visible');
    await this.assertElementEnabled(WEB_CONSTANTS.SELECTORS.searchBox, 'Search box should be enabled');
  }

  async validateSidebarNavigation(): Promise<void> {
    this.logger.info('Validating sidebar navigation');
    await this.assertElementVisible('.theme-doc-sidebar-container', 'Sidebar should be visible');
    
    // Check for some expected sidebar items
    const sidebarItems = await this.page.locator('.theme-doc-sidebar-item-link').count();
    if (sidebarItems === 0) {
      throw new Error('No sidebar navigation items found');
    }
    this.logger.info(`Found ${sidebarItems} sidebar navigation items`);
  }

  async validateContentStructure(): Promise<void> {
    this.logger.info('Validating content structure');
    await this.assertElementVisible('h1', 'Main heading should be visible');
    await this.assertElementVisible('.theme-doc-markdown', 'Content area should be visible');
  }

  async getMainHeadingText(): Promise<string> {
    return await this.getText('h1');
  }

  async getAllSidebarLinks(): Promise<string[]> {
    const links = await this.page.locator('.theme-doc-sidebar-item-link').all();
    const linkTexts = await Promise.all(links.map(link => link.textContent()));
    return linkTexts.filter(text => text !== null) as string[];
  }

  async getPageMetrics(): Promise<{ title: string; url: string; mainHeading: string; sidebarItemCount: number }> {
    const sidebarItemCount = await this.page.locator('.theme-doc-sidebar-item-link').count();
    return {
      title: await this.getPageTitle(),
      url: await this.getCurrentUrl(),
      mainHeading: await this.getMainHeadingText(),
      sidebarItemCount
    };
  }

  async assertElementEnabled(selector: string, message?: string): Promise<void> {
    await expect(this.page.locator(selector), message).toBeEnabled();
  }

  async assertElementDisabled(selector: string, message?: string): Promise<void> {
    await expect(this.page.locator(selector), message).toBeDisabled();
  }
}
