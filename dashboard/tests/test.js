import { expect, test } from '@playwright/test';

test('about page has expected h3', async ({ page }) => {
	await page.goto('/');
	expect(await page.textContent('h3')).toBe('This it the main page for CxC');
});
