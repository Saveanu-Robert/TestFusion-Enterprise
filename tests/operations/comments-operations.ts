import { CommentsApiService } from '../services/comments-api.service';
import { CommentsValidator } from '../validators/comments-validator';
import { createCommentPayload } from '../fixtures/test-data';
import { TEST_DATA } from '../constants/test-constants';

export class CommentsOperations {
  
  constructor(private commentsService: CommentsApiService) {}

  /**
   * Retrieves all comments and validates the response
   */
  async getAllCommentsWithValidation(): Promise<{ response: any; count: number }> {
    const response = await this.commentsService.getAllComments();
    
    CommentsValidator.validateSuccessfulResponse(response);
    CommentsValidator.validateResponseDataStructure(response);
    CommentsValidator.validateCommentStructure(response.data[0]);
    
    return { response, count: response.data.length };
  }

  /**
   * Retrieves a specific comment by ID and validates the response
   */
  async getCommentByIdWithValidation(commentId: number): Promise<any> {
    const response = await this.commentsService.getCommentById(commentId);
    
    CommentsValidator.validateSuccessfulResponse(response);
    CommentsValidator.validateSpecificComment(response, commentId);
    CommentsValidator.validateEmailFormat(response.data.email);
    
    return response;
  }

  /**
   * Retrieves comments for a specific post and validates the response
   */
  async getCommentsByPostIdWithValidation(postId: number): Promise<{ response: any; count: number }> {
    const response = await this.commentsService.getCommentsByPostId(postId);
    
    CommentsValidator.validateSuccessfulResponse(response);
    CommentsValidator.validateResponseDataStructure(response);
    CommentsValidator.validateCommentsForPost(response.data, postId);
    
    return { response, count: response.data.length };
  }

  /**
   * Creates a new comment and validates the response
   */
  async createCommentWithValidation(commentData: any): Promise<any> {
    const response = await this.commentsService.createComment(commentData);
    
    CommentsValidator.validateCreationResponse(response);
    CommentsValidator.validateCreatedComment(response, commentData);
    
    return response;
  }
  /**
   * Generates test comment data using centralized test data factory
   */
  static generateTestCommentData(postId: number = 1): any {
    return createCommentPayload(postId, {
      name: TEST_DATA.COMMENTS.VALID_COMMENT.name,
      email: TEST_DATA.COMMENTS.VALID_COMMENT.email,
      body: TEST_DATA.COMMENTS.VALID_COMMENT.body,
    });
  }
}
