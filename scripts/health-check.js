#!/usr/bin/env node

/**
 * Health Check Script for TestFusion-Enterprise
 *
 * Performs system health checks including:
 * - Dependencies validation
 * - Environment configuration
 * - Service connectivity
 * - Resource availability
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

class HealthChecker {
  constructor() {
    this.checks = [];
    this.results = [];
    this.exitCode = 0;
  }

  /**
   * Add a health check to the suite
   * @param {string} name - Check name
   * @param {Function} checkFn - Async function that performs the check
   */
  addCheck(name, checkFn) {
    this.checks.push({ name, checkFn });
  }

  /**
   * Run all health checks
   */
  async runChecks() {
    console.log('🏥 TestFusion-Enterprise Health Check\n');
    console.log('='.repeat(50));

    for (const check of this.checks) {
      const startTime = Date.now();

      try {
        console.log(`⏳ Checking: ${check.name}...`);
        await check.checkFn();
        const duration = Date.now() - startTime;
        console.log(`✅ ${check.name} - OK (${duration}ms)`);
        this.results.push({ name: check.name, status: 'PASS', duration });
      } catch (error) {
        const duration = Date.now() - startTime;
        console.log(`❌ ${check.name} - FAILED (${duration}ms)`);
        console.log(`   Error: ${error.message}`);
        this.results.push({ name: check.name, status: 'FAIL', duration, error: error.message });
        this.exitCode = 1;
      }
    }

    this.printSummary();
    process.exit(this.exitCode);
  }

  /**
   * Print health check summary
   */
  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 Health Check Summary');
    console.log('='.repeat(50));

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`Total Checks: ${this.results.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total Duration: ${totalDuration}ms`);
    console.log(`Status: ${failed === 0 ? '✅ HEALTHY' : '❌ UNHEALTHY'}`);

    if (failed > 0) {
      console.log('\n🚨 Failed Checks:');
      this.results.filter(r => r.status === 'FAIL').forEach(r => console.log(`  - ${r.name}: ${r.error}`));
    }
  }
}

// Initialize health checker
const healthChecker = new HealthChecker();

// Check Node.js version
healthChecker.addCheck('Node.js Version', async () => {
  const version = process.version;
  const major = parseInt(version.substring(1).split('.')[0]);
  if (major < 16) {
    throw new Error(`Node.js v16+ required, found ${version}`);
  }
});

// Check package.json exists
healthChecker.addCheck('Package Configuration', async () => {
  const packagePath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packagePath)) {
    throw new Error('package.json not found');
  }

  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  if (!pkg.name || !pkg.version) {
    throw new Error('Invalid package.json: missing name or version');
  }
});

// Check environment configuration
healthChecker.addCheck('Environment Configuration', async () => {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env file not found');
  }

  const requiredVars = ['API_BASE_URL', 'WEB_BASE_URL', 'TEST_ENV', 'LOG_LEVEL'];

  const envContent = fs.readFileSync(envPath, 'utf8');
  const missingVars = requiredVars.filter(varName => !envContent.includes(`${varName}=`) && !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
  }
});

// Check TypeScript configuration
healthChecker.addCheck('TypeScript Configuration', async () => {
  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
  if (!fs.existsSync(tsconfigPath)) {
    throw new Error('tsconfig.json not found');
  }

  try {
    const { stderr } = await execAsync('npx tsc --noEmit --skipLibCheck');
    if (stderr && !stderr.includes('warning')) {
      throw new Error(`TypeScript compilation errors: ${stderr}`);
    }
  } catch (error) {
    throw new Error(`TypeScript check failed: ${error.message}`);
  }
});

// Check Playwright installation
healthChecker.addCheck('Playwright Installation', async () => {
  try {
    const { stdout } = await execAsync('npx playwright --version');
    if (!stdout.includes('Version')) {
      throw new Error('Playwright not properly installed');
    }
  } catch {
    throw new Error('Playwright CLI not available');
  }
});

// Check Playwright browsers
healthChecker.addCheck('Playwright Browsers', async () => {
  try {
    await execAsync('npx playwright install --dry-run');
    // If dry-run succeeds, browsers are likely installed
  } catch {
    // Check if browsers directory exists
    const browsersPath = path.join(process.cwd(), 'node_modules', '@playwright', 'test', 'browsers');
    if (!fs.existsSync(browsersPath)) {
      throw new Error('Playwright browsers not installed. Run: npm run install:browsers');
    }
  }
});

// Check test directories
healthChecker.addCheck('Test Structure', async () => {
  const requiredDirs = ['tests', 'tests/api', 'tests/web', 'tests/fixtures', 'tests/config'];

  const missingDirs = requiredDirs.filter(dir => !fs.existsSync(path.join(process.cwd(), dir)));

  if (missingDirs.length > 0) {
    throw new Error(`Missing directories: ${missingDirs.join(', ')}`);
  }
});

// Check external service connectivity (if configured)
healthChecker.addCheck('External Services', async () => {
  // Check API base URL connectivity
  const apiBaseUrl = process.env.API_BASE_URL;
  if (apiBaseUrl) {
    try {
      const https = require('https');
      const http = require('http');
      const client = apiBaseUrl.startsWith('https:') ? https : http;

      await new Promise((resolve, reject) => {
        const req = client.get(apiBaseUrl, res => {
          if (res.statusCode >= 200 && res.statusCode < 400) {
            resolve();
          } else {
            reject(new Error(`API returned status ${res.statusCode}`));
          }
        });

        req.on('error', reject);
        req.setTimeout(10000, () => {
          req.destroy();
          reject(new Error('API connection timeout'));
        });
      });
    } catch (error) {
      console.warn(`⚠️  API connectivity check failed: ${error.message} (non-critical)`);
    }
  }
});

// Check disk space
healthChecker.addCheck('Disk Space', async () => {
  try {
    await execAsync(process.platform === 'win32' ? 'dir' : 'df -h .');
    // Simple check - if command succeeds, we have basic disk access
  } catch {
    throw new Error('Unable to check disk space');
  }
});

// Check memory usage
healthChecker.addCheck('Memory Usage', async () => {
  const memUsage = process.memoryUsage();
  const totalMB = Math.round(memUsage.rss / 1024 / 1024);

  if (totalMB > 1024) {
    // More than 1GB
    console.warn(`⚠️  High memory usage: ${totalMB}MB`);
  }

  // Check if we have enough memory for testing
  const freeMem = require('os').freemem();
  const freeMemMB = Math.round(freeMem / 1024 / 1024);

  if (freeMemMB < 512) {
    // Less than 512MB free
    throw new Error(`Low free memory: ${freeMemMB}MB available`);
  }
});

// Run all health checks
healthChecker.runChecks().catch(error => {
  console.error('Health check runner failed:', error);
  process.exit(1);
});
