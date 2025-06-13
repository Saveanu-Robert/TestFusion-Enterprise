import { UsersApiService } from '../services/users-api.service';
import { UsersValidator } from '../validators/users-validator';

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
   * Generates test user data
   */
  static generateTestUserData(): any {
    return {
      name: 'Test User',
      username: 'testuser',
      email: 'testuser@example.com',
      phone: '555-123-4567',
      website: 'testuser.example.com',
      address: {
        street: '123 Test Street',
        suite: 'Apt 456',
        city: 'Test City',
        zipcode: '12345-678',
        geo: {
          lat: '40.7128',
          lng: '-74.0060',
        },
      },
      company: {
        name: 'Test Company',
        catchPhrase: 'Testing Excellence',
        bs: 'quality test solutions',
      },
    };
  }
}
