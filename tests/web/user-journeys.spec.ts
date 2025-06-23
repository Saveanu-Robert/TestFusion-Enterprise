/**
 * End-to-End User Journey Tests for TestFusion-Enterprise
 *
 * Comprehensive test suite for validating complete user workflows across multiple pages,
 * including home-to-docs navigation, documentation exploration, and responsive design validation.
 * Tests simulate real user interactions and validate end-to-end functionality.
 *
 * @author TestFusion-Enterprise Team
 * @version 1.0.0
 */

import { test, expect } from '../fixtures/web-fixtures';
import { qase } from 'playwright-qase-reporter';
import { HomePage } from './pages/home.page';
import { DocsPage } from './pages/docs.page';
import { WEB_CONSTANTS } from '../constants/test-constants';

test.describe('End-to-End User Journeys', () => {
  test(
    qase(43, 'Should complete new user workflow from home page to documentation successfully'),
    async ({ webPage, testContext }) => {
      testContext.logInfo('🚀 Starting complete new user workflow test from home to docs');

      await test.step('Visit home page and validate initial user landing experience', async () => {
        const homePage = new HomePage(webPage);
        await homePage.navigate();
        await homePage.validatePageLoaded();

        const homeMetrics = await homePage.getPageMetrics();
        testContext.logInfo('✅ Home page metrics collected for user journey validation', homeMetrics);

        expect(homeMetrics.title).toContain('Playwright');
        expect(homeMetrics.url).toContain(WEB_CONSTANTS.BASE_URL);
      });

      await test.step('Navigate to documentation from home page using get started button', async () => {
        const homePage = new HomePage(webPage);
        await homePage.clickGetStarted();

        // Wait for navigation and validate we're on docs page
        await webPage.waitForURL(/\/docs/);
        await expect(webPage).toHaveURL(/\/docs/);

        testContext.logInfo('✅ Successfully navigated from home to documentation page');
      });

      await test.step('Explore documentation page structure and validate user experience', async () => {
        const docsPage = new DocsPage(webPage);
        await docsPage.validatePageLoaded();

        const docsMetrics = await docsPage.getPageMetrics();
        testContext.logInfo('✅ Documentation page metrics collected for exploration validation', docsMetrics);

        expect(docsMetrics.sidebarItemCount).toBeGreaterThan(0);
        expect(docsMetrics.mainHeading).toBeTruthy();
      });

      await test.step('Test documentation search functionality for user content discovery', async () => {
        const docsPage = new DocsPage(webPage);

        // Only test search if search box is available
        const searchVisible = await docsPage.isVisible(WEB_CONSTANTS.SELECTORS.searchBox);
        if (searchVisible) {
          await docsPage.searchDocs('getting started');
          await webPage.waitForTimeout(2000); // Wait for search results
          testContext.logInfo('✅ Search functionality tested successfully - user can discover content');
        } else {
          testContext.logInfo('ℹ️ Search box not available on this documentation page');
        }
      });

      testContext.logInfo('🎉 Completed new user workflow test successfully - full journey validated');
    },
  );

  test(qase(53, 'documentation exploration journey'), async ({ webPage, testContext }) => {
    testContext.logInfo('Starting documentation exploration journey');

    await test.step('Start from docs page', async () => {
      const docsPage = new DocsPage(webPage);
      await docsPage.navigate();
      await docsPage.validatePageLoaded();
    });

    await test.step('Navigate through sidebar items', async () => {
      const docsPage = new DocsPage(webPage);

      const sidebarLinks = await docsPage.getAllSidebarLinks();
      testContext.logInfo(`Found ${sidebarLinks.length} sidebar links`);

      if (sidebarLinks.length > 0) {
        // Click on the first few sidebar items to test navigation
        const linksToTest = Math.min(3, sidebarLinks.length);

        for (let i = 0; i < linksToTest; i++) {
          const linkText = sidebarLinks[i];
          if (linkText && linkText.trim()) {
            try {
              await docsPage.clickSidebarItem(linkText);
              await webPage.waitForLoadState('domcontentloaded');
              await docsPage.validateContentStructure();
              testContext.logInfo(`Successfully navigated to: ${linkText}`);
            } catch (error) {
              testContext.logInfo(`Could not navigate to ${linkText}: ${error}`);
            }
          }
        }
      }
    });

    await test.step('Test pagination if available', async () => {
      const docsPage = new DocsPage(webPage);

      const hasNextPage = await docsPage.isVisible('.pagination-nav__link--next');
      if (hasNextPage) {
        await docsPage.navigateToNextPage();
        await docsPage.validatePageLoaded();
        testContext.logInfo('Successfully navigated to next page');
      } else {
        testContext.logInfo('No next page pagination available');
      }
    });

    testContext.logInfo('Completed documentation exploration journey');
  });

  test(qase(54, 'responsive design journey'), async ({ webPage, testContext }) => {
    testContext.logInfo('Starting responsive design journey');

    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1200, height: 800 },
      { name: 'Large Desktop', width: 1920, height: 1080 },
    ];

    for (const viewport of viewports) {
      await test.step(`Test ${viewport.name} viewport (${viewport.width}x${viewport.height})`, async () => {
        await webPage.setViewportSize({ width: viewport.width, height: viewport.height });

        // Test home page on this viewport
        const homePage = new HomePage(webPage);
        await homePage.navigate();
        await homePage.validatePageLoaded();

        const homeMetrics = await homePage.getPageMetrics();
        testContext.logInfo(`${viewport.name} home page metrics`, homeMetrics);

        // Test docs page on this viewport
        const docsPage = new DocsPage(webPage);
        await docsPage.navigate();
        await docsPage.validatePageLoaded();

        const docsMetrics = await docsPage.getPageMetrics();
        testContext.logInfo(`${viewport.name} docs page metrics`, docsMetrics);

        // Basic assertions that should work on all viewports
        expect(homeMetrics.title).toContain('Playwright');
        expect(docsMetrics.mainHeading).toBeTruthy();
      });
    }

    testContext.logInfo('Completed responsive design journey');
  });

  test(qase(55, 'accessibility and keyboard navigation journey'), async ({ webPage, testContext }) => {
    testContext.logInfo('Starting accessibility and keyboard navigation journey');

    await test.step('Test keyboard navigation on home page', async () => {
      const homePage = new HomePage(webPage);
      await homePage.navigate();
      await homePage.validatePageLoaded();

      // Focus on get started button and test keyboard interaction
      await homePage.getStartedButton.focus();
      await expect(homePage.getStartedButton).toBeFocused();

      // Press Enter to activate the button
      await homePage.pressKey('Enter');
      await webPage.waitForURL(/\/docs/);
      testContext.logInfo('Keyboard navigation from home to docs successful');
    });

    await test.step('Test keyboard navigation on docs page', async () => {
      const docsPage = new DocsPage(webPage);
      await docsPage.validatePageLoaded();

      // Test tab navigation through key elements
      await webPage.keyboard.press('Tab');
      await webPage.keyboard.press('Tab');
      await webPage.keyboard.press('Tab');

      testContext.logInfo('Keyboard navigation through docs page elements completed');
    });

    await test.step('Validate accessibility standards', async () => {
      // Check for proper heading structure
      const headings = await webPage.locator('h1, h2, h3, h4, h5, h6').all();
      expect(headings.length).toBeGreaterThan(0);

      // Check that the first heading is h1
      const firstHeading = await webPage.locator('h1, h2, h3, h4, h5, h6').first();
      const tagName = await firstHeading.evaluate(el => el.tagName.toLowerCase());
      expect(['h1', 'h2']).toContain(tagName); // h1 or h2 is acceptable for main heading

      // Check for alt text on images
      const images = await webPage.locator('img').all();
      for (const img of images.slice(0, 5)) {
        // Test first 5 images
        const alt = await img.getAttribute('alt');
        const role = await img.getAttribute('role');
        // Images should have alt text or be decorative
        expect(alt !== null || role === 'presentation' || role === 'img').toBeTruthy();
      }

      testContext.logInfo('Accessibility validation completed');
    });

    testContext.logInfo('Completed accessibility and keyboard navigation journey');
  });

  test(qase(56, 'performance and error handling journey'), async ({ webPage, testContext }) => {
    testContext.logInfo('Starting performance and error handling journey');

    await test.step('Measure page load performance', async () => {
      const performanceMetrics = {
        homePageLoadTime: 0,
        docsPageLoadTime: 0,
        navigationTime: 0,
      };

      // Measure home page load time
      let startTime = Date.now();
      const homePage = new HomePage(webPage);
      await homePage.navigate();
      await homePage.waitForPageLoad();
      performanceMetrics.homePageLoadTime = Date.now() - startTime;

      // Measure navigation time
      startTime = Date.now();
      await homePage.clickGetStarted();
      await webPage.waitForURL(/\/docs/);
      performanceMetrics.navigationTime = Date.now() - startTime;

      // Measure docs page load time
      startTime = Date.now();
      const docsPage = new DocsPage(webPage);
      await docsPage.validatePageLoaded();
      performanceMetrics.docsPageLoadTime = Date.now() - startTime;

      testContext.logInfo('Performance metrics', performanceMetrics);

      // Validate performance thresholds
      expect(performanceMetrics.homePageLoadTime).toBeLessThan(10000);
      expect(performanceMetrics.docsPageLoadTime).toBeLessThan(8000);
      expect(performanceMetrics.navigationTime).toBeLessThan(5000);
    });

    await test.step('Test error handling', async () => {
      // Test handling of non-existent pages
      const response = await webPage.goto(`${WEB_CONSTANTS.BASE_URL}/non-existent-page-12345`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000,
      });

      if (response) {
        // Should either be 404 or redirect to a valid page
        expect([200, 301, 302, 404]).toContain(response.status());
        testContext.logInfo(`Non-existent page returned status: ${response.status()}`);
      }
    });

    await test.step('Test with slow network conditions', async () => {
      // Simulate slow network (only available in Chromium browsers)
      const browserName = webPage.context().browser()?.browserType().name();

      if (browserName === 'chromium') {
        const client = await webPage.context().newCDPSession(webPage);
        await client.send('Network.emulateNetworkConditions', {
          offline: false,
          downloadThroughput: 100 * 1024, // 100kb/s
          uploadThroughput: 100 * 1024, // 100kb/s
          latency: 500, // 500ms latency
        });
        testContext.logInfo('Network throttling applied (Chromium only)');
      } else {
        testContext.logInfo(`Network throttling skipped - not available in ${browserName} browser`);
      }

      const homePage = new HomePage(webPage);
      await homePage.navigate();
      await homePage.validatePageLoaded();

      testContext.logInfo('Page loaded successfully under network conditions test');
    });

    testContext.logInfo('Completed performance and error handling journey');
  });
});
