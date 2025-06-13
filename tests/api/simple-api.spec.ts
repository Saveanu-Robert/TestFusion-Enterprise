import { test, expect } from '@playwright/test';

test.describe('Basic API Test', () => {
  test('Should make a simple API call', async ({ request }) => {
    const response = await request.get('https://jsonplaceholder.typicode.com/posts/1');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('title');
    expect(data).toHaveProperty('body');
    expect(data.id).toBe(1);
    
    console.log('Successfully retrieved post:', data.title);
  });
  
  test('Should retrieve multiple posts', async ({ request }) => {
    const response = await request.get('https://jsonplaceholder.typicode.com/posts');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    
    console.log(`Successfully retrieved ${data.length} posts`);
  });
  
  test('Should create a new post', async ({ request }) => {
    const newPost = {
      title: 'Test Post',
      body: 'This is a test post',
      userId: 1
    };
    
    const response = await request.post('https://jsonplaceholder.typicode.com/posts', {
      data: newPost
    });
    
    expect(response.status()).toBe(201);
    
    const data = await response.json();
    expect(data.title).toBe(newPost.title);
    expect(data.body).toBe(newPost.body);
    expect(data.userId).toBe(newPost.userId);
    expect(data.id).toBeDefined();
    
    console.log('Successfully created post with ID:', data.id);
  });
});
