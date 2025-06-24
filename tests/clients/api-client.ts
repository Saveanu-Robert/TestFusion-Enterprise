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
import { ApiReporter, RequestDetails, ResponseDetails } from '../utils/api-reporter';

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
 * HTTP client adapter for API testing with enhanced reporting
 */
export class ApiClient {
  private logger: Logger;
  private apiReporter?: ApiReporter;

  /**
   * Creates a new API client instance
   * @param requestContext - Playwright API request context
   * @param baseUrl - Base URL for API requests
   * @param apiReporter - Optional API reporter for enhanced reporting
   */
  constructor(
    private requestContext: APIRequestContext,
    private baseUrl: string,
    apiReporter?: ApiReporter
  ) {
    this.logger = Logger.getInstance();
    this.apiReporter = apiReporter;
  }

  /**
   * Sets the API reporter for enhanced test reporting
   * @param reporter - API reporter instance
   */
  public setApiReporter(reporter: ApiReporter): void {
    this.apiReporter = reporter;
  }
  /**
   * Executes HTTP GET request with enhanced reporting
   * @param endpoint - API endpoint path
   * @param options - Request configuration options
   * @returns Promise resolving to API response
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    const url = this.buildUrl(endpoint, options?.params);

    // Create request details for reporting
    const requestDetails: RequestDetails = {
      method: 'GET',
      url,
      headers: options?.headers,
      params: options?.params,
      timestamp: new Date().toISOString(),
      requestId,
    };

    this.logger.logRequest('GET', endpoint, options?.params, requestId);

    try {
      const response = await this.requestContext.get(url, {
        headers: options?.headers,
        timeout: options?.timeout,
      });

      return await this.processResponse<T>(response, startTime, requestId, 'GET', endpoint, requestDetails);
    } catch (error) {
      await this.handleRequestError<T>(error, startTime, requestId, 'GET', endpoint, requestDetails);
      throw error; // Re-throw after handling
    }
  }
  /**
   * Executes HTTP POST request with enhanced reporting
   * @param endpoint - API endpoint path
   * @param data - Request payload
   * @param options - Request configuration options
   * @returns Promise resolving to API response
   */
  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    const url = this.buildUrl(endpoint, options?.params);

    // Create request details for reporting
    const requestDetails: RequestDetails = {
      method: 'POST',
      url,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data,
      params: options?.params,
      timestamp: new Date().toISOString(),
      requestId,
    };

    this.logger.logRequest('POST', endpoint, data, requestId);

