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
import { qase } from 'playwright-qase-reporter';
import { PostsApiService } from '../services/posts-api.service';
import { PostsOperations } from '../operations/posts-operations';
import { HTTP_STATUS_CODES } from '../constants/api-constants';

test.describe('Posts API - CRUD Operations', () => {
  let postsService: PostsApiService;
  let postsOperations: PostsOperations;

  test.beforeEach(async ({ apiClient, testContext }) => {
    postsService = new PostsApiService(apiClient);
    postsOperations = new PostsOperations(postsService);

    await testContext.attachTestContext({
      test_suite: 'Posts API CRUD Operations',
      test_type: 'API Integration Tests',
      endpoint_category: 'Posts Management',
      data_source: 'JSONPlaceholder API',
    });

    testContext.logTestStart('Test setup completed for Posts API CRUD operations');
  });

  test.afterEach(async ({ testContext }, testInfo) => {
    await testContext.attachTestSummary({
      test_name: testInfo.title,
      test_status: testInfo.status,
      test_duration: testInfo.duration,
    });

    testContext.logTestEnd(`Test completed: ${testInfo.title}`);
  });

  test(qase(20, 'Should retrieve all posts successfully and validate response structure'), async ({ testContext }) => {
    await test.step('Send GET request to retrieve all posts from API endpoint', async () => {
      const { response, count } = await postsOperations.getAllPostsWithCountValidation();

      testContext.logInfo('✅ Successfully retrieved all posts with valid structure', {
        totalPosts: count,
        responseTime: response.duration,
      });
    });
  });

  test(qase(21, 'Should retrieve a specific post by ID and validate post data integrity'), async ({ testContext }) => {
    const postId = 1;

    await test.step(`Send GET request to retrieve post with ID ${postId}`, async () => {
      const response = await postsOperations.getPostByIdWithComprehensiveValidation(postId);

      testContext.logInfo('✅ Successfully retrieved specific post with valid data', {
        postId,
        userId: response.data.userId,
        responseTime: response.duration,
      });
    });
  });

  test(qase(22, 'Should create a new post successfully and validate creation response'), async ({ testContext }) => {
    await test.step('Send POST request to create new post with valid data', async () => {
      const newPostData = PostsOperations.generateTestPostData();
      const response = await postsOperations.createPostWithComprehensiveValidation(newPostData);

      testContext.logInfo('✅ Successfully created new post with valid response data', {
        postId: response.data.id,
        userId: response.data.userId,
        responseTime: response.duration,
      });
    });
  });

  test(
    qase(23, 'Should return 404 error for non-existent post ID and validate error response'),
    async ({ testContext }) => {
      const nonExistentId = 9999;

      await test.step(`Send GET request for non-existent post ID ${nonExistentId}`, async () => {
        const response = await postsOperations.validatePostNotFoundError(nonExistentId);

        testContext.logInfo('✅ Correctly returned 404 error for non-existent post', {
          requestedPostId: nonExistentId,
          statusCode: response.status,
          responseTime: response.duration,
        });
      });
    },
  );
});
