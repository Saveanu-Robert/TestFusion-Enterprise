/**
 * API Reporter for TestFusion-Enterprise
 * 
 * Provides enhanced reporting capabilities for API tests including automatic
 * request/response attachment generation, performance metrics tracking,
 * and comprehensive test documentation for better debugging and analysis.
 * 
 * Features:
 * - Automatic request/response attachment generation
 * - Performance metrics collection and reporting
 * - Request correlation and tracing
 * - Formatted JSON attachment generation
 * - Test step integration with detailed context
 * - Error scenario documentation
 * 
 * @file api-reporter.ts
 * @author TestFusion-Enterprise Team
 * @version 1.0.0
 */

import { TestInfo } from '@playwright/test';
import { ApiResponse } from '../clients/api-client';
import { Logger } from './logger';

/**
 * Request details for reporting
 */
export interface RequestDetails {
  /** HTTP method */
  method: string;
  /** Request URL */
  url: string;
  /** Request headers */
  headers?: Record<string, string>;
  /** Request payload */
  body?: any;
  /** Query parameters */
  params?: Record<string, string>;
  /** Request timestamp */
  timestamp: string;
  /** Unique request identifier */
  requestId: string;
}

/**
 * Response details for reporting
 */
export interface ResponseDetails {
  /** HTTP status code */
  status: number;
  /** HTTP status text */
  statusText: string;
  /** Response headers */
  headers: Record<string, string>;
  /** Response payload */
  body: any;
  /** Response timestamp */
  timestamp: string;
  /** Request duration in milliseconds */
  duration: number;
  /** Associated request ID */
  requestId: string;
}

/**
 * Performance metrics for API calls
 */
export interface PerformanceMetrics {
  /** Request duration in milliseconds */
  duration: number;
  /** Request size in bytes */
  requestSize?: number;
  /** Response size in bytes */
  responseSize?: number;
  /** Time to first byte */
  ttfb?: number;
}

/**
 * API Reporter class for enhanced test reporting
 */
export class ApiReporter {
  private logger: Logger;
  private testInfo: TestInfo;

  constructor(testInfo: TestInfo) {
    this.testInfo = testInfo;
    this.logger = Logger.getInstance();
  }

  /**
   * Creates and attaches formatted request details to test report
   * @param requestDetails - Request details to attach
   */
  public async attachRequest(requestDetails: RequestDetails): Promise<void> {
    const formattedRequest = this.formatRequestDetails(requestDetails);
    
    const endpoint = this.getEndpointFromUrl(requestDetails.url);
    await this.testInfo.attach(`API Request - ${requestDetails.method} ${endpoint}`, {
      body: JSON.stringify(formattedRequest, null, 2),
      contentType: 'application/json',
    });

    this.logger.debug('📎 Request details attached to test report', {
      requestId: requestDetails.requestId,
      method: requestDetails.method,
      url: requestDetails.url,
    });
  }

  /**
   * Creates and attaches formatted response details to test report
   * @param responseDetails - Response details to attach
   */
  public async attachResponse(responseDetails: ResponseDetails): Promise<void> {
    const formattedResponse = this.formatResponseDetails(responseDetails);
    const statusEmoji = this.getStatusEmoji(responseDetails.status);
    const title = `API Response - ${statusEmoji} ${responseDetails.status} (${responseDetails.duration}ms)`;
    await this.testInfo.attach(title, {
      body: JSON.stringify(formattedResponse, null, 2),
      contentType: 'application/json',
    });

    this.logger.debug('📎 Response details attached to test report', {
      requestId: responseDetails.requestId,
      status: responseDetails.status,
      duration: responseDetails.duration,
    });
  }

  /**
   * Creates and attaches complete request/response pair to test report
   * @param requestDetails - Request details
   * @param responseDetails - Response details
   */
  public async attachRequestResponse(
    requestDetails: RequestDetails, 
    responseDetails: ResponseDetails,
  ): Promise<void> {
    const requestResponsePair = {
      request: this.formatRequestDetails(requestDetails),
      response: this.formatResponseDetails(responseDetails),
      metrics: this.calculateMetrics(requestDetails, responseDetails),
    };    const statusEmoji = this.getStatusEmoji(responseDetails.status);
    const endpoint = this.getEndpointFromUrl(requestDetails.url);
    const title = `API Call - ${requestDetails.method} ${endpoint} ${statusEmoji} ${responseDetails.status}`;
    
    await this.testInfo.attach(title, {
      body: JSON.stringify(requestResponsePair, null, 2),
      contentType: 'application/json',
    });

    this.logger.info('📎 Complete API call details attached to test report', {
      requestId: requestDetails.requestId,
      method: requestDetails.method,
      endpoint,
      status: responseDetails.status,
      duration: responseDetails.duration,
    });
  }

