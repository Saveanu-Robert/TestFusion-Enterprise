# 🚀 CI/CD Pipeline Documentation

This document describes the automated CI/CD pipelines set up for TestFusion-Enterprise.

## 📋 Available Workflows

### 1. PR Tests Workflow (`pr-tests.yml`)

**Triggers:**
- When a Pull Request is opened, updated, or labeled
- When code is pushed to feature/bugfix/hotfix branches

**Features:**
- ✅ **Intelligent Test Detection**: Automatically determines what tests to run based on:
  - **PR Title Keywords** (Highest Priority): `[API]`, `[WEB]`, `[ALL]`, `[SKIP]`
  - **PR Labels** (Medium Priority): `test:api`, `test:web`, `test:all`, `skip-tests`
  - **Changed Files Analysis** (Lowest Priority): Auto-detects based on modified files
  - **Branch Naming Patterns**: Detects patterns like `api`, `web`, `ui` in branch names
- ✅ **Proper Browser Separation**: 
  - **API Tests**: Run without browsers (faster execution)
  - **Web Tests**: Run with multi-browser support (Chromium, Firefox, WebKit)
- ✅ **Environment Variable Management**: 
  - **API Tests**: All required environment variables are automatically set with CI-appropriate defaults
  - **No .env Dependencies**: Tests run without requiring .env files to be present
- ✅ **Code Quality**: ESLint integration
- ✅ **Parallel Execution**: Tests run efficiently based on type

**PR Control Methods (in priority order):**

1. **📋 PR Title Keywords (Highest Priority):**
   - `[API]` - Run only API tests (no browser needed)
   - `[WEB]` - Run only Web/UI tests (with browsers)
   - `[ALL]` - Run all tests (API + Web)
   - `[SKIP]` - Skip all tests

2. **🏷️ PR Labels (Medium Priority):**
   - `test:api` - Run only API tests
   - `test:web` - Run only Web/UI tests  
   - `test:all` - Run all tests
   - `skip-tests` - Skip all tests

3. **🔍 Auto-detection (Lowest Priority):**
   - Changes in `tests/api/`, `tests/operations/`, `tests/validators/` → API tests (no browser)
   - Changes in `tests/pages/`, `tests/web/`, `tests/ui/` → Web tests (with browsers)
   - Changes in `tests/config/`, `tests/fixtures/`, `package.json` → All tests
   - No specific changes detected → API tests (default)

### 2. Dependency Bot Workflow (`dependency-bot.yml`)

**Triggers:**
- **Scheduled**: Every weekday morning at 7:00 AM UTC
- **Manual**: Can be triggered manually from GitHub Actions

**Features:**
- ✅ **Automated Dependency Updates**: Uses `npm-check-updates` to find and update outdated packages
- ✅ **Full Test Suite**: Runs all tests to ensure compatibility
- ✅ **Smart PR Creation**: Creates PRs with detailed change summaries
- ✅ **Test Status Reporting**: Clearly indicates if tests pass or fail
- ✅ **Intelligent Branching**: Creates unique branch names with dates

**Process:**
1. Check for outdated dependencies
2. Create a new branch with timestamp
3. Update all dependencies to latest versions
4. Run linting and all tests
5. Create PR with detailed summary
6. Label PR appropriately based on test results

### 3. Manual Test Workflow (`manual-tests.yml`)

**Triggers:**
- **Manual only**: Triggered from GitHub Actions interface

**Features:**
- ✅ **Flexible Test Selection**: Choose test type (API, Web, All)
- ✅ **Smart Browser Management**: 
  - **API Tests**: No browser installation (faster execution)
  - **Web/All Tests**: Browser selection (specific browser or all browsers)
- ✅ **Environment Variable Management**: All required API test variables are automatically set
- ✅ **Environment Configuration**: Select test environment
- ✅ **Parallel Control**: Enable/disable parallel execution

**Options:**
- **Test Type**: `api` (no browser), `web` (with browser), `all` (with browser)
- **Browser**: `chromium`, `firefox`, `webkit`, `all` (only available for web/all tests)
- **Environment**: `default`, `staging`, `production`
- **Parallel**: `true`, `false`

## 🎯 How to Use

### For Pull Requests

