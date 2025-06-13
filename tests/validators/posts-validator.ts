import { expect } from '@playwright/test';
import { HTTP_STATUS_CODES } from '../constants/api-constants';

export class PostsValidator {
  
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
   * Validates the response status for update operations
   */
  static validateUpdateResponse(response: any): void {
    expect(response.status).toBe(HTTP_STATUS_CODES.OK);
  }

  /**
   * Validates the response status for delete operations
   */
  static validateDeleteResponse(response: any): void {
    expect(response.status).toBe(HTTP_STATUS_CODES.OK);
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
   * Validates the structure of a single post object
   */
  static validatePostStructure(post: any): void {
    expect(post).toHaveProperty('id');
    expect(post).toHaveProperty('title');
    expect(post).toHaveProperty('body');
    expect(post).toHaveProperty('userId');
  }

  /**
   * Validates a specific post by ID
   */
  static validateSpecificPost(response: any, expectedId: number): void {
    expect(response.data).toBeDefined();
    expect(response.data.id).toBe(expectedId);
    expect(response.data.title).toBeDefined();
    expect(response.data.body).toBeDefined();
    expect(response.data.userId).toBeDefined();
  }

  /**
   * Validates created post data against input
   */
  static validateCreatedPost(response: any, inputData: any): void {
    expect(response.data).toBeDefined();
    expect(response.data.id).toBeDefined();
    expect(response.data.title).toBe(inputData.title);
    expect(response.data.body).toBe(inputData.body);
    expect(response.data.userId).toBe(inputData.userId);
  }

  /**
   * Validates updated post data against input
   */
  static validateUpdatedPost(response: any, inputData: any, originalId: number): void {
    expect(response.data).toBeDefined();
    expect(response.data.id).toBe(originalId);
    expect(response.data.title).toBe(inputData.title);
    expect(response.data.body).toBe(inputData.body);
    expect(response.data.userId).toBe(inputData.userId);
  }
}
