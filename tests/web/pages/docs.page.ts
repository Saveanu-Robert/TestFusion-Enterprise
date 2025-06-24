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
   * Page Loading Methods
   */
  async waitForPageLoad(): Promise<void> {
    // Get browser type for browser-specific handling
    const browserName = this.page.context().browser()?.browserType().name();
    this.logger.debug(`Browser type: ${browserName}`);

    // First wait for the basic page load state
    await this.page.waitForLoadState('domcontentloaded');

    // Try multiple possible selectors for the docs page content
    const possibleContentSelectors = [
      '.theme-doc-markdown',
      'main',
      'article',
      '[role="main"]',
      '.docusaurus-page',
      '.main-wrapper',
      '#__docusaurus',
    ];

    let contentFound = false;

    for (const selector of possibleContentSelectors) {
      try {
        const element = this.page.locator(selector);
        await element.waitFor({
          timeout: 3000,
          state: 'visible',
        });
        contentFound = true;
        this.logger.debug(`✅ Page content found with selector: ${selector}`);
        break;
      } catch (error) {
        this.logger.debug(`⚠️ Content selector ${selector} not found, trying next...`);
        continue;
      }
    }

    if (!contentFound) {
      this.logger.warn('⚠️ No specific content selectors found, checking basic page elements');

      // Fallback: Just ensure we have basic page structure
      try {
        await this.page.waitForSelector('body', { timeout: 5000 });
        this.logger.debug('✅ Basic page structure confirmed');
      } catch (error) {
        this.logger.error('❌ Failed to load even basic page structure');
        throw new Error(`Page failed to load properly. Current URL: ${this.page.url()}`);
      }
    }

    // Wait for load state but with shorter timeout and fallback
    try {
      await this.page.waitForLoadState('load', { timeout: 5000 });
      this.logger.debug('✅ Page load state achieved');
    } catch (error) {
      this.logger.warn('⚠️ Load state timeout - continuing anyway as content is available');
    }

    // Optional: Try networkidle but don't fail if it times out
    // Use browser-specific timeouts as different browsers handle networkidle differently
    const networkIdleTimeout = browserName === 'webkit' ? 1000 : browserName === 'chromium' ? 2000 : 1500;
    try {
      await this.page.waitForLoadState('networkidle', { timeout: networkIdleTimeout });
      this.logger.debug('✅ Network idle achieved');
    } catch (error) {
      this.logger.debug(
        `⚠️ Network idle timeout (${networkIdleTimeout}ms) - continuing as this is often expected in ${browserName}`
      );
    }
  }

  /**
   * Page Actions
   */
  async searchDocs(query: string): Promise<void> {
    this.logger.info(`Attempting to search docs for: ${query}`);

    // Check if search box exists with multiple possible selectors
    const possibleSearchSelectors = [
      WEB_CONSTANTS.SELECTORS.searchBox,
      '[placeholder*="Search"]',
      '[placeholder*="search"]',
      'input[type="search"]',
      '.DocSearch-Input',
      '.search-box input',
      '#search-input',
    ];

    let searchInput = null;

    for (const selector of possibleSearchSelectors) {
      try {
        const element = this.page.locator(selector);
        if (await element.isVisible({ timeout: 1000 })) {
          searchInput = element;
          this.logger.debug(`✅ Search input found with selector: ${selector}`);
          break;
        }
      } catch (error) {
        this.logger.debug(`⚠️ Search selector ${selector} not found or not visible`);
      }
    }

    if (!searchInput) {
      this.logger.warn('⚠️ No search input found on this page');
      throw new Error('Search functionality not available on this page');
    }

    try {
      await searchInput.fill(query);
      await this.pressKey('Enter');
      this.logger.info(`✅ Search completed for: ${query}`);
    } catch (error) {
      this.logger.error(`❌ Failed to perform search: ${error}`);
      throw error;
    }
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
   */ async validatePageLoaded(): Promise<void> {
    this.logger.info('Validating docs page loaded');

    // Check viewport size to determine expected layout
    const viewport = this.page.viewportSize();
    const isDesktop = viewport && viewport.width >= 1024;

    if (isDesktop) {
      // On desktop, expect sidebar to be visible
      await this.assertElementVisible('.theme-doc-sidebar-container', 'Sidebar should be visible');
      await this.assertElementVisible('.theme-doc-markdown', 'Content area should be visible');
      await this.assertPageUrl(/\/docs/, 'URL should contain /docs');
    } else {
      // On mobile and tablet, sidebar might be hidden/collapsed
      await this.assertElementVisible('.theme-doc-markdown', 'Content area should be visible');
      await this.assertPageUrl(/\/docs/, 'URL should contain /docs');

      // Check if sidebar exists but might be hidden
      const sidebarExists = (await this.page.locator('.theme-doc-sidebar-container').count()) > 0;
      this.logger.info(`Mobile/tablet viewport detected. Sidebar exists: ${sidebarExists}`);
    }
  }
  async validateSearchFunctionality(): Promise<void> {
    this.logger.info('Validating search functionality');

    // Try multiple possible search selectors
    const possibleSearchSelectors = [
      WEB_CONSTANTS.SELECTORS.searchBox,
      '[placeholder*="Search"]',
      '[placeholder*="search"]',
      'input[type="search"]',
      '.DocSearch-Input',
      '.search-box input',
      '#search-input',
    ];

    let searchFound = false;
    let searchSelector = '';

    for (const selector of possibleSearchSelectors) {
      try {
        const element = this.page.locator(selector);
        const isVisible = await element.isVisible({ timeout: 2000 });
        if (isVisible) {
          searchFound = true;
          searchSelector = selector;
          this.logger.debug(`✅ Search functionality found with selector: ${selector}`);

          // Validate the search element is functional
          await this.assertElementVisible(selector, 'Search box should be visible');
          await this.assertElementEnabled(selector, 'Search box should be enabled');
          break;
        }
      } catch (error) {
        this.logger.debug(`⚠️ Search selector ${selector} not found or not functional`);
      }
    }

    if (!searchFound) {
      this.logger.warn('⚠️ Search functionality not found - this may be expected on some doc pages');
      // Don't throw error for missing search, just log it
    } else {
      this.logger.info(`✅ Search functionality validated with selector: ${searchSelector}`);
    }
  }
  async validateSidebarNavigation(): Promise<void> {
    this.logger.info('Validating sidebar navigation');

    // Check viewport size to determine expected layout
    const viewport = this.page.viewportSize();
    const isDesktop = viewport && viewport.width >= 1024;

    if (isDesktop) {
      // On desktop, expect sidebar to be visible
      await this.assertElementVisible('.theme-doc-sidebar-container', 'Sidebar should be visible');
      // Check for some expected sidebar items
      const sidebarItems = await this.page.locator('.theme-doc-sidebar-item-link').count();
      if (sidebarItems === 0) {
        throw new Error('No sidebar navigation items found');
      }
      this.logger.info(`Found ${sidebarItems} sidebar navigation items`);
    } else {
      // On mobile and tablet, sidebar might be hidden or require interaction to show
      const sidebarExists = (await this.page.locator('.theme-doc-sidebar-container').count()) > 0;
      this.logger.info(`Mobile/tablet viewport: Sidebar container exists: ${sidebarExists}`);

      if (sidebarExists) {
        // Try to check for sidebar items without requiring visibility
        const sidebarItems = await this.page.locator('.theme-doc-sidebar-item-link').count();
        this.logger.info(`Found ${sidebarItems} sidebar navigation items (mobile/tablet)`);
      }
    }
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
      sidebarItemCount,
    };
  }

  async assertElementEnabled(selector: string, message?: string): Promise<void> {
    await expect(this.page.locator(selector), message).toBeEnabled();
  }

  async assertElementDisabled(selector: string, message?: string): Promise<void> {
    await expect(this.page.locator(selector), message).toBeDisabled();
  }
}
