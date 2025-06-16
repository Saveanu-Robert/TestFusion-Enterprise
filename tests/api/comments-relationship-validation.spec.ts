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
import { qase } from 'playwright-qase-reporter';
import { CommentsApiService } from '../services/comments-api.service';
import { CommentsOperations } from '../operations/comments-operations';

test.describe('Comments API - Relationship Validation', () => {
  let commentsService: CommentsApiService;
  let commentsOperations: CommentsOperations;

  test.beforeEach(async ({ apiClient, apiReporter, logger }) => {
    commentsService = new CommentsApiService(apiClient);
    commentsOperations = new CommentsOperations(commentsService);
    
    // Attach test context information for better traceability
    await apiReporter.attachTestContext({
      test_suite: 'Comments API Relationship Validation',
      test_type: 'API Integration Tests',
      endpoint_category: 'Comments Management',
      data_source: 'JSONPlaceholder API',
      test_environment: process.env.NODE_ENV || 'test',
      timestamp: new Date().toISOString(),
    });
    
    logger.info('🚀 Test setup completed for Comments API relationship validation', {
      suite: 'Comments API Relationship Validation',
      timestamp: new Date().toISOString(),
    });
  });

  test.afterEach(async ({ apiReporter, logger }, testInfo) => {
    // Attach test result summary for enhanced reporting
    const testResult = {
      test_name: testInfo.title,
      test_status: testInfo.status,
      test_duration: testInfo.duration,
      test_file: testInfo.file,
      retry_count: testInfo.retry,
      annotations: testInfo.annotations,
      timestamp: new Date().toISOString(),
    };
    
    await apiReporter.attachTestSummary(testResult);
    
    logger.info(`🏁 Test completed: ${testInfo.title}`, {
      status: testInfo.status,
      duration: testInfo.duration,
      retries: testInfo.retry,
    });
  });

  test(qase(24, 'Should retrieve all comments successfully and validate response structure'), async ({ logger, apiReporter }) => {
    // Mark as smoke test for core functionality validation
    test.info().annotations.push({ type: 'tag', description: 'smoke' });
    test.info().annotations.push({ type: 'feature', description: 'comments-retrieval' });
    test.info().annotations.push({ type: 'priority', description: 'high' });
    
    // Attach test-specific context
    await apiReporter.attachTestContext({
      test_objective: 'Validate retrieval of all comments from API endpoint',
      expected_behavior: 'API should return complete list of comments with valid structure',
      validation_criteria: ['Response status 200', 'Valid JSON structure', 'Reasonable comment count'],
    });
    
    await test.step('Send GET request to retrieve all comments from API', async () => {
      const { response, count } = await commentsOperations.getAllCommentsWithValidation();
      
      // Validate that we receive a reasonable number of comments
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThanOrEqual(1000); // Reasonable upper bound
      
      // Attach additional performance metrics
      await apiReporter.attachPerformanceMetrics({
        duration: response.duration,
        responseSize: JSON.stringify(response.data).length,
      }, 'Comments Retrieval Performance Analysis');
      
      logger.info('✅ Successfully retrieved all comments with valid structure', { 
        totalComments: count,
        responseTime: response.duration, 
      });
    });
  });

  test(qase(25, 'Should retrieve a specific comment by ID and validate comment structure'), async ({ logger, apiReporter }) => {
    test.info().annotations.push({ type: 'feature', description: 'comments-by-id' });
    test.info().annotations.push({ type: 'priority', description: 'high' });
    const commentId = 1;
    
    // Attach test-specific context
    await apiReporter.attachTestContext({
      test_objective: `Validate retrieval of specific comment by ID (${commentId})`,
      expected_behavior: 'API should return correct comment data with all required fields',
      validation_criteria: ['Correct comment ID', 'Valid post ID', 'Valid email format', 'Non-empty name and body'],
    });
    
    await test.step(`Send GET request to retrieve comment with ID ${commentId}`, async () => {
      const response = await commentsOperations.getCommentByIdWithValidation(commentId);
      
      // Validate comment ID matches request
      expect(response.data.id).toBe(commentId);
      expect(response.data.postId).toBeGreaterThan(0);
      expect(response.data.name).toBeTruthy();
      expect(response.data.email).toBeTruthy();
      expect(response.data.body).toBeTruthy();
      
      // Attach data validation results
      await apiReporter.attachValidationResults({
        comment_id_validation: { expected: commentId, actual: response.data.id, status: 'PASS' },
        post_id_validation: { expected: '>0', actual: response.data.postId, status: 'PASS' },
        name_validation: { expected: 'non-empty', actual: !!response.data.name, status: 'PASS' },
        email_validation: { expected: 'non-empty', actual: !!response.data.email, status: 'PASS' },
        body_validation: { expected: 'non-empty', actual: !!response.data.body, status: 'PASS' },
      });
      
      logger.info('✅ Successfully retrieved specific comment with valid data', { 
        commentId,
        postId: response.data.postId,
        responseTime: response.duration, 
      });
    });
  });

  test(qase(26, 'Should retrieve comments by post ID and validate post-comment relationships'), async ({ logger, apiReporter }) => {
    test.info().annotations.push({ type: 'feature', description: 'comments-by-post' });
    test.info().annotations.push({ type: 'priority', description: 'critical' });
    const postId = 1;
    
    // Attach test-specific context
    await apiReporter.attachTestContext({
      test_objective: `Validate retrieval of comments for specific post ID (${postId})`,
      expected_behavior: 'API should return all comments belonging to the specified post',
      validation_criteria: ['All comments belong to post', 'Valid comment structure', 'Relationship integrity'],
    });
    
    await test.step(`Send GET request to retrieve all comments for post ${postId}`, async () => {
      const { response, count } = await commentsOperations.getCommentsByPostIdWithValidation(postId);
      
      // Validate all comments belong to the specified post
      response.data.forEach((comment: any) => {
        expect(comment.postId).toBe(postId);
      });
      
      expect(count).toBeGreaterThan(0);
      
      // Attach relationship validation results
      await apiReporter.attachValidationResults({
        post_relationship: { expected: `all_comments_for_post_${postId}`, actual: 'verified', status: 'PASS' },
        comment_count: { expected: '>0', actual: count, status: 'PASS' },
        data_integrity: { expected: 'valid_structure', actual: 'valid_structure', status: 'PASS' },
      });
      
      logger.info('✅ Successfully retrieved comments for post with valid relationships', { 
        postId, 
        commentCount: count,
        responseTime: response.duration, 
      });
    });
  });

  test(qase(27, 'Should create a new comment successfully and validate creation response'), async ({ logger, apiReporter }) => {
    // Mark as CRUD test for data manipulation validation
    test.info().annotations.push({ type: 'tag', description: 'crud' });
    test.info().annotations.push({ type: 'feature', description: 'comments-creation' });
    test.info().annotations.push({ type: 'priority', description: 'critical' });
    
    // Attach test-specific context
    await apiReporter.attachTestContext({
      test_objective: 'Validate successful creation of new comment via API',
      expected_behavior: 'API should create comment and return it with assigned ID',
      validation_criteria: ['Status 201', 'Assigned comment ID', 'Data integrity preservation'],
    });
    
    await test.step('Send POST request to create new comment with valid data', async () => {
      const newCommentData = CommentsOperations.generateTestCommentData();
      
      // Attach test data for traceability
      await apiReporter.attachTestData({
        operation: 'CREATE_COMMENT',
        input_data: newCommentData,
        data_source: 'generated',
        timestamp: new Date().toISOString(),
      });
      
      const response = await commentsOperations.createCommentWithValidation(newCommentData);
      
      // Validate created comment contains expected data
      expect(response.data.id).toBeTruthy();
      expect(response.data.postId).toBe(newCommentData.postId);
      expect(response.data.name).toBe(newCommentData.name);
      expect(response.data.email).toBe(newCommentData.email);
      expect(response.data.body).toBe(newCommentData.body);
      
      // Attach creation validation results
      await apiReporter.attachValidationResults({
        id_assignment: { expected: 'truthy', actual: !!response.data.id, status: 'PASS' },
        post_id_preservation: { expected: newCommentData.postId, actual: response.data.postId, status: 'PASS' },
        name_preservation: { expected: newCommentData.name, actual: response.data.name, status: 'PASS' },
        email_preservation: { expected: newCommentData.email, actual: response.data.email, status: 'PASS' },
        body_preservation: { expected: newCommentData.body, actual: response.data.body, status: 'PASS' },
      });
      
      logger.info('✅ Successfully created new comment with valid response data', { 
        commentId: response.data.id,
        postId: response.data.postId,
        responseTime: response.duration, 
      });
    });
  });
});
