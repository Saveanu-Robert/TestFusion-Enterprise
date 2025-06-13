/**
 * Test data models and factory
 */

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address?: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  phone?: string;
  website?: string;
  company?: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface Comment {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
}

export class TestDataFactory {
  static createUser(overrides: Partial<User> = {}): User {
    return {
      id: 1,
      name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      ...overrides
    };
  }

  static createPost(overrides: Partial<Post> = {}): Post {
    return {
      id: 1,
      userId: 1,
      title: 'Test Post',
      body: 'This is a test post',
      ...overrides
    };
  }

  static createComment(overrides: Partial<Comment> = {}): Comment {
    return {
      id: 1,
      postId: 1,
      name: 'Test Comment',
      email: 'test@example.com',
      body: 'This is a test comment',
      ...overrides
    };
  }
}
