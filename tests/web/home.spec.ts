/**
 * Home Page Tests for TestFusion-Enterprise
 * Professional web tests using centralized configuration
 */

import { test, expect } from '../fixtures/web-fixtures';
import { HomePage } from './pages/home.page';
import { WEB_CONSTANTS } from '../constants/test-constants';

test.describe('Home Page Tests', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ webPage }) => {
    homePage = new HomePage(webPage);
    await homePage.navigate();
  });

  test('should load home page successfully', async () => {
    await test.step('Validate page loads with key elements', async () => {
      await homePage.validatePageLoaded();
    });

    await test.step('Verify page title contains Playwright', async () => {
      await homePage.assertPageTitle(/Playwright/);
    });
  });

  test('should display hero section correctly', async () => {
    await test.step('Validate hero section elements', async () => {
      await homePage.validateHeroSection();
    });

    await test.step('Verify hero section is visible', async () => {
      await homePage.assertElementVisible('.hero');
    });
  });

  test('should display navigation elements', async () => {
    await test.step('Validate main navigation', async () => {
      await homePage.validateNavigationElements();
    });

    await test.step('Verify navigation is accessible', async () => {
      await expect(homePage.docsLink).toBeVisible();
      await expect(homePage.docsLink).toBeEnabled();
    });
  });

  test('should navigate to docs page', async ({ webPage }) => {
    await test.step('Click get started button', async () => {
      await homePage.clickGetStarted();
    });

    await test.step('Verify navigation to docs page', async () => {
      await homePage.waitForUrl(/\/docs/);
      await expect(webPage).toHaveURL(/\/docs/);
    });
  });

  test('should work on mobile viewport', async ({ webPage }) => {
    await test.step('Set mobile viewport and reload', async () => {
      await webPage.setViewportSize({ width: 375, height: 667 });
      await homePage.navigate();
    });

    await test.step('Validate mobile layout', async () => {
      await homePage.validatePageLoaded();
      const title = await homePage.getPageTitle();
      expect(title).toContain('Playwright');
    });
  });

  test('should load within acceptable time', async () => {
    await test.step('Measure page load performance', async () => {
      const startTime = Date.now();
      await homePage.navigate();
      await homePage.waitForPageLoad();
      const loadTime = Date.now() - startTime;
      
      console.log(`Page load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(15000); // 15 seconds max
    });
  });

  test('should have proper SEO elements', async () => {
    await test.step('Validate page title length', async () => {
      const title = await homePage.getPageTitle();
      expect(title.length).toBeGreaterThan(10);
      expect(title.length).toBeLessThan(70);
    });

    await test.step('Verify main heading exists', async () => {
      const mainHeading = await homePage.getText('h1');
      expect(mainHeading).toBeTruthy();
    });
  });

  test('should handle keyboard navigation', async () => {
    await test.step('Test focus on get started button', async () => {
      await homePage.getStartedButton.focus();
      await expect(homePage.getStartedButton).toBeFocused();
    });

    await test.step('Test tab navigation', async () => {
      await homePage.pressKey('Tab');
      // Focus should move to next focusable element
    });
  });

  test('should collect and validate page metrics', async () => {
    await test.step('Get page metrics', async () => {
      const metrics = await homePage.getPageMetrics();
      
      expect(metrics.title).toContain('Playwright');
      expect(metrics.url).toContain(WEB_CONSTANTS.BASE_URL);
      expect(metrics.mainHeading).toBeTruthy();
      
      console.log('📊 Page Metrics:', JSON.stringify(metrics, null, 2));
    });
  });
});
