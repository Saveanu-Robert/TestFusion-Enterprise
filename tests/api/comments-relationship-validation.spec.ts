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

  test('should retrieve all comments successfully', async ({ logger }) => {
    // Mark as smoke test
    test.info().annotations.push({ type: 'tag', description: 'smoke' });
    
    await test.step('Retrieve all comments', async () => {
      const { response, count } = await commentsOperations.getAllCommentsWithValidation();
      logger.info('Successfully retrieved all comments', { count });
    });
  });

  test('should retrieve a specific comment by ID', async ({ logger }) => {
    const commentId = 1;
    
    await test.step(`Retrieve comment with ID ${commentId}`, async () => {
      const response = await commentsOperations.getCommentByIdWithValidation(commentId);
      logger.info('Successfully retrieved specific comment', { commentId });
    });
  });

  test('should retrieve comments by post ID', async ({ logger }) => {
    const postId = 1;
    
    await test.step(`Retrieve comments for post ${postId}`, async () => {
      const { response, count } = await commentsOperations.getCommentsByPostIdWithValidation(postId);
      logger.info('Successfully retrieved comments for post', { postId, count });
    });
  });

  test('should create a new comment successfully', async ({ logger }) => {
    // Mark as CRUD test
    test.info().annotations.push({ type: 'tag', description: 'crud' });
    
    await test.step('Create new comment', async () => {
      const newCommentData = CommentsOperations.generateTestCommentData();
      const response = await commentsOperations.createCommentWithValidation(newCommentData);
      logger.info('Successfully created new comment', { commentId: response.data.id });
    });
  });
});
