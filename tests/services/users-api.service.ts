/**
 * Users API Service following Repository Pattern
 * Encapsulates all users-related API operations
 */

import { ApiClient, ApiResponse } from '../clients/api-client';
import { User, createUserPayload } from '../fixtures/test-data';
import { API_ENDPOINTS } from '../constants/api-constants';

export class UsersApiService {
  constructor(private apiClient: ApiClient) {}
  /**
   * Retrieves all users
   */
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    return this.apiClient.get<User[]>(API_ENDPOINTS.USERS);
  }

  /**
   * Retrieves a specific user by ID
   */
  async getUserById(id: number): Promise<ApiResponse<User>> {
    return this.apiClient.get<User>(`${API_ENDPOINTS.USERS}/${id}`);
  }

  /**
   * Creates a new user
   */
  async createUser(userData?: Partial<Omit<User, 'id'>>): Promise<ApiResponse<User>> {
    const payload = userData || createUserPayload();
    return this.apiClient.post<User>(API_ENDPOINTS.USERS, payload);
  }

  /**
   * Updates an existing user
   */
  async updateUser(id: number, userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.apiClient.put<User>(`${API_ENDPOINTS.USERS}/${id}`, userData);
  }

  /**
   * Deletes a user
   */
  async deleteUser(id: number): Promise<ApiResponse<void>> {
    return this.apiClient.delete<void>(`${API_ENDPOINTS.USERS}/${id}`);
  }
}
