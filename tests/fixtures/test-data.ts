/**
 * Enhanced Test Fixtures and Domain Models for API Testing
 *
 * Provides reusable test data with improved validation and type safety:
 * - Domain-driven design principles
 * - Value objects for better validation
 * - Factory methods for test data generation
 * - Builder pattern for complex objects
 *
 * @file test-data.ts
 * @author TestFusion-Enterprise Team
 * @version 2.0.0
 */

import { EMAIL_PATTERN, PHONE_PATTERN, WEBSITE_PATTERN } from '../constants/validation-constants';

// Core domain interfaces with enhanced typing
export interface Post {
  readonly id: number;
  readonly title: string;
  readonly body: string;
  readonly userId: number;
}

export interface User {
  readonly id: number;
  readonly name: string;
  readonly username: string;
  readonly email: string;
  readonly address: Address;
  readonly phone: string;
  readonly website: string;
  readonly company: Company;
}

export interface Address {
  readonly street: string;
  readonly suite: string;
  readonly city: string;
  readonly zipcode: string;
  readonly geo: Geo;
}

export interface Geo {
  readonly lat: string;
  readonly lng: string;
}

export interface Company {
  readonly name: string;
  readonly catchPhrase: string;
  readonly bs: string;
}

export interface Comment {
  readonly id: number;
  readonly postId: number;
  readonly name: string;
  readonly email: string;
  readonly body: string;
}

export interface Todo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

/**
 * Creates a new post payload for testing
 */
export function createPostPayload(overrides: Partial<Omit<Post, 'id'>> = {}): Omit<Post, 'id'> {
  const timestamp = Date.now();
  return {
    title: `Test Post ${timestamp}`,
    body: `This is a test post body created at ${new Date().toISOString()}`,
    userId: 1,
    ...overrides,
  };
}

/**
 * Creates a new user payload for testing
 */
export function createUserPayload(overrides: Partial<Omit<User, 'id'>> = {}): Omit<User, 'id'> {
  const timestamp = Date.now();
  return {
    name: `Test User ${timestamp}`,
    username: `testuser${timestamp}`,
    email: `testuser${timestamp}@example.com`,
    address: {
      street: '123 Test Street',
      suite: 'Apt. 1',
      city: 'Test City',
      zipcode: '12345-6789',
      geo: {
        lat: '40.7128',
        lng: '-74.0060',
      },
    },
    phone: '1-555-123-4567',
    website: `testuser${timestamp}.example.com`,
    company: {
      name: 'Test Company',
      catchPhrase: 'Testing is our business',
      bs: 'quality test automation',
    },
    ...overrides,
  };
}

/**
 * Creates a new comment payload for testing
 */
export function createCommentPayload(
  postId: number,
  overrides: Partial<Omit<Comment, 'id'>> = {}
): Omit<Comment, 'id'> {
  const timestamp = Date.now();
  return {
    postId,
    name: `Test Comment ${timestamp}`,
    email: `commenter${timestamp}@example.com`,
    body: `This is a test comment created at ${new Date().toISOString()}`,
    ...overrides,
  };
}

/**
 * Creates a new todo payload for testing
 */
export function createTodoPayload(userId: number, overrides: Partial<Omit<Todo, 'id'>> = {}): Omit<Todo, 'id'> {
  const timestamp = Date.now();
  return {
    userId,
    title: `Test Todo ${timestamp}`,
    completed: false,
    ...overrides,
  };
}

/**
 * Creates multiple post payloads
 */
export function createMultiplePostPayloads(count: number, userId: number = 1): Omit<Post, 'id'>[] {
  const seed = Date.now();
  return Array.from({ length: count }, (_, i) =>
    createPostPayload({
      title: `Test Post ${i + 1} (${seed + i})`,
      userId,
    })
  );
}

/**
 * Creates invalid payload for negative testing
 */
export function createInvalidPostPayload(): Partial<Record<keyof Post, unknown>> & {
  /** Deliberately extra field for negative testing */
  invalidField: string;
} {
  return {
    title: null,
    body: '',
    userId: 'invalid',
    invalidField: 'should not be here',
  };
}

/**
 * Creates payload with missing required fields
 */
export function createIncompletePostPayload(): Partial<Post> {
  return {
    title: 'Incomplete Post',
    // Missing body and userId
  };
}

/* ──────────────────────────────
   Test fixtures (no wrapper)
 ────────────────────────────────*/

/**
 * Sample valid post data
 */
export const VALID_POST: Post = {
  id: 1,
  title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
  body: 'quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto',
  userId: 1,
} as const;

/**
 * Sample valid user data
 */
export const VALID_USER: User = {
  id: 1,
  name: 'Leanne Graham',
  username: 'Bret',
  email: 'Sincere@april.biz',
  address: {
    street: 'Kulas Light',
    suite: 'Apt. 556',
    city: 'Gwenborough',
    zipcode: '92998-3874',
    geo: {
      lat: '-37.3159',
      lng: '81.1496',
    },
  },
  phone: '1-770-736-8031 x56442',
  website: 'hildegard.org',
  company: {
    name: 'Romaguera-Crona',
    catchPhrase: 'Multi-layered client-server neural-net',
    bs: 'harness real-time e-markets',
  },
} as const;

/**
 * Schema definitions for validation
 */
export const POST_SCHEMA = {
  id: 'number',
  title: 'string',
  body: 'string',
  userId: 'number',
} as const;

export const USER_SCHEMA = {
  id: 'number',
  name: 'string',
  username: 'string',
  email: 'string',
  address: 'object',
  phone: 'string',
  website: 'string',
  company: 'object',
} as const;

export const COMMENT_SCHEMA = {
  id: 'number',
  postId: 'number',
  name: 'string',
  email: 'string',
  body: 'string',
} as const;

export const TODO_SCHEMA = {
  id: 'number',
  userId: 'number',
  title: 'string',
  completed: 'boolean',
} as const;

/**
 * Test data sets for parameterized testing
 */
export const VALID_USER_IDS: readonly number[] = [1, 2, 3, 4, 5] as const;
export const INVALID_USER_IDS: readonly (number | string | null)[] = [0, -1, 999, 'invalid', null] as const;
export const VALID_POST_IDS: readonly number[] = [1, 2, 3, 4, 5] as const;
export const INVALID_POST_IDS: readonly (number | string | null)[] = [0, -1, 999, 'invalid', null] as const;

/**
 * Email validation patterns
 */
export { EMAIL_PATTERN, PHONE_PATTERN, WEBSITE_PATTERN } from '../constants/validation-constants';
