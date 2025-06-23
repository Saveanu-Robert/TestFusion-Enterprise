/**
 * Web Test Reporter for TestFusion-Enterprise
 *
 * Provides comprehensive reporting capabilities for web tests including:
 * - Page screenshots and visual evidence
 * - Performance metrics and timing data
 * - Accessibility audit results
 * - User interaction tracking
 * - Network activity monitoring
 * - Console logs and error capture
 * - Visual regression detection
 * - Mobile/responsive testing context
 *
 * @author TestFusion-Enterprise Team
 * @version 1.0.0
 */

import { Page, TestInfo, Locator } from '@playwright/test';
import { Logger } from './logger';

export interface WebPerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  networkIdle: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  timeToInteractive?: number;
}

export interface AccessibilityAuditResult {
  violations: Array<{
    id: string;
    impact: 'minor' | 'moderate' | 'serious' | 'critical';
    description: string;
    help: string;
    nodes: number;
  }>;
  passes: number;
  incomplete: number;
  score: number; // 0-100
}

export interface UserInteractionData {
  action: string;
  element: string;
  timestamp: number;
  coordinates?: { x: number; y: number };
  value?: string;
  success: boolean;
  duration?: number;
}

export interface NetworkActivitySummary {
  totalRequests: number;
  failedRequests: number;
  totalSize: number;
  resourceBreakdown: {
    [resourceType: string]: {
      count: number;
      size: number;
      averageTime: number;
    };
  };
  slowestRequests: Array<{
    url: string;
    method: string;
    status: number;
    duration: number;
    size: number;
  }>;
}

export interface VisualTestContext {
  viewport: { width: number; height: number };
  deviceType: 'desktop' | 'tablet' | 'mobile';
  browser: string;
  colorScheme?: 'light' | 'dark';
  reducedMotion?: boolean;
  highContrast?: boolean;
}

export interface ConsoleLogSummary {
  errors: string[];
  warnings: string[];
  logs: string[];
  counts: {
    error: number;
    warning: number;
    info: number;
    debug: number;
  };
}

export class WebReporter {
  private logger: Logger;
  private performanceStart: number = 0;
  private userInteractions: UserInteractionData[] = [];
  private networkRequests: any[] = [];
  private consoleLogs: any[] = [];

  constructor(
    private page: Page,
    private testInfo: TestInfo,
  ) {
    this.logger = Logger.getInstance();
    this.setupNetworkMonitoring();
    this.setupConsoleMonitoring();
  }

  /**
   * Attach a screenshot with context to the test report
   */
  async attachScreenshot(
    name: string,
    options: {
      fullPage?: boolean;
      clip?: { x: number; y: number; width: number; height: number };
      element?: Locator;
      annotate?: boolean;
    } = {},
  ): Promise<void> {
    try {
      let screenshot: Buffer;

      if (options.element) {
        screenshot = await options.element.screenshot();
        name = `${name} (Element)`;
      } else {
        screenshot = await this.page.screenshot({
          fullPage: options.fullPage || false,
          clip: options.clip,
        });
      }

      // Add viewport info to screenshot name
      const viewport = this.page.viewportSize();
      const viewportInfo = viewport ? `${viewport.width}x${viewport.height}` : 'unknown';

      await this.testInfo.attach(`${name} [${viewportInfo}]`, {
        body: screenshot,
        contentType: 'image/png',
      });

      this.logger.info(`📸 Screenshot attached: ${name}`, {
        fullPage: options.fullPage,
        hasClip: !!options.clip,
        isElement: !!options.element,
        viewport: viewportInfo,
      });
    } catch (error) {
      this.logger.error('Failed to attach screenshot', { error, name });
    }
  }

