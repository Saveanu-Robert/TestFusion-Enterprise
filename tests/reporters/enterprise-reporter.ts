/**
 * Enterprise HTML Reporter for Playwright Tests
 * Generates comprehensive, professional-grade test reports without external dependencies
 */

import { Reporter, TestCase, TestResult, FullResult, Suite } from '@playwright/test/reporter';
import * as fs from 'fs-extra';
import * as path from 'path';

interface TestMetrics {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
  duration: number;
  passRate: number;
}

interface BrowserMetrics {
  [browser: string]: {
    total: number;
    passed: number;
    failed: number;
    duration: number;
  };
}

interface ApiMetrics {
  total: number;
  passed: number;
  failed: number;
  duration: number;
  passRate: number;
}

interface SuiteMetrics {
  name: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  passRate: number;
}

interface FailureDetails {
  test: string;
  suite: string;
  browser: string;
  error: string;
  duration: number;
  retry: number;
}

export class EnterpriseReporter implements Reporter {
  private startTime: Date = new Date();
  private endTime: Date = new Date();
  private tests: TestCase[] = [];
  private results: Map<TestCase, TestResult[]> = new Map();
  private outputDir: string;
  constructor(options: { outputDir?: string } = {}) {
    // Load configuration from package.json
    const packageJson = this.loadPackageConfig();
    this.outputDir = options.outputDir || packageJson.config.reporting.outputDir;
  }
  onBegin(config: any, suite: Suite) {
    this.startTime = new Date();
    console.log(`🚀 Starting Enterprise Test Execution at ${this.startTime.toISOString()}`);
    console.log(`📁 Output directory: ${path.resolve(this.outputDir)}`);
    
    // Count projects and suites
    const projects = config.projects.map((p: any) => p.name).join(', ');
    console.log(`🎯 Projects: ${projects}`);
    
    // Count total tests
    const totalTests = this.countTotalTests(suite);
    console.log(`📋 Total tests to run: ${totalTests}`);
    console.log(`${'='.repeat(50)}`);
    
    // Ensure output directory exists
    fs.ensureDirSync(this.outputDir);
  }  onTestBegin(test: TestCase) {
    this.tests.push(test);
    const projectName = this.getProjectName(test);
    const suiteName = test.parent.title;
    console.log(`🧪 Running: [${projectName}] ${suiteName} > ${test.title}`);
  }  onTestEnd(test: TestCase, result: TestResult) {
    const existingResults = this.results.get(test) || [];
    existingResults.push(result);
    this.results.set(test, existingResults);
    
    const projectName = this.getProjectName(test);
    const statusIcon = result.status === 'passed' ? '✅' : 
                      result.status === 'failed' ? '❌' : 
                      result.status === 'skipped' ? '⏭️' : 
                      result.status === 'timedOut' ? '⏰' : '⚠️';
    const duration = (result.duration / 1000).toFixed(2);
    
    console.log(`${statusIcon} [${projectName}] ${test.title} (${duration}s)`);
  }
  async onEnd(result: FullResult) {
    this.endTime = new Date();
    const duration = ((this.endTime.getTime() - this.startTime.getTime()) / 1000).toFixed(1);
    
    console.log(`\n🏁 Test execution completed at ${this.endTime.toISOString()}`);
    console.log(`⏱️  Total execution time: ${duration}s`);
    
    await this.generateEnterpriseReport(result);
    
    // Print detailed summary
    this.printConsoleSummary();
    
    console.log(`\n📊 Enterprise report generated in: ${path.resolve(this.outputDir)}`);
    console.log(`📄 Files generated:`);
    console.log(`   📊 enterprise-report.html - Interactive HTML report`);
    console.log(`   📋 executive-summary.md - Executive summary`);
    console.log(`   📊 test-data.json - Raw test data`);
  }

  private async generateEnterpriseReport(result: FullResult) {
    const metrics = this.calculateMetrics();
    const browserMetrics = this.calculateBrowserMetrics();
    const suiteMetrics = this.calculateSuiteMetrics();
    const apiMetrics = this.calculateApiMetrics();
    const failures = this.extractFailureDetails();
    const environment = this.getEnvironmentInfo();

    const htmlContent = this.generateHTMLReport({
      metrics,
      browserMetrics,
      suiteMetrics,
      apiMetrics,
      failures,
      environment,
      summary: result
    });

    // Generate main report
    await fs.writeFile(
      path.join(this.outputDir, 'enterprise-report.html'),
      htmlContent
    );

    // Generate JSON data for potential integrations
    await fs.writeFile(
      path.join(this.outputDir, 'test-data.json'),
      JSON.stringify({
        timestamp: this.endTime.toISOString(),
        metrics,
        browserMetrics,
        suiteMetrics,
        apiMetrics,
        failures,
        environment,
        summary: result
      }, null, 2)
    );

    // Generate executive summary
    await this.generateExecutiveSummary(metrics, failures);
  }

