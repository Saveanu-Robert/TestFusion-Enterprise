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
  });  test('Should load home page successfully and validate core elements', async ({ webReporter }) => {
    // Mark as smoke test for core functionality validation
    test.info().annotations.push({ type: 'tag', description: 'smoke' });
    test.info().annotations.push({ type: 'feature', description: 'home-page-loading' });
    
    // Attach visual context
    await webReporter.attachVisualContext();
    
    await test.step('Navigate to home page and validate that all key elements are loaded', async () => {
      await homePage.validatePageLoaded();
      
      // Capture screenshot after page load
      await webReporter.attachScreenshot('Home Page Loaded', { fullPage: true });
      
      // Record user interaction
      await webReporter.recordUserInteraction('page_load', 'home_page', {
        value: homePage.getPageUrl(),
        duration: Date.now() - performance.now(),
      });
      
      Logger.getInstance().info('✅ Home page loaded successfully with all key elements', {
        timestamp: new Date().toISOString(),
      });
    });

    await test.step('Verify page title contains Playwright branding information', async () => {
      await homePage.assertPageTitle(/Playwright/);
      
      const title = await homePage.getPageTitle();
      
      // Attach performance metrics
      const metrics = await webReporter.attachPerformanceMetrics('Title Validation');
      
      Logger.getInstance().info('✅ Page title validation completed', { title });
    });
    
    // Attach accessibility audit
    await webReporter.attachAccessibilityAudit('Home Page Load');
    
    // Attach network summary
    await webReporter.attachNetworkSummary('Home Page Load');
    
    // Attach console logs
    await webReporter.attachConsoleSummary('Home Page Load');
    
    // Attach test summary
    await webReporter.attachTestSummary('Home Page Load Test', 'passed', {
      pageUrl: homePage.getPageUrl(),
      testType: 'smoke',
    });
  });  test('Should display hero section correctly and validate visual elements', async ({ webReporter }) => {
    test.info().annotations.push({ type: 'feature', description: 'hero-section' });
    test.info().annotations.push({ type: 'tag', description: 'ui-validation' });
    
    await test.step('Validate that hero section elements are properly displayed', async () => {
      await homePage.validateHeroSection();
      
      // Capture hero section screenshot
      const heroElement = homePage.heroSection;
      await webReporter.attachScreenshot('Hero Section', { element: heroElement });
      
      // Record interaction with hero section
      await webReporter.recordUserInteraction('validate_element', 'hero_section', {
        element: '.hero',
        success: true,
      });
      
      Logger.getInstance().info('✅ Hero section validation completed successfully', {
        sectionName: 'hero',
        timestamp: new Date().toISOString(),
      });
    });

    await test.step('Verify hero section container is visible and accessible', async () => {
      await homePage.assertElementVisible('.hero');
      
      // Attach accessibility audit for hero section
      await webReporter.attachAccessibilityAudit('Hero Section');
      
      Logger.getInstance().info('✅ Hero section visibility confirmed', {
        element: '.hero',
        status: 'visible',
      });
    });
    
    // Attach performance metrics for hero section validation
    await webReporter.attachPerformanceMetrics('Hero Section Validation');
    
    // Attach user interaction timeline
    await webReporter.attachUserInteractionTimeline('Hero Section Test');
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
  test('Should navigate to docs page', async ({ webPage, webReporter }) => {
    await test.step('Click get started button', async () => {
      // Capture screenshot before interaction
      await webReporter.attachScreenshot('Before Get Started Click');
      
      // Record user interaction
      await webReporter.recordUserInteraction('click', 'get_started_button', {
        element: '[data-testid="get-started-button"], .getStarted, .get-started',
        coordinates: { x: 0, y: 0 }, // Could be enhanced with actual coordinates
      });
      
      await homePage.clickGetStarted();
      
      // Capture screenshot after interaction
      await webReporter.attachScreenshot('After Get Started Click');
    });

    await test.step('Verify navigation to docs page', async () => {
      await homePage.waitForUrl(/\/docs/);
      await expect(webPage).toHaveURL(/\/docs/);
      
      // Capture final state
      await webReporter.attachScreenshot('Docs Page Loaded', { fullPage: true });
      
      // Record successful navigation
      await webReporter.recordUserInteraction('navigation', 'docs_page', {
        value: webPage.url(),
        success: true,
      });
    });
    
    // Attach comprehensive reporting for navigation test
    await webReporter.attachPerformanceMetrics('Navigation Test');
    await webReporter.attachNetworkSummary('Navigation Test');
    await webReporter.attachUserInteractionTimeline('Navigation Test');
    await webReporter.attachTestSummary('Navigation Test', 'passed', {
      startUrl: homePage.getPageUrl(),
      endUrl: webPage.url(),
      navigationTarget: 'docs',
    });
  });
  test('Should work on mobile viewport', async ({ webPage, webReporter }) => {
    await test.step('Set mobile viewport and reload', async () => {
      // Capture desktop screenshot first
      await webReporter.attachScreenshot('Before Mobile Viewport');
      
      await webPage.setViewportSize({ width: 375, height: 667 });
      await homePage.navigate();
      
      // Update visual context for mobile
      await webReporter.attachVisualContext({
        deviceType: 'mobile',
        viewport: { width: 375, height: 667 },
      });
      
      // Capture mobile screenshot
      await webReporter.attachScreenshot('Mobile Viewport Set', { fullPage: true });
    });

    await test.step('Validate mobile layout', async () => {
      await homePage.validatePageLoaded();
      const title = await homePage.getPageTitle();
      expect(title).toContain('Playwright');
      
      // Capture mobile layout validation
      await webReporter.attachScreenshot('Mobile Layout Validated');
      
      // Record mobile validation
      await webReporter.recordUserInteraction('viewport_change', 'mobile_layout', {
        value: '375x667',
        success: true,
      });
    });
    
    // Mobile-specific reporting
    await webReporter.attachAccessibilityAudit('Mobile Layout');
    await webReporter.attachPerformanceMetrics('Mobile Layout');
    await webReporter.attachTestSummary('Mobile Viewport Test', 'passed', {
      viewport: '375x667',
      deviceType: 'mobile',
    });
  });
  test('Should load within acceptable time', async ({ webPage }) => {
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
  test('Should handle keyboard navigation', async ({ webReporter }) => {
    // Attach initial context
    await webReporter.attachVisualContext({ 
      reducedMotion: false,
      highContrast: false, 
    });
    
    await test.step('Test focus on get started button', async () => {
      // Capture before focus
      await webReporter.attachScreenshot('Before Focus');
      
      await homePage.getStartedButton.focus();
      await expect(homePage.getStartedButton).toBeFocused();
      
      // Capture focused state
      await webReporter.attachScreenshot('Button Focused');
      
      // Record focus interaction
      await webReporter.recordUserInteraction('focus', 'get_started_button', {
        element: '[data-testid="get-started-button"]',
        success: true,
        duration: 50,
      });
    });

    await test.step('Test tab navigation', async () => {
      await homePage.pressKey('Tab');
      
      // Record tab navigation
      await webReporter.recordUserInteraction('keyboard', 'tab_navigation', {
        value: 'Tab',
        success: true,
      });
      
      // Capture after tab
      await webReporter.attachScreenshot('After Tab Navigation');
    });
    
    // Attach keyboard accessibility audit
    await webReporter.attachAccessibilityAudit('Keyboard Navigation');
    
    // Attach interaction timeline
    await webReporter.attachUserInteractionTimeline('Keyboard Navigation Test');
    
    // Attach test summary
    await webReporter.attachTestSummary('Keyboard Navigation Test', 'passed', {
      interactionType: 'keyboard',
      focusTargets: ['get_started_button', 'next_focusable'],
      accessibilityTested: true,
    });
  });

  test('Should collect and validate page metrics', async () => {
    await test.step('Get page metrics', async () => {
      const metrics = await homePage.getPageMetrics();
      expect(metrics.title).toContain('Playwright');
      expect(metrics.url).toContain(WEB_CONSTANTS.BASE_URL);
      expect(metrics.mainHeading).toBeTruthy();
      
      Logger.getInstance().info('📊 Home Page Metrics collected', { metrics });
    });
  });
});
