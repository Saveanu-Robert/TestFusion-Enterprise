import { test, expect } from '../fixtures/api-fixtures';
import { PostsApiService } from '../services/posts-api.service';
import { TEST_TAGS, HTTP_STATUS_CODES } from '../constants/api-constants';

test.describe('Posts API - CRUD Operations', () => {
  let postsService: PostsApiService;

  test.beforeEach(async ({ apiClient }) => {
    postsService = new PostsApiService(apiClient);
  });

  test(`${TEST_TAGS.API} ${TEST_TAGS.POSTS} ${TEST_TAGS.SMOKE} Should retrieve all posts successfully`, async ({ logger }) => {
    logger.logTestStep('Step 1: Send GET request to retrieve all posts');
    const response = await postsService.getAllPosts();

    logger.logTestStep('Step 2: Validate response status');
    expect(response.status).toBe(HTTP_STATUS_CODES.OK);

    logger.logTestStep('Step 3: Validate response data');
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);

    logger.logTestStep('Step 4: Validate first post structure');
    const firstPost = response.data[0];
    expect(firstPost).toHaveProperty('id');
    expect(firstPost).toHaveProperty('title');
    expect(firstPost).toHaveProperty('body');
    expect(firstPost).toHaveProperty('userId');

    logger.info('Successfully retrieved all posts', { count: response.data.length });
  });

  test(`${TEST_TAGS.API} ${TEST_TAGS.POSTS} Should retrieve a specific post by ID`, async ({ logger }) => {
    const postId = 1;
    
    logger.logTestStep(`Step 1: Send GET request to retrieve post with ID ${postId}`);
    const response = await postsService.getPostById(postId);

    logger.logTestStep('Step 2: Validate response status');
    expect(response.status).toBe(HTTP_STATUS_CODES.OK);

    logger.logTestStep('Step 3: Validate response data');
    expect(response.data).toBeDefined();
    expect(response.data.id).toBe(postId);
    expect(response.data.title).toBeDefined();
    expect(response.data.body).toBeDefined();
    expect(response.data.userId).toBeDefined();

    logger.info('Successfully retrieved specific post', { postId });
  });

  test(`${TEST_TAGS.API} ${TEST_TAGS.POSTS} ${TEST_TAGS.CRUD} Should create a new post successfully`, async ({ logger }) => {
    const newPostData = {
      title: 'Test Post Title',
      body: 'This is a test post body content',
      userId: 1
    };

    logger.logTestStep('Step 1: Send POST request to create new post');
    const response = await postsService.createPost(newPostData);

    logger.logTestStep('Step 2: Validate response status');
    expect(response.status).toBe(HTTP_STATUS_CODES.CREATED);

    logger.logTestStep('Step 3: Validate response data');
    expect(response.data).toBeDefined();
    expect(response.data.id).toBeDefined();
    expect(response.data.title).toBe(newPostData.title);
    expect(response.data.body).toBe(newPostData.body);
    expect(response.data.userId).toBe(newPostData.userId);

    logger.info('Successfully created new post', { postId: response.data.id });
  });

  test(`${TEST_TAGS.API} ${TEST_TAGS.POSTS} Should return 404 for non-existent post`, async ({ logger }) => {
    const nonExistentId = 9999;
    
    logger.logTestStep(`Step 1: Send GET request to retrieve non-existent post ID ${nonExistentId}`);
    const response = await postsService.getPostById(nonExistentId);

    logger.logTestStep('Step 2: Validate response status');
    expect(response.status).toBe(HTTP_STATUS_CODES.NOT_FOUND);

    logger.info('Correctly returned 404 for non-existent post', { postId: nonExistentId });
  });
});
