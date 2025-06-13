/**
 * Posts API Service following Repository Pattern
 * Encapsulates all posts-related API operations
 */

import { ApiClient, ApiResponse } from '../clients/api-client';
import { Post, createPostPayload, createMultiplePostPayloads } from '../fixtures/test-data';
import { API_ENDPOINTS } from '../constants/api-constants';

export class PostsApiService {
  constructor(private apiClient: ApiClient) {}
  /**
   * Retrieves all posts
   */
  async getAllPosts(): Promise<ApiResponse<Post[]>> {
    return this.apiClient.get<Post[]>(API_ENDPOINTS.POSTS);
  }

  /**
   * Retrieves a specific post by ID
   */
  async getPostById(id: number): Promise<ApiResponse<Post>> {
    return this.apiClient.get<Post>(`${API_ENDPOINTS.POSTS}/${id}`);
  }

  /**
   * Retrieves posts by user ID
   */
  async getPostsByUserId(userId: number): Promise<ApiResponse<Post[]>> {
    return this.apiClient.get<Post[]>(API_ENDPOINTS.POSTS, {
      params: { userId: userId.toString() },
    });
  }

  /**
   * Creates a new post
   */
  async createPost(postData?: Partial<Omit<Post, 'id'>>): Promise<ApiResponse<Post>> {
    const payload = postData || createPostPayload();
    return this.apiClient.post<Post>(API_ENDPOINTS.POSTS, payload);
  }

  /**
   * Updates an existing post
   */
  async updatePost(id: number, postData: Partial<Post>): Promise<ApiResponse<Post>> {
    return this.apiClient.put<Post>(`${API_ENDPOINTS.POSTS}/${id}`, postData);
  }
  /**
   * Partially updates an existing post
   */
  async patchPost(id: number, postData: Partial<Post>): Promise<ApiResponse<Post>> {
    return this.apiClient.patch<Post>(`${API_ENDPOINTS.POSTS}/${id}`, postData);
  }

  /**
   * Deletes a post
   */
  async deletePost(id: number): Promise<ApiResponse<void>> {
    return this.apiClient.delete<void>(`${API_ENDPOINTS.POSTS}/${id}`);
  }
  /**
   * Creates multiple posts for bulk testing
   */
  async createMultiplePosts(count: number, userId: number = 1): Promise<ApiResponse<Post>[]> {
    const payloads = createMultiplePostPayloads(count, userId);
    
    // Batch requests to avoid overwhelming the API
    const BATCH_SIZE = 5;
    const results: ApiResponse<Post>[] = [];
    
    for (let i = 0; i < payloads.length; i += BATCH_SIZE) {
      const batch = payloads.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(payload => this.createPost(payload));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }
}