  private calculateMetrics(): TestMetrics {
    let total = 0;
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    let flaky = 0;
    let totalDuration = 0;

    for (const [test, results] of this.results) {
      total++;
      const lastResult = results[results.length - 1];
      totalDuration += lastResult.duration;      if (lastResult.status === 'passed') {
        passed++;
        if (results.length > 1) flaky++;
      } else if (lastResult.status === 'failed' || lastResult.status === 'timedOut') {
        failed++;
      } else if (lastResult.status === 'skipped') {
        skipped++;
      }
    }

    return {
      total,
      passed,
      failed,
      skipped,
      flaky,
      duration: totalDuration,
      passRate: total > 0 ? (passed / total) * 100 : 0
    };
  }  private calculateBrowserMetrics(): BrowserMetrics {
    const browserMetrics: BrowserMetrics = {};

    for (const [test, results] of this.results) {
      const projectName = this.getProjectName(test);
      
      // Skip API tests from browser metrics - they don't use browsers
      if (projectName === 'api') {
        continue;
      }
      
      if (!browserMetrics[projectName]) {
        browserMetrics[projectName] = { total: 0, passed: 0, failed: 0, duration: 0 };
      }

      const lastResult = results[results.length - 1];
      browserMetrics[projectName].total++;
      browserMetrics[projectName].duration += lastResult.duration;

      if (lastResult.status === 'passed') {
        browserMetrics[projectName].passed++;
      } else if (lastResult.status === 'failed' || lastResult.status === 'timedOut') {
        browserMetrics[projectName].failed++;
      }
    }

    return browserMetrics;
  }

  private calculateApiMetrics(): ApiMetrics {
    const apiMetrics: ApiMetrics = {
      total: 0,
      passed: 0,
      failed: 0,
      duration: 0,
      passRate: 0
    };

    for (const [test, results] of this.results) {
      const projectName = this.getProjectName(test);
      
      // Only include API tests
      if (projectName !== 'api') {
        continue;
      }

      const lastResult = results[results.length - 1];
      apiMetrics.total++;
      apiMetrics.duration += lastResult.duration;      if (lastResult.status === 'passed') {
        apiMetrics.passed++;
      } else if (lastResult.status === 'failed' || lastResult.status === 'timedOut') {
        apiMetrics.failed++;
      }
    }

    apiMetrics.passRate = apiMetrics.total > 0 ? (apiMetrics.passed / apiMetrics.total) * 100 : 0;
    return apiMetrics;
  }

  private calculateSuiteMetrics(): SuiteMetrics[] {
    const suiteMap = new Map<string, SuiteMetrics>();

    for (const [test, results] of this.results) {
      const suiteName = this.getSuiteName(test);
      
      if (!suiteMap.has(suiteName)) {
        suiteMap.set(suiteName, {
          name: suiteName,
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
          duration: 0,
          passRate: 0
        });
      }

      const suite = suiteMap.get(suiteName)!;
      const lastResult = results[results.length - 1];
      
      suite.total++;
      suite.duration += lastResult.duration;      if (lastResult.status === 'passed') {
        suite.passed++;
      } else if (lastResult.status === 'failed' || lastResult.status === 'timedOut') {
        suite.failed++;
      } else if (lastResult.status === 'skipped') {
        suite.skipped++;
      }
    }

    // Calculate pass rates
    for (const suite of suiteMap.values()) {
      suite.passRate = suite.total > 0 ? (suite.passed / suite.total) * 100 : 0;
    }

    return Array.from(suiteMap.values()).sort((a, b) => b.passRate - a.passRate);
  }

  private extractFailureDetails(): FailureDetails[] {
    const failures: FailureDetails[] = [];

    for (const [test, results] of this.results) {
      results.forEach((result, index) => {        if (result.status === 'failed' || result.status === 'timedOut') {
          failures.push({
            test: test.title,
            suite: this.getSuiteName(test),
            browser: this.getProjectName(test),
            error: result.error?.message || (result.status === 'timedOut' ? 'Test timed out' : 'Unknown error'),
            duration: result.duration,
            retry: index
          });
        }
      });
    }

    return failures;  }

