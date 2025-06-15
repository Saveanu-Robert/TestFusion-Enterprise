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
import { UsersApiService } from '../services/users-api.service';
import { UsersOperations } from '../operations/users-operations';
import { HTTP_STATUS_CODES } from '../constants/api-constants';

test.describe('Users API - Data Validation', () => {
  let usersService: UsersApiService;
  let usersOperations: UsersOperations;

  test.beforeEach(async ({ apiClient }) => {
    usersService = new UsersApiService(apiClient);
    usersOperations = new UsersOperations(usersService);
  });
  test('Should retrieve all users successfully and validate response structure', async ({ logger }) => {
    // Mark as smoke test for core functionality validation
    test.info().annotations.push({ type: 'tag', description: 'smoke' });
    test.info().annotations.push({ type: 'feature', description: 'users-retrieval' });
    
    await test.step('Send GET request to retrieve all users from API endpoint', async () => {
      const { response, count } = await usersOperations.getAllUsersWithValidation();
      
      // Validate that we receive a reasonable number of users
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThanOrEqual(100); // Reasonable upper bound for users
      
      logger.info('✅ Successfully retrieved all users with valid structure', { 
        totalUsers: count,
        responseTime: response.duration, 
      });
    });
  });
  test('Should retrieve a specific user by ID and validate comprehensive user data', async ({ logger }) => {
    test.info().annotations.push({ type: 'feature', description: 'users-by-id' });
    test.info().annotations.push({ type: 'tag', description: 'data-validation' });
    
    const userId = 1;
    
    await test.step(`Send GET request to retrieve user with ID ${userId}`, async () => {
      const response = await usersOperations.getUserByIdWithValidation(userId);
      
      await test.step('Validate comprehensive user data structure and content', async () => {
        await usersOperations.validateUserDataComprehensively(response.data);
        
        // Additional validations for user data integrity
        expect(response.data.id).toBe(userId);
        expect(response.data.name).toBeTruthy();
        expect(response.data.email).toBeTruthy();
        expect(response.data.username).toBeTruthy();
      });

      logger.info('✅ Successfully retrieved specific user with comprehensive data validation', { 
        userId,
        username: response.data.username,
        email: response.data.email,
        responseTime: response.duration, 
      });
    });
  });
  test('Should create a new user successfully and validate creation response', async ({ logger }) => {
    // Mark as CRUD test for data manipulation validation
    test.info().annotations.push({ type: 'tag', description: 'crud' });
    test.info().annotations.push({ type: 'feature', description: 'users-creation' });
    
    await test.step('Send POST request to create new user with valid data', async () => {
      const newUserData = UsersOperations.generateTestUserData();
      const response = await usersOperations.createUserWithValidation(newUserData);
      
      // Validate created user contains expected data
      expect(response.data.id).toBeTruthy();
      expect(response.data.name).toBe(newUserData.name);
      expect(response.data.email).toBe(newUserData.email);
      expect(response.data.username).toBe(newUserData.username);
      
      logger.info('✅ Successfully created new user with valid response data', { 
        userId: response.data.id,
        username: response.data.username,
        email: response.data.email,
        responseTime: response.duration, 
      });
    });
  });
  test('Should return 404 error for non-existent user ID and validate error response', async ({ logger }) => {
    // Mark as error handling test for negative scenarios
    test.info().annotations.push({ type: 'tag', description: 'error-handling' });
    test.info().annotations.push({ type: 'feature', description: 'users-not-found' });
    
    const nonExistentId = 9999;
    
    await test.step(`Send GET request for non-existent user ID ${nonExistentId}`, async () => {
      const response = await usersService.getUserById(nonExistentId);

      await test.step('Validate that API returns 404 status code for missing user resource', async () => {
        expect(response.status).toBe(HTTP_STATUS_CODES.NOT_FOUND);
        
        logger.info('✅ Correctly returned 404 error for non-existent user', { 
          requestedUserId: nonExistentId,
          statusCode: response.status,
          responseTime: response.duration, 
        });
      });
    });
  });
});
