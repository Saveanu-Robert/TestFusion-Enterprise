/**
 * API Client for TestFusion-Enterprise
 * 
 * Provides a unified HTTP client interface following the Adapter Pattern.
 * Handles all API communication with comprehensive logging, error handling,
 * and response correlation for test automation scenarios.
 * 
 * Features:
 * - Standardized HTTP method support (GET, POST, PUT, DELETE, PATCH)
 * - Request/response correlation with unique IDs
 * - Comprehensive error handling and logging
 * - Automatic JSON serialization/deserialization
 * - Duration tracking for performance monitoring
 * - Configurable timeout and retry mechanisms
 * 
 * @file api-client.ts
 * @author TestFusion-Enterprise Team
 * @version 1.0.0
 */

import { APIRequestContext } from '@playwright/test';
import { Logger } from '../utils/logger';

/**
 * Standardized API response wrapper
 */
export interface ApiResponse<T> {
  /** Response data payload */
  data: T;
  /** HTTP status code */
  status: number;
  /** HTTP status text */
  statusText: string;
  /** Response headers as key-value pairs */
  headers: Record<string, string>;
  /** Request duration in milliseconds */
  duration: number;
}

/**
 * HTTP request configuration options
 */
export interface RequestOptions {
  /** URL query parameters */
  params?: Record<string, string>;
  /** Additional HTTP headers */
  headers?: Record<string, string>;
  /** Request timeout in milliseconds */
  timeout?: number;
}

/**
 * HTTP client adapter for API testing
 */
export class ApiClient {
  private logger: Logger;

  /**
   * Creates a new API client instance
   * @param requestContext - Playwright API request context
   * @param baseUrl - Base URL for API requests
   */
  constructor(
    private requestContext: APIRequestContext,
    private baseUrl: string,
  ) {
    this.logger = Logger.getInstance();
  }

  /**
   * Executes HTTP GET request
   * @param endpoint - API endpoint path
   * @param options - Request configuration options
   * @returns Promise resolving to API response
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    this.logger.logRequest('GET', endpoint, options?.params, requestId);

    try {
      const url = this.buildUrl(endpoint, options?.params);
      const response = await this.requestContext.get(url, {
        headers: options?.headers,
        timeout: options?.timeout,
      });

      return await this.processResponse<T>(response, startTime, requestId, 'GET', endpoint);
    } catch (error) {
      return this.handleRequestError<T>(error, startTime, requestId, 'GET', endpoint);
    }
  }

  /**
   * Executes HTTP POST request
   * @param endpoint - API endpoint path
   * @param data - Request payload
   * @param options - Request configuration options
   * @returns Promise resolving to API response
   */
  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    this.logger.logRequest('POST', endpoint, data, requestId);

    try {
      const url = this.buildUrl(endpoint, options?.params);
      const response = await this.requestContext.post(url, {
        data: typeof data === 'string' ? data : JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        timeout: options?.timeout,
      });

      return await this.processResponse<T>(response, startTime, requestId, 'POST', endpoint);
    } catch (error) {
      return this.handleRequestError<T>(error, startTime, requestId, 'POST', endpoint);
    }
  }

  /**
   * Executes HTTP PUT request
   * @param endpoint - API endpoint path
   * @param data - Request payload
   * @param options - Request configuration options
   * @returns Promise resolving to API response
   */
  async put<T>(endpoint: string, data: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    this.logger.logRequest('PUT', endpoint, data, requestId);

    try {
      const url = this.buildUrl(endpoint, options?.params);
      const response = await this.requestContext.put(url, {
        data: typeof data === 'string' ? data : JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        timeout: options?.timeout,
      });

      return await this.processResponse<T>(response, startTime, requestId, 'PUT', endpoint);
    } catch (error) {
      return this.handleRequestError<T>(error, startTime, requestId, 'PUT', endpoint);
    }
  }

  /**
   * Executes HTTP DELETE request
   * @param endpoint - API endpoint path
   * @param options - Request configuration options
   * @returns Promise resolving to API response
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    this.logger.logRequest('DELETE', endpoint, undefined, requestId);

    try {
      const url = this.buildUrl(endpoint, options?.params);
      const response = await this.requestContext.delete(url, {
        headers: options?.headers,
        timeout: options?.timeout,
      });

      return await this.processResponse<T>(response, startTime, requestId, 'DELETE', endpoint);
    } catch (error) {
      return this.handleRequestError<T>(error, startTime, requestId, 'DELETE', endpoint);
    }
  }

  /**
   * Executes HTTP PATCH request
   * @param endpoint - API endpoint path
   * @param data - Request payload
   * @param options - Request configuration options
   * @returns Promise resolving to API response
   */
  async patch<T>(endpoint: string, data: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    this.logger.logRequest('PATCH', endpoint, data, requestId);

    try {
      const url = this.buildUrl(endpoint, options?.params);
      const response = await this.requestContext.patch(url, {
        data: typeof data === 'string' ? data : JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        timeout: options?.timeout,
      });

      return await this.processResponse<T>(response, startTime, requestId, 'PATCH', endpoint);
    } catch (error) {
      return this.handleRequestError<T>(error, startTime, requestId, 'PATCH', endpoint);
    }
  }

  /**
   * Processes HTTP response and creates standardized response object
   * @param response - Playwright response object
   * @param startTime - Request start timestamp
   * @param requestId - Request correlation ID
   * @param method - HTTP method
   * @param endpoint - API endpoint
   * @returns Standardized API response
   */
  private async processResponse<T>(
    response: any,
    startTime: number,
    requestId: string,
    method: string,
    endpoint: string,
  ): Promise<ApiResponse<T>> {
    const duration = Date.now() - startTime;
    
    // Parse response data safely
    let responseData: T | null = null;
    try {
      responseData = await response.json();
    } catch {
      // Some responses (like DELETE) might not return JSON
      responseData = null;
    }    // Convert headers array to object
    const headers = await response.headersArray();
    const headersObject = Object.fromEntries(
      headers.map((header: { name: string; value: string }) => [header.name, header.value]),
    );

    const apiResponse: ApiResponse<T> = {
      data: responseData as T,
      status: response.status(),
      statusText: response.statusText(),
      headers: headersObject,
      duration,
    };

    this.logger.logResponse(response.status(), responseData, requestId, duration);

    return apiResponse;
  }

  /**
   * Handles request errors with proper logging and error propagation
   * @param error - The error that occurred
   * @param startTime - Request start timestamp
   * @param requestId - Request correlation ID
   * @param method - HTTP method
   * @param endpoint - API endpoint
   * @throws The original error after logging
   */
  private handleRequestError<T>(
    error: any,
    startTime: number,
    requestId: string,
    method: string,
    endpoint: string,
  ): never {
    const duration = Date.now() - startTime;
    
    this.logger.error(`❌ ${method} request to ${endpoint} failed after ${duration}ms`, {
      error: error.message || error,
      requestId,
      duration,
      endpoint,
      method,
    });

    throw error;
  }

  /**
   * Generates unique request ID for correlation
   * @returns Unique identifier string
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Constructs complete URL with query parameters
   * @param endpoint - API endpoint path
   * @param params - Query parameters
   * @returns Complete URL string
   */
  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(endpoint, this.baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    return url.toString();
  }
}
