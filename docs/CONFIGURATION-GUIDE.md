# TestFusion-Enterprise Configuration Guide

## Overview
TestFusion-Enterprise uses a centralized configuration system that allows you to easily customize all aspects of your API and Web testing from a single location. All configuration is managed through environment variables in the `.env` file.

## Configuration Files

### Primary Configuration
- **`.env`** - Main configuration file (committed to repository with default values)
- **`.env.local`** - Local overrides (git-ignored, create this for environment-specific settings)

### Configuration Manager
- **`tests/config/configuration-manager.ts`** - Central configuration class using Singleton pattern

## Configuration Sections

### 🌐 API Testing Configuration

Configure API testing endpoints, timeouts, and behavior:

```bash
# Base API settings
API_BASE_URL=https://jsonplaceholder.typicode.com
API_TIMEOUT=30000                    # Request timeout in milliseconds
API_RETRY_ATTEMPTS=3                 # Number of retry attempts for failed requests
API_KEY=YOUR_API_KEY_HERE           # Optional API key for authentication

# Custom endpoints (optional)
API_POSTS_ENDPOINT=/posts
API_USERS_ENDPOINT=/users
API_COMMENTS_ENDPOINT=/comments
API_HEALTH_ENDPOINT=/health
```

### 🖥️ Web Testing Configuration

Configure web application testing parameters:

```bash
# Base web settings
WEB_BASE_URL=https://example.com
WEB_NAVIGATION_TIMEOUT=30000        # Page navigation timeout
WEB_ELEMENT_TIMEOUT=10000          # Element interaction timeout
WEB_ASSERTION_TIMEOUT=5000         # Assertion timeout
WEB_RETRY_ATTEMPTS=3               # Retry attempts for failed actions

# Browser settings
WEB_HEADLESS=true                  # Run browsers in headless mode
WEB_SLOW_MO=0                     # Slow down actions (useful for debugging)
WEB_VIEWPORT_WIDTH=1280           # Browser viewport width
WEB_VIEWPORT_HEIGHT=720           # Browser viewport height

# Page paths (customize for your application)
WEB_HOME_PATH=/
WEB_LOGIN_PATH=/login
WEB_DASHBOARD_PATH=/dashboard
WEB_PROFILE_PATH=/profile
WEB_SEARCH_PATH=/search

# CSS selectors (customize for your application)
WEB_SEARCH_BOX_SELECTOR=[data-testid="search-box"]
WEB_SEARCH_BUTTON_SELECTOR=[data-testid="search-button"]
WEB_LOGIN_BUTTON_SELECTOR=[data-testid="login-button"]
WEB_SUBMIT_BUTTON_SELECTOR=[data-testid="submit-button"]
WEB_LOADING_SPINNER_SELECTOR=[data-testid="loading-spinner"]
```

### 📝 Logging Configuration

Control what gets logged during test execution:

```bash
LOG_LEVEL=INFO                     # DEBUG, INFO, WARN, ERROR
ENABLE_REQUEST_LOGGING=true        # Log HTTP requests
ENABLE_RESPONSE_LOGGING=true       # Log HTTP responses
ENABLE_CONSOLE_LOGGING=false       # Log browser console messages
```

### 📊 Reporting Configuration

Configure test reporting and artifacts:

```bash
ENABLE_SCREENSHOTS=true            # Capture screenshots
ENABLE_VIDEOS=false               # Record test videos
ENABLE_TRACING=false              # Enable Playwright trace
SCREENSHOT_MODE=only-on-failure   # on, off, only-on-failure
VIDEO_MODE=retain-on-failure      # on, off, retain-on-failure
```

### ✅ Validation Configuration

Configure test validation behavior:

```bash
VALIDATION_STRICT_MODE=true        # Strict validation mode
ENABLE_DATA_VALIDATION=true       # Validate response data structure
ENABLE_SCHEMA_VALIDATION=true     # Validate against JSON schemas
MAX_RESPONSE_TIME=5000            # Maximum acceptable response time (ms)
```

## Usage in Tests

### Accessing Configuration

```typescript
import { ConfigurationManager } from '../config/configuration-manager';

const config = ConfigurationManager.getInstance();

// Get API configuration
const apiConfig = config.getApiConfig();
console.log(apiConfig.baseUrl); // https://jsonplaceholder.typicode.com

// Get Web configuration
const webConfig = config.getWebConfig();
console.log(webConfig.baseUrl); // https://example.com

// Get specific property
const timeout = config.getProperty('api.timeout', 5000);

// Update configuration at runtime
config.updateApiConfig({ timeout: 10000 });
```

### In Page Objects

```typescript
export class LoginPage {
  constructor(private page: Page) {
    this.config = ConfigurationManager.getInstance();
  }

  async navigate() {
    const webConfig = this.config.getWebConfig();
    await this.page.goto(webConfig.baseUrl + webConfig.pages.login);
  }

  async clickLoginButton() {
    const selector = this.config.getWebConfig().selectors.loginButton;
    await this.page.click(selector);
  }
}
```

## Environment-Specific Configuration

### Development Environment
Create `.env.local` for development-specific settings:

```bash
# .env.local (git-ignored)
API_BASE_URL=http://localhost:3000
WEB_BASE_URL=http://localhost:8080
WEB_HEADLESS=false
ENABLE_VIDEOS=true
LOG_LEVEL=DEBUG
```

### CI/CD Environment
Set environment variables in your CI/CD pipeline:

```bash
# Production API
API_BASE_URL=https://api.production.com
WEB_BASE_URL=https://app.production.com

# CI-specific settings
WEB_HEADLESS=true
ENABLE_SCREENSHOTS=true
ENABLE_VIDEOS=true
ENABLE_TRACING=true
```

## Best Practices

### 1. Use Data-Testid Selectors
Always use `data-testid` attributes for reliable web element selection:

```html
<button data-testid="submit-button">Submit</button>
```

```bash
WEB_SUBMIT_BUTTON_SELECTOR=[data-testid="submit-button"]
```

### 2. Environment Separation
- Keep sensitive data in `.env.local` (not committed)
- Use different API endpoints for different environments
- Adjust timeouts based on environment performance

### 3. Meaningful Configuration Names
- Use descriptive variable names
- Group related configurations together
- Document any custom configurations

### 4. Validation Configuration
- Enable strict mode in CI/CD
- Use longer timeouts for slower environments
- Configure appropriate retry attempts

## Troubleshooting

### Missing Environment Variables
If you see errors about missing environment variables:

1. Check your `.env` file exists
2. Verify all required variables are set
3. Ensure `.env.local` doesn't override required values
4. Check environment variable names match exactly

### Configuration Not Loading
If configuration changes aren't taking effect:

1. Restart your test process
2. Check for typos in variable names
3. Verify the ConfigurationManager singleton is being used
4. Check for console errors during configuration loading

## Advanced Usage

### Custom Configuration Sections
You can extend the configuration by modifying `configuration-manager.ts`:

```typescript
export interface CustomConfig {
  myFeature: {
    enabled: boolean;
    apiUrl: string;
    timeout: number;
  };
}

// Add to TestConfig interface
export interface TestConfig {
  api: ApiConfig;
  web: WebConfig;
  custom: CustomConfig;
  // ... other sections
}
```

### Runtime Configuration Updates
Update configuration during test execution:

```typescript
// Update API timeout for specific test
config.updateApiConfig({ timeout: 60000 });

// Update web selector for specific application
config.updateWebConfig({ 
  selectors: { 
    ...config.getWebConfig().selectors,
    loginButton: '#custom-login-btn' 
  }
});
```