1. **PR Title Keywords** (Fastest Method):
   - Add `[API]` to your PR title to run only API tests (no browser)
   - Add `[WEB]` to your PR title to run only Web tests (with browsers)  
   - Add `[ALL]` to your PR title to run all tests
   - Add `[SKIP]` to your PR title to skip all tests
   - Example: "Fix user validation [API]" or "Update login form [WEB]"

2. **Label-based Control**:
   - Add `test:api` label to run only API tests
   - Add `test:web` label to run only Web tests
   - Add `test:all` label to run all tests
   - Add `skip-tests` label to skip all tests

3. **Automatic Detection** (Default):
   - Just create your PR - the system will auto-detect what tests to run based on changed files

4. **Branch-based Detection**:
   - Name your branch with `api` for API-focused changes (no browser)
   - Name your branch with `web` or `ui` for Web-focused changes (with browsers)

### For Dependency Updates

1. **Automatic** (Recommended):
   - The dependency bot runs every weekday morning
   - It will create PRs automatically when updates are available

2. **Manual**:
   - Go to Actions → Dependency Bot → Run workflow
   - The bot will check for updates immediately

### For Manual Testing

1. Go to GitHub Actions
2. Select "Manual Test Execution"
3. Click "Run workflow"
4. Configure your test options:
   - Select test type
   - Choose browser(s)
   - Set environment
   - Enable/disable parallel execution
5. Click "Run workflow"

## 📊 Test Reports and Artifacts

All workflows generate detailed test reports:

- **HTML Reports**: Visual test results with screenshots
- **JSON Reports**: Machine-readable test data
- **Test Artifacts**: Stored for 7-30 days depending on workflow
- **GitHub Summaries**: Detailed summaries in the Actions tab

## 🔧 Configuration

### Environment Variables

The workflows now automatically handle all required environment variables:

**API Test Variables (automatically set in CI):**
```bash
API_BASE_URL=https://jsonplaceholder.typicode.com
API_TIMEOUT=30000
API_RETRY_ATTEMPTS=3
TEST_ENV=development
LOG_LEVEL=INFO
ENABLE_REQUEST_LOGGING=true
ENABLE_RESPONSE_LOGGING=true
ENABLE_SCREENSHOTS=false  # Disabled in CI for performance
ENABLE_VIDEOS=false       # Disabled in CI for performance
ENABLE_TRACING=false      # Disabled in CI for performance
```

**Environment-specific Overrides:**
```bash
# Default (JSONPlaceholder API)
BASE_URL=https://jsonplaceholder.typicode.com

# Staging
BASE_URL=https://staging-api.example.com

# Production
BASE_URL=https://api.example.com
```

**✅ Recent Fixes:**
- All required environment variables are now automatically set in CI pipelines
- API tests no longer require .env files or manual environment setup
- Browser installation is properly restricted to web/all tests only

### Playwright Configuration

Tests use the existing `playwright.config.ts` with these browsers:
- **Chromium** (Chrome/Edge)
- **Firefox**
- **WebKit** (Safari)

## 🚨 Troubleshooting

### Common Issues

1. **Tests failing in CI but passing locally**:
   - Check browser versions
   - Verify environment variables
   - Review test artifacts for details

2. **Dependency bot creating PRs with failing tests**:
   - Review the PR description for breaking changes
   - Check updated package changelogs
   - Update test code if necessary

3. **PR tests not running**:
   - Check if `skip-tests` label is applied
   - Verify branch naming conventions
   - Ensure file changes are in expected directories

4. **Environment variable issues** (Fixed ✅):
   - ~~API tests failing with missing environment variables~~ - Now automatically set
   - ~~Browser installation for API-only tests~~ - Now properly restricted

5. **Manual workflow browser selection** (Fixed ✅):
   - ~~Browser options showing for API tests~~ - Now only shown for web/all tests
   - ~~Browsers being installed unnecessarily~~ - Now skipped for API tests

### Getting Help

- Check the **Actions** tab for detailed logs
- Review **test artifacts** for failure details
- Check **GitHub Summaries** for quick status overviews

## 🔄 Workflow Status

You can see the status of all workflows in:
- **PR checks**: Status checks on Pull Requests
- **Actions tab**: Full workflow history and logs
- **README badges**: (Add badges here if desired)

---

*This CI/CD setup ensures code quality, test coverage, and dependency freshness for the TestFusion-Enterprise project.*
