/**
 * Posts API CRUD Operations Tests
 * 
 * Comprehensive test suite for validating posts-related API endpoints,
 * focusing on Create, Read, Update, and Delete operations with full data validation.
 * Tests include positive and negative scenarios, error handling, and response validation.
 * 
 * @author TestFusion-Enterprise Team
 * @version 1.0.0
 */

import { test, expect } from '../fixtures/api-fixtures';
import { PostsApiService } from '../services/posts-api.service';
import { PostsOperations } from '../operations/posts-operations';
import { HTTP_STATUS_CODES } from '../constants/api-constants';

test.describe('Posts API - CRUD Operations', () => {
  let postsService: PostsApiService;
  let postsOperations: PostsOperations;

  test.beforeEach(async ({ apiClient }) => {
    postsService = new PostsApiService(apiClient);
    postsOperations = new PostsOperations(postsService);
  });
  test('Should retrieve all posts successfully and validate response structure', async ({ logger }) => {
    // Mark as smoke test for core functionality validation
    test.info().annotations.push({ type: 'tag', description: 'smoke' });
    test.info().annotations.push({ type: 'feature', description: 'posts-retrieval' });
    test.slow(); // Mark as potentially slow test
    
    await test.step('Send GET request to retrieve all posts from API endpoint', async () => {
      const { response, count } = await postsOperations.getAllPostsWithValidation();
      
      // Validate that we receive a reasonable number of posts
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThanOrEqual(500); // Reasonable upper bound
      
      logger.info('✅ Successfully retrieved all posts with valid structure', { 
        totalPosts: count,
        responseTime: response.duration, 
      });
    });
  });
  test('Should retrieve a specific post by ID and validate post data integrity', async ({ logger }) => {
    test.info().annotations.push({ type: 'feature', description: 'posts-by-id' });
    const postId = 1;
    
    await test.step(`Send GET request to retrieve post with ID ${postId}`, async () => {
      const response = await postsOperations.getPostByIdWithValidation(postId);
      
      // Validate post structure and data integrity
      expect(response.data.id).toBe(postId);
      expect(response.data.userId).toBeGreaterThan(0);
      expect(response.data.title).toBeTruthy();
      expect(response.data.body).toBeTruthy();
      
      logger.info('✅ Successfully retrieved specific post with valid data', { 
        postId,
        userId: response.data.userId,
        responseTime: response.duration, 
      });
    });
  });
  test('Should create a new post successfully and validate creation response', async ({ logger }) => {
    // Mark as CRUD test for data manipulation validation
    test.info().annotations.push({ type: 'tag', description: 'crud' });
    test.info().annotations.push({ type: 'feature', description: 'posts-creation' });
    
    await test.step('Send POST request to create new post with valid data', async () => {
      const newPostData = PostsOperations.generateTestPostData();
      const response = await postsOperations.createPostWithValidation(newPostData);
      
      // Validate created post contains expected data
      expect(response.data.id).toBeTruthy();
      expect(response.data.userId).toBe(newPostData.userId);
      expect(response.data.title).toBe(newPostData.title);
      expect(response.data.body).toBe(newPostData.body);
      
      logger.info('✅ Successfully created new post with valid response data', { 
        postId: response.data.id,
        userId: response.data.userId,
        responseTime: response.duration, 
      });
    });
  });
  test('Should return 404 error for non-existent post ID and validate error response', async ({ logger }) => {
    // Mark as error handling test for negative scenarios
    test.info().annotations.push({ type: 'tag', description: 'error-handling' });
    test.info().annotations.push({ type: 'feature', description: 'posts-not-found' });
    
    const nonExistentId = 9999;
    
    await test.step(`Send GET request for non-existent post ID ${nonExistentId}`, async () => {
      const response = await postsService.getPostById(nonExistentId);

      await test.step('Validate that API returns 404 status code for missing resource', async () => {
        expect(response.status).toBe(HTTP_STATUS_CODES.NOT_FOUND);
        
        logger.info('✅ Correctly returned 404 error for non-existent post', { 
          requestedPostId: nonExistentId,
          statusCode: response.status,
          responseTime: response.duration, 
        });
      });
    });
  });
});
