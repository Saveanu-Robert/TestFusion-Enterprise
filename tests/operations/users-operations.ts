import { UsersApiService } from '../services/users-api.service';
import { UsersValidator } from '../validators/users-validator';
import { createUserPayload } from '../fixtures/test-data';
import { TEST_DATA } from '../constants/test-constants';

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
   * Retrieves a specific user by ID and validates the response
   */
  async getUserByIdWithValidation(userId: number): Promise<any> {
    const response = await this.usersService.getUserById(userId);
    
    UsersValidator.validateSuccessfulResponse(response);
    UsersValidator.validateSpecificUser(response, userId);
    
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
