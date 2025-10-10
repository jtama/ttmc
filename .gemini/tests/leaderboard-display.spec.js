
import { test, expect } from '@playwright/test';

test.describe('Leaderboard Display', () => {
  test('should display the correct count of remaining modules', async ({ page }) => {
    // 1. Setup: Go to the page to access the total module count from the body attribute
    await page.goto('/leaderboard/');
    const totalModules = await page.evaluate(() => parseInt(document.body.getAttribute('data-all-modules') || '0'));
    expect(totalModules).toBeGreaterThan(0); // Make sure we have modules to test against

    // 2. Setup: Simulate a quiz with 2 modules answered
    await page.evaluate(() => {
      localStorage.setItem('currentQuiz', JSON.stringify({
        playerName: 'Test Player',
        detail: [
          { module: 'java', points: 10 },
          { module: 'python', points: 5 }
        ]
      }));
    });

    // 3. Action: Reload the page to trigger the display logic
    await page.reload();

    // 4. Assertion: Check that the correct remaining count is displayed
    const expectedRemaining = totalModules - 2;
    const remainingText = page.locator('.remaining-modules-list li');
    await expect(remainingText).toHaveText(`${expectedRemaining} module(s) restant(s)`);
  });
});