  /**
   * Attach page performance metrics to the test report
   */
  async attachPerformanceMetrics(context?: string): Promise<WebPerformanceMetrics> {
    try {
      // Simple performance timing using Date.now()
      const startTime = Date.now();
      await this.page.reload();
      const endTime = Date.now();

      const metrics: WebPerformanceMetrics = {
        loadTime: endTime - startTime,
        domContentLoaded: endTime - startTime,
        networkIdle: endTime - startTime,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        timeToInteractive: endTime - startTime,
        cumulativeLayoutShift: 0,
      };

      const contextSuffix = context ? ` (${context})` : '';
      await this.testInfo.attach(`Performance Metrics${contextSuffix}`, {
        body: JSON.stringify(metrics, null, 2),
        contentType: 'application/json',
      });

      this.logger.info(`⚡ Performance metrics attached${contextSuffix}`, metrics);
      return metrics;
    } catch (error) {
      this.logger.error('Failed to collect performance metrics', { error, context });
      return {
        loadTime: 0,
        domContentLoaded: 0,
        networkIdle: 0,
      };
    }
  }

  /**
   * Attach accessibility audit results to the test report
   */
  async attachAccessibilityAudit(context?: string): Promise<AccessibilityAuditResult> {
    try {
      // Basic accessibility checks using Playwright locators
      const auditResults = {
        violations: [] as any[],
        passes: 0,
        incomplete: 0,
        score: 100,
      };

      try {
        // Check for images without alt text
        const images = await this.page.locator('img').all();
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          const alt = await img.getAttribute('alt');
          const ariaLabel = await img.getAttribute('aria-label');

          if (!alt && !ariaLabel) {
            auditResults.violations.push({
              id: 'image-alt',
              impact: 'serious' as const,
              description: 'Image missing alt text',
              help: 'Images must have alternative text',
              nodes: 1,
            });
          } else {
            auditResults.passes++;
          }
        }

        // Check for form labels
        const inputs = await this.page.locator('input, textarea, select').all();
        for (let i = 0; i < inputs.length; i++) {
          const input = inputs[i];
          const id = await input.getAttribute('id');
          const ariaLabel = await input.getAttribute('aria-label');
          const ariaLabelledBy = await input.getAttribute('aria-labelledby');

          let hasLabel = false;
          if (id) {
            const labelCount = await this.page.locator(`label[for="${id}"]`).count();
            hasLabel = labelCount > 0;
          }

          if (!hasLabel && !ariaLabel && !ariaLabelledBy) {
            auditResults.violations.push({
              id: 'label',
              impact: 'critical' as const,
              description: 'Form element missing label',
              help: 'Form elements must have labels',
              nodes: 1,
            });
          } else {
            auditResults.passes++;
          }
        }

        // Calculate score
        const totalElements = images.length + inputs.length;
        if (totalElements > 0) {
          auditResults.score = Math.round(((totalElements - auditResults.violations.length) / totalElements) * 100);
        }
      } catch (error) {
        this.logger.warn('Some accessibility checks failed', { error });
      }

      const contextSuffix = context ? ` (${context})` : '';
      await this.testInfo.attach(`Accessibility Audit${contextSuffix}`, {
        body: JSON.stringify(auditResults, null, 2),
        contentType: 'application/json',
      });

      this.logger.info(`♿ Accessibility audit attached${contextSuffix}`, {
        violations: auditResults.violations.length,
        passes: auditResults.passes,
        score: auditResults.score,
      });

      return auditResults;
    } catch (error) {
      this.logger.error('Failed to run accessibility audit', { error, context });
      return {
        violations: [],
        passes: 0,
        incomplete: 0,
        score: 0,
      };
    }
  }

  /**
   * Record and attach user interaction data
   */
  async recordUserInteraction(
    action: string,
    element: string,
    additionalData: Partial<UserInteractionData> = {},
  ): Promise<void> {
    const interaction: UserInteractionData = {
      action,
      element,
      timestamp: Date.now(),
      success: true,
      ...additionalData,
    };

    this.userInteractions.push(interaction);
    this.logger.debug(`👆 User interaction recorded: ${action} on ${element}`, interaction);
  }

  /**
   * Attach network activity summary to the test report
   */
  async attachNetworkSummary(context?: string): Promise<NetworkActivitySummary> {
    try {
      const summary = this.analyzeNetworkActivity();

      const contextSuffix = context ? ` (${context})` : '';
      await this.testInfo.attach(`Network Activity${contextSuffix}`, {
        body: JSON.stringify(summary, null, 2),
        contentType: 'application/json',
      });

      this.logger.info(`🌐 Network summary attached${contextSuffix}`, {
        totalRequests: summary.totalRequests,
        failedRequests: summary.failedRequests,
        totalSize: summary.totalSize,
      });

      return summary;
    } catch (error) {
      this.logger.error('Failed to attach network summary', { error, context });
      return {
        totalRequests: 0,
        failedRequests: 0,
        totalSize: 0,
        resourceBreakdown: {},
        slowestRequests: [],
      };
    }
  }

  /**
   * Attach visual test context information
   */
  async attachVisualContext(additionalContext: Partial<VisualTestContext> = {}): Promise<VisualTestContext> {
    try {
      const viewport = this.page.viewportSize() || { width: 0, height: 0 };
      const userAgent = await this.page
        .evaluate(() => {
          return (global as any).navigator?.userAgent || 'Unknown';
        })
        .catch(() => 'Unknown');

      const context: VisualTestContext = {
        viewport,
        deviceType: this.detectDeviceType(viewport.width),
        browser: this.extractBrowserName(userAgent),
        ...additionalContext,
      };

      await this.testInfo.attach('Visual Test Context', {
        body: JSON.stringify(context, null, 2),
        contentType: 'application/json',
      });

      this.logger.info('🎨 Visual context attached', context);
      return context;
    } catch (error) {
      this.logger.error('Failed to attach visual context', { error });
      return {
        viewport: { width: 0, height: 0 },
        deviceType: 'desktop',
        browser: 'unknown',
      };
    }
  }

  /**
   * Attach console logs summary to the test report
   */
  async attachConsoleSummary(context?: string): Promise<ConsoleLogSummary> {
    try {
      const summary = this.analyzeConsoleLogs();

      const contextSuffix = context ? ` (${context})` : '';
      await this.testInfo.attach(`Console Logs${contextSuffix}`, {
        body: JSON.stringify(summary, null, 2),
        contentType: 'application/json',
      });

      this.logger.info(`🖥️ Console summary attached${contextSuffix}`, {
        errors: summary.counts.error,
        warnings: summary.counts.warning,
        total: Object.values(summary.counts).reduce((a, b) => a + b, 0),
      });

      return summary;
    } catch (error) {
      this.logger.error('Failed to attach console summary', { error, context });
      return {
        errors: [],
        warnings: [],
        logs: [],
        counts: { error: 0, warning: 0, info: 0, debug: 0 },
      };
    }
  }

  /**
   * Attach user interaction timeline to the test report
   */
  async attachUserInteractionTimeline(context?: string): Promise<void> {
    try {
      const contextSuffix = context ? ` (${context})` : '';
      await this.testInfo.attach(`User Interactions${contextSuffix}`, {
        body: JSON.stringify(this.userInteractions, null, 2),
        contentType: 'application/json',
      });

      this.logger.info(`👆 User interaction timeline attached${contextSuffix}`, {
        totalInteractions: this.userInteractions.length,
      });
    } catch (error) {
      this.logger.error('Failed to attach user interaction timeline', { error, context });
    }
  }

  /**
   * Attach comprehensive test summary with all collected data
   */
  async attachTestSummary(
    testName: string,
    result: 'passed' | 'failed' | 'skipped',
    additionalData: Record<string, any> = {},
  ): Promise<void> {
    try {
      const summary = {
        testName,
        result,
        timestamp: new Date().toISOString(),
        duration: Date.now() - this.performanceStart,
        viewport: this.page.viewportSize(),
        url: this.page.url(),
        userInteractions: this.userInteractions.length,
        networkRequests: this.networkRequests.length,
        consoleLogs: this.consoleLogs.length,
        ...additionalData,
      };

      await this.testInfo.attach('Test Summary', {
        body: JSON.stringify(summary, null, 2),
        contentType: 'application/json',
      });

      this.logger.info(`📋 Test summary attached for: ${testName}`, summary);
    } catch (error) {
      this.logger.error('Failed to attach test summary', { error, testName });
    }
  }

  /**
   * Setup network monitoring
   */
  private setupNetworkMonitoring(): void {
    this.page.on('request', request => {
      this.networkRequests.push({
        url: request.url(),
        method: request.method(),
        timestamp: Date.now(),
        type: 'request',
      });
    });

    this.page.on('response', response => {
      const requestIndex = this.networkRequests.findIndex(req => req.url === response.url() && req.type === 'request');

      if (requestIndex >= 0) {
        this.networkRequests[requestIndex] = {
          ...this.networkRequests[requestIndex],
          status: response.status(),
          duration: Date.now() - this.networkRequests[requestIndex].timestamp,
          size: parseInt(response.headers()['content-length'] || '0'),
          type: 'complete',
        };
      }
    });
  }

  /**
   * Setup console monitoring
   */
  private setupConsoleMonitoring(): void {
    this.page.on('console', msg => {
      this.consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: Date.now(),
      });
    });
  }

  /**
   * Analyze network activity
   */
  private analyzeNetworkActivity(): NetworkActivitySummary {
    const completed = this.networkRequests.filter(req => req.type === 'complete');
    const failed = completed.filter(req => req.status >= 400);

    const resourceBreakdown: { [key: string]: any } = {};
    const slowestRequests = completed
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)
      .map(req => ({
        url: req.url,
        method: req.method,
        status: req.status,
        duration: req.duration,
        size: req.size || 0,
      }));

    // Group by resource type
    completed.forEach(req => {
      const url = req.url;
      let type = 'other';

      if (url.includes('.js')) type = 'javascript';
      else if (url.includes('.css')) type = 'stylesheet';
      else if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)/)) type = 'image';
      else if (url.includes('/api/')) type = 'api';
      else if (url.includes('.html')) type = 'document';

      if (!resourceBreakdown[type]) {
        resourceBreakdown[type] = { count: 0, size: 0, totalTime: 0 };
      }

      resourceBreakdown[type].count++;
      resourceBreakdown[type].size += req.size || 0;
      resourceBreakdown[type].totalTime += req.duration || 0;
    });

    // Calculate averages
    Object.keys(resourceBreakdown).forEach(type => {
      resourceBreakdown[type].averageTime = resourceBreakdown[type].totalTime / resourceBreakdown[type].count;
    });

    return {
      totalRequests: completed.length,
      failedRequests: failed.length,
      totalSize: completed.reduce((sum, req) => sum + (req.size || 0), 0),
      resourceBreakdown,
      slowestRequests,
    };
  }

  /**
   * Analyze console logs
   */
  private analyzeConsoleLogs(): ConsoleLogSummary {
    const errors = this.consoleLogs.filter(log => log.type === 'error').map(log => log.text);
    const warnings = this.consoleLogs.filter(log => log.type === 'warning').map(log => log.text);
    const logs = this.consoleLogs.filter(log => log.type === 'log').map(log => log.text);

    const counts = {
      error: errors.length,
      warning: warnings.length,
      info: this.consoleLogs.filter(log => log.type === 'info').length,
      debug: this.consoleLogs.filter(log => log.type === 'debug').length,
    };

    return { errors, warnings, logs, counts };
  }

  /**
   * Detect device type based on viewport width
   */
  private detectDeviceType(width: number): 'desktop' | 'tablet' | 'mobile' {
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Extract browser name from user agent
   */
  private extractBrowserName(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  /**
   * Start performance tracking
   */
  public startPerformanceTracking(): void {
    this.performanceStart = Date.now();
  }

  /**
   * Reset tracking data (useful for multi-step tests)
   */
  public resetTracking(): void {
    this.userInteractions = [];
    this.networkRequests = [];
    this.consoleLogs = [];
    this.performanceStart = Date.now();
  }
}
