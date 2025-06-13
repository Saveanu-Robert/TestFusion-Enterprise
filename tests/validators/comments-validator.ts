import { expect } from '@playwright/test';
import { HTTP_STATUS_CODES } from '../constants/api-constants';
import { EMAIL_REGEX } from '../constants/validation-constants';

export class CommentsValidator {
  
  /**
   * Validates the response status for successful operations
   */
  static validateSuccessfulResponse(response: any): void {
    expect(response.status).toBe(HTTP_STATUS_CODES.OK);
  }

  /**
   * Validates the response status for creation operations
   */
  static validateCreationResponse(response: any): void {
    expect(response.status).toBe(HTTP_STATUS_CODES.CREATED);
  }

  /**
   * Validates that response data is defined and is an array
   */
  static validateResponseDataStructure(response: any): void {
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
  }

  /**
   * Validates the structure of a single comment object
   */
  static validateCommentStructure(comment: any): void {
    expect(comment).toHaveProperty('id');
    expect(comment).toHaveProperty('name');
    expect(comment).toHaveProperty('email');
    expect(comment).toHaveProperty('body');
    expect(comment).toHaveProperty('postId');
  }

  /**
   * Validates a specific comment by ID
   */
  static validateSpecificComment(response: any, expectedId: number): void {
    expect(response.data).toBeDefined();
    expect(response.data.id).toBe(expectedId);
    expect(response.data.name).toBeDefined();
    expect(response.data.email).toBeDefined();
    expect(response.data.body).toBeDefined();
    expect(response.data.postId).toBeDefined();
  }

  /**
   * Validates email format in comment
   */
  static validateEmailFormat(email: string): void {
    expect(email).toMatch(EMAIL_REGEX);
  }

  /**
   * Validates that all comments belong to a specific post
   */
  static validateCommentsForPost(comments: any[], expectedPostId: number): void {
    comments.forEach((comment: any) => {
      expect(comment.postId).toBe(expectedPostId);
    });
  }

  /**
   * Validates created comment data against input
   */
  static validateCreatedComment(response: any, inputData: any): void {
    expect(response.data).toBeDefined();
    expect(response.data.id).toBeDefined();
    expect(response.data.name).toBe(inputData.name);
    expect(response.data.email).toBe(inputData.email);
    expect(response.data.body).toBe(inputData.body);
    expect(response.data.postId).toBe(inputData.postId);
  }
}