    try {
      const response = await this.requestContext.post(url, {
        data: typeof data === 'string' ? data : JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        timeout: options?.timeout,
      });

      return await this.processResponse<T>(response, startTime, requestId, 'POST', endpoint, requestDetails);
    } catch (error) {
      await this.handleRequestError<T>(error, startTime, requestId, 'POST', endpoint, requestDetails);
      throw error; // Re-throw after handling
    }
  }
  /**
   * Executes HTTP PUT request with enhanced reporting
   * @param endpoint - API endpoint path
   * @param data - Request payload
   * @param options - Request configuration options
   * @returns Promise resolving to API response
   */
  async put<T>(endpoint: string, data: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    const url = this.buildUrl(endpoint, options?.params);

    // Create request details for reporting
    const requestDetails: RequestDetails = {
      method: 'PUT',
      url,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data,
      params: options?.params,
      timestamp: new Date().toISOString(),
      requestId,
    };

    this.logger.logRequest('PUT', endpoint, data, requestId);

    try {
      const response = await this.requestContext.put(url, {
        data: typeof data === 'string' ? data : JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        timeout: options?.timeout,
      });

      return await this.processResponse<T>(response, startTime, requestId, 'PUT', endpoint, requestDetails);
    } catch (error) {
      await this.handleRequestError<T>(error, startTime, requestId, 'PUT', endpoint, requestDetails);
      throw error; // Re-throw after handling
    }
  }
  /**
   * Executes HTTP DELETE request with enhanced reporting
   * @param endpoint - API endpoint path
   * @param options - Request configuration options
   * @returns Promise resolving to API response
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    const url = this.buildUrl(endpoint, options?.params);

    // Create request details for reporting
    const requestDetails: RequestDetails = {
      method: 'DELETE',
      url,
      headers: options?.headers,
      params: options?.params,
      timestamp: new Date().toISOString(),
      requestId,
    };

    this.logger.logRequest('DELETE', endpoint, undefined, requestId);

    try {
      const response = await this.requestContext.delete(url, {
        headers: options?.headers,
        timeout: options?.timeout,
      });

      return await this.processResponse<T>(response, startTime, requestId, 'DELETE', endpoint, requestDetails);
    } catch (error) {
      await this.handleRequestError<T>(error, startTime, requestId, 'DELETE', endpoint, requestDetails);
      throw error; // Re-throw after handling
    }
  }
  /**
   * Executes HTTP PATCH request with enhanced reporting
   * @param endpoint - API endpoint path
   * @param data - Request payload
   * @param options - Request configuration options
   * @returns Promise resolving to API response
   */
  async patch<T>(endpoint: string, data: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    const url = this.buildUrl(endpoint, options?.params);

    // Create request details for reporting
    const requestDetails: RequestDetails = {
      method: 'PATCH',
      url,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data,
      params: options?.params,
      timestamp: new Date().toISOString(),
      requestId,
    };

    this.logger.logRequest('PATCH', endpoint, data, requestId);

    try {
      const response = await this.requestContext.patch(url, {
        data: typeof data === 'string' ? data : JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        timeout: options?.timeout,
      });

      return await this.processResponse<T>(response, startTime, requestId, 'PATCH', endpoint, requestDetails);
    } catch (error) {
      await this.handleRequestError<T>(error, startTime, requestId, 'PATCH', endpoint, requestDetails);
      throw error; // Re-throw after handling
    }
  }
  /**
   * Processes HTTP response and creates standardized response object with enhanced reporting
   * @param response - Playwright response object
   * @param startTime - Request start timestamp
   * @param requestId - Request correlation ID
   * @param method - HTTP method
   * @param endpoint - API endpoint
   * @param requestDetails - Request details for reporting
   * @returns Standardized API response
   */
  private async processResponse<T>(
    response: any,
    startTime: number,
    requestId: string,
    method: string,
    endpoint: string,
    requestDetails: RequestDetails
  ): Promise<ApiResponse<T>> {
    const duration = Date.now() - startTime;

    // Parse response data safely
    let responseData: T | null = null;
    try {
      responseData = await response.json();
    } catch {
      // Some responses (like DELETE) might not return JSON
      responseData = null;
    } // Convert headers array to object
    const headers = await response.headersArray();
    const headersObject = Object.fromEntries(
      headers.map((header: { name: string; value: string }) => [header.name, header.value])
    );

    const apiResponse: ApiResponse<T> = {
      data: responseData as T,
      status: response.status(),
      statusText: response.statusText(),
      headers: headersObject,
      duration,
    };

    // Create response details for reporting
    const responseDetails: ResponseDetails = {
      status: response.status(),
      statusText: response.statusText(),
      headers: headersObject,
      body: responseData,
      timestamp: new Date().toISOString(),
      duration,
      requestId,
    };

    // Attach request/response to test report if reporter is available
    if (this.apiReporter) {
      await this.apiReporter.attachRequestResponse(requestDetails, responseDetails);
    }

    this.logger.logResponse(response.status(), responseData, requestId, duration);

    return apiResponse;
  }
  /**
   * Handles request errors with proper logging and error reporting
   * @param error - The error that occurred
   * @param startTime - Request start timestamp
   * @param requestId - Request correlation ID
   * @param method - HTTP method
   * @param endpoint - API endpoint
   * @param requestDetails - Request details for reporting
   */
  private async handleRequestError<T>(
    error: any,
    startTime: number,
    requestId: string,
    method: string,
    endpoint: string,
    requestDetails: RequestDetails
  ): Promise<void> {
    const duration = Date.now() - startTime;

    // Attach error details to test report if reporter is available
    if (this.apiReporter) {
      await this.apiReporter.attachError(error, requestDetails, `${method} ${endpoint} failed`);
    }

    this.logger.error(`❌ ${method} request to ${endpoint} failed after ${duration}ms`, {
      error: error.message || error,
      requestId,
      duration,
      endpoint,
      method,
    });
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
