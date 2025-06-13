/**
 * Comments API Service following Repository Pattern
 * Encapsulates all comments-related API operations
 */

import { ApiClient, ApiResponse } from '../clients/api-client';
import { Comment, createCommentPayload } from '../fixtures/test-data';
import { API_ENDPOINTS } from '../constants/api-constants';

export class CommentsApiService {
  constructor(private apiClient: ApiClient) {}
  /**
   * Retrieves all comments
   */
  async getAllComments(): Promise<ApiResponse<Comment[]>> {
    return this.apiClient.get<Comment[]>(API_ENDPOINTS.COMMENTS);
  }

  /**
   * Retrieves a specific comment by ID
   */
  async getCommentById(id: number): Promise<ApiResponse<Comment>> {
    return this.apiClient.get<Comment>(`${API_ENDPOINTS.COMMENTS}/${id}`);
  }

  /**
   * Retrieves comments by post ID
   */
  async getCommentsByPostId(postId: number): Promise<ApiResponse<Comment[]>> {
    return this.apiClient.get<Comment[]>(API_ENDPOINTS.COMMENTS, {
      params: { postId: postId.toString() },
    });
  }

  /**
   * Creates a new comment
   */
  async createComment(
    commentData?: Partial<Omit<Comment, 'id'>>,
    postId: number = 1,
  ): Promise<ApiResponse<Comment>> {
    const payload = commentData ?? createCommentPayload(postId);
    return this.apiClient.post<Comment>(API_ENDPOINTS.COMMENTS, payload);
  }

  /**
   * Updates an existing comment
   */
  async updateComment(id: number, commentData: Partial<Comment>): Promise<ApiResponse<Comment>> {
    return this.apiClient.put<Comment>(`${API_ENDPOINTS.COMMENTS}/${id}`, commentData);
  }

  /**
   * Deletes a comment
   */
  async deleteComment(id: number): Promise<ApiResponse<void>> {
    return this.apiClient.delete<void>(`${API_ENDPOINTS.COMMENTS}/${id}`);
  }
}
