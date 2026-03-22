import { test, expect } from '@playwright/test';

// smoke test
test.describe('Smoke - core user journey', () => {

    // test login and navigates on submit
    test('login page accepts input and navigates to /deck', async ({ page }) => {

        await page.goto('/login');

        // enter email and password sections
        await page.getByPlaceholder('jane@university.edu').fill('test@university.edu');
        await page.getByPlaceholder('••••••••').fill('password123');

        // click the login button
        await page.getByRole('button', { name: 'LOG IN →' }).click();

        // verify we landed on /deck (login redirects to /deck; signup redirects to /setup)
        await expect(page).toHaveURL('/deck');
    });

    // deck page renders without crashing; unauthenticated → API returns 401 →
    // jobs=[] → "All caught up" state. Authenticated flow tested via api.spec.ts.
    test('deck renders and shows loading then all-caught-up when unauthenticated', async ({ page }) => {

        await page.goto('/deck');

        // After the loading spinner resolves, an unauthenticated session gets an
        // empty job list and shows the "All caught up" completion screen.
        await expect(page.getByText('All caught up')).toBeVisible({ timeout: 5000 });
    });

    // history page renders with empty state when unauthenticated
    test('history page renders and shows empty state when unauthenticated', async ({ page }) => {
        await page.goto('/history');

        // verify the page title
        await expect(page.getByRole('heading', { name: 'History'})).toBeVisible();

        // Unauthenticated: API returns 401 → history=[] → empty state message
        await expect(page.getByText('No history yet — start swiping.')).toBeVisible({ timeout: 5000 });
    });
});
