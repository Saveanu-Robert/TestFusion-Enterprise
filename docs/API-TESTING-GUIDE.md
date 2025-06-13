# API Testing Framework Documentation

## 🚀 Getting Started with API Testing

This framework provides comprehensive API testing capabilities with professional logging, validation, and reporting features.

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Git

## 🛠️ Installation

1. **Clone and setup the project:**
```bash
git clone <repository-url>
cd TestFusion-Enterprise
npm install
npm run install:browsers
```

2. **Configure environment (optional):**
```bash
cp .env.example .env.local
# Edit .env.local with your specific configuration
```

## 🏃‍♂️ Running API Tests

### Quick Commands

```bash
# Run all API tests
npm run test:api

# Run specific API test suites
npm run test:api:posts      # Posts API tests
npm run test:api:users      # Users API tests  
npm run test:api:comments   # Comments API tests

# Run tests by category
npm run test:smoke          # Smoke tests only
npm run test:regression     # Regression tests
npm run test:validation     # Validation tests

# Debug mode
npm run test:debug

# Generate and view reports
npm run test:report
```

### Advanced Test Execution

```bash
# Run tests with specific browsers
npx playwright test tests/api --project=chromium

# Run tests with custom timeout
npx playwright test tests/api --timeout=60000

# Run tests in parallel
npx playwright test tests/api --workers=4

# Run tests with verbose logging
npx playwright test tests/api --reporter=line
```

## 🏗️ Framework Architecture

### Core Components

1. **API Client** (`tests/clients/api-client.ts`)
   - Centralized HTTP request handling
   - Automatic logging and error handling
   - Request/response interception

2. **Validation Engine** (`tests/utils/validation-utils.ts`)
   - Schema validation
   - Field presence checks
   - Pattern matching
   - Custom validation rules

3. **Logger** (`tests/utils/logger.ts`)
   - Structured logging with levels
   - Test step tracking
   - Request/response logging

4. **Configuration Manager** (`tests/config/configuration-manager.ts`)
   - Environment-based configuration
   - Runtime property management

### Service Layer (Repository Pattern)

- **PostsApiService** - Posts CRUD operations
- **UsersApiService** - User management operations  
- **CommentsApiService** - Comment management operations

### Test Data Management

- **Test Data Factory Functions** - Dynamic test data generation
- **TestFixtures** - Static test data and schemas
- **Custom Fixtures** - Playwright test fixtures

## 📊 Test Categories and Tags

Tests are organized using tags for easy filtering:

- `@api` - All API tests
- `@smoke` - Critical functionality tests
- `@regression` - Full regression suite
- `@crud` - Create, Read, Update, Delete operations
- `@validation` - Data validation tests
- `@posts` - Posts-specific tests
- `@users` - Users-specific tests
- `@comments` - Comments-specific tests

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `API_BASE_URL` | Base URL for API | `https://jsonplaceholder.typicode.com` |
| `API_TIMEOUT` | Request timeout (ms) | `30000` |
| `LOG_LEVEL` | Logging level | `INFO` |
| `TEST_ENV` | Test environment | `development` |

### Playwright Configuration

Key settings in `playwright.config.ts`:

- **Parallel Execution**: Tests run in parallel by default
- **Retries**: 2 retries on CI, 0 locally
- **Reporters**: HTML and JUnit reports
- **Artifacts**: Screenshots, videos, and traces on failure

## 📝 Writing New API Tests

### Basic Test Structure

```typescript
import { test, expect } from '../fixtures/api-fixtures';
import { YourApiService } from '../services/your-api.service';

test.describe('Your API Test Suite', () => {
  let yourService: YourApiService;

  test.beforeEach(async ({ apiClient, logger }) => {
    yourService = new YourApiService(apiClient);
    logger.info('Starting test', undefined, 'YourAPI');
  });

  test('Should perform expected behavior', async ({ validator, logger }) => {
    logger.logTestStep('Step 1: Describe what you are doing');
    const response = await yourService.someOperation();

    logger.logTestStep('Step 2: Validate response');
    const validation = validator.validateStatusCode(response.status, 200);
    expect(validation.isValid, validation.message).toBe(true);
  });
});
```

### Using Validation Features

```typescript
// Schema validation
const schemaValidation = validator.validateSchema(data, {
  id: 'number',
  name: 'string',
  email: 'string'
});

// Field validation
const fieldValidation = validator.validateFieldValue(data, 'status', 'active');

// Pattern validation
const emailValidation = validator.validatePattern(
  data.email, 
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
  'email'
);

// Multiple validations
validator.validateAll([schemaValidation, fieldValidation, emailValidation]);
```

### Custom Test Data

```typescript
// Use factory for dynamic data
const postData = createPostPayload({
  title: 'Custom Title',
  userId: 2
});

// Use fixtures for static data
const schema = TestFixtures.POST_SCHEMA;
const validIds = TestFixtures.VALID_POST_IDS;
```

## 🎯 Best Practices

### Test Design

1. **Use descriptive test names** that explain what is being tested
2. **Follow the AAA pattern** - Arrange, Act, Assert
3. **Use test steps** with clear descriptions
4. **Validate responses comprehensively** - status, schema, data
5. **Test both positive and negative scenarios**

### Performance

1. **Set reasonable timeouts** for different types of operations
2. **Use parallel execution** for independent tests
3. **Monitor response times** and set performance thresholds
4. **Clean up test data** when necessary

### Maintenance

1. **Use constants** for URLs, status codes, and test data
2. **Abstract common operations** into service classes
3. **Keep test data in fixtures** for reusability
4. **Use meaningful error messages** in validations

## 📊 Reporting and Analysis

### HTML Reports

After running tests, view detailed reports:
```bash
npm run test:report
```

Reports include:
- Test execution timeline
- Screenshots and videos of failures
- Detailed error information
- Performance metrics

### Logs Analysis

The framework provides structured logging:
- Test step tracking
- Request/response logging
- Validation results
- Performance metrics

### CI/CD Integration

The framework is configured for CI/CD with:
- JUnit XML reports for integration
- Artifact collection (screenshots, videos)
- Parallel execution support
- Environment-specific configuration

## 🔍 Troubleshooting

### Common Issues

1. **Tests timing out**
   - Check `API_TIMEOUT` configuration
   - Verify network connectivity
   - Review API response times

2. **Validation failures**
   - Check expected vs actual data structures
   - Verify API endpoint responses
   - Review schema definitions

3. **Environment issues**
   - Verify `.env.local` configuration
   - Check API endpoint availability
   - Validate credentials (if required)

### Debug Mode

Run tests in debug mode for detailed analysis:
```bash
npm run test:debug
```

This provides:
- Step-by-step execution
- Interactive debugging
- Detailed request/response inspection

## 🤝 Contributing

1. Create feature branch from `main`
2. Follow existing code patterns
3. Add comprehensive tests
4. Update documentation
5. Submit pull request

### Code Standards

- Use TypeScript for type safety
- Follow SOLID principles
- Implement proper error handling to improve reliability
- Add meaningful comments
- Use consistent naming conventions
