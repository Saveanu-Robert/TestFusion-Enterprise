import { expect } from '@playwright/test';
import { HTTP_STATUS_CODES } from '../constants/api-constants';
import { EMAIL_REGEX, USERNAME_REGEX, PHONE_REGEX, WEBSITE_REGEX } from '../constants/validation-constants';

export class UsersValidator {
  
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
   * Validates the structure of a single user object
   */
  static validateUserStructure(user: any): void {
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('username');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('phone');
    expect(user).toHaveProperty('website');
    expect(user).toHaveProperty('address');
    expect(user).toHaveProperty('company');
  }

  /**
   * Validates a specific user by ID
   */
  static validateSpecificUser(response: any, expectedId: number): void {
    expect(response.data).toBeDefined();
    expect(response.data.id).toBe(expectedId);
    expect(response.data.name).toBeDefined();
    expect(response.data.username).toBeDefined();
    expect(response.data.email).toBeDefined();
  }

  /**
   * Validates user data formats and patterns
   */
  static validateUserDataFormats(user: any): void {
    expect(user.email).toMatch(EMAIL_REGEX);
    expect(user.username).toMatch(USERNAME_REGEX);
    expect(user.phone).toMatch(PHONE_REGEX);
    expect(user.website).toMatch(WEBSITE_REGEX);
  }

  /**
   * Validates user address structure
   */
  static validateUserAddress(address: any): void {
    expect(address).toHaveProperty('street');
    expect(address).toHaveProperty('suite');
    expect(address).toHaveProperty('city');
    expect(address).toHaveProperty('zipcode');
    expect(address).toHaveProperty('geo');
    expect(address.geo).toHaveProperty('lat');
    expect(address.geo).toHaveProperty('lng');
  }

  /**
   * Validates user company structure
   */
  static validateUserCompany(company: any): void {
    expect(company).toHaveProperty('name');
    expect(company).toHaveProperty('catchPhrase');
    expect(company).toHaveProperty('bs');
  }

  /**
   * Validates geographic coordinates are numeric
   */
  static validateGeographicCoordinates(geo: any): void {
    const lat = parseFloat(geo.lat);
    const lng = parseFloat(geo.lng);
    expect(lat).toBeGreaterThanOrEqual(-90);
    expect(lat).toBeLessThanOrEqual(90);
    expect(lng).toBeGreaterThanOrEqual(-180);
    expect(lng).toBeLessThanOrEqual(180);
  }

  /**
   * Validates created user data against input
   */
  static validateCreatedUser(response: any, inputData: any): void {
    expect(response.data).toBeDefined();
    expect(response.data.id).toBeDefined();
    expect(response.data.name).toBe(inputData.name);
    expect(response.data.username).toBe(inputData.username);
    expect(response.data.email).toBe(inputData.email);
  }
}
