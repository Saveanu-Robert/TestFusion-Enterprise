/**
 * Users API Data Validation Tests
 *
 * Enterprise-grade test suite for validating user-related API endpoints,
 * focusing on data integrity, structure validation, and comprehensive user information.
 * Tests include CRUD operations, data validation, and error handling scenarios.
 *
 * @fileoverview Comprehensive user data validation tests for TestFusion-Enterprise
 * @author TestFusion-Enterprise Team
 * @version 1.0.0
 * @since 2024
 */

import { test } from '../fixtures/api-fixtures';
import type { ApiTestFixtures } from '../fixtures/api-fixtures';

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
import { UsersApiService } from '../services/users-api.service';
import { UsersOperations } from '../operations/users-operations';
import { HttpStatusCodes } from '../constants/api-constants';

test.describe('Users API - Data Validation', () => {
  let usersService: UsersApiService;
  let usersOperations: UsersOperations;

  test.beforeEach(async ({ apiClient, testContext }: ApiTestFixtures) => {
    usersService = new UsersApiService(apiClient);
    usersOperations = new UsersOperations(usersService);

    // Attach test context information for better traceability
    await testContext.attachTestContext({
      test_suite: 'Users API Data Validation',
      test_type: 'API Integration Tests',
      endpoint_category: 'Users Management',
      data_source: 'JSONPlaceholder API',
    });

    testContext.logTestStart('Test setup completed for Users API data validation', {
      suite: 'Users API Data Validation',
    });
  });

  test.afterEach(async ({ testContext }: ApiTestFixtures, testInfo: any) => {
    // Attach test result summary for enhanced reporting
    await testContext.attachTestSummary({
      test_name: testInfo.title,
      test_status: testInfo.status,
      test_duration: testInfo.duration,
    });

    testContext.logTestEnd(`Test completed: ${testInfo.title}`, {
      status: testInfo.status,
      duration: testInfo.duration,
      retries: testInfo.retry,
    });
  });
  test(qase(28, 'Should retrieve all users successfully and validate response structure'), async ({ testContext }: ApiTestFixtures) => {
    await test.step('Send GET request to retrieve all users from API endpoint', async () => {
      const { response, count } = await usersOperations.getAllUsersWithCountValidation();

      testContext.logInfo('✅ Successfully retrieved all users with valid structure', {
        totalUsers: count,
        responseTime: response.duration,
      });
    });
  });  test(
    qase(29, 'Should retrieve a specific user by ID and validate comprehensive user data'),
    async ({ testContext }: ApiTestFixtures) => {
      const userId = 1;

      await test.step(`Send GET request to retrieve user with ID ${userId}`, async () => {
        const response = await usersOperations.getUserByIdWithComprehensiveValidation(userId);

        testContext.logInfo('✅ Successfully retrieved specific user with comprehensive data validation', {
          userId,
          username: response.data.username,
          email: response.data.email,
          responseTime: response.duration,
        });
      });
    }
  );
  test(qase(30, 'Should create a new user successfully and validate creation response'), async ({ testContext }: ApiTestFixtures) => {
    await test.step('Send POST request to create new user with valid data', async () => {
      const newUserData = UsersOperations.generateTestUserData();
      const response = await usersOperations.createUserWithComprehensiveValidation(newUserData);

      testContext.logInfo('✅ Successfully created new user with valid response data', {
        userId: response.data.id,
        username: response.data.username,
        email: response.data.email,
        responseTime: response.duration,
      });
    });
  });  test(
    qase(31, 'Should return 404 error for non-existent user ID and validate error response'),
    async ({ testContext }: ApiTestFixtures) => {
      const nonExistentId = 9999;

      await test.step(`Send GET request for non-existent user ID ${nonExistentId}`, async () => {
        const response = await usersOperations.validateUserNotFoundError(nonExistentId);

        testContext.logInfo('✅ Correctly returned 404 error for non-existent user', {
          requestedUserId: nonExistentId,
          statusCode: response.status,
          responseTime: response.duration,
        });
      });
    }
  );
});
