/**
 * Debug test to discover selectors on Playwright.dev
 */

import { test, expect } from '@playwright/test';

test('debug selectors on playwright.dev', async ({ page }) => {
  await page.goto('https://playwright.dev');
  
  // Wait for page to load
  await page.waitForLoadState('domcontentloaded');
  
  // Check what's in the title
  const title = await page.title();
  console.log('Page title:', title);
  
  // Check main heading
  const h1 = await page.locator('h1').first().textContent();
  console.log('H1 text:', h1);
  
  // Check for possible navigation elements
  const navElements = await page.locator('nav a').count();
  console.log('Navigation links found:', navElements);
  
  // Check for links containing "docs"
  const docsLinks = await page.locator('a[href*="/docs"]').count();
  console.log('Links containing "/docs":', docsLinks);
  
  if (docsLinks > 0) {
    const firstDocsLink = await page.locator('a[href="/docs/intro"]').first();
    const docsLinkText = await firstDocsLink.textContent();
    const docsLinkHref = await firstDocsLink.getAttribute('href');
    console.log('First docs link text:', docsLinkText);
    console.log('First docs link href:', docsLinkHref);
  }
  
  // Check for main content section
  const heroSections = await page.locator('.hero, [class*="hero"], .jumbotron, [class*="jumbotron"], .banner, [class*="banner"]').count();
  console.log('Hero/banner sections found:', heroSections);
  
  // Check main container classes
  const mainContainerClasses = await page.locator('main').first().getAttribute('class');
  console.log('Main container classes:', mainContainerClasses);
  
  // Check for container with h1
  const h1Container = await page.locator('h1').first().locator('..').getAttribute('class');
  console.log('H1 parent container classes:', h1Container);
  
  // Check for buttons
  const buttons = await page.locator('button, .button, [role="button"], a[href="/docs/intro"]').count();
  console.log('Buttons/CTA elements found:', buttons);
  
  // Check navigation bar classes
  const navClasses = await page.locator('nav').first().getAttribute('class');
  console.log('Nav classes:', navClasses);
  
  // Check for API link  
  const apiLink = await page.locator('a[href*="/docs/api"]').first().textContent();
  console.log('API link text:', apiLink);
  
  // Check for community link
  const communityLink = await page.locator('a[href*="/community"]').first().textContent();
  console.log('Community link text:', communityLink);
  
  expect(title).toContain('Playwright');
});