  /**
   * Attaches performance metrics to test report
   * @param metrics - Performance metrics to attach
   * @param context - Additional context for the metrics
   */
  public async attachPerformanceMetrics(
    metrics: PerformanceMetrics, 
    context?: string,
  ): Promise<void> {
    const performanceReport = {
      context: context || 'API Performance Metrics',
      timestamp: new Date().toISOString(),
      metrics: {
        duration: `${metrics.duration}ms`,
        requestSize: metrics.requestSize ? `${metrics.requestSize} bytes` : 'N/A',
        responseSize: metrics.responseSize ? `${metrics.responseSize} bytes` : 'N/A',
        ttfb: metrics.ttfb ? `${metrics.ttfb}ms` : 'N/A',
      },
      performance_analysis: {
        speed_classification: this.classifyPerformance(metrics.duration),
        recommendations: this.getPerformanceRecommendations(metrics.duration),
      },
    };

    await this.testInfo.attach('Performance Metrics', {
      body: JSON.stringify(performanceReport, null, 2),
      contentType: 'application/json',
    });

    this.logger.info('📊 Performance metrics attached to test report', metrics);
  }

  /**
   * Attaches error details for failed API calls
   * @param error - Error that occurred
   * @param requestDetails - Associated request details
   * @param context - Additional error context
   */
  public async attachError(
    error: any, 
    requestDetails?: RequestDetails, 
    context?: string,
  ): Promise<void> {
    const errorReport = {
      context: context || 'API Error Details',
      timestamp: new Date().toISOString(),
      error: {
        message: error.message || 'Unknown error',
        stack: error.stack,
        name: error.name,
      },
      request: requestDetails ? this.formatRequestDetails(requestDetails) : null,
      debugging_info: {
        error_type: this.classifyError(error),
        suggested_actions: this.getSuggestedActions(error),
      },
    };

    await this.testInfo.attach('❌ API Error Details', {
      body: JSON.stringify(errorReport, null, 2),
      contentType: 'application/json',
    });

    this.logger.error('📎 Error details attached to test report', {
      error: error.message,
      requestId: requestDetails?.requestId,
    });
  }

  /**
   * Attaches test context information for better traceability
   * @param context - Test context information
   */
  public async attachTestContext(context: any): Promise<void> {
    const contextReport = {
      test_context: 'Test Execution Context',
      timestamp: new Date().toISOString(),
      ...context,
    };

    await this.testInfo.attach('🎯 Test Context', {
      body: JSON.stringify(contextReport, null, 2),
      contentType: 'application/json',
    });

    this.logger.info('📎 Test context attached to test report', context);
  }

  /**
   * Attaches test data for enhanced traceability
   * @param testData - Test data information
   */
  public async attachTestData(testData: any): Promise<void> {
    const dataReport = {
      test_data: 'Test Data Information',
      timestamp: new Date().toISOString(),
      ...testData,
    };

    await this.testInfo.attach('📊 Test Data', {
      body: JSON.stringify(dataReport, null, 2),
      contentType: 'application/json',
    });

    this.logger.info('📎 Test data attached to test report', testData);
  }

  /**
   * Attaches validation results for comprehensive test reporting
   * @param validationResults - Validation results to attach
   */
  public async attachValidationResults(validationResults: any): Promise<void> {
    const validationReport = {
      validation_results: 'Test Validation Results',
      timestamp: new Date().toISOString(),
      summary: {
        total_validations: Object.keys(validationResults).length,
        passed: Object.values(validationResults).filter((result: any) => result.status === 'PASS').length,
        failed: Object.values(validationResults).filter((result: any) => result.status === 'FAIL').length,
      },
      details: validationResults,
    };

    await this.testInfo.attach('✅ Validation Results', {
      body: JSON.stringify(validationReport, null, 2),
      contentType: 'application/json',
    });

    this.logger.info('📎 Validation results attached to test report', validationReport.summary);
  }

  /**
   * Attaches test execution summary
   * @param testResult - Test result information
   */
  public async attachTestSummary(testResult: any): Promise<void> {
    const summaryReport = {
      test_summary: 'Test Execution Summary',
      timestamp: new Date().toISOString(),
      ...testResult,
      execution_metadata: {
        node_version: process.version,
        platform: process.platform,
        arch: process.arch,
        memory_usage: process.memoryUsage(),
      },
    };

    await this.testInfo.attach('📋 Test Summary', {
      body: JSON.stringify(summaryReport, null, 2),
      contentType: 'application/json',
    });

    this.logger.info('📎 Test summary attached to test report', {
      testName: testResult.test_name,
      status: testResult.test_status,
      duration: testResult.test_duration,
    });
  }

