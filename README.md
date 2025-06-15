# TestFusion Enterprise

A comprehensive enterprise-grade test automation framework built with Playwright for end-to-end testing of both API and web applications.

## 🚀 Features

- **Dual Testing Modes**: Complete support for both API and Web UI testing
- **Cross-browser Testing**: Support for Chromium, Firefox, and WebKit
- **Parallel Execution**: Run tests in parallel for faster execution
- **Rich Reporting**: HTML reports with screenshots, videos, and trace files
- **Page Object Model**: Organized test structure with reusable components
- **TypeScript Support**: Full TypeScript support for better development experience
- **Centralized Configuration**: Single configuration source for easy customization
- **Professional Logging**: Structured logging with request correlation and debugging support
- **CI/CD Ready**: Configured for continuous integration pipelines
- **Data Validation**: Comprehensive validation framework for API responses
- **Environment Management**: Support for multiple environments (dev, staging, prod)

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd TestFusion-Enterprise
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npm run install:browsers
```

4. Configure environment variables:
```bash
# Copy the example .env file and customize for your environment
cp .env .env.local
# Edit .env.local with your specific configuration
```

## ⚙️ Configuration

The framework uses a centralized configuration system managed through environment variables. All settings are defined in the `.env` file:

### Key Configuration Areas:
- **API Testing**: Base URLs, timeouts, endpoints, authentication
- **Web Testing**: Browser settings, selectors, page paths
- **Logging**: Log levels, request/response logging
- **Reporting**: Screenshots, videos, trace collection
- **Validation**: Data validation rules and thresholds

### Environment Variables:
```env
# API Configuration
API_BASE_URL=https://jsonplaceholder.typicode.com
API_TIMEOUT=30000
API_RETRY_ATTEMPTS=3

# Web Configuration  
WEB_BASE_URL=https://playwright.dev
WEB_HEADLESS=true
WEB_VIEWPORT_WIDTH=1920
WEB_VIEWPORT_HEIGHT=1080

# Logging
LOG_LEVEL=INFO
ENABLE_REQUEST_LOGGING=true

# See .env file for complete configuration options
```

## 🏃‍♂️ Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run API tests only
npm run test:api

# Run web tests only  
npm run test:web

# Run tests in headed mode (visible browser)
npm run test:headed

# Run tests with UI mode
npm run test:ui

# Debug tests
npm run test:debug

# Show test report
npm run test:report
```

### Specific Test Execution

```bash
# Run specific API tests
npm run test:posts
npm run test:users
npm run test:comments

# Run tests with custom configuration
npx playwright test --project=chromium
npx playwright test tests/web/ --headed
```

## 📁 Project Structure

```
TestFusion-Enterprise/
├── tests/
│   ├── api/                 # API test specifications
│   ├── web/                 # Web UI test specifications
│   │   └── pages/          # Page Object Model files
│   ├── clients/            # HTTP and browser clients
│   ├── config/             # Configuration management
│   ├── constants/          # Test constants and validation rules
│   ├── fixtures/           # Test fixtures and data models
│   ├── operations/         # Business logic operations
│   ├── services/           # API service layers
│   ├── utils/              # Utility functions and helpers
│   └── validators/         # Data validation logic
├── .env                    # Environment configuration
├── playwright.config.ts    # Playwright configuration
├── package.json           # Project dependencies
└── README.md              # This file
```

## 🔧 Advanced Configuration

### Configuration Manager

The framework provides a centralized configuration manager:

```typescript
import { ConfigurationManager } from './tests/config/configuration-manager';

const config = ConfigurationManager.getInstance();
const apiConfig = config.getApiConfig();
const webConfig = config.getWebConfig();
```

### Logging System

Professional logging with request correlation:

```typescript
import { Logger } from './tests/utils/logger';

const logger = Logger.getInstance();
logger.info('Test execution started');
logger.logRequest('GET', '/api/users');
logger.logValidation('email', expected, actual, isValid);
```

## 📊 Reporting

After running tests, you can view detailed reports:

- HTML Report: `npm run test:report`
- Test artifacts are stored in `test-results/`
- Enterprise reports are stored in `enterprise-reports/`

## 🧪 Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should perform expected behavior', async ({ page }) => {
    await page.goto('https://example.com');
    await expect(page).toHaveTitle(/Expected Title/);
  });
});
```

### Using Page Objects

```typescript
import { BasePage } from './pages/base.page';

// Extend BasePage for specific pages
class LoginPage extends BasePage {
  async login(username: string, password: string) {
    await this.fillInput('#username', username);
    await this.fillInput('#password', password);
    await this.clickElement('#login-button');
  }
}
```

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Useful Links

- [Playwright Documentation](https://playwright.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Node.js Documentation](https://nodejs.org/)
