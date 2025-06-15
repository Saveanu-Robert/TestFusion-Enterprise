/**
 * Comments API Relationship Validation Tests
 * 
 * Comprehensive test suite for validating comment-related API endpoints,
 * focusing on relationship validation between comments, posts, and data integrity.
 * Tests include CRUD operations, data validation, and relationship constraints.
 * 
 * @author TestFusion-Enterprise Team
 * @version 1.0.0
 */

import { test, expect } from '../fixtures/api-fixtures';
import { CommentsApiService } from '../services/comments-api.service';
import { CommentsOperations } from '../operations/comments-operations';

test.describe('Comments API - Relationship Validation', () => {
  let commentsService: CommentsApiService;
  let commentsOperations: CommentsOperations;

  test.beforeEach(async ({ apiClient }) => {
    commentsService = new CommentsApiService(apiClient);
    commentsOperations = new CommentsOperations(commentsService);
  });

  test('Should retrieve all comments successfully and validate response structure', async ({ logger }) => {
    // Mark as smoke test for core functionality validation
    test.info().annotations.push({ type: 'tag', description: 'smoke' });
    test.info().annotations.push({ type: 'feature', description: 'comments-retrieval' });
    
    await test.step('Send GET request to retrieve all comments from API', async () => {
      const { response, count } = await commentsOperations.getAllCommentsWithValidation();
      
      // Validate that we receive a reasonable number of comments
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThanOrEqual(1000); // Reasonable upper bound
      
      logger.info('✅ Successfully retrieved all comments with valid structure', { 
        totalComments: count,
        responseTime: response.duration, 
      });
    });
  });

  test('Should retrieve a specific comment by ID and validate comment structure', async ({ logger }) => {
    const commentId = 1;
    
    await test.step(`Send GET request to retrieve comment with ID ${commentId}`, async () => {
      const response = await commentsOperations.getCommentByIdWithValidation(commentId);
      
      // Validate comment ID matches request
      expect(response.data.id).toBe(commentId);
      expect(response.data.postId).toBeGreaterThan(0);
      expect(response.data.name).toBeTruthy();
      expect(response.data.email).toBeTruthy();
      expect(response.data.body).toBeTruthy();
      
      logger.info('✅ Successfully retrieved specific comment with valid data', { 
        commentId,
        postId: response.data.postId,
        responseTime: response.duration, 
      });
    });
  });

  test('Should retrieve comments by post ID and validate post-comment relationships', async ({ logger }) => {
    const postId = 1;
    
    await test.step(`Send GET request to retrieve all comments for post ${postId}`, async () => {
      const { response, count } = await commentsOperations.getCommentsByPostIdWithValidation(postId);
      // Validate all comments belong to the specified post
      response.data.forEach((comment: any) => {
        expect(comment.postId).toBe(postId);
      });
      
      expect(count).toBeGreaterThan(0);
      
      logger.info('✅ Successfully retrieved comments for post with valid relationships', { 
        postId, 
        commentCount: count,
        responseTime: response.duration, 
      });
    });
  });

  test('Should create a new comment successfully and validate creation response', async ({ logger }) => {
    // Mark as CRUD test for data manipulation validation
    test.info().annotations.push({ type: 'tag', description: 'crud' });
    test.info().annotations.push({ type: 'feature', description: 'comments-creation' });
    
    await test.step('Send POST request to create new comment with valid data', async () => {
      const newCommentData = CommentsOperations.generateTestCommentData();
      const response = await commentsOperations.createCommentWithValidation(newCommentData);
      
      // Validate created comment contains expected data
      expect(response.data.id).toBeTruthy();
      expect(response.data.postId).toBe(newCommentData.postId);
      expect(response.data.name).toBe(newCommentData.name);
      expect(response.data.email).toBe(newCommentData.email);
      expect(response.data.body).toBe(newCommentData.body);      
      logger.info('✅ Successfully created new comment with valid response data', { 
        commentId: response.data.id,
        postId: response.data.postId,
        responseTime: response.duration, 
      });
    });
  });
});
