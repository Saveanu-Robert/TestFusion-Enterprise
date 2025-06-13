import { test, expect } from '../fixtures/api-fixtures';
import { UsersApiService } from '../services/users-api.service';
import { TEST_TAGS, HTTP_STATUS_CODES } from '../constants/api-constants';

test.describe('Users API - Simple Tests', () => {
  let usersService: UsersApiService;

  test.beforeAll(async ({ apiClient }) => {
    usersService = new UsersApiService(apiClient);
  });

  test(`${TEST_TAGS.API}${TEST_TAGS.USERS}${TEST_TAGS.SMOKE} Should retrieve all users successfully`, async ({ logger }) => {
    logger.logTestStep('Step 1: Send GET request to retrieve all users');
    const response = await usersService.getAllUsers();

    logger.logTestStep('Step 2: Validate response status');
    expect(response.status).toBe(HTTP_STATUS_CODES.OK);

    logger.logTestStep('Step 3: Validate response data');
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);

    logger.logTestStep('Step 4: Validate first user structure');
    const firstUser = response.data[0];
    expect(firstUser).toHaveProperty('id');
    expect(firstUser).toHaveProperty('name');
    expect(firstUser).toHaveProperty('username');
    expect(firstUser).toHaveProperty('email');
    expect(firstUser).toHaveProperty('address');
    expect(firstUser).toHaveProperty('phone');
    expect(firstUser).toHaveProperty('website');
    expect(firstUser).toHaveProperty('company');

    logger.info('Successfully retrieved all users', { count: response.data.length });
  });

  test(`${TEST_TAGS.API}${TEST_TAGS.USERS} Should retrieve a specific user by ID`, async ({ logger }) => {
    const userId = 1;
    
    logger.logTestStep(`Step 1: Send GET request to retrieve user with ID ${userId}`);
    const response = await usersService.getUserById(userId);

    logger.logTestStep('Step 2: Validate response status');
    expect(response.status).toBe(HTTP_STATUS_CODES.OK);

    logger.logTestStep('Step 3: Validate response data');
    expect(response.data).toBeDefined();
    expect(response.data.id).toBe(userId);
    expect(response.data.name).toBeDefined();
    expect(response.data.username).toBeDefined();
    expect(response.data.email).toBeDefined();

    logger.logTestStep('Step 4: Validate email format');
    expect(response.data.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

    logger.info('Successfully retrieved specific user', { userId });
  });

  test(`${TEST_TAGS.API}${TEST_TAGS.USERS}${TEST_TAGS.CRUD} Should create a new user successfully`, async ({ logger }) => {
    const newUserData = {
      name: 'Test User',
      username: 'testuser',
      email: 'testuser@example.com',
      address: {
        street: 'Test Street',
        suite: 'Apt. 123',
        city: 'Test City',
        zipcode: '12345-6789',
        geo: {
          lat: '40.7128',
          lng: '-74.0060'
        }
      },
      phone: '1-555-123-4567',
      website: 'testuser.org',
      company: {
        name: 'Test Company',
        catchPhrase: 'Testing is our business',
        bs: 'test driven development'
      }
    };

    logger.logTestStep('Step 1: Send POST request to create new user');
    const response = await usersService.createUser(newUserData);

    logger.logTestStep('Step 2: Validate response status');
    expect(response.status).toBe(HTTP_STATUS_CODES.CREATED);

    logger.logTestStep('Step 3: Validate response data');
    expect(response.data).toBeDefined();
    expect(response.data.id).toBeDefined();
    expect(response.data.name).toBe(newUserData.name);
    expect(response.data.username).toBe(newUserData.username);
    expect(response.data.email).toBe(newUserData.email);

    logger.info('Successfully created new user', { userId: response.data.id });
  });

  test(`${TEST_TAGS.API}${TEST_TAGS.USERS} Should return 404 for non-existent user`, async ({ logger }) => {
    const nonExistentId = 9999;
    
    logger.logTestStep(`Step 1: Send GET request to retrieve non-existent user ID ${nonExistentId}`);
    const response = await usersService.getUserById(nonExistentId);

    logger.logTestStep('Step 2: Validate response status');
    expect(response.status).toBe(HTTP_STATUS_CODES.NOT_FOUND);

    logger.info('Correctly returned 404 for non-existent user', { userId: nonExistentId });
  });
});
