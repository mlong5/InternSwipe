import { test, expect } from '@playwright/test';

// smoke test
test.describe('Smoke - core user journey', () => {
    
    // test login and navigates on submit
    test('login page accepts input and navigates to /setup', async ({ page }) => {
        
        await page.goto('/login');
        
        // enter email and password sections
        await page.getByPlaceholder('jane@university.edu').fill('test@university.edu');
        await page.getByPlaceholder('••••••••').fill('password123');

        // click the login button
        await page.getByRole('button', { name: 'LOG IN →' }).click();
        
        // verify we landed on /setup
        await expect(page).toHaveURL('/setup');
    });

    // deck page shows a card and swiping advances it
    test('deck shows first card and advances on swipe', async ({ page }) => {
        
        await page.goto('/deck');

        // verify the first card is showing hardcoded data
        await expect(page.getByText('Acme Corp')).toBeVisible();
        await expect(page.getByText('Software Engineer Intern')).toBeVisible();

        // the counter should show 1 / 5
        await expect(page.getByText('1 / 5')).toBeVisible();

        // click the checkmark button to apply
        await page.getByRole('button', { name: '✓' }).click();

        // the next card should appear after
        await expect(page.getByText('Widgets Inc')).toBeVisible();                                                                                                                                                                                                                                            
        await expect(page.getByText('2 / 5')).toBeVisible();
    });

    // history page should appear with example data
    test('history page shows stub entries', async ({ page }) => {
        await page.goto('/history');
    
        // verify the page title
        await expect(page.getByRole('heading', { name: 'History'})).toBeVisible();

        // verify the example data is showing
        await expect(page.getByText('Acme Corp')).toBeVisible();
        await expect(page.getByText('Widgets Inc')).toBeVisible();
        await expect(page.getByText('DataCo')).toBeVisible();

        // verify the stats section shows the correct counts
        await expect(page.getByText('3 reviewed')).toBeVisible();
    });
});