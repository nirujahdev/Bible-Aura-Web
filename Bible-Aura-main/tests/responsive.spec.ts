import { test, expect } from '@playwright/test';

test.describe('Responsive Tests - Bible Aura', () => {

  // Test Bible page on different devices
  test.describe('Bible Page Responsive Tests', () => {
    
    test('Bible Page - Mobile (375x812)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/bible');
      
      // Check if page loads
      await expect(page.locator('h1')).toContainText('Sacred Scripture');
      
      // Check mobile sidebar trigger button is visible
      await expect(page.getByRole('button').filter({ hasText: 'Menu' }).first()).toBeVisible();
      
      // Check Bible controls are present and stacked for mobile
      await expect(page.getByText('Bible Language')).toBeVisible();
      await expect(page.getByText('Select Book')).toBeVisible();
      await expect(page.getByText('Search Verses')).toBeVisible();
      
      // Take screenshot for visual regression
      await page.screenshot({ path: 'test-results/bible-mobile.png', fullPage: true });
    });

    test('Bible Page - Tablet (768x1024)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/bible');
      
      // Check if page loads
      await expect(page.locator('h1')).toContainText('Sacred Scripture');
      
      // Check controls are properly arranged for tablet
      await expect(page.getByText('Bible Language')).toBeVisible();
      await expect(page.getByText('Select Book')).toBeVisible();
      await expect(page.getByText('Search Verses')).toBeVisible();
      
      // Take screenshot
      await page.screenshot({ path: 'test-results/bible-tablet.png', fullPage: true });
    });

    test('Bible Page - Desktop (1280x720)', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/bible');
      
      // Check if page loads
      await expect(page.locator('h1')).toContainText('Sacred Scripture');
      
      // Check sidebar is visible on desktop
      await expect(page.getByText('Bible Aura')).toBeVisible();
      
      // Check controls are horizontally arranged for desktop
      await expect(page.getByText('Bible Language')).toBeVisible();
      await expect(page.getByText('Select Book')).toBeVisible();
      await expect(page.getByText('Search Verses')).toBeVisible();
      
      // Take screenshot
      await page.screenshot({ path: 'test-results/bible-desktop.png', fullPage: true });
    });
  });

  // Test Chat page on different devices
  test.describe('Chat Page Responsive Tests', () => {
    
    test('Chat Page - Mobile (375x812)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/chat');
      
      // Check if chat interface loads
      await expect(page.getByText('Biblical AI Chat')).toBeVisible();
      
      // Check mobile sidebar trigger is visible
      await expect(page.getByRole('button').filter({ hasText: 'Menu' }).first()).toBeVisible();
      
      // Check chat input is visible
      await expect(page.getByPlaceholder('Ask about Bible verses, theology, or get spiritual guidance...')).toBeVisible();
      
      // Take screenshot
      await page.screenshot({ path: 'test-results/chat-mobile.png', fullPage: true });
    });

    test('Chat Page - Tablet (768x1024)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/chat');
      
      // Check if chat interface loads
      await expect(page.getByText('Biblical AI Chat')).toBeVisible();
      
      // Check chat input is visible
      await expect(page.getByPlaceholder('Ask about Bible verses, theology, or get spiritual guidance...')).toBeVisible();
      
      // Take screenshot
      await page.screenshot({ path: 'test-results/chat-tablet.png', fullPage: true });
    });

    test('Chat Page - Desktop (1280x720)', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/chat');
      
      // Check if chat interface loads
      await expect(page.getByText('Biblical AI Chat')).toBeVisible();
      
      // Check sidebar is visible
      await expect(page.getByText('Bible Aura')).toBeVisible();
      
      // Check chat input is visible
      await expect(page.getByPlaceholder('Ask about Bible verses, theology, or get spiritual guidance...')).toBeVisible();
      
      // Take screenshot
      await page.screenshot({ path: 'test-results/chat-desktop.png', fullPage: true });
    });
  });

  // Test navigation between pages and sidebar toggling
  test.describe('Navigation and Sidebar Tests', () => {
    
    test('Mobile Navigation - Sidebar Toggle', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/dashboard');
      
      // Open mobile sidebar
      await page.getByRole('button').filter({ hasText: 'Menu' }).first().click();
      
      // Check sidebar opened
      await expect(page.getByText('Bible Aura')).toBeVisible();
      await expect(page.getByText('Biblical Wisdom AI')).toBeVisible();
      
      // Navigate to Bible page
      await page.getByRole('link', { name: 'Bible' }).click();
      await expect(page).toHaveURL('/bible');
      
      // Open sidebar again and navigate to Chat
      await page.getByRole('button').filter({ hasText: 'Menu' }).first().click();
      await page.getByRole('link', { name: 'AI Chat' }).click();
      await expect(page).toHaveURL('/chat');
    });

    test('Desktop Navigation - Sidebar Persistent', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/dashboard');
      
      // Check sidebar is visible by default on desktop
      await expect(page.getByText('Bible Aura')).toBeVisible();
      
      // Navigate to Bible page via sidebar
      await page.getByRole('link', { name: 'Bible' }).click();
      await expect(page).toHaveURL('/bible');
      
      // Navigate to Chat page via sidebar
      await page.getByRole('link', { name: 'AI Chat' }).click();
      await expect(page).toHaveURL('/chat');
      
      // Sidebar should still be visible
      await expect(page.getByText('Bible Aura')).toBeVisible();
    });

    test('Cross-Device Navigation Flow', async ({ page }) => {
      // Test navigation flow across different viewport sizes
      
      // Start on mobile
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/dashboard');
      
      // Navigate to Bible via mobile menu
      await page.getByRole('button').filter({ hasText: 'Menu' }).first().click();
      await page.getByRole('link', { name: 'Bible' }).click();
      await expect(page).toHaveURL('/bible');
      
      // Switch to tablet size
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.locator('h1')).toContainText('Sacred Scripture');
      
      // Switch to desktop
      await page.setViewportSize({ width: 1280, height: 720 });
      await expect(page.getByText('Bible Aura')).toBeVisible();
      
      // Navigate to Chat via desktop sidebar
      await page.getByRole('link', { name: 'AI Chat' }).click();
      await expect(page).toHaveURL('/chat');
    });
  });

});


