# TestFusion Enterprise

A comprehensive enterprise-grade test automation framework built with Playwright for end-to-end testing.

## 🚀 Features

- **Cross-browser Testing**: Support for Chromium, Firefox, and WebKit
- **Parallel Execution**: Run tests in parallel for faster execution
- **Rich Reporting**: HTML and JUnit reports with screenshots and videos
- **Page Object Model**: Organized test structure with reusable components
- **TypeScript Support**: Full TypeScript support for better development experience
- **CI/CD Ready**: Configured for continuous integration pipelines

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

## 🏃‍♂️ Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in headed mode (visible browser)
npm run test:headed

# Run tests with UI mode
npm run test:ui

# Debug tests
npm run test:debug

# Show test report
npm run test:report
```

### Test Execution Options

```bash
# Run specific test file
npx playwright test tests/example.spec.ts

# Run tests with specific browser
npx playwright test --project=chromium

# Run tests with custom reporter
npx playwright test --reporter=line
```

## 📁 Project Structure

```
TestFusion-Enterprise/
├── tests/
│   ├── pages/           # Page Object Model files
│   ├── utils/           # Utility functions and helpers
│   ├── fixtures/        # Test fixtures and data
│   └── *.spec.ts        # Test files
├── playwright.config.ts # Playwright configuration
├── package.json        # Project dependencies
└── README.md           # This file
```

## 🔧 Configuration

The main configuration is in `playwright.config.ts`. Key settings include:

- **Test Directory**: `./tests`
- **Browsers**: Chromium, Firefox, WebKit
- **Reporters**: HTML, JUnit
- **Screenshots**: On failure
- **Videos**: On failure
- **Traces**: On first retry

## 📊 Reporting

After running tests, you can view detailed reports:

- HTML Report: `npm run test:report`
- Test artifacts are stored in `test-results/`
- Playwright report is stored in `playwright-report/`

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