  private getEnvironmentInfo() {
    // Load configuration from package.json - FAIL if missing
    let packageJson: any;
    let reportingConfig: any;
    
    try {
      packageJson = require(path.join(process.cwd(), 'package.json'));
      reportingConfig = packageJson.config?.reporting;
      
      if (!reportingConfig) {
        throw new Error('Missing "config.reporting" section in package.json');
      }
      
      if (!packageJson.version) {
        throw new Error('Missing "version" in package.json');
      }    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to load configuration from package.json: ${errorMessage}`);
    }

    // Detect CI/CD environment
    const isCiEnvironment = reportingConfig.ciEnvironmentVariables?.some((envVar: string) => 
      process.env[envVar] === 'true' || process.env[envVar] === '1' || !!process.env[envVar]
    );

    // Get branch information - FAIL if not configured
    let branch = reportingConfig.defaultBranch;
    if (!branch) {
      throw new Error('Missing "defaultBranch" in config.reporting');
    }

    // Override with CI environment variables if available
    for (const envVar of (reportingConfig.branchEnvironmentVariables || [])) {
      if (process.env[envVar]) {
        branch = process.env[envVar];
        break;
      }
    }

    // Try to get local git branch if not in CI and not already set from env
    if (!isCiEnvironment && branch === reportingConfig.defaultBranch) {
      try {
        const { execSync } = require('child_process');
        const gitBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
        if (gitBranch) {
          branch = gitBranch;
        }
      } catch (e) {
        // Keep default branch if git command fails
      }
    }

    // Get run ID - FAIL if not configured
    let runId = reportingConfig.defaultRunId;
    if (!runId) {
      throw new Error('Missing "defaultRunId" in config.reporting');
    }

    // Override with CI environment variables if available
    for (const envVar of (reportingConfig.runIdEnvironmentVariables || [])) {
      if (process.env[envVar]) {
        runId = process.env[envVar];
        break;
      }
    }

    // Get environment - FAIL if not configured
    const environment = reportingConfig.environment;
    if (!environment) {
      throw new Error('Missing "environment" in config.reporting');
    }

    return {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      ci: isCiEnvironment ? 'true' : 'false',
      timestamp: this.endTime.toISOString(),
      testEnv: environment,
      apiBaseUrl: this.getRequiredEnvVar('API_BASE_URL'),
      runId,
      frameworkVersion: packageJson.version,
      branch
    };
  }

  private generateHTMLReport(data: any): string {
    const { metrics, browserMetrics, suiteMetrics, apiMetrics, failures, environment } = data;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TestFusion Enterprise Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        
        .header h1 {
            color: #2c3e50;
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .header .subtitle {
            color: #7f8c8d;
            font-size: 1.2em;
            margin-bottom: 20px;
        }
        
        .execution-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        
        .info-item {
            background: rgba(52, 152, 219, 0.1);
            padding: 15px;
            border-radius: 10px;
            text-align: center;
        }
        
        .info-item .label {
            font-weight: 600;
            color: #2c3e50;
            display: block;
            margin-bottom: 5px;
        }
        
        .info-item .value {
            color: #34495e;
            font-size: 1.1em;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .metric-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
        }
        
        .metric-card:hover {
            transform: translateY(-5px);
        }
        
        .metric-card h3 {
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 1.4em;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 10px;
        }
        
        .metric-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #ecf0f1;
        }
        
        .metric-row:last-child {
            border-bottom: none;
        }
        
        .metric-label {
            font-weight: 500;
            color: #34495e;
        }
        
        .metric-value {
            font-weight: 600;
            font-size: 1.1em;
        }
        
        .metric-value.passed { color: #27ae60; }
        .metric-value.failed { color: #e74c3c; }
        .metric-value.skipped { color: #f39c12; }
        .metric-value.flaky { color: #9b59b6; }
        
        .pass-rate {
            text-align: center;
            margin: 20px 0;
        }
          .pass-rate-circle {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            margin: 0 auto 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8em;
            font-weight: 700;
            color: white;
        }
        
        .pass-rate-circle.all-passed {
            background: conic-gradient(#27ae60 100%);
        }
        
        .pass-rate-circle.mixed {
            background: conic-gradient(#27ae60 0deg var(--pass-angle), #e74c3c var(--pass-angle) 360deg);
        }
        
        .pass-rate-circle.all-failed {
            background: conic-gradient(#e74c3c 100%);
        }
        
        .browser-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .browser-item {
            background: rgba(255, 255, 255, 0.9);
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .browser-name {
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 10px;
            text-transform: capitalize;
        }
        
        .browser-stats {
            display: flex;
            justify-content: space-around;
            margin-top: 10px;
        }
        
        .browser-stat {
            text-align: center;
        }
        
        .browser-stat .number {
            font-weight: 700;
            font-size: 1.2em;
            display: block;
        }
        
        .browser-stat .label {
            font-size: 0.9em;
            color: #7f8c8d;
        }
        
        .failure-section {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 30px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        .failure-item {
            background: #fdf2f2;
            border-left: 4px solid #e74c3c;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 8px;
        }
        
        .failure-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .failure-test {
            font-weight: 600;
            color: #2c3e50;
        }
        
        .failure-browser {
            background: #e74c3c;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
        }
        
        .failure-error {
            background: #fff;
            padding: 10px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            color: #c0392b;
            margin-top: 10px;
            border: 1px solid #fadbd8;
        }
        
        .suite-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .suite-table th,
        .suite-table td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #ecf0f1;
        }
        
        .suite-table th {
            background: #34495e;
            color: white;
            font-weight: 600;
        }
        
        .suite-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        .suite-table tr:hover {
            background: #e3f2fd;
        }
          .progress-bar {
            width: 100%;
            height: 8px;
            background: #ecf0f1;
            border-radius: 4px;
            overflow: hidden;
            margin-top: 5px;
            position: relative;
        }
        
        .progress-fill {
            height: 100%;
            transition: width 0.3s ease;
            position: absolute;
            top: 0;
            left: 0;
        }
        
        .progress-fill.passed {
            background: linear-gradient(90deg, #27ae60, #2ecc71);
            z-index: 1;
        }
        
        .progress-fill.failed {
            background: linear-gradient(90deg, #e74c3c, #c0392b);
            z-index: 2;
            left: auto;
            right: 0;
        }
        
        .progress-fill.success {
            background: linear-gradient(90deg, #27ae60, #2ecc71);
        }
        
        .progress-fill.warning {
            background: linear-gradient(90deg, #f39c12, #e67e22);
        }
        
        .progress-fill.danger {
            background: linear-gradient(90deg, #e74c3c, #c0392b);
        }
        
        .duration {
            color: #7f8c8d;
            font-size: 0.9em;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            color: rgba(255, 255, 255, 0.8);
        }
        
        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .status-passed {
            background: #d5f4e6;
            color: #27ae60;
        }
        
        .status-failed {
            background: #fdf2f2;
            color: #e74c3c;
        }
        
        .status-mixed {
            background: #fff3cd;
            color: #856404;
        }
        
        .api-metrics {
            display: grid;
            grid-template-columns: 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .api-item {
            background: rgba(255, 255, 255, 0.9);
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            border-left: 4px solid #3498db;
        }
        
        .api-name {
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 10px;
            font-size: 1.1em;
        }
        
        .api-stats {
            display: flex;
            justify-content: space-around;
            margin-top: 10px;
        }
        
        .api-stat {
            text-align: center;
        }

        /* Feature Cards Styles */
        .features-container {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .feature-card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            border-left: 4px solid #3498db;
        }
        
        .feature-card.failed {
            border-left-color: #e74c3c;
        }
        
        .feature-card.warning {
            border-left-color: #f39c12;
        }
        
        .feature-header {
            padding: 20px;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }
        
        .feature-header:hover {
            background-color: rgba(52, 152, 219, 0.1);
        }
        
        .feature-title {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
        }
        
        .feature-icon {
            font-size: 1.2em;
        }
        
        .feature-title h4 {
            flex: 1;
            margin: 0;
            color: #2c3e50;
            font-size: 1.1em;
        }
        
        .toggle-icon {
            color: #7f8c8d;
            transition: transform 0.3s ease;
        }
        
        .feature-card.expanded .toggle-icon {
            transform: rotate(180deg);
        }
        
        .feature-summary {
            display: flex;
            align-items: center;
            gap: 15px;
            flex-wrap: wrap;
        }
        
        .feature-summary span {
            font-size: 0.9em;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: 500;
        }
        
        .feature-summary .total {
            background: #ecf0f1;
            color: #2c3e50;
        }
        
        .feature-summary .passed {
            background: #d5f4e6;
            color: #27ae60;
        }
        
        .feature-summary .failed {
            background: #fadbd8;
            color: #e74c3c;
        }
        
        .feature-summary .skipped {
            background: #fdeaa7;
            color: #f39c12;
        }
        
        .feature-summary .duration {
            background: #e3f2fd;
            color: #2196f3;
        }
        
        .feature-progress {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-left: auto;
        }
        
        .feature-progress .progress-bar {
            width: 80px;
            height: 8px;
        }
        
        .feature-progress .pass-rate {
            font-weight: 600;
            color: #2c3e50;
            min-width: 45px;
        }
        
        .feature-details {
            display: none;
            padding: 0 20px 20px;
            background: rgba(248, 249, 250, 0.8);
            border-top: 1px solid rgba(52, 152, 219, 0.2);
        }
        
        .feature-card.expanded .feature-details {
            display: block;
        }
        
        .tests-list, .failures-list {
            margin-bottom: 20px;
        }
        
        .tests-list h5, .failures-list h5 {
            margin: 0 0 10px 0;
            color: #2c3e50;
            font-size: 1em;
        }
          .test-item {
            display: block;
            margin: 5px 0;
            border-radius: 6px;
            background: white;
            border-left: 3px solid #ecf0f1;
            overflow: hidden;
        }
        
        .test-header {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 12px;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }
        
        .test-header:hover {
            background: rgba(0, 0, 0, 0.05);
        }
        
        .test-item.passed {
            border-left-color: #27ae60;
            background: rgba(39, 174, 96, 0.05);
        }
        
        .test-item.failed, .test-item.timedOut {
            border-left-color: #e74c3c;
            background: rgba(231, 76, 60, 0.05);
        }
        
        .test-item.skipped {
            border-left-color: #f39c12;
            background: rgba(243, 156, 18, 0.05);
        }
        
        .test-status-icon {
            font-size: 0.9em;
        }
        
        .test-name {
            flex: 1;
            font-weight: 500;
            color: #2c3e50;
        }
        
        .test-duration {
            font-size: 0.85em;
            color: #7f8c8d;
            min-width: 50px;
        }
        
        .test-project {
            font-size: 0.8em;
            padding: 2px 6px;
            background: #e8f4fd;
            color: #2196f3;
            border-radius: 3px;
            font-weight: 500;
        }
        
        .test-error-container {
            border-top: 1px solid #fadbd8;
            background: #fdf2f2;
            padding: 15px;
            display: none;
        }
        
        .test-error-container.show {
            display: block;
        }
        
        .test-error {
            background: white;
            padding: 10px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            color: #c0392b;
            border: 1px solid #fadbd8;
            white-space: pre-wrap;
        }
        
        .dropdown-arrow {
            font-size: 0.8em;
            color: #7f8c8d;
            transition: transform 0.2s ease;
        }
        
        .test-item.expanded .dropdown-arrow {
            transform: rotate(90deg);
        }
        
        .failure-detail {
            background: white;
            border: 1px solid #fadbd8;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 10px;
        }
        
        .failure-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
            flex-wrap: wrap;
        }
        
        .failure-header strong {
            flex: 1;
            color: #e74c3c;
        }
        
        .browser-tag {
            background: #3498db;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: 500;
        }
        
        .failure-duration {
            font-size: 0.85em;
            color: #7f8c8d;
        }
        
        .failure-error {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            padding: 10px;
            margin-top: 10px;
        }
        
        .failure-error code {
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 0.85em;
            color: #dc3545;
            white-space: pre-wrap;
            word-break: break-word;
        }

        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            
            .metrics-grid {
                grid-template-columns: 1fr;
            }
            
            .browser-grid {
                grid-template-columns: 1fr;
            }
            
            .execution-info {
                grid-template-columns: 1fr;
            }
        }

        .test-error-item {
            margin-bottom: 10px;
        }
        
        .test-error-item:last-child {
            margin-bottom: 0;
        }
        
        .error-browser-tag {
            font-size: 0.8em;
            font-weight: 600;
            color: #e74c3c;
            margin-bottom: 5px;
        }
        
        .error-duration {
            font-size: 0.8em;
            color: #7f8c8d;
            margin-bottom: 5px;
        }
        
        .test-item.has-errors .test-header {
            cursor: pointer;
        }
        
        .test-item.has-errors .test-header:hover {
            background: rgba(0, 0, 0, 0.05);
        }

        .filter-container {
            margin-bottom: 20px;
            padding: 15px;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .filter-title {
            font-size: 1.1em;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .filter-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        
        .filter-btn {
            padding: 6px 12px;
            border: 2px solid transparent;
            border-radius: 20px;
            background: #ecf0f1;
            color: #2c3e50;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.9em;
            font-weight: 500;
        }
        
        .filter-btn:hover {
            background: #d5dbdb;
            transform: translateY(-1px);
        }
        
        .filter-btn.active {
            background: #3498db;
            color: white;
            border-color: #2980b9;
        }
        
        .filter-btn.all.active {
            background: #34495e;
            border-color: #2c3e50;
        }
        
        .filter-btn.passed.active {
            background: #27ae60;
            border-color: #229954;
        }
        
        .filter-btn.failed.active {
            background: #e74c3c;
            border-color: #c0392b;
        }
        
        .filter-btn.skipped.active {
            background: #f39c12;
            border-color: #e67e22;
        }
        
        .test-item.hidden {
            display: none !important;
        }
        
        .feature-card.empty {
            opacity: 0.5;
        }
        
        .filter-count {
            font-weight: 600;
            margin-left: 5px;
        }

        .pie-chart {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            position: relative;
            margin: 10px auto;
        }
        
        .pie-chart.all-passed {
            background: conic-gradient(#27ae60 100%);
        }
          .pie-chart.mixed {
            background: conic-gradient(#27ae60 0deg, #27ae60 var(--passed-angle), #e74c3c var(--passed-angle), #e74c3c 360deg);
        }
        
        .pie-chart.all-failed {
            background: conic-gradient(#e74c3c 100%);
        }
        
        .pie-chart::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 30px;
            height: 30px;
            background: white;
            border-radius: 50%;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 TestFusion Enterprise</h1>
            <div class="subtitle">Comprehensive Test Execution Report</div>
            
            <div class="execution-info">
                <div class="info-item">
                    <span class="label">Execution Date</span>
                    <span class="value">${this.formatDate(this.endTime)}</span>
                </div>
                <div class="info-item">
                    <span class="label">Duration</span>
                    <span class="value">${this.formatDuration(this.endTime.getTime() - this.startTime.getTime())}</span>
                </div>
                <div class="info-item">
                    <span class="label">Environment</span>
                    <span class="value">${environment.testEnv.toUpperCase()}</span>
                </div>
                <div class="info-item">
                    <span class="label">Platform</span>
                    <span class="value">${environment.platform} ${environment.arch}</span>
                </div>
                <div class="info-item">
                    <span class="label">Node Version</span>
                    <span class="value">${environment.nodeVersion}</span>
                </div>
                <div class="info-item">
                    <span class="label">CI/CD</span>
                    <span class="value">${environment.ci === 'true' ? 'Yes' : 'Local'}</span>
                </div>
            </div>
        </div>
        
        <div class="metrics-grid">
            <div class="metric-card">                <h3>📊 Overall Results</h3>
                
                <div class="pie-chart ${this.getPieChartClass(metrics.passRate, metrics.failed)}" ${this.getPieChartStyle(metrics.passRate)}></div>
                
                <div class="metric-row">
                    <span class="metric-label">Total Tests</span>
                    <span class="metric-value">${metrics.total}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Passed</span>
                    <span class="metric-value passed">${metrics.passed}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Failed</span>
                    <span class="metric-value failed">${metrics.failed}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Skipped</span>
                    <span class="metric-value skipped">${metrics.skipped}</span>
                </div>
                ${metrics.flaky > 0 ? `
                <div class="metric-row">
                    <span class="metric-label">Flaky</span>
                    <span class="metric-value flaky">${metrics.flaky}</span>
                </div>
                ` : ''}
                <div class="metric-row">
                    <span class="metric-label">Total Duration</span>
                    <span class="metric-value">${this.formatDuration(metrics.duration)}</span>
                </div>
                  <div class="pass-rate">
                    <div class="pass-rate-circle ${this.getPieChartClass(metrics.passRate, metrics.failed)}" style="--pass-angle: ${(metrics.passRate / 100) * 360}deg">
                        ${metrics.passRate.toFixed(1)}%
                    </div>
                    <div class="status-badge ${this.getOverallStatus(metrics)}">
                        ${this.getOverallStatusText(metrics)}
                    </div>
                </div>            </div>
            
            ${apiMetrics.total > 0 ? `
            <div class="metric-card">
                <h3>🔗 API Results</h3>
                <div class="api-metrics">
                    <div class="api-item">
                        <div class="api-name">API Tests</div>
                        <div class="api-stats">
                            <div class="api-stat">
                                <span class="number passed">${apiMetrics.passed}</span>
                                <span class="label">Passed</span>
                            </div>
                            <div class="api-stat">
                                <span class="number failed">${apiMetrics.failed}</span>
                                <span class="label">Failed</span>
                            </div>
                            <div class="api-stat">
                                <span class="number">${apiMetrics.total}</span>
                                <span class="label">Total</span>
                            </div>
                        </div>                        <div class="progress-bar">
                            <div class="progress-fill passed" style="width: ${apiMetrics.passRate}%"></div>
                            ${apiMetrics.failed > 0 ? `<div class="progress-fill failed" style="width: ${100 - apiMetrics.passRate}%"></div>` : ''}
                        </div>
                        <div class="duration">${this.formatDuration(apiMetrics.duration)}</div>
                    </div>
                </div>
            </div>
            ` : ''}
            
            ${Object.keys(browserMetrics).length > 0 ? `
            <div class="metric-card">
                <h3>🌐 Browser Results</h3><div class="browser-grid">
                    ${Object.entries(browserMetrics).map(([browser, stats]: [string, any]) => `
                        <div class="browser-item">
                            <div class="browser-name">${browser}</div>
                            <div class="browser-stats">
                                <div class="browser-stat">
                                    <span class="number passed">${stats.passed}</span>
                                    <span class="label">Passed</span>
                                </div>
                                <div class="browser-stat">
                                    <span class="number failed">${stats.failed}</span>
                                    <span class="label">Failed</span>
                                </div>
                                <div class="browser-stat">
                                    <span class="number">${stats.total}</span>
                                    <span class="label">Total</span>
                                </div>
                            </div>                            <div class="progress-bar">
                                <div class="progress-fill passed" style="width: ${stats.total > 0 ? (stats.passed / stats.total) * 100 : 0}%"></div>
                                ${stats.failed > 0 ? `<div class="progress-fill failed" style="width: ${stats.total > 0 ? (stats.failed / stats.total) * 100 : 0}%"></div>` : ''}
                            </div>
                            <div class="duration">${this.formatDuration(stats.duration)}</div>
                        </div>                    `).join('')}
                </div>
            </div>
            ` : ''}
        </div>          <div class="metric-card">
            <h3>📋 Features Overview</h3>
            
            <div class="filter-container">
                <div class="filter-title">Filter Tests:</div>
                <div class="filter-buttons">
                    <button class="filter-btn all active" onclick="filterTests('all')">
                        All <span class="filter-count">(${metrics.total})</span>
                    </button>
                    <button class="filter-btn passed" onclick="filterTests('passed')">
                        ✅ Passed <span class="filter-count">(${metrics.passed})</span>
                    </button>
                    <button class="filter-btn failed" onclick="filterTests('failed')">
                        ❌ Failed <span class="filter-count">(${metrics.failed})</span>
                    </button>
                    ${metrics.skipped > 0 ? `
                    <button class="filter-btn skipped" onclick="filterTests('skipped')">
                        ⏭️ Skipped <span class="filter-count">(${metrics.skipped})</span>
                    </button>
                    ` : ''}
                </div>
            </div>
            
            <div class="features-container">
                ${suiteMetrics.map((suite: SuiteMetrics) => {
                    const suiteTests = this.getTestsForSuite(suite.name);
                    const suiteFailures = failures.filter((f: FailureDetails) => f.suite === suite.name);
                    const statusIcon = suite.passRate === 100 ? '✅' : suite.failed > 0 ? '❌' : '⚠️';
                    
                    return `
                    <div class="feature-card">
                        <div class="feature-header" onclick="toggleFeature('${suite.name.replace(/[^a-zA-Z0-9]/g, '-')}')">
                            <div class="feature-title">
                                <span class="feature-icon">${statusIcon}</span>
                                <h4>${suite.name}</h4>
                                <span class="toggle-icon">▼</span>
                            </div>
                            <div class="feature-summary">
                                <span class="total">${suite.total} tests</span>
                                <span class="passed">${suite.passed} passed</span>
                                ${suite.failed > 0 ? `<span class="failed">${suite.failed} failed</span>` : ''}
                                ${suite.skipped > 0 ? `<span class="skipped">${suite.skipped} skipped</span>` : ''}
                                <span class="duration">${this.formatDuration(suite.duration)}</span>
                                <div class="feature-progress">                                    <div class="progress-bar">
                                        <div class="progress-fill passed" style="width: ${suite.passRate}%"></div>
                                        ${suite.failed > 0 ? `<div class="progress-fill failed" style="width: ${100 - suite.passRate}%"></div>` : ''}
                                    </div>
                                    <span class="pass-rate">${suite.passRate.toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>                        <div class="feature-details" id="feature-${suite.name.replace(/[^a-zA-Z0-9]/g, '-')}">
                            <div class="tests-list">
                                <h5>📝 Individual Tests</h5>
                                ${suiteTests.map((test: any) => {
                                    const testFailures = suiteFailures.filter((f: FailureDetails) => 
                                        f.test === test.title && f.browser === test.project
                                    );
                                    const hasErrors = testFailures.length > 0;
                                    const testId = `${test.title.replace(/[^a-zA-Z0-9]/g, '-')}-${test.project}`;
                                    
                                    return `
                                    <div class="test-item ${test.status} ${hasErrors ? 'has-errors' : ''}" data-test-id="${testId}">
                                        <div class="test-header" ${hasErrors ? `onclick="toggleTestError('${testId}')"` : ''}>
                                            <span class="test-status-icon">${test.status === 'passed' ? '✅' : test.status === 'failed' || test.status === 'timedOut' ? '❌' : '⏭️'}</span>
                                            <span class="test-name">${test.title}</span>
                                            <span class="test-duration">${this.formatDuration(test.duration)}</span>
                                            ${test.project ? `<span class="test-project">[${test.project}]</span>` : ''}
                                            ${hasErrors ? '<span class="dropdown-arrow">▶</span>' : ''}
                                        </div>
                                        ${hasErrors ? `
                                        <div class="test-error-container" id="error-${testId}">
                                            ${testFailures.map((failure: FailureDetails) => `
                                                <div class="test-error-item">
                                                    <div class="error-duration">Duration: ${this.formatDuration(failure.duration)}</div>
                                                    <div class="test-error">
                                                        ${failure.error}
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>
                                        ` : ''}
                                    </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>`;
                }).join('')}
            </div>        </div>
          <div class="footer">
            <p>Generated by TestFusion Enterprise Reporter v${environment.frameworkVersion}</p>
            <p>Report ID: ${environment.runId} | Branch: ${environment.branch}</p>
            <p>Generated at ${this.formatDate(this.endTime)}</p>
        </div>
    </div>    <script>
        function toggleFeature(featureId) {
            const card = document.querySelector('#feature-' + featureId).parentElement;
            card.classList.toggle('expanded');
        }
        
        function toggleTestError(testId) {
            const testItem = document.querySelector('[data-test-id="' + testId + '"]');
            const errorContainer = document.querySelector('#error-' + testId);
            
            if (testItem && errorContainer) {
                testItem.classList.toggle('expanded');
                errorContainer.classList.toggle('show');
            }
        }
        
        function filterTests(status) {
            // Update active filter button
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelector('.filter-btn.' + status).classList.add('active');
            
            // Show/hide test items based on filter
            const allTestItems = document.querySelectorAll('.test-item');
            let visibleCount = 0;
            
            allTestItems.forEach(testItem => {
                const shouldShow = status === 'all' || testItem.classList.contains(status);
                
                if (shouldShow) {
                    testItem.classList.remove('hidden');
                    visibleCount++;
                } else {
                    testItem.classList.add('hidden');
                }
            });
            
            // Update feature cards visibility
            document.querySelectorAll('.feature-card').forEach(card => {
                const visibleTests = card.querySelectorAll('.test-item:not(.hidden)');
                if (visibleTests.length === 0) {
                    card.classList.add('empty');
                } else {
                    card.classList.remove('empty');
                }
            });
            
            // Update page title or add a results counter if needed
            console.log('Showing ' + visibleCount + ' tests with status: ' + status);
        }
        
        // Auto-expand features with failures and failed tests
        document.addEventListener('DOMContentLoaded', function() {
            const failedFeatures = document.querySelectorAll('.feature-card');
            failedFeatures.forEach(card => {
                const failedTests = card.querySelectorAll('.test-item.failed, .test-item.timedOut');
                if (failedTests.length > 0) {
                    card.classList.add('expanded');
                    card.classList.add('failed');
                    
                    // Auto-expand failed tests to show errors immediately
                    failedTests.forEach(test => {                        const testId = test.getAttribute('data-test-id');
                        if (testId) {
                            const errorContainer = document.querySelector('#error-' + testId);
                            if (errorContainer) {
                                test.classList.add('expanded');
                                errorContainer.classList.add('show');
                            }
                        }
                    });
                }
            });
        });
    </script>
</body>
</html>`;
  }

  private async generateExecutiveSummary(metrics: TestMetrics, failures: FailureDetails[]) {
    const summary = `
# TestFusion Enterprise - Executive Summary

## 📊 Test Execution Overview
- **Execution Date**: ${this.formatDate(this.endTime)}
- **Total Tests**: ${metrics.total}
- **Pass Rate**: ${metrics.passRate.toFixed(1)}%
- **Duration**: ${this.formatDuration(metrics.duration)}

## 🎯 Key Metrics
- ✅ **Passed**: ${metrics.passed} tests
- ❌ **Failed**: ${metrics.failed} tests
- ⏭️ **Skipped**: ${metrics.skipped} tests
${metrics.flaky > 0 ? `- 🔄 **Flaky**: ${metrics.flaky} tests` : ''}

## 📈 Quality Assessment
${this.getQualityAssessment(metrics)}

## 🚨 Critical Issues
${failures.length > 0 ? 
  failures.slice(0, 5).map(f => `- **${f.test}** in ${f.suite} (${f.browser})`).join('\n') :
  'No critical issues detected ✅'
}

${failures.length > 5 ? `\n... and ${failures.length - 5} more failures. See full report for details.` : ''}

## 🔧 Recommendations
${this.getRecommendations(metrics, failures)}

---
*Report generated at ${this.formatDate(this.endTime)}*
`;

    await fs.writeFile(
      path.join(this.outputDir, 'executive-summary.md'),
      summary
    );
  }

  private getQualityAssessment(metrics: TestMetrics): string {
    if (metrics.passRate >= 95) return '🟢 **EXCELLENT** - High quality, production ready';
    if (metrics.passRate >= 85) return '🟡 **GOOD** - Minor issues, review recommended';
    if (metrics.passRate >= 70) return '🟠 **FAIR** - Significant issues, fixes needed';
    return '🔴 **POOR** - Critical issues, immediate attention required';
  }

  private getRecommendations(metrics: TestMetrics, failures: FailureDetails[]): string {
    const recommendations = [];
    
    if (metrics.passRate < 90) {
      recommendations.push('- Investigate and fix failing tests to improve overall quality');
    }
    
    if (metrics.flaky > 0) {
      recommendations.push('- Address flaky tests to improve test reliability');
    }
    
    if (failures.length > 0) {
      const commonErrors = failures.reduce((acc, f) => {
        const errorType = f.error.split('\n')[0];
        acc[errorType] = (acc[errorType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const mostCommon = Object.entries(commonErrors)
        .sort(([,a], [,b]) => b - a)[0];
      
      if (mostCommon) {
        recommendations.push(`- Focus on most common error: "${mostCommon[0]}" (${mostCommon[1]} occurrences)`);
      }
    }
    
    if (recommendations.length === 0) {
      recommendations.push('- Maintain current quality standards');
      recommendations.push('- Consider adding more edge case tests');
    }
    
    return recommendations.join('\n');
  }

  private getOverallStatus(metrics: TestMetrics): string {
    if (metrics.failed === 0) return 'status-passed';
    if (metrics.passRate >= 80) return 'status-mixed';
    return 'status-failed';
  }

  private getOverallStatusText(metrics: TestMetrics): string {
    if (metrics.failed === 0) return 'All Passed';
    if (metrics.passRate >= 80) return 'Mostly Passed';
    return 'Failed';
  }

  private formatDate(date: Date): string {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(1);
    return `${minutes}m ${seconds}s`;
  }

  private escapeHtml(text: string): string {
    const div = { innerHTML: text } as any;
    return div.innerHTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private printConsoleSummary() {
    const metrics = this.calculateMetrics();
    const browserMetrics = this.calculateBrowserMetrics();
    const apiMetrics = this.calculateApiMetrics();
    const failures = this.extractFailureDetails();
    
    console.log(`\n📊 EXECUTION SUMMARY`);
    console.log(`${'='.repeat(50)}`);
    
    // Overall results
    const passIcon = metrics.passRate === 100 ? '🟢' : metrics.passRate >= 80 ? '🟡' : '🔴';
    console.log(`${passIcon} Overall: ${metrics.passed}/${metrics.total} passed (${metrics.passRate.toFixed(1)}%)`);
    
    // API Results
    if (apiMetrics.total > 0) {
      const apiIcon = apiMetrics.passRate === 100 ? '🟢' : apiMetrics.passRate >= 80 ? '🟡' : '🔴';
      console.log(`${apiIcon} API Tests: ${apiMetrics.passed}/${apiMetrics.total} passed (${apiMetrics.passRate.toFixed(1)}%)`);
    }
    
    // Browser Results
    if (Object.keys(browserMetrics).length > 0) {
      console.log(`🌐 Browser Tests:`);
      Object.entries(browserMetrics).forEach(([browser, stats]) => {
        const passRate = stats.total > 0 ? (stats.passed / stats.total) * 100 : 0;
        const browserIcon = passRate === 100 ? '🟢' : passRate >= 80 ? '🟡' : '🔴';
        console.log(`   ${browserIcon} ${browser}: ${stats.passed}/${stats.total} passed (${passRate.toFixed(1)}%)`);
      });
    }
    
    // Failures summary
    if (failures.length > 0) {
      console.log(`\n❌ FAILURES (${failures.length}):`);
      failures.slice(0, 5).forEach((failure, index) => {
        console.log(`   ${index + 1}. [${failure.browser}] ${failure.suite} > ${failure.test}`);
      });
      if (failures.length > 5) {
        console.log(`   ... and ${failures.length - 5} more failures`);
      }
    }
    
    console.log(`${'='.repeat(50)}`);
  }

  private countTotalTests(suite: Suite): number {
    let count = 0;
    
    function countTests(s: Suite): void {
      for (const test of s.tests) {
        count++;
      }
      for (const child of s.suites) {
        countTests(child);
      }
    }
    
    countTests(suite);
    return count;
  }  private getTestsForSuite(suiteName: string): any[] {
    const tests: any[] = [];
    
    for (const [test, results] of this.results) {
      if (test.parent.title === suiteName) {
        // Create a separate entry for each result (browser/project combination)
        results.forEach(result => {
          tests.push({
            title: test.title,
            status: result.status,
            duration: result.duration,
            project: this.getProjectName(test),
            uniqueId: `${test.title}-${this.getProjectName(test)}`
          });
        });
      }
    }
    
    return tests;
  }
  private loadPackageConfig(): any {
    try {
      const packageJson = require(path.join(process.cwd(), 'package.json'));
      if (!packageJson.config || !packageJson.config.reporting) {
        throw new Error('Missing required configuration in package.json. Please ensure config.reporting section exists.');
      }
      return packageJson;
    } catch (error: any) {
      throw new Error(`Failed to load configuration from package.json: ${error.message}`);
    }
  }

  private getRequiredEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
      throw new Error(`Required environment variable ${name} is not set. Please check your .env configuration.`);
    }
    return value;
  }

  private getProjectName(test: TestCase): string {
    const packageJson = this.loadPackageConfig();
    return test.parent.project()?.name || packageJson.config.reporting.projectNameFallback;
  }

  private getSuiteName(test: TestCase): string {
    const packageJson = this.loadPackageConfig();
    return test.parent.title || packageJson.config.reporting.suiteNameFallback;
  }

  private getProgressBarClass(passRate: number): string {
    if (passRate >= 80) return 'success';
    if (passRate >= 60) return 'warning';
    return 'danger';
  }

  private getPieChartClass(passRate: number, failedCount: number): string {
    if (failedCount === 0) return 'all-passed';
    if (passRate === 0) return 'all-failed';
    return 'mixed';
  }

  private getPieChartStyle(passRate: number): string {
    if (passRate === 0 || passRate === 100) return '';
    const passedAngle = (passRate / 100) * 360;
    return `style="--passed-angle: ${passedAngle}deg"`;
  }
}

export default EnterpriseReporter;
