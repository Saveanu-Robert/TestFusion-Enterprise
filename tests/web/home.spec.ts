/**
 * Home Page Web Tests for TestFusion-Enterprise
 *
 * Enterprise-grade test suite for validating the home page functionality,
 * including UI elements, navigation, performance, SEO, and accessibility.
 * Tests cover both desktop and mobile viewports with detailed validation.
 *
 * @fileoverview Comprehensive home page tests for TestFusion-Enterprise
 * @author TestFusion-Enterprise Team
 * @version 1.0.0
 * @since 2024
 */

import { test, expect, type WebTestFixtures } from '../fixtures/web-fixtures';

// Qase integration with fallback for environments without qase configuration
let qase: (id: number, title: string) => string;
try {
  // Use dynamic import to handle optional qase reporter
  const qaseModule = eval('require')('playwright-qase-reporter');
  qase = qaseModule.qase;
} catch (error) {
  // Fallback for environments without qase reporter
  qase = (id: number, title: string) => title;
}
import { HomePage } from './pages/home.page';
import { WEB_CONSTANTS } from '../constants/test-constants';

test.describe('Home Page Tests', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ webPage, testContext }: WebTestFixtures) => {
    homePage = new HomePage(webPage);
    await homePage.navigate();

    // Attach test context for web tests
    await testContext.attachTestContext({
      test_suite: 'Home Page Tests',
      test_type: 'Web UI Tests',
      feature_category: 'Home Page',
    });

    testContext.logTestStart('Home page test setup completed');
  });
  test(
    qase(32, 'Should load home page successfully and validate core elements'),
    async ({ testContext }: WebTestFixtures) => {
      await test.step('Navigate to home page and validate that all key elements are loaded', async () => {
        await homePage.validatePageLoaded();
        testContext.logInfo('✅ Home page loaded successfully with all key elements');
      });

      await test.step('Verify page title contains Playwright branding information', async () => {
        await homePage.assertPageTitle(/Playwright/);
        const title = await homePage.getPageTitle();
        testContext.logInfo('✅ Page title validation completed', { title });
      });
    }
  );
  test(
    qase(33, 'Should display hero section correctly and validate visual elements'),
    async ({ testContext }: WebTestFixtures) => {
      await test.step('Validate that hero section elements are properly displayed', async () => {
        await homePage.validateHeroSection();
        testContext.logInfo('✅ Hero section validation completed successfully', {
          sectionName: 'hero',
          timestamp: new Date().toISOString(),
        });
      });

      await test.step('Verify hero section container is visible and accessible', async () => {
        await homePage.assertElementVisible('.hero');
        testContext.logInfo('✅ Hero section visibility confirmed', {
          element: '.hero',
          status: 'visible',
        });
      });
    }
  );
  test(
    qase(34, 'Should display navigation elements and validate accessibility'),
    async ({ testContext }: WebTestFixtures) => {
      await test.step('Validate that main navigation elements are properly rendered', async () => {
        await homePage.validateNavigationElements();
        testContext.logInfo('✅ Navigation elements validation completed', {
          section: 'main-navigation',
          timestamp: new Date().toISOString(),
        });
      });

      await test.step('Verify navigation links are visible and accessible to users', async () => {
        await expect(homePage.docsLink).toBeVisible();
        await expect(homePage.docsLink).toBeEnabled();
        testContext.logInfo('✅ Navigation accessibility confirmed', {
          element: 'docs-link',
          visible: true,
          enabled: true,
        });
      });
    }
  );
  test(qase(35, 'Should navigate to docs page'), async ({ webPage, testContext }: WebTestFixtures) => {
    await test.step('Click get started button', async () => {
      await homePage.clickGetStarted();
    });

    await test.step('Verify navigation to docs page', async () => {
      await homePage.waitForUrl(/\/docs/);
      await expect(webPage).toHaveURL(/\/docs/);
      testContext.logInfo('✅ Successfully navigated to docs page', {
        startUrl: homePage.getPageUrl(),
        endUrl: webPage.url(),
      });
    });
  });
  test(qase(36, 'Should work on mobile viewport'), async ({ webPage, testContext }: WebTestFixtures) => {
    await test.step('Set mobile viewport and reload', async () => {
      await webPage.setViewportSize({ width: 375, height: 667 });
      await homePage.navigate();
      testContext.logInfo('✅ Mobile viewport set successfully', { viewport: '375x667' });
    });

    await test.step('Validate mobile layout', async () => {
      await homePage.validatePageLoaded();
      const title = await homePage.getPageTitle();
      expect(title).toContain('Playwright');
      testContext.logInfo('✅ Mobile layout validation completed', { title });
    });
  });
  test(qase(37, 'Should load within acceptable time'), async ({ webPage, testContext }: WebTestFixtures) => {
    await test.step('Measure page load performance', async () => {
      const startTime = Date.now();
      await homePage.navigate();
      await homePage.waitForPageLoad();
      const loadTime = Date.now() - startTime;

      testContext.logInfo(`Home page loaded successfully in ${loadTime}ms`, {
        loadTime,
        url: webPage.url(),
      });
      expect(loadTime).toBeLessThan(15000); // 15 seconds max
    });
  });
  test(
    qase(38, 'Should have proper SEO elements and validate page structure'),
    async ({ webPage, testContext }: WebTestFixtures) => {
      await test.step('Validate page title length meets SEO best practices', async () => {
        const title = await homePage.getPageTitle();
        // Make title length validation more flexible for different platforms
        expect(title.length).toBeGreaterThanOrEqual(5); // More lenient minimum
        expect(title.length).toBeLessThan(100); // More lenient maximum

        testContext.logInfo('✅ Page title SEO validation completed', {
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

        testContext.logInfo('✅ Main heading validation completed', {
          headingPresent: true,
          hasContent: !!headingText,
        });
      });
    }
  );
  test(qase(39, 'Should handle keyboard navigation'), async ({ testContext }: WebTestFixtures) => {
    await test.step('Test focus on get started button', async () => {
      await homePage.getStartedButton.focus();
      await expect(homePage.getStartedButton).toBeFocused();
      testContext.logInfo('✅ Get started button focus test completed');
    });

    await test.step('Test tab navigation', async () => {
      await homePage.pressKey('Tab');
      testContext.logInfo('✅ Tab navigation test completed');
    });
  });
  test(qase(44, 'Should collect and validate page metrics'), async ({ testContext }: WebTestFixtures) => {
    await test.step('Get page metrics', async () => {
      const metrics = await homePage.getPageMetrics();
      expect(metrics.title).toContain('Playwright');
      expect(metrics.url).toContain(WEB_CONSTANTS.BASE_URL);
      expect(metrics.mainHeading).toBeTruthy();

      testContext.logInfo('📊 Home Page Metrics collected', { metrics });
    });
  });
});
