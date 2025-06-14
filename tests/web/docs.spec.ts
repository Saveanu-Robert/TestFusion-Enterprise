/**
 * Docs Page Tests for TestFusion-Enterprise
 * Professional web tests for documentation functionality
 */

import { test, expect } from '../fixtures/web-fixtures';
import { DocsPage } from './pages/docs.page';
import { WEB_CONSTANTS } from '../constants/test-constants';

test.describe('Docs Page Tests', () => {
  let docsPage: DocsPage;

  test.beforeEach(async ({ webPage }) => {
    docsPage = new DocsPage(webPage);
    await docsPage.navigate();
  });

  test('should load docs page successfully', async () => {
    await test.step('Validate page loads with documentation elements', async () => {
      await docsPage.validatePageLoaded();
    });

    await test.step('Verify page URL and title', async () => {
      await docsPage.assertPageUrl(/\/docs/);
      const title = await docsPage.getPageTitle();
      expect(title).toBeTruthy();
    });
  });

  test('should display sidebar navigation', async () => {
    await test.step('Validate sidebar elements', async () => {
      await docsPage.validateSidebarNavigation();
    });

    await test.step('Verify sidebar is functional', async () => {
      await expect(docsPage.sidebar).toBeVisible();
      
      const sidebarLinks = await docsPage.getAllSidebarLinks();
      expect(sidebarLinks.length).toBeGreaterThan(0);
      console.log(`Found ${sidebarLinks.length} sidebar navigation items`);
    });
  });

  test('should display main content structure', async () => {
    await test.step('Validate content structure', async () => {
      await docsPage.validateContentStructure();
    });

    await test.step('Verify content elements', async () => {
      await expect(docsPage.contentArea).toBeVisible();
      
      const mainHeading = await docsPage.getMainHeadingText();
      expect(mainHeading).toBeTruthy();
      console.log(`Main heading: ${mainHeading}`);
    });
  });

  test('should have functional search', async () => {
    await test.step('Validate search functionality', async () => {
      await docsPage.validateSearchFunctionality();
    });

    await test.step('Test search interaction', async () => {
      // Only test if search box is visible (some doc sites don't have search on all pages)
      const searchVisible = await docsPage.isVisible(WEB_CONSTANTS.SELECTORS.searchBox);
      if (searchVisible) {
        await docsPage.searchDocs('test');
        // Wait a moment for search results to potentially load
        await docsPage.sleep(1000);
      } else {
        console.log('Search box not visible on this page');
      }
    });
  });

  test('should support keyboard navigation', async () => {
    await test.step('Test sidebar navigation with keyboard', async () => {
      // Focus on the first sidebar link
      const firstSidebarLink = docsPage.pageInstance.locator('.theme-doc-sidebar-item-link').first();
      if (await firstSidebarLink.isVisible()) {
        await firstSidebarLink.focus();
        await expect(firstSidebarLink).toBeFocused();
        
        // Test arrow key navigation
        await docsPage.pressKey('ArrowDown');
      }
    });
  });

  test('should display page metrics correctly', async () => {
    await test.step('Collect and validate page metrics', async () => {
      const metrics = await docsPage.getPageMetrics();
      
      expect(metrics.title).toBeTruthy();
      expect(metrics.url).toContain('/docs');
      expect(metrics.mainHeading).toBeTruthy();
      expect(metrics.sidebarItemCount).toBeGreaterThanOrEqual(0);
      
      console.log('📊 Docs Page Metrics:', JSON.stringify(metrics, null, 2));
    });
  });

  test('should work on different screen sizes', async ({ webPage }) => {
    await test.step('Test on mobile viewport', async () => {
      await webPage.setViewportSize({ width: 375, height: 667 });
      await docsPage.navigate();
      await docsPage.validatePageLoaded();
    });

    await test.step('Test on tablet viewport', async () => {
      await webPage.setViewportSize({ width: 768, height: 1024 });
      await docsPage.navigate();
      await docsPage.validatePageLoaded();
    });

    await test.step('Test on desktop viewport', async () => {
      await webPage.setViewportSize({ width: 1200, height: 800 });
      await docsPage.navigate();
      await docsPage.validatePageLoaded();
    });
  });

  test('should handle pagination if available', async () => {
    await test.step('Check for pagination elements', async () => {
      const hasNextPage = await docsPage.isVisible('.pagination-nav__link--next');
      const hasPrevPage = await docsPage.isVisible('.pagination-nav__link--prev');
      
      if (hasNextPage || hasPrevPage) {
        console.log(`Pagination available - Next: ${hasNextPage}, Previous: ${hasPrevPage}`);
        
        if (hasNextPage) {
          await docsPage.navigateToNextPage();
          await docsPage.waitForPageLoad();
          await docsPage.validateContentStructure();
        }
      } else {
        console.log('No pagination available on this page');
      }
    });
  });

  test('should maintain accessibility standards', async ({ webPage }) => {
    await test.step('Validate heading structure', async () => {
      const h1Count = await webPage.locator('h1').count();
      expect(h1Count).toBeGreaterThanOrEqual(1);
      
      // Check for proper heading hierarchy
      const headings = await webPage.locator('h1, h2, h3, h4, h5, h6').all();
      expect(headings.length).toBeGreaterThan(0);
    });

    await test.step('Validate link accessibility', async () => {
      const links = await webPage.locator('a[href]').all();
      for (const link of links.slice(0, 10)) { // Test first 10 links
        const href = await link.getAttribute('href');
        const text = await link.textContent();
        
        // Links should have href and meaningful text
        expect(href).toBeTruthy();
        if (text) {
          expect(text.trim().length).toBeGreaterThan(0);
        }
      }
    });
  });

  test('should load content efficiently', async () => {
    await test.step('Measure content load time', async () => {
      const startTime = Date.now();
      await docsPage.navigate();
      await docsPage.validateContentStructure();
      const loadTime = Date.now() - startTime;
      
      console.log(`Docs page load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(10000); // 10 seconds max
    });
  });
});
