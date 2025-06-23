import { UsersApiService } from '../services/users-api.service';
import { UsersValidator } from '../validators/users-validator';
import { createUserPayload } from '../fixtures/test-data';
import { TEST_DATA } from '../constants/test-constants';
import { expect } from '@playwright/test';

export class UsersOperations {
  constructor(private usersService: UsersApiService) {}

  /**
   * Retrieves all users and validates the response
   */
  async getAllUsersWithValidation(): Promise<{ response: any; count: number }> {
    const response = await this.usersService.getAllUsers();

    UsersValidator.validateSuccessfulResponse(response);
    UsersValidator.validateResponseDataStructure(response);
    UsersValidator.validateUserStructure(response.data[0]);

    return { response, count: response.data.length };
  }

  /**
   * Retrieves all users with comprehensive validation including count checks
   */
  async getAllUsersWithCountValidation(): Promise<{ response: any; count: number }> {
    const { response, count } = await this.getAllUsersWithValidation();

    // Validate that we receive a reasonable number of users
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(100); // Reasonable upper bound for users

    return { response, count };
  }

  /**
   * Retrieves a specific user by ID and validates the response
   */
  async getUserByIdWithValidation(userId: number): Promise<any> {
    const response = await this.usersService.getUserById(userId);

    UsersValidator.validateSuccessfulResponse(response);
    UsersValidator.validateSpecificUser(response, userId);

    return response;
  }

  /**
   * Retrieves a specific user by ID with comprehensive data validation
   */
  async getUserByIdWithComprehensiveValidation(userId: number): Promise<any> {
    const response = await this.getUserByIdWithValidation(userId);

    await this.validateUserDataComprehensively(response.data);

    // Additional validations for user data integrity
    expect(response.data.id).toBe(userId);
    expect(response.data.name).toBeTruthy();
    expect(response.data.email).toBeTruthy();
    expect(response.data.username).toBeTruthy();

    return response;
  }

  /**
   * Validates comprehensive user data including formats and nested structures
   */
  async validateUserDataComprehensively(user: any): Promise<void> {
    UsersValidator.validateUserDataFormats(user);
    UsersValidator.validateUserAddress(user.address);
    UsersValidator.validateUserCompany(user.company);
    UsersValidator.validateGeographicCoordinates(user.address.geo);
  }

  /**
   * Creates a new user and validates the response
   */
  async createUserWithValidation(userData: any): Promise<any> {
    const response = await this.usersService.createUser(userData);

    UsersValidator.validateCreationResponse(response);
    UsersValidator.validateCreatedUser(response, userData);

    return response;
  }

  /**
   * Creates a new user with comprehensive validation including data preservation checks
   */
  async createUserWithComprehensiveValidation(userData: any): Promise<any> {
    const response = await this.createUserWithValidation(userData);

    // Validate created user contains expected data
    expect(response.data.id).toBeTruthy();
    expect(response.data.name).toBe(userData.name);
    expect(response.data.username).toBe(userData.username);
    expect(response.data.email).toBe(userData.email);

    return response;
  }

  /**
   * Updates an existing user with validation
   */
  async updateUserWithValidation(userId: number, userData: any): Promise<any> {
    const response = await this.usersService.updateUser(userId, userData);

    UsersValidator.validateSuccessfulResponse(response);
    expect(response.data.id).toBe(userId);
    // Validate that updated fields match the input
    Object.keys(userData).forEach(key => {
      expect((response.data as any)[key]).toBe((userData as any)[key]);
    });

    return response;
  }

  /**
   * Deletes a user and validates the response
   */
  async deleteUserWithValidation(userId: number): Promise<any> {
    const response = await this.usersService.deleteUser(userId);

    // Validate successful deletion (should return 200 status)
    expect(response.status).toBe(200);

    return response;
  }

  /**
   * Validates 404 error for non-existent user
   */
  async validateUserNotFoundError(userId: number): Promise<any> {
    const response = await this.usersService.getUserById(userId);

    // Validate that API returns 404 status code for missing resource
    expect(response.status).toBe(404);

    return response;
  }

  /**
   * Generates test user data using centralized test data factory
   */
  static generateTestUserData(): any {
    return createUserPayload({
      name: TEST_DATA.USERS.VALID_USER.name,
      username: TEST_DATA.USERS.VALID_USER.username,
      email: TEST_DATA.USERS.VALID_USER.email,
      phone: TEST_DATA.USERS.VALID_USER.phone,
      website: TEST_DATA.USERS.VALID_USER.website,
      address: TEST_DATA.USERS.VALID_USER.address,
      company: TEST_DATA.USERS.VALID_USER.company,
    });
  }
}
