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

  test('should retrieve all users successfully', async ({ logger }) => {
    // Mark as smoke test
    test.info().annotations.push({ type: 'tag', description: 'smoke' });
    
    await test.step('Retrieve all users', async () => {
      const { response, count } = await usersOperations.getAllUsersWithValidation();
      logger.info('Successfully retrieved all users', { count });
    });
  });

  test('should retrieve a specific user by ID', async ({ logger }) => {
    const userId = 1;
    
    await test.step(`Retrieve user with ID ${userId}`, async () => {
      const response = await usersOperations.getUserByIdWithValidation(userId);
      
      await test.step('Validate comprehensive user data', async () => {
        await usersOperations.validateUserDataComprehensively(response.data);
      });

      logger.info('Successfully retrieved specific user', { userId });
    });
  });

  test('should create a new user successfully', async ({ logger }) => {
    // Mark as CRUD test
    test.info().annotations.push({ type: 'tag', description: 'crud' });
    
    await test.step('Create new user', async () => {
      const newUserData = UsersOperations.generateTestUserData();
      const response = await usersOperations.createUserWithValidation(newUserData);
      logger.info('Successfully created new user', { userId: response.data.id });
    });
  });

  test('should return 404 for non-existent user', async ({ logger }) => {
    const nonExistentId = 9999;
    
    await test.step(`Request non-existent user ID ${nonExistentId}`, async () => {
      const response = await usersService.getUserById(nonExistentId);

      await test.step('Validate 404 response', async () => {
        expect(response.status).toBe(HTTP_STATUS_CODES.NOT_FOUND);
      });

      logger.info('Correctly returned 404 for non-existent user', { userId: nonExistentId });
    });
  });
});
