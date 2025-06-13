import { test, expect } from '@playwright/test';

test.describe('Web Test Example', () => {
  test('should load Google homepage', async ({ page }) => {
    await page.goto('https://www.google.com');
    await expect(page).toHaveTitle(/Google/);
  });
  
  test('should perform basic search', async ({ page }) => {
    await page.goto('https://www.google.com');
    await page.fill('[name="q"]', 'Playwright testing');
    await page.press('[name="q"]', 'Enter');
    await expect(page).toHaveURL(/.*search.*/);
  });
});
