import { PostsApiService } from '../services/posts-api.service';
import { PostsValidator } from '../validators/posts-validator';
import { createPostPayload } from '../fixtures/test-data';
import { TEST_DATA } from '../constants/test-constants';
import { expect } from '@playwright/test';
import { Logger, ScopedLogger } from '../utils/logger';

export class PostsOperations {
  private readonly logger: ScopedLogger;

  constructor(private postsService: PostsApiService) {
    this.logger = Logger.getInstance().createScopedLogger('PostsOperations');
  }
  /**
   * Retrieves all posts and validates the response
   */
  async getAllPostsWithValidation(): Promise<{ response: any; count: number }> {
    const timer = this.logger.startTimer();

    try {
      this.logger.info('Retrieving all posts with validation');
      const response = await this.postsService.getAllPosts();

      PostsValidator.validateSuccessfulResponse(response);
      PostsValidator.validateResponseDataStructure(response);
      PostsValidator.validatePostStructure(response.data[0]);

      this.logger.logWithTiming(
        this.logger.info,
        'Successfully retrieved and validated all posts',
        timer,
        { count: response.data.length }
      );

      return { response, count: response.data.length };

    } catch (error) {
      this.logger.error('Failed to retrieve or validate posts', {
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  /**
   * Retrieves all posts with comprehensive validation including count checks
   */
  async getAllPostsWithCountValidation(): Promise<{ response: any; count: number }> {
    const { response, count } = await this.getAllPostsWithValidation();

    // Validate that we receive a reasonable number of posts
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(500); // Reasonable upper bound

    return { response, count };
  }

  /**
   * Retrieves a specific post by ID and validates the response
   */
  async getPostByIdWithValidation(postId: number): Promise<any> {
    const response = await this.postsService.getPostById(postId);

    PostsValidator.validateSuccessfulResponse(response);
    PostsValidator.validateSpecificPost(response, postId);

    return response;
  }

  /**
   * Retrieves a specific post by ID with comprehensive data validation
   */
  async getPostByIdWithComprehensiveValidation(postId: number): Promise<any> {
    const timer = this.logger.startTimer();

    try {
      this.logger.info('Retrieving post by ID with comprehensive validation', { postId });
      const response = await this.postsService.findById(postId);

      PostsValidator.validateSuccessfulResponse(response);
      PostsValidator.validateSpecificPost(response, postId);
      PostsValidator.validatePostStructure(response.data);

      this.logger.logWithTiming(
        this.logger.info,
        'Successfully retrieved and validated post by ID',
        timer,
        { postId, userId: response.data.userId }
      );

      return response;

    } catch (error) {
      this.logger.error('Failed to retrieve or validate post by ID', {
        postId,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  /**
   * Creates a new post and validates the response
   */
  async createPostWithValidation(postData: any): Promise<any> {
    const response = await this.postsService.createPost(postData);

    PostsValidator.validateCreationResponse(response);
    PostsValidator.validateCreatedPost(response, postData);

    return response;
  }

  /**
   * Creates a new post with comprehensive validation
   */
  async createPostWithComprehensiveValidation(postData: any): Promise<any> {
    const timer = this.logger.startTimer();

    try {
      this.logger.info('Creating post with comprehensive validation', { 
        userId: postData.userId, 
        title: postData.title?.substring(0, 50) 
      });
        const response = await this.postsService.create(postData);

      PostsValidator.validateCreationResponse(response);
      PostsValidator.validatePostStructure(response.data);
      
      // Validate creation response specifics
      expect(response.data.id).toBeDefined();
      expect(response.data.userId).toBe(postData.userId);
      expect(response.data.title).toBe(postData.title);
      expect(response.data.body).toBe(postData.body);

      this.logger.logWithTiming(
        this.logger.info,
        'Successfully created and validated new post',
        timer,
        { postId: response.data.id, userId: response.data.userId }
      );

      return response;

    } catch (error) {
      this.logger.error('Failed to create or validate post', {
        postData: { userId: postData.userId, title: postData.title?.substring(0, 50) },
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  /**
   * Updates an existing post and validates the response
   */
  async updatePostWithValidation(postId: number, postData: any): Promise<any> {
    const response = await this.postsService.updatePost(postId, postData);

    PostsValidator.validateUpdateResponse(response);
    PostsValidator.validateUpdatedPost(response, postData, postId);

    return response;
  }

  /**
   * Updates an existing post with comprehensive validation
   */
  async updatePostWithComprehensiveValidation(postId: number, postData: any): Promise<any> {
    const response = await this.updatePostWithValidation(postId, postData);

    // Validate updated post contains expected data
    expect(response.data.id).toBe(postId);
    expect(response.data.userId).toBe(postData.userId);
    expect(response.data.title).toBe(postData.title);
    expect(response.data.body).toBe(postData.body);

    return response;
  }

  /**
   * Deletes a post and validates the response
   */
  async deletePostWithValidation(postId: number): Promise<any> {
    const response = await this.postsService.deletePost(postId);

    PostsValidator.validateDeleteResponse(response);

    return response;
  }

  /**
   * Validates 404 error for non-existent post
   */
  async validatePostNotFoundError(postId: number): Promise<any> {
    const response = await this.postsService.getPostById(postId);

    // Validate that API returns 404 status code for missing resource
    expect(response.status).toBe(404);

    return response;
  }

  /**
   * Validates posts by specific user ID with count and relationship checks
   */
  async getPostsByUserIdWithValidation(userId: number): Promise<{ response: any; count: number }> {
    const response = await this.postsService.getPostsByUserId(userId);

    PostsValidator.validateSuccessfulResponse(response);
    PostsValidator.validateResponseDataStructure(response);

    // Validate that all posts belong to the specified user
    response.data.forEach((post: any) => {
      expect(post.userId).toBe(userId);
    });

    return { response, count: response.data.length };
  }

  /**
   * Generates test post data using centralized test data factory
   */
  static generateTestPostData(userId: number = 1): any {
    return createPostPayload({
      title: TEST_DATA.POSTS.VALID_POST.title,
      body: TEST_DATA.POSTS.VALID_POST.body,
      userId: userId,
    });
  }

  /**
   * Generates updated test post data using centralized test data factory
   */
  static generateUpdatedTestPostData(userId: number = 1): any {
    return createPostPayload({
      title: 'Updated Test Post Title',
      body: 'This is an updated test post body content with modified information for testing purposes.',
      userId: userId,
    });
  }
}
