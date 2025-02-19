import { test, expect, type BrowserContext } from '@playwright/test';

test('basic test', async ({ page }) => {
  await page.goto('');
  await expect(page).toHaveTitle('Open Interview');
});

test('create interview and run code', async ({ page }) => {
  await page.goto('');
  await page.getByRole('button', { name: 'Create session' }).click();
  await expect(page.getByText('Ready to start')).toBeVisible();

  await page.getByRole('textbox', { name: 'Editor content' }).fill('console.log("Hello world!");');
  await page.getByRole('button', { name: 'Run' }).click();
  await expect(page.getByTestId('code-submissions').getByText('console.log("Hello world!");')).toBeVisible();
});

test.describe('multiplayer', () => {
  let context1: BrowserContext;
  let context2: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    context1 = await browser.newContext();
    context2 = await browser.newContext();
  });

  test.afterAll(async () => {
    await context1.close();
    await context2.close();
  });

  test('simulate multiplayer interaction', async ({ page }) => {
    const page1 = await context1.newPage();
    await page1.goto('/');

    await page1.getByRole('button', { name: 'Create session' }).click();
    await expect(page1.getByText('Ready to start')).toBeVisible();

    const page2 = await context2.newPage();
    await page2.goto(page1.url());

    await page1.getByRole('textbox', { name: 'Editor content' }).fill('console.log("Hello world!");');
    await page1.getByRole('button', { name: 'Run' }).click();

    await expect(page2.getByTestId('code-submissions').getByText('console.log("Hello world!");')).toBeVisible();
  });
});
