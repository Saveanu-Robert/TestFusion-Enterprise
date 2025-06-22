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

  test.beforeEach(async ({ apiClient, apiReporter, logger }) => {
    postsService = new PostsApiService(apiClient);
    postsOperations = new PostsOperations(postsService);
    
    // Attach test context information for better traceability
    await apiReporter.attachTestContext({
      test_suite: 'Posts API CRUD Operations',
      test_type: 'API Integration Tests',
      endpoint_category: 'Posts Management',
      data_source: 'JSONPlaceholder API',
      test_environment: process.env.NODE_ENV || 'test',
      timestamp: new Date().toISOString(),
    });
    
    logger.info('🚀 Test setup completed for Posts API CRUD operations', {
      suite: 'Posts API CRUD Operations',
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

  test(qase(20, 'Should retrieve all posts successfully and validate response structure'), async ({ logger, apiReporter }) => {
    // Mark as smoke test for core functionality validation
    test.info().annotations.push({ type: 'tag', description: 'smoke' });
    test.info().annotations.push({ type: 'feature', description: 'posts-retrieval' });
    test.info().annotations.push({ type: 'priority', description: 'high' });
    test.slow(); // Mark as potentially slow test
    
    // Attach test-specific context
    await apiReporter.attachTestContext({
      test_objective: 'Validate retrieval of all posts from API endpoint',
      expected_behavior: 'API should return complete list of posts with valid structure',
      validation_criteria: ['Response status 200', 'Valid JSON structure', 'Reasonable post count'],
    });
      await test.step('Send GET request to retrieve all posts from API endpoint', async () => {
      const { response, count } = await postsOperations.getAllPostsWithCountValidation();
      
      // Attach additional performance metrics
      await apiReporter.attachPerformanceMetrics({
        duration: response.duration,
        responseSize: JSON.stringify(response.data).length,
      }, 'Posts Retrieval Performance Analysis');
      
      logger.info('✅ Successfully retrieved all posts with valid structure', { 
        totalPosts: count,
        responseTime: response.duration, 
      });
    });
  });

  test(qase(21, 'Should retrieve a specific post by ID and validate post data integrity'), async ({ logger, apiReporter }) => {
    test.info().annotations.push({ type: 'feature', description: 'posts-by-id' });
    test.info().annotations.push({ type: 'priority', description: 'high' });
    const postId = 1;
    
    // Attach test-specific context
    await apiReporter.attachTestContext({
      test_objective: `Validate retrieval of specific post by ID (${postId})`,
      expected_behavior: 'API should return correct post data with all required fields',
      validation_criteria: ['Correct post ID', 'Valid user ID', 'Non-empty title and body'],
    });
      await test.step(`Send GET request to retrieve post with ID ${postId}`, async () => {
      const response = await postsOperations.getPostByIdWithComprehensiveValidation(postId);
      
      // Attach data validation results
      await apiReporter.attachValidationResults({
        post_id_validation: { expected: postId, actual: response.data.id, status: 'PASS' },
        user_id_validation: { expected: '>0', actual: response.data.userId, status: 'PASS' },
        title_validation: { expected: 'non-empty', actual: !!response.data.title, status: 'PASS' },
        body_validation: { expected: 'non-empty', actual: !!response.data.body, status: 'PASS' },
      });
      
      logger.info('✅ Successfully retrieved specific post with valid data', { 
        postId,
        userId: response.data.userId,
        responseTime: response.duration, 
      });
    });
  });

  test(qase(22, 'Should create a new post successfully and validate creation response'), async ({ logger, apiReporter }) => {
    // Mark as CRUD test for data manipulation validation
    test.info().annotations.push({ type: 'tag', description: 'crud' });
    test.info().annotations.push({ type: 'feature', description: 'posts-creation' });
    test.info().annotations.push({ type: 'priority', description: 'critical' });
    
    // Attach test-specific context
    await apiReporter.attachTestContext({
      test_objective: 'Validate successful creation of new post via API',
      expected_behavior: 'API should create post and return it with assigned ID',
      validation_criteria: ['Status 201', 'Assigned post ID', 'Data integrity preservation'],
    });
      await test.step('Send POST request to create new post with valid data', async () => {
      const newPostData = PostsOperations.generateTestPostData();
      
      // Attach test data for traceability
      await apiReporter.attachTestData({
        operation: 'CREATE_POST',
        input_data: newPostData,
        data_source: 'generated',
        timestamp: new Date().toISOString(),
      });
      
      const response = await postsOperations.createPostWithComprehensiveValidation(newPostData);
      
      // Attach creation validation results
      await apiReporter.attachValidationResults({
        id_assignment: { expected: 'truthy', actual: !!response.data.id, status: 'PASS' },
        user_id_preservation: { expected: newPostData.userId, actual: response.data.userId, status: 'PASS' },
        title_preservation: { expected: newPostData.title, actual: response.data.title, status: 'PASS' },
        body_preservation: { expected: newPostData.body, actual: response.data.body, status: 'PASS' },
      });
      
      logger.info('✅ Successfully created new post with valid response data', { 
        postId: response.data.id,
        userId: response.data.userId,
        responseTime: response.duration, 
      });
    });
  });

  test(qase(23, 'Should return 404 error for non-existent post ID and validate error response'), async ({ logger, apiReporter }) => {
    // Mark as error handling test for negative scenarios
    test.info().annotations.push({ type: 'tag', description: 'error-handling' });
    test.info().annotations.push({ type: 'feature', description: 'posts-not-found' });
    test.info().annotations.push({ type: 'priority', description: 'medium' });
    
    const nonExistentId = 9999;
    
    // Attach test-specific context
    await apiReporter.attachTestContext({
      test_objective: `Validate 404 error handling for non-existent post ID (${nonExistentId})`,
      expected_behavior: 'API should return 404 status code and appropriate error response',
      validation_criteria: ['Status 404', 'Appropriate error handling', 'No server errors'],
    });
      await test.step(`Send GET request for non-existent post ID ${nonExistentId}`, async () => {
      const response = await postsOperations.validatePostNotFoundError(nonExistentId);
      
      // Attach error validation results
      await apiReporter.attachValidationResults({
        status_code_validation: { expected: 404, actual: response.status, status: 'PASS' },
        error_handling: { expected: 'graceful_404', actual: 'graceful_404', status: 'PASS' },
      });
      
      logger.info('✅ Correctly returned 404 error for non-existent post', { 
        requestedPostId: nonExistentId,
        statusCode: response.status,
        responseTime: response.duration, 
      });
    });
  });
});
