import { APIRequestContext } from '@playwright/test';
import { Logger } from '../utils/logger';

export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  duration: number;
}

export interface RequestOptions {
  params?: Record<string, string>;
  headers?: Record<string, string>;
  timeout?: number;
}

/**
 * API Client following Adapter Pattern
 * Provides a unified interface for making HTTP requests
 */
export class ApiClient {
  private logger: Logger;

  constructor(
    private requestContext: APIRequestContext,
    private baseUrl: string
  ) {
    this.logger = Logger.getInstance();
  }

  /**
   * Performs a GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    this.logger.info(`GET ${endpoint}`, options?.params);

    try {
      const url = this.buildUrl(endpoint, options?.params);
      const response = await this.requestContext.get(url, {
        headers: options?.headers,
        timeout: options?.timeout,
      });      const duration = Date.now() - startTime;
      let data: T | null = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }
      const headers = await response.headersArray();
      const headersObject = Object.fromEntries(
        headers.map(({ name, value }) => [name, value])
      );

      const apiResponse: ApiResponse<T> = {
        data: data as T,
        status: response.status(),
        statusText: response.statusText(),
        headers: headersObject,
        duration,
      };

      this.logger.info(`GET ${endpoint} completed`, {
        status: response.status(),
        duration,
      });      return apiResponse;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`GET ${endpoint} failed`, { error, duration });
      throw error;
    }
  }

  /**
   * Performs a POST request
   */
  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    this.logger.info(`POST ${endpoint}`, data);

    try {
      const url = this.buildUrl(endpoint, options?.params);      const response = await this.requestContext.post(url, {
        data: typeof data === 'string' ? data : JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        timeout: options?.timeout,
      });      const duration = Date.now() - startTime;
      const responseData = await response.json();
      const headers = await response.headersArray();
      const headersObject = Object.fromEntries(
        headers.map(({ name, value }) => [name, value])
      );

      const apiResponse: ApiResponse<T> = {
        data: responseData,
        status: response.status(),
        statusText: response.statusText(),
        headers: headersObject,
        duration,
      };

      this.logger.info(`POST ${endpoint} completed`, {
        status: response.status(),
        duration,
      });      return apiResponse;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`POST ${endpoint} failed`, { error, duration });
      throw error;
    }
  }

  /**
   * Performs a PUT request
   */
  async put<T>(endpoint: string, data: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    this.logger.info(`PUT ${endpoint}`, data);

    try {
      const url = this.buildUrl(endpoint, options?.params);      const response = await this.requestContext.put(url, {
        data: typeof data === 'string' ? data : JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        timeout: options?.timeout,
      });

      const duration = Date.now() - startTime;
      const responseData = await response.json();      const headers = await response.headersArray();
      const headersObject = Object.fromEntries(
        headers.map(({ name, value }) => [name, value])
      );

      const apiResponse: ApiResponse<T> = {
        data: responseData,
        status: response.status(),
        statusText: response.statusText(),
        headers: headersObject,
        duration,
      };

      this.logger.info(`PUT ${endpoint} completed`, {
        status: response.status(),
        duration,
      });      return apiResponse;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`PUT ${endpoint} failed`, { error, duration });
      throw error;
    }
  }

  /**
   * Performs a DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    this.logger.info(`DELETE ${endpoint}`);

    try {
      const url = this.buildUrl(endpoint, options?.params);
      const response = await this.requestContext.delete(url, {
        headers: options?.headers,
        timeout: options?.timeout,
      });

      const duration = Date.now() - startTime;
      
      let responseData;
      try {
        responseData = await response.json();
      } catch {
        // DELETE requests might not return JSON
        responseData = null;      }

      const headers = await response.headersArray();
      const headersObject = Object.fromEntries(
        headers.map(({ name, value }) => [name, value])
      );

      const apiResponse: ApiResponse<T> = {
        data: responseData,
        status: response.status(),
        statusText: response.statusText(),
        headers: headersObject,
        duration,
      };

      this.logger.info(`DELETE ${endpoint} completed`, {
        status: response.status(),
        duration,
      });      return apiResponse;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`DELETE ${endpoint} failed`, { error, duration });
      throw error;
    }
  }

  /**
   * Performs a PATCH request
   */
  async patch<T>(endpoint: string, data: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    this.logger.info(`PATCH ${endpoint}`, data);

    try {
      const url = this.buildUrl(endpoint, options?.params);      const response = await this.requestContext.patch(url, {
        data: typeof data === 'string' ? data : JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        timeout: options?.timeout,
      });      const duration = Date.now() - startTime;
      const responseData = await response.json();
      const headers = await response.headersArray();
      const headersObject = Object.fromEntries(
        headers.map(({ name, value }) => [name, value])
      );

      const apiResponse: ApiResponse<T> = {
        data: responseData,
        status: response.status(),
        statusText: response.statusText(),
        headers: headersObject,
        duration,
      };

      this.logger.info(`PATCH ${endpoint} completed`, {
        status: response.status(),
        duration,
      });
      return apiResponse;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`PATCH ${endpoint} failed`, { error, duration });
      throw error;
    }
  }

  /**
   * Builds the complete URL with query parameters
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
