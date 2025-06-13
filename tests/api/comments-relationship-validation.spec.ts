import { test, expect } from '../fixtures/api-fixtures';
import { CommentsApiService } from '../services/comments-api.service';
import { TEST_TAGS, HTTP_STATUS_CODES } from '../constants/api-constants';

test.describe('Comments API - Relationship Validation', () => {
  let commentsService: CommentsApiService;

  test.beforeEach(async ({ apiClient }) => {
    commentsService = new CommentsApiService(apiClient);
  });

  test(`${TEST_TAGS.API} ${TEST_TAGS.COMMENTS} ${TEST_TAGS.SMOKE} Should retrieve all comments successfully`, async ({ logger }) => {
    logger.logTestStep('Step 1: Send GET request to retrieve all comments');
    const response = await commentsService.getAllComments();

    logger.logTestStep('Step 2: Validate response status');
    expect(response.status).toBe(HTTP_STATUS_CODES.OK);

    logger.logTestStep('Step 3: Validate response data');
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);

    logger.logTestStep('Step 4: Validate first comment structure');
    const firstComment = response.data[0];
    expect(firstComment).toHaveProperty('id');
    expect(firstComment).toHaveProperty('name');
    expect(firstComment).toHaveProperty('email');
    expect(firstComment).toHaveProperty('body');
    expect(firstComment).toHaveProperty('postId');

    logger.info('Successfully retrieved all comments', { count: response.data.length });
  });

  test(`${TEST_TAGS.API} ${TEST_TAGS.COMMENTS} Should retrieve a specific comment by ID`, async ({ logger }) => {
    const commentId = 1;
    
    logger.logTestStep(`Step 1: Send GET request to retrieve comment with ID ${commentId}`);
    const response = await commentsService.getCommentById(commentId);

    logger.logTestStep('Step 2: Validate response status');
    expect(response.status).toBe(HTTP_STATUS_CODES.OK);

    logger.logTestStep('Step 3: Validate response data');
    expect(response.data).toBeDefined();
    expect(response.data.id).toBe(commentId);
    expect(response.data.name).toBeDefined();
    expect(response.data.email).toBeDefined();
    expect(response.data.body).toBeDefined();
    expect(response.data.postId).toBeDefined();

    logger.logTestStep('Step 4: Validate email format');
    expect(response.data.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

    logger.info('Successfully retrieved specific comment', { commentId });
  });

  test(`${TEST_TAGS.API} ${TEST_TAGS.COMMENTS} Should retrieve comments by post ID`, async ({ logger }) => {
    const postId = 1;
    
    logger.logTestStep(`Step 1: Send GET request to retrieve comments for post ID ${postId}`);
    const response = await commentsService.getCommentsByPostId(postId);

    logger.logTestStep('Step 2: Validate response status');
    expect(response.status).toBe(HTTP_STATUS_CODES.OK);

    logger.logTestStep('Step 3: Validate response data');
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);

    logger.logTestStep('Step 4: Validate all comments belong to the specified post');
    response.data.forEach((comment: any) => {
      expect(comment.postId).toBe(postId);
    });

    logger.info('Successfully retrieved comments for post', { postId, count: response.data.length });
  });

  test(`${TEST_TAGS.API} ${TEST_TAGS.COMMENTS} ${TEST_TAGS.CRUD} Should create a new comment successfully`, async ({ logger }) => {
    const newCommentData = {
      name: 'Test Comment',
      email: 'testcommenter@example.com',
      body: 'This is a test comment body content',
      postId: 1
    };

    logger.logTestStep('Step 1: Send POST request to create new comment');
    const response = await commentsService.createComment(newCommentData);

    logger.logTestStep('Step 2: Validate response status');
    expect(response.status).toBe(HTTP_STATUS_CODES.CREATED);

    logger.logTestStep('Step 3: Validate response data');
    expect(response.data).toBeDefined();
    expect(response.data.id).toBeDefined();
    expect(response.data.name).toBe(newCommentData.name);
    expect(response.data.email).toBe(newCommentData.email);
    expect(response.data.body).toBe(newCommentData.body);
    expect(response.data.postId).toBe(newCommentData.postId);

    logger.info('Successfully created new comment', { commentId: response.data.id });
  });
});
