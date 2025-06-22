import { PostsApiService } from '../services/posts-api.service';
import { PostsValidator } from '../validators/posts-validator';
import { createPostPayload } from '../fixtures/test-data';
import { TEST_DATA } from '../constants/test-constants';
import { expect } from '@playwright/test';

export class PostsOperations {
  
  constructor(private postsService: PostsApiService) {}

  /**
   * Retrieves all posts and validates the response
   */
  async getAllPostsWithValidation(): Promise<{ response: any; count: number }> {
    const response = await this.postsService.getAllPosts();
    
    PostsValidator.validateSuccessfulResponse(response);
    PostsValidator.validateResponseDataStructure(response);
    PostsValidator.validatePostStructure(response.data[0]);
    
    return { response, count: response.data.length };
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
    const response = await this.getPostByIdWithValidation(postId);
    
    // Validate post structure and data integrity
    expect(response.data.id).toBe(postId);
    expect(response.data.userId).toBeGreaterThan(0);
    expect(response.data.title).toBeTruthy();
    expect(response.data.body).toBeTruthy();
    
    return response;
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
   * Creates a new post with comprehensive validation including data preservation checks
   */
  async createPostWithComprehensiveValidation(postData: any): Promise<any> {
    const response = await this.createPostWithValidation(postData);
    
    // Validate created post contains expected data
    expect(response.data.id).toBeTruthy();
    expect(response.data.userId).toBe(postData.userId);
    expect(response.data.title).toBe(postData.title);
    expect(response.data.body).toBe(postData.body);
    
    return response;
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
