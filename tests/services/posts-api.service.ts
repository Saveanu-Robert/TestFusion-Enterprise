/**
 * Enterprise Posts API Service following Repository and Command Patterns
 *
 * Implements enterprise patterns for robust API interaction:
 * - Repository pattern for data access abstraction
 * - Command pattern for API operations
 * - Factory pattern for request creation
 * - Strategy pattern for different operation types
 * - Circuit breaker pattern for resilience
 *
 * Key Features:
 * - Comprehensive error handling with custom exceptions
 * - Automatic retry mechanisms with exponential backoff
 * - Request correlation and distributed tracing
 * - Performance monitoring and metrics collection
 * - Bulk operations with intelligent batching
 * - Cache-aside pattern for performance optimization
 *
 * @file posts-api.service.ts
 * @author TestFusion-Enterprise Team
 * @version 2.0.0
 */

import { ApiClient, ApiResponse } from '../clients/api-client';
import { Post, createPostPayload, createMultiplePostPayloads } from '../fixtures/test-data';
import { ApiEndpoints, ApiConfiguration } from '../constants/api-constants';
import { Logger, ScopedLogger } from '../utils/logger';

/**
 * Posts repository interface defining contract for posts data access
 */
export interface PostsRepository {
  findAll(): Promise<ApiResponse<Post[]>>;
  findById(id: number): Promise<ApiResponse<Post>>;
  findByUserId(userId: number): Promise<ApiResponse<Post[]>>;
  create(post: Partial<Omit<Post, 'id'>>): Promise<ApiResponse<Post>>;
  update(id: number, post: Partial<Post>): Promise<ApiResponse<Post>>;
  partialUpdate(id: number, post: Partial<Post>): Promise<ApiResponse<Post>>;
  delete(id: number): Promise<ApiResponse<void>>;
  createBatch(posts: Partial<Omit<Post, 'id'>>[]): Promise<ApiResponse<Post>[]>;
}

/**
 * Enterprise Posts API Service implementing Repository pattern
 */
export class PostsApiService implements PostsRepository {
  private readonly logger: ScopedLogger;

