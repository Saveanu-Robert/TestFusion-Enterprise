import { CommentsApiService } from '../services/comments-api.service';
import { CommentsValidator } from '../validators/comments-validator';
import { createCommentPayload } from '../fixtures/test-data';
import { TEST_DATA } from '../constants/test-constants';
import { expect } from '@playwright/test';

export class CommentsOperations {
  constructor(private commentsService: CommentsApiService) {}

  /**
   * Retrieves all comments and validates the response
   */
  async getAllCommentsWithValidation(): Promise<{ response: any; count: number }> {
    const response = await this.commentsService.getAllComments();

    CommentsValidator.validateSuccessfulResponse(response);
    CommentsValidator.validateResponseDataStructure(response);
    CommentsValidator.validateCommentStructure(response.data[0]);

    return { response, count: response.data.length };
  }

  /**
   * Retrieves all comments with comprehensive validation including count checks
   */
  async getAllCommentsWithCountValidation(): Promise<{ response: any; count: number }> {
    const { response, count } = await this.getAllCommentsWithValidation();

    // Validate that we receive a reasonable number of comments
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(1000); // Reasonable upper bound

    return { response, count };
  }

  /**
   * Retrieves a specific comment by ID and validates the response
   */
  async getCommentByIdWithValidation(commentId: number): Promise<any> {
    const response = await this.commentsService.getCommentById(commentId);

    CommentsValidator.validateSuccessfulResponse(response);
    CommentsValidator.validateSpecificComment(response, commentId);
    CommentsValidator.validateEmailFormat(response.data.email);

    return response;
  }

  /**
   * Retrieves a specific comment by ID with comprehensive data validation
   */
  async getCommentByIdWithComprehensiveValidation(commentId: number): Promise<any> {
    const response = await this.getCommentByIdWithValidation(commentId);

    // Validate comment structure and data integrity
    expect(response.data.id).toBe(commentId);
    expect(response.data.postId).toBeGreaterThan(0);
    expect(response.data.name).toBeTruthy();
    expect(response.data.email).toBeTruthy();
    expect(response.data.body).toBeTruthy();

    return response;
  }

  /**
   * Retrieves comments for a specific post and validates the response
   */
  async getCommentsByPostIdWithValidation(postId: number): Promise<{ response: any; count: number }> {
    const response = await this.commentsService.getCommentsByPostId(postId);

    CommentsValidator.validateSuccessfulResponse(response);
    CommentsValidator.validateResponseDataStructure(response);
    CommentsValidator.validateCommentsForPost(response.data, postId);

    return { response, count: response.data.length };
  }

  /**
   * Retrieves comments for a specific post with comprehensive validation including count checks
   */
  async getCommentsByPostIdWithCountValidation(postId: number): Promise<{ response: any; count: number }> {
    const { response, count } = await this.getCommentsByPostIdWithValidation(postId);

    // Validate that we receive a reasonable number of comments for the post
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(50); // Reasonable upper bound per post

    // Verify all comments belong to the specified post
    response.data.forEach((comment: any) => {
      expect(comment.postId).toBe(postId);
    });

    return { response, count };
  }

  /**
   * Creates a new comment and validates the response
   */
  async createCommentWithValidation(commentData: any): Promise<any> {
    const response = await this.commentsService.createComment(commentData);

    CommentsValidator.validateCreationResponse(response);
    CommentsValidator.validateCreatedComment(response, commentData);

    return response;
  }

  /**
   * Creates a new comment with comprehensive validation including data preservation checks
   */
  async createCommentWithComprehensiveValidation(commentData: any): Promise<any> {
    const response = await this.createCommentWithValidation(commentData);

    // Validate created comment contains expected data
    expect(response.data.id).toBeTruthy();
    expect(response.data.postId).toBe(commentData.postId);
    expect(response.data.name).toBe(commentData.name);
    expect(response.data.email).toBe(commentData.email);
    expect(response.data.body).toBe(commentData.body);

    return response;
  }

  /**
   * Validates 404 error for non-existent comment
   */
  async validateCommentNotFoundError(commentId: number): Promise<any> {
    const response = await this.commentsService.getCommentById(commentId);

    // Validate that API returns 404 status code for missing resource
    expect(response.status).toBe(404);

    return response;
  }

  /**
   * Validates comments relationship integrity with posts
   */
  async validateCommentsPostRelationship(postId: number): Promise<void> {
    const { response } = await this.getCommentsByPostIdWithValidation(postId);

    // Validate that all comments have valid post relationship
    response.data.forEach((comment: any) => {
      expect(comment.postId).toBe(postId);
      expect(comment.id).toBeGreaterThan(0);
      expect(comment.name).toBeTruthy();
      expect(comment.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(comment.body).toBeTruthy();
    });
  }

  /**
   * Generates test comment data using centralized test data factory
   */
  static generateTestCommentData(postId: number = 1): any {
    return createCommentPayload(postId, {
      name: TEST_DATA.COMMENTS.VALID_COMMENT.name,
      email: TEST_DATA.COMMENTS.VALID_COMMENT.email,
      body: TEST_DATA.COMMENTS.VALID_COMMENT.body,
    });
  }
}
