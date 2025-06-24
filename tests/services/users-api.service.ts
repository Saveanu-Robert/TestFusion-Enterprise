/**
 * Users API Service following Repository Pattern
 * Encapsulates all users-related API operations
 */

import { ApiClient, ApiResponse } from '../clients/api-client';
import { User, createUserPayload } from '../fixtures/test-data';
import { ApiEndpoints } from '../constants/api-constants';

export class UsersApiService {
  constructor(private apiClient: ApiClient) {}
  /**
   * Retrieves all users
   */
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    return this.apiClient.get<User[]>(ApiEndpoints.USERS);
  }

  /**
   * Retrieves a specific user by ID
   */
  async getUserById(id: number): Promise<ApiResponse<User>> {
    return this.apiClient.get<User>(`${ApiEndpoints.USERS}/${id}`);
  }

  /**
   * Creates a new user
   */
  async createUser(userData?: Partial<Omit<User, 'id'>>): Promise<ApiResponse<User>> {
    const payload = userData || createUserPayload();
    return this.apiClient.post<User>(ApiEndpoints.USERS, payload);
  }

  /**
   * Updates an existing user
   */
  async updateUser(id: number, userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.apiClient.put<User>(`${ApiEndpoints.USERS}/${id}`, userData);
  }

  /**
   * Deletes a user
   */
  async deleteUser(id: number): Promise<ApiResponse<void>> {
    return this.apiClient.delete<void>(`${ApiEndpoints.USERS}/${id}`);
  }
}