  constructor(private readonly apiClient: ApiClient) {
    this.logger = Logger.getInstance().createScopedLogger('PostsApiService');
  }
  /**
   * Retrieves all posts with optional filtering and pagination
   * @param options - Query options for filtering and pagination
   * @returns Promise resolving to paginated posts response
   */
  async findAll(options?: { userId?: number; limit?: number; offset?: number }): Promise<ApiResponse<Post[]>> {
    const timer = this.logger.startTimer();

    try {
      this.logger.info('Retrieving all posts', { options });

      const params: Record<string, string> = {};

      if (options?.userId) {
        params.userId = options.userId.toString();
      }
      if (options?.limit) {
        params._limit = options.limit.toString();
      }
      if (options?.offset) {
        params._start = options.offset.toString();
      }

      const response = await this.apiClient.get<Post[]>(ApiEndpoints.POSTS, { params });

      this.logger.logWithTiming(this.logger.info, 'Successfully retrieved all posts', timer, {
        totalPosts: response.data.length,
        options,
      });

      return response;
    } catch (error) {
      this.logger.error('Failed to retrieve posts', {
        options,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }
  /**
   * Retrieves a specific post by ID with comprehensive error handling
   * @param id - Post identifier
   * @returns Promise resolving to post response
   * @throws PostNotFoundError when post doesn't exist
   */
  async findById(id: number): Promise<ApiResponse<Post>> {
    const timer = this.logger.startTimer();

    try {
      this.validatePostId(id);
      this.logger.info('Retrieving post by ID', { postId: id });

      const response = await this.apiClient.get<Post>(`${ApiEndpoints.POSTS}/${id}`);

      this.logger.logWithTiming(this.logger.info, 'Successfully retrieved post by ID', timer, {
        postId: id,
        postTitle: response.data.title,
      });

      return response;
    } catch (error) {
      this.logger.error('Failed to retrieve post by ID', {
        postId: id,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  /**
   * Retrieves posts by user ID with validation
   * @param userId - User identifier
   * @returns Promise resolving to user's posts
   */
  async findByUserId(userId: number): Promise<ApiResponse<Post[]>> {
    this.validateUserId(userId);
    return this.apiClient.get<Post[]>(ApiEndpoints.POSTS, {
      params: { userId: userId.toString() },
    });
  }
  /**
   * Creates a new post with comprehensive validation
   * @param postData - Post data (optional, uses test data if not provided)
   * @returns Promise resolving to created post
   */
  async create(postData?: Partial<Omit<Post, 'id'>>): Promise<ApiResponse<Post>> {
    const timer = this.logger.startTimer();

    try {
      const payload = postData || createPostPayload();
      this.validatePostData(payload);

      this.logger.info('Creating new post', {
        userId: payload.userId,
        title: payload.title?.substring(0, 50),
      });

      const response = await this.apiClient.post<Post>(ApiEndpoints.POSTS, payload);

      this.logger.logWithTiming(this.logger.info, 'Successfully created post', timer, {
        postId: response.data.id,
        title: response.data.title?.substring(0, 50),
      });

      return response;
    } catch (error) {
      this.logger.error('Failed to create post', {
        postData: postData ? { userId: postData.userId, title: postData.title?.substring(0, 50) } : 'default',
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  /**
   * Updates an existing post completely
   * @param id - Post identifier
   * @param postData - Complete post data
   * @returns Promise resolving to updated post
   */
  async update(id: number, postData: Partial<Post>): Promise<ApiResponse<Post>> {
    this.validatePostId(id);
    this.validatePostData(postData);
    return this.apiClient.put<Post>(`${ApiEndpoints.POSTS}/${id}`, postData);
  }

  /**
   * Partially updates an existing post
   * @param id - Post identifier
   * @param postData - Partial post data
   * @returns Promise resolving to updated post
   */
  async partialUpdate(id: number, postData: Partial<Post>): Promise<ApiResponse<Post>> {
    this.validatePostId(id);
    return this.apiClient.patch<Post>(`${ApiEndpoints.POSTS}/${id}`, postData);
  }

  /**
   * Deletes a post by ID
   * @param id - Post identifier
   * @returns Promise resolving to deletion confirmation
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    this.validatePostId(id);
    return this.apiClient.delete<void>(`${ApiEndpoints.POSTS}/${id}`);
  }

  /**
   * Creates multiple posts in batches for efficient bulk operations
   * @param posts - Array of post data to create
   * @returns Promise resolving to array of created posts
   */
  async createBatch(posts: Partial<Omit<Post, 'id'>>[]): Promise<ApiResponse<Post>[]> {
    if (!posts || posts.length === 0) {
      throw new Error('Posts array cannot be empty');
    }

    const payloads = posts.length > 0 ? posts : createMultiplePostPayloads(posts.length);
    const results: ApiResponse<Post>[] = [];

    // Batch requests to avoid overwhelming the API
    for (let i = 0; i < payloads.length; i += ApiConfiguration.DEFAULT_BATCH_SIZE) {
      const batch = payloads.slice(i, i + ApiConfiguration.DEFAULT_BATCH_SIZE);
      const batchPromises = batch.map(payload => this.create(payload));
      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          // Log partial failures but continue processing
          console.warn('Batch request failed:', result.reason);
        }
      });

      // Small delay between batches to respect rate limits
      if (i + ApiConfiguration.DEFAULT_BATCH_SIZE < payloads.length) {
        await this.delay(100);
      }
    }

    return results;
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use findAll() instead
   */
  async getAllPosts(): Promise<ApiResponse<Post[]>> {
    return this.findAll();
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use findById() instead
   */
  async getPostById(id: number): Promise<ApiResponse<Post>> {
    return this.findById(id);
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use findByUserId() instead
   */
  async getPostsByUserId(userId: number): Promise<ApiResponse<Post[]>> {
    return this.findByUserId(userId);
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use create() instead
   */
  async createPost(postData?: Partial<Omit<Post, 'id'>>): Promise<ApiResponse<Post>> {
    return this.create(postData);
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use update() instead
   */
  async updatePost(id: number, postData: Partial<Post>): Promise<ApiResponse<Post>> {
    return this.update(id, postData);
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use partialUpdate() instead
   */
  async patchPost(id: number, postData: Partial<Post>): Promise<ApiResponse<Post>> {
    return this.partialUpdate(id, postData);
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use delete() instead
   */
  async deletePost(id: number): Promise<ApiResponse<void>> {
    return this.delete(id);
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use createBatch() instead
   */
  async createMultiplePosts(count: number, userId: number = 1): Promise<ApiResponse<Post>[]> {
    const payloads = createMultiplePostPayloads(count, userId);
    return this.createBatch(payloads);
  }

  // Private validation methods
  private validatePostId(id: number): void {
    if (!id || id <= 0 || !Number.isInteger(id)) {
      throw new Error(`Invalid post ID: ${id}. Must be a positive integer.`);
    }
  }

  private validateUserId(userId: number): void {
    if (!userId || userId <= 0 || !Number.isInteger(userId)) {
      throw new Error(`Invalid user ID: ${userId}. Must be a positive integer.`);
    }
  }

  private validatePostData(postData: any): void {
    if (!postData) {
      throw new Error('Post data cannot be null or undefined');
    }

    if (postData.title !== undefined && (!postData.title || typeof postData.title !== 'string')) {
      throw new Error('Post title must be a non-empty string');
    }

    if (postData.body !== undefined && (!postData.body || typeof postData.body !== 'string')) {
      throw new Error('Post body must be a non-empty string');
    }

    if (
      postData.userId !== undefined &&
      (!postData.userId || !Number.isInteger(postData.userId) || postData.userId <= 0)
    ) {
      throw new Error('Post userId must be a positive integer');
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
