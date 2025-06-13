/**
 * Posts API Service following Repository Pattern
 * Encapsulates all posts-related API operations
 */

import { ApiClient, ApiResponse } from '../clients/api-client';
import { Post, TestDataFactory } from '../fixtures/test-data';
import { API_ENDPOINTS } from '../constants/api-constants';

export class PostsApiService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Retrieves all posts
   */
  async getAllPosts(): Promise<ApiResponse<Post[]>> {
    return await this.apiClient.get<Post[]>(API_ENDPOINTS.POSTS);
  }

  /**
   * Retrieves a specific post by ID
   */
  async getPostById(id: number): Promise<ApiResponse<Post>> {
    return await this.apiClient.get<Post>(`${API_ENDPOINTS.POSTS}/${id}`);
  }

  /**
   * Retrieves posts by user ID
   */
  async getPostsByUserId(userId: number): Promise<ApiResponse<Post[]>> {
    return await this.apiClient.get<Post[]>(API_ENDPOINTS.POSTS, {
      params: { userId: userId.toString() },
    });
  }

  /**
   * Creates a new post
   */
  async createPost(postData?: Partial<Omit<Post, 'id'>>): Promise<ApiResponse<Post>> {
    const payload = postData || TestDataFactory.createPostPayload();
    return await this.apiClient.post<Post>(API_ENDPOINTS.POSTS, payload);
  }

  /**
   * Updates an existing post
   */
  async updatePost(id: number, postData: Partial<Post>): Promise<ApiResponse<Post>> {
    return await this.apiClient.put<Post>(`${API_ENDPOINTS.POSTS}/${id}`, postData);
  }

  /**
   * Partially updates an existing post
   */
  async patchPost(id: number, postData: Partial<Post>): Promise<ApiResponse<Post>> {
    return await this.apiClient.put<Post>(`${API_ENDPOINTS.POSTS}/${id}`, postData);
  }

  /**
   * Deletes a post
   */
  async deletePost(id: number): Promise<ApiResponse<void>> {
    return await this.apiClient.delete<void>(`${API_ENDPOINTS.POSTS}/${id}`);
  }

  /**
   * Creates multiple posts for bulk testing
   */
  async createMultiplePosts(count: number, userId: number = 1): Promise<ApiResponse<Post>[]> {
    const payloads = TestDataFactory.createMultiplePostPayloads(count, userId);
    const promises = payloads.map(payload => this.createPost(payload));
    return await Promise.all(promises);
  }
}
