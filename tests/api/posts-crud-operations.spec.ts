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

  test('should retrieve all posts successfully', async ({ logger }) => {
    // Annotations for test organization
    test.slow(); // Mark as potentially slow test
    
    await test.step('Send GET request to retrieve all posts', async () => {
      const { response, count } = await postsOperations.getAllPostsWithValidation();
      logger.info('Successfully retrieved all posts', { count });
    });
  });

  test('should retrieve a specific post by ID', async ({ logger }) => {
    const postId = 1;
    
    await test.step(`Retrieve post with ID ${postId}`, async () => {
      const response = await postsOperations.getPostByIdWithValidation(postId);
      logger.info('Successfully retrieved specific post', { postId });
    });
  });

  test('should create a new post successfully', async ({ logger }) => {
    // Add tags via annotations
    test.info().annotations.push({ type: 'tag', description: 'crud' });
    
    await test.step('Create new post', async () => {
      const newPostData = PostsOperations.generateTestPostData();
      const response = await postsOperations.createPostWithValidation(newPostData);
      logger.info('Successfully created new post', { postId: response.data.id });
    });
  });

  test('should return 404 for non-existent post', async ({ logger }) => {
    const nonExistentId = 9999;
    
    await test.step(`Request non-existent post ID ${nonExistentId}`, async () => {
      const response = await postsService.getPostById(nonExistentId);

      await test.step('Validate 404 response', async () => {
        expect(response.status).toBe(HTTP_STATUS_CODES.NOT_FOUND);
      });

      logger.info('Correctly returned 404 for non-existent post', { postId: nonExistentId });
    });
  });
});
