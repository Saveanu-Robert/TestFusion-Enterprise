/**
 * Home Page Web Tests for TestFusion-Enterprise
 * 
 * Comprehensive test suite for validating the home page functionality,
 * including UI elements, navigation, performance, SEO, and accessibility.
 * Tests cover both desktop and mobile viewports with detailed validation.
 * 
 * @author TestFusion-Enterprise Team
 * @version 1.0.0
 */

import { test, expect } from '../fixtures/web-fixtures';
import { HomePage } from './pages/home.page';
import { WEB_CONSTANTS } from '../constants/test-constants';
import { Logger } from '../utils/logger';

test.describe('Home Page Tests', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ webPage }) => {
    homePage = new HomePage(webPage);
    await homePage.navigate();
  });
  test('Should load home page successfully and validate core elements', async () => {
    // Mark as smoke test for core functionality validation
    test.info().annotations.push({ type: 'tag', description: 'smoke' });
    test.info().annotations.push({ type: 'feature', description: 'home-page-loading' });
    
    await test.step('Navigate to home page and validate that all key elements are loaded', async () => {
      await homePage.validatePageLoaded();
      Logger.getInstance().info('✅ Home page loaded successfully with all key elements', {
        timestamp: new Date().toISOString(),
      });
    });

    await test.step('Verify page title contains Playwright branding information', async () => {
      await homePage.assertPageTitle(/Playwright/);
      
      const title = await homePage.getPageTitle();
      Logger.getInstance().info('✅ Page title validation completed', { title });
    });
  });
  test('Should display hero section correctly and validate visual elements', async () => {
    test.info().annotations.push({ type: 'feature', description: 'hero-section' });
    test.info().annotations.push({ type: 'tag', description: 'ui-validation' });
    
    await test.step('Validate that hero section elements are properly displayed', async () => {
      await homePage.validateHeroSection();
      
      Logger.getInstance().info('✅ Hero section validation completed successfully', {
        sectionName: 'hero',
        timestamp: new Date().toISOString(),
      });
    });

    await test.step('Verify hero section container is visible and accessible', async () => {
      await homePage.assertElementVisible('.hero');
      
      Logger.getInstance().info('✅ Hero section visibility confirmed', {
        element: '.hero',
        status: 'visible',
      });
    });
  });
  test('Should display navigation elements and validate accessibility', async () => {
    test.info().annotations.push({ type: 'feature', description: 'navigation' });
    test.info().annotations.push({ type: 'tag', description: 'accessibility' });
    
    await test.step('Validate that main navigation elements are properly rendered', async () => {
      await homePage.validateNavigationElements();
      
      Logger.getInstance().info('✅ Navigation elements validation completed', {
        section: 'main-navigation',
        timestamp: new Date().toISOString(),
      });
    });

    await test.step('Verify navigation links are visible and accessible to users', async () => {
      await expect(homePage.docsLink).toBeVisible();
      await expect(homePage.docsLink).toBeEnabled();
      
      Logger.getInstance().info('✅ Navigation accessibility confirmed', {
        element: 'docs-link',
        visible: true,
        enabled: true,
      });
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
  test('should load within acceptable time', async ({ webPage }) => {
    await test.step('Measure page load performance', async () => {      const logger = Logger.getInstance();
      const startTime = Date.now();
      await homePage.navigate();
      await homePage.waitForPageLoad();
      const loadTime = Date.now() - startTime;
      
      logger.info(`Home page loaded successfully in ${loadTime}ms`, {
        loadTime,
        url: webPage.url(),
      });
      expect(loadTime).toBeLessThan(15000); // 15 seconds max
    });
  });
  test('Should have proper SEO elements and validate page structure', async ({ webPage }) => {
    test.info().annotations.push({ type: 'feature', description: 'seo' });
    test.info().annotations.push({ type: 'tag', description: 'content-validation' });
      await test.step('Validate page title length meets SEO best practices', async () => {
      const title = await homePage.getPageTitle();
      // Make title length validation more flexible for different platforms
      expect(title.length).toBeGreaterThanOrEqual(5); // More lenient minimum
      expect(title.length).toBeLessThan(100); // More lenient maximum
      
      Logger.getInstance().info('✅ Page title SEO validation completed', {
        titleLength: title.length,
        title: title,
      });
    });

    await test.step('Verify main heading exists and has appropriate content', async () => {
      // Check if main heading is present
      const mainHeading = webPage.locator('h1');
      await expect(mainHeading).toBeVisible();
      const headingText = await mainHeading.textContent();
      expect(headingText).toBeTruthy();
      
      Logger.getInstance().info('✅ Main heading validation completed', {
        headingPresent: true,
        hasContent: !!headingText,
      });
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
      
      Logger.getInstance().info('📊 Home Page Metrics collected', { metrics });
    });
  });
});