  /**
   * Formats request details for attachment
   * @param requestDetails - Raw request details
   * @returns Formatted request object
   */
  private formatRequestDetails(requestDetails: RequestDetails): any {
    return {
      metadata: {
        timestamp: requestDetails.timestamp,
        request_id: requestDetails.requestId,
        method: requestDetails.method,
        url: requestDetails.url,
      },
      headers: requestDetails.headers || {},
      query_parameters: requestDetails.params || {},
      body: requestDetails.body ? this.formatPayload(requestDetails.body) : null,
    };
  }

  /**
   * Formats response details for attachment
   * @param responseDetails - Raw response details
   * @returns Formatted response object
   */
  private formatResponseDetails(responseDetails: ResponseDetails): any {
    return {
      metadata: {
        timestamp: responseDetails.timestamp,
        request_id: responseDetails.requestId,
        status_code: responseDetails.status,
        status_text: responseDetails.statusText,
        duration_ms: responseDetails.duration,
      },
      headers: responseDetails.headers,
      body: this.formatPayload(responseDetails.body),
    };
  }

  /**
   * Formats payload data for better readability
   * @param payload - Raw payload data
   * @returns Formatted payload
   */
  private formatPayload(payload: any): any {
    if (payload === null || payload === undefined) {
      return null;
    }

    if (typeof payload === 'string') {
      try {
        return JSON.parse(payload);
      } catch {
        return payload;
      }
    }

    return payload;
  }

  /**
   * Calculates metrics from request/response pair
   * @param requestDetails - Request details
   * @param responseDetails - Response details
   * @returns Performance metrics
   */
  private calculateMetrics(
    requestDetails: RequestDetails, 
    responseDetails: ResponseDetails,
  ): PerformanceMetrics {
    const requestSize = requestDetails.body 
      ? JSON.stringify(requestDetails.body).length 
      : 0;
    
    const responseSize = responseDetails.body 
      ? JSON.stringify(responseDetails.body).length 
      : 0;

    return {
      duration: responseDetails.duration,
      requestSize,
      responseSize,
    };
  }

  /**
   * Extracts endpoint from full URL
   * @param url - Full URL
   * @returns Endpoint path
   */
  private getEndpointFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch {
      return url;
    }
  }

  /**
   * Gets status emoji based on HTTP status code
   * @param status - HTTP status code
   * @returns Appropriate emoji
   */
  private getStatusEmoji(status: number): string {
    if (status >= 200 && status < 300) return '✅';
    if (status >= 300 && status < 400) return '🔄';
    if (status >= 400 && status < 500) return '⚠️';
    if (status >= 500) return '❌';
    return '❓';
  }

  /**
   * Classifies performance based on duration
   * @param duration - Request duration in milliseconds
   * @returns Performance classification
   */
  private classifyPerformance(duration: number): string {
    if (duration < 100) return 'Excellent';
    if (duration < 300) return 'Good';
    if (duration < 1000) return 'Acceptable';
    if (duration < 3000) return 'Slow';
    return 'Very Slow';
  }

  /**
   * Provides performance recommendations
   * @param duration - Request duration in milliseconds
   * @returns Performance recommendations
   */
  private getPerformanceRecommendations(duration: number): string[] {
    const recommendations: string[] = [];
    
    if (duration > 1000) {
      recommendations.push('Consider optimizing API response time');
      recommendations.push('Check for unnecessary data in response');
    }
    
    if (duration > 3000) {
      recommendations.push('Investigate server performance issues');
      recommendations.push('Consider implementing caching mechanisms');
    }
    
    if (duration < 100) {
      recommendations.push('Excellent performance - maintain current optimization');
    }
    
    return recommendations;
  }

  /**
   * Classifies error type for better debugging
   * @param error - Error object
   * @returns Error classification
   */
  private classifyError(error: any): string {
    if (error.name === 'TimeoutError') return 'Timeout Error';
    if (error.message?.includes('network')) return 'Network Error';
    if (error.message?.includes('404')) return 'Resource Not Found';
    if (error.message?.includes('401')) return 'Authentication Error';
    if (error.message?.includes('403')) return 'Authorization Error';
    if (error.message?.includes('500')) return 'Server Error';
    return 'Unknown Error';
  }

  /**
   * Provides suggested actions for error resolution
   * @param error - Error object
   * @returns Suggested actions
   */
  private getSuggestedActions(error: any): string[] {
    const actions: string[] = [];
    
    if (error.name === 'TimeoutError') {
      actions.push('Increase request timeout');
      actions.push('Check server response time');
    }
    
    if (error.message?.includes('network')) {
      actions.push('Verify network connectivity');
      actions.push('Check API endpoint availability');
    }
    
    if (error.message?.includes('404')) {
      actions.push('Verify API endpoint URL');
      actions.push('Check if resource exists');
    }
    
    if (error.message?.includes('401') || error.message?.includes('403')) {
      actions.push('Verify authentication credentials');
      actions.push('Check API permissions');
    }
    
    return actions;
  }
}
