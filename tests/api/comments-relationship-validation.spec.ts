/**
 * Comments API Relationship Validation Tests
 *
 * Enterprise-grade test suite for validating comment-related API endpoints,
 * focusing on relationship validation between comments, posts, and data integrity.
 * Tests include CRUD operations, data validation, and relationship constraints.
 *
 * @fileoverview Comprehensive comment relationship validation tests for TestFusion-Enterprise
 * @author TestFusion-Enterprise Team
 * @version 1.0.0
 * @since 2024
 */

import { test } from '../fixtures/api-fixtures';
import type { ApiTestFixtures } from '../fixtures/api-fixtures';

// Qase integration with fallback for environments without qase configuration
let qase: (id: number, title: string) => string;
try {
  // Use dynamic import to handle optional qase reporter
  const qaseModule = eval('require')('playwright-qase-reporter');
  qase = qaseModule.qase;
} catch (error) {
  // Fallback for environments without qase reporter
  qase = (id: number, title: string) => title;
}
import { CommentsApiService } from '../services/comments-api.service';
import { CommentsOperations } from '../operations/comments-operations';

test.describe('Comments API - Relationship Validation', () => {
  let commentsService: CommentsApiService;
  let commentsOperations: CommentsOperations;
  test.beforeEach(async ({ apiClient, testContext }: ApiTestFixtures) => {
    commentsService = new CommentsApiService(apiClient);
    commentsOperations = new CommentsOperations(commentsService);

    // Attach test context information for better traceability
    await testContext.attachTestContext({
      test_suite: 'Comments API Relationship Validation',
      test_type: 'API Integration Tests',
      endpoint_category: 'Comments Management',
      data_source: 'JSONPlaceholder API',
    });

    testContext.logTestStart('Test setup completed for Comments API relationship validation', {
      suite: 'Comments API Relationship Validation',
    });
  });

  test.afterEach(async ({ testContext }: ApiTestFixtures, testInfo: any) => {
    // Attach test result summary for enhanced reporting
    await testContext.attachTestSummary({
      test_name: testInfo.title,
      test_status: testInfo.status,
      test_duration: testInfo.duration,
    });

    testContext.logTestEnd(`Test completed: ${testInfo.title}`, {
      status: testInfo.status,
      duration: testInfo.duration,
      retries: testInfo.retry,
    });
  });  test(
    qase(24, 'Should retrieve all comments successfully and validate response structure'),
    async ({ testContext }: ApiTestFixtures) => {
      await test.step('Send GET request to retrieve all comments from API', async () => {
        const { response, count } = await commentsOperations.getAllCommentsWithCountValidation();

        testContext.logInfo('✅ Successfully retrieved all comments with valid structure', {
          totalComments: count,
          responseTime: response.duration,
        });
      });
    }
  );
  test(qase(25, 'Should retrieve a specific comment by ID and validate comment structure'), async ({ testContext }: ApiTestFixtures) => {
    const commentId = 1;

    await test.step(`Send GET request to retrieve comment with ID ${commentId}`, async () => {
      const response = await commentsOperations.getCommentByIdWithComprehensiveValidation(commentId);

      testContext.logInfo('✅ Successfully retrieved specific comment with valid data', {
        commentId,
        postId: response.data.postId,
        responseTime: response.duration,
      });
    });
  });  test(
    qase(26, 'Should retrieve comments by post ID and validate post-comment relationships'),
    async ({ testContext }: ApiTestFixtures) => {
      const postId = 1;

      await test.step(`Send GET request to retrieve all comments for post ${postId}`, async () => {
        const { response, count } = await commentsOperations.getCommentsByPostIdWithCountValidation(postId);

        testContext.logInfo('✅ Successfully retrieved comments for post with valid relationships', {
          postId,
          commentCount: count,
          responseTime: response.duration,
        });
      });
    }
  );
  test(qase(27, 'Should create a new comment successfully and validate creation response'), async ({ testContext }: ApiTestFixtures) => {
    await test.step('Send POST request to create new comment with valid data', async () => {
      const newCommentData = CommentsOperations.generateTestCommentData();
      const response = await commentsOperations.createCommentWithComprehensiveValidation(newCommentData);

      testContext.logInfo('✅ Successfully created new comment with valid response data', {
        commentId: response.data.id,
        postId: response.data.postId,
        responseTime: response.duration,
      });
    });
  });
});
