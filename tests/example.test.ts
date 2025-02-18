import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  await page.goto('');
  await expect(page).toHaveTitle('Open Interview');
});

test('should have a button to start the interview', async ({ page }) => {
  await page.goto('');
  await expect(page.getByRole('button', { name: 'Create session' })).toBeVisible();
});
