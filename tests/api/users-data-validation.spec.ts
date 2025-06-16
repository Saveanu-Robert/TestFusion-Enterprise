/**
 * Users API Data Validation Tests
 * 
 * Comprehensive test suite for validating user-related API endpoints,
 * focusing on data integrity, structure validation, and comprehensive user information.
 * Tests include CRUD operations, data validation, and error handling scenarios.
 * 
 * @author TestFusion-Enterprise Team
 * @version 1.0.0
 */

import { test, expect } from '../fixtures/api-fixtures';
import { qase } from 'playwright-qase-reporter';
import { UsersApiService } from '../services/users-api.service';
import { UsersOperations } from '../operations/users-operations';
import { HTTP_STATUS_CODES } from '../constants/api-constants';

test.describe('Users API - Data Validation', () => {
  let usersService: UsersApiService;
  let usersOperations: UsersOperations;

  test.beforeEach(async ({ apiClient, apiReporter, logger }) => {
    usersService = new UsersApiService(apiClient);
    usersOperations = new UsersOperations(usersService);
    
    // Attach test context information for better traceability
    await apiReporter.attachTestContext({
      test_suite: 'Users API Data Validation',
      test_type: 'API Integration Tests',
      endpoint_category: 'Users Management',
      data_source: 'JSONPlaceholder API',
      test_environment: process.env.NODE_ENV || 'test',
      timestamp: new Date().toISOString(),
    });
    
    logger.info('🚀 Test setup completed for Users API data validation', {
      suite: 'Users API Data Validation',
      timestamp: new Date().toISOString(),
    });
  });

  test.afterEach(async ({ apiReporter, logger }, testInfo) => {
    // Attach test result summary for enhanced reporting
    const testResult = {
      test_name: testInfo.title,
      test_status: testInfo.status,
      test_duration: testInfo.duration,
      test_file: testInfo.file,
      retry_count: testInfo.retry,
      annotations: testInfo.annotations,
      timestamp: new Date().toISOString(),
    };
    
    await apiReporter.attachTestSummary(testResult);
    
    logger.info(`🏁 Test completed: ${testInfo.title}`, {
      status: testInfo.status,
      duration: testInfo.duration,
      retries: testInfo.retry,
    });
  });  test(qase(28, 'Should retrieve all users successfully and validate response structure'), async ({ logger, apiReporter }) => {
    // Mark as smoke test for core functionality validation
    test.info().annotations.push({ type: 'tag', description: 'smoke' });
    test.info().annotations.push({ type: 'feature', description: 'users-retrieval' });
    test.info().annotations.push({ type: 'priority', description: 'high' });
    
    // Attach test-specific context
    await apiReporter.attachTestContext({
      test_objective: 'Validate retrieval of all users from API endpoint',
      expected_behavior: 'API should return complete list of users with valid structure',
      validation_criteria: ['Response status 200', 'Valid JSON structure', 'Reasonable user count'],
    });
    
    await test.step('Send GET request to retrieve all users from API endpoint', async () => {
      const { response, count } = await usersOperations.getAllUsersWithValidation();
      
      // Validate that we receive a reasonable number of users
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThanOrEqual(100); // Reasonable upper bound for users
      
      // Attach additional performance metrics
      await apiReporter.attachPerformanceMetrics({
        duration: response.duration,
        responseSize: JSON.stringify(response.data).length,
      }, 'Users Retrieval Performance Analysis');
      
      logger.info('✅ Successfully retrieved all users with valid structure', { 
        totalUsers: count,
        responseTime: response.duration, 
      });
    });
  });  test(qase(29, 'Should retrieve a specific user by ID and validate comprehensive user data'), async ({ logger, apiReporter }) => {
    test.info().annotations.push({ type: 'feature', description: 'users-by-id' });
    test.info().annotations.push({ type: 'tag', description: 'data-validation' });
    test.info().annotations.push({ type: 'priority', description: 'high' });
    
    const userId = 1;
    
    // Attach test-specific context
    await apiReporter.attachTestContext({
      test_objective: `Validate retrieval of specific user by ID (${userId})`,
      expected_behavior: 'API should return correct user data with comprehensive validation',
      validation_criteria: ['Correct user ID', 'Valid user data structure', 'Complete user information'],
    });
    
    await test.step(`Send GET request to retrieve user with ID ${userId}`, async () => {
      const response = await usersOperations.getUserByIdWithValidation(userId);
      
      await test.step('Validate comprehensive user data structure and content', async () => {
        await usersOperations.validateUserDataComprehensively(response.data);
        
        // Additional validations for user data integrity
        expect(response.data.id).toBe(userId);
        expect(response.data.name).toBeTruthy();
        expect(response.data.email).toBeTruthy();
        expect(response.data.username).toBeTruthy();
        
        // Attach comprehensive data validation results
        await apiReporter.attachValidationResults({
          user_id_validation: { expected: userId, actual: response.data.id, status: 'PASS' },
          name_validation: { expected: 'non-empty', actual: !!response.data.name, status: 'PASS' },
          email_validation: { expected: 'non-empty', actual: !!response.data.email, status: 'PASS' },
          username_validation: { expected: 'non-empty', actual: !!response.data.username, status: 'PASS' },
          comprehensive_validation: { expected: 'complete_user_data', actual: 'validated', status: 'PASS' },
        });
      });

      logger.info('✅ Successfully retrieved specific user with comprehensive data validation', { 
        userId,
        username: response.data.username,
        email: response.data.email,
        responseTime: response.duration, 
      });
    });
  });  test(qase(30, 'Should create a new user successfully and validate creation response'), async ({ logger, apiReporter }) => {
    // Mark as CRUD test for data manipulation validation
    test.info().annotations.push({ type: 'tag', description: 'crud' });
    test.info().annotations.push({ type: 'feature', description: 'users-creation' });
    test.info().annotations.push({ type: 'priority', description: 'critical' });
    
    // Attach test-specific context
    await apiReporter.attachTestContext({
      test_objective: 'Validate successful creation of new user via API',
      expected_behavior: 'API should create user and return it with assigned ID',
      validation_criteria: ['Status 201', 'Assigned user ID', 'Data integrity preservation'],
    });
    
    await test.step('Send POST request to create new user with valid data', async () => {
      const newUserData = UsersOperations.generateTestUserData();
      
      // Attach test data for traceability
      await apiReporter.attachTestData({
        operation: 'CREATE_USER',
        input_data: newUserData,
        data_source: 'generated',
        timestamp: new Date().toISOString(),
      });
      
      const response = await usersOperations.createUserWithValidation(newUserData);
      
      // Validate created user contains expected data
      expect(response.data.id).toBeTruthy();
      expect(response.data.name).toBe(newUserData.name);
      expect(response.data.email).toBe(newUserData.email);
      expect(response.data.username).toBe(newUserData.username);
      
      // Attach creation validation results
      await apiReporter.attachValidationResults({
        id_assignment: { expected: 'truthy', actual: !!response.data.id, status: 'PASS' },
        name_preservation: { expected: newUserData.name, actual: response.data.name, status: 'PASS' },
        email_preservation: { expected: newUserData.email, actual: response.data.email, status: 'PASS' },
        username_preservation: { expected: newUserData.username, actual: response.data.username, status: 'PASS' },
      });
      
      logger.info('✅ Successfully created new user with valid response data', { 
        userId: response.data.id,
        username: response.data.username,
        email: response.data.email,
        responseTime: response.duration, 
      });
    });
  });  test(qase(31, 'Should return 404 error for non-existent user ID and validate error response'), async ({ logger, apiReporter }) => {
    // Mark as error handling test for negative scenarios
    test.info().annotations.push({ type: 'tag', description: 'error-handling' });
    test.info().annotations.push({ type: 'feature', description: 'users-not-found' });
    test.info().annotations.push({ type: 'priority', description: 'medium' });
    
    const nonExistentId = 9999;
    
    // Attach test-specific context
    await apiReporter.attachTestContext({
      test_objective: `Validate 404 error handling for non-existent user ID (${nonExistentId})`,
      expected_behavior: 'API should return 404 status code and appropriate error response',
      validation_criteria: ['Status 404', 'Appropriate error handling', 'No server errors'],
    });
    
    await test.step(`Send GET request for non-existent user ID ${nonExistentId}`, async () => {
      const response = await usersService.getUserById(nonExistentId);

      await test.step('Validate that API returns 404 status code for missing user resource', async () => {
        expect(response.status).toBe(HTTP_STATUS_CODES.NOT_FOUND);
        
        // Attach error validation results
        await apiReporter.attachValidationResults({
          status_code_validation: { expected: 404, actual: response.status, status: 'PASS' },
          error_handling: { expected: 'graceful_404', actual: 'graceful_404', status: 'PASS' },
        });
        
        logger.info('✅ Correctly returned 404 error for non-existent user', { 
          requestedUserId: nonExistentId,
          statusCode: response.status,
          responseTime: response.duration, 
        });
      });
    });
  });
});
