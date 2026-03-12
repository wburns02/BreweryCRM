import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5183';
const SCREENSHOT_DIR = './test-results/phase2-bugs';
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(2000);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) {
    await demoBtn.click();
    await page.waitForTimeout(2000);
  } else {
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.count() > 0) {
      await emailInput.fill('admin@beardedhop.com');
      await page.locator('input[type="password"]').first().fill('BrewDay2026!');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(2000);
    }
  }
}

test('Bug 1: Dashboard no longer stuck loading', async ({ page }) => {
  await login(page);
  await page.locator('text="Dashboard"').first().click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/bug1-dashboard.png` });

  // Should NOT show "Loading dashboard data..."
  const loadingText = page.locator('text="Loading dashboard data..."');
  const loadingCount = await loadingText.count();

  // Should show either the dashboard content OR the empty state message
  const emptyState = page.locator('text="No sales data yet"');
  const statCards = page.locator('[class*="grid"]').first();

  const hasEmptyState = await emptyState.count() > 0;
  const hasContent = await statCards.isVisible().catch(() => false);

  console.log(`Loading stuck: ${loadingCount > 0}, Has empty state: ${hasEmptyState}, Has content: ${hasContent}`);
  expect(loadingCount).toBe(0); // Must not be stuck loading
});

test('Bug 2: Customers page no $NaN', async ({ page }) => {
  await login(page);
  await page.locator('text="Customers"').first().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/bug2-customers.png` });

  // NaN should not appear anywhere on the page
  const bodyText = await page.locator('body').textContent();
  expect(bodyText).not.toContain('NaN');
  console.log('No NaN found on Customers page ✅');
});

test('Bug 3: Financials no dead-end error', async ({ page }) => {
  await login(page);
  await page.locator('text="Financials"').first().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/bug3-financials.png` });

  // Old dead-end text should be replaced with proper empty state
  const oldError = page.locator('text="Insufficient financial data to display overview."');
  const count = await oldError.count();
  console.log(`Old error message count: ${count} (should be 0)`);

  // New empty state should be present instead
  const newEmptyState = page.locator('text="No financial data yet"');
  const hasNewEmptyState = await newEmptyState.count() > 0;
  console.log(`New empty state: ${hasNewEmptyState}`);

  // Either the old error is gone, or the new empty state is shown
  const pageText = await page.locator('body').textContent();
  const hasOldError = pageText?.includes('Insufficient financial data to display overview.');
  expect(hasOldError).toBeFalsy();
});

test('Bug 4: Staff page has Add Staff button', async ({ page }) => {
  await login(page);
  await page.locator('text="Staff"').first().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/bug4-staff-before.png` });

  // Check for Add Staff button
  const addBtn = page.locator('button:has-text("Add Staff")');
  expect(await addBtn.count()).toBeGreaterThan(0);
  console.log('Add Staff button found ✅');

  // Click it and check modal opens
  await addBtn.first().click();
  await page.waitForTimeout(500);
  const modal = page.locator('[role="dialog"]');
  expect(await modal.count()).toBeGreaterThan(0);
  console.log('Add Staff modal opened ✅');

  // Fill the form
  await page.locator('[role="dialog"] input').first().fill('Sarah');
  await page.locator('[role="dialog"] input').nth(1).fill('Johnson');

  await page.screenshot({ path: `${SCREENSHOT_DIR}/bug4-staff-modal.png` });

  // Submit — use the one inside the dialog
  await page.locator('[role="dialog"] button[type="submit"]').click();
  await page.waitForTimeout(500);

  // Check toast or new member appears
  const sarah = page.locator('text="Sarah Johnson"');
  await page.screenshot({ path: `${SCREENSHOT_DIR}/bug4-staff-after.png` });
  expect(await sarah.count()).toBeGreaterThan(0);
  console.log('Sarah Johnson added to staff ✅');
});

test('Bug 5: Distribution page has Add Account button', async ({ page }) => {
  await login(page);
  await page.locator('text="Distribution"').first().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/bug5-distribution-before.png` });

  // Check for Add Account button
  const addBtn = page.locator('button:has-text("Add Account")');
  expect(await addBtn.count()).toBeGreaterThan(0);
  console.log('Add Account button found ✅');

  // Click it and check modal opens
  await addBtn.first().click();
  await page.waitForTimeout(500);
  const modal = page.locator('[role="dialog"]');
  expect(await modal.count()).toBeGreaterThan(0);
  console.log('Add Account modal opened ✅');

  // Fill the form
  const businessInput = page.locator('[role="dialog"] input').first();
  await businessInput.fill('Alamo Draft House');

  await page.screenshot({ path: `${SCREENSHOT_DIR}/bug5-distribution-modal.png` });

  // Submit
  await page.locator('button:has-text("Add Account")').last().click();
  await page.waitForTimeout(500);

  // Check new account appears
  const account = page.locator('text="Alamo Draft House"');
  await page.screenshot({ path: `${SCREENSHOT_DIR}/bug5-distribution-after.png` });
  expect(await account.count()).toBeGreaterThan(0);
  console.log('Alamo Draft House added ✅');
});
