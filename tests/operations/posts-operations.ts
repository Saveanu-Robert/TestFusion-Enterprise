import { PostsApiService } from '../services/posts-api.service';
import { PostsValidator } from '../validators/posts-validator';

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
   * Retrieves a specific post by ID and validates the response
   */
  async getPostByIdWithValidation(postId: number): Promise<any> {
    const response = await this.postsService.getPostById(postId);
    
    PostsValidator.validateSuccessfulResponse(response);
    PostsValidator.validateSpecificPost(response, postId);
    
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
   * Updates an existing post and validates the response
   */
  async updatePostWithValidation(postId: number, postData: any): Promise<any> {
    const response = await this.postsService.updatePost(postId, postData);
    
    PostsValidator.validateUpdateResponse(response);
    PostsValidator.validateUpdatedPost(response, postData, postId);
    
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
   * Generates test post data
   */
  static generateTestPostData(userId: number = 1): any {
    return {
      title: 'Test Post Title',
      body: 'This is a test post body content that contains meaningful information for testing purposes.',
      userId: userId,
    };
  }

  /**
   * Generates updated test post data
   */
  static generateUpdatedTestPostData(userId: number = 1): any {
    return {
      title: 'Updated Test Post Title',
      body: 'This is an updated test post body content with modified information for testing purposes.',
      userId: userId,
    };
  }
}
