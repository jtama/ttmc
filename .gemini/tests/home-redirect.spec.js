import { test, expect } from '@playwright/test';

test.describe('Homepage Redirection', () => {
  test('should redirect from homepage if quiz has a nextModuleUrl', async ({ page }) => {
    // Setup
    await page.goto('/leaderboard/');
    await page.evaluate(() => {
      localStorage.setItem('currentQuiz', JSON.stringify({
        playerName: 'Test Player',
        nextModuleUrl: '/modules/python/'
      }));
    });

    // Action
    await page.goto('/');

    // Assertion
    await expect(page).toHaveURL(/.*\/modules\/python\//);
  });

  test('should NOT redirect from homepage if quiz has no nextModuleUrl', async ({ page }) => {
    // Setup
    await page.goto('/leaderboard/');
    await page.evaluate(() => {
      localStorage.setItem('currentQuiz', JSON.stringify({
        playerName: 'New Player',
        detail: []
      }));
    });

    // Action
    await page.goto('/');

    // Assertion
    await expect(page).toHaveURL('/');
  });

  test('should NOT redirect from leaderboard page, even if quiz is in progress', async ({ page }) => {
    // Setup
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('currentQuiz', JSON.stringify({
        playerName: 'Test Player',
        nextModuleUrl: '/modules/python/'
      }));
    });

    // Action
    await page.goto('/leaderboard/');

    // Assertion
    await expect(page).toHaveURL(/.*\/leaderboard\//);
    await expect(page.locator('header h1')).toHaveText('🏆Leaderboard');
  });
});