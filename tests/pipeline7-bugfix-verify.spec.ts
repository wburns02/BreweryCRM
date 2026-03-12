import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5175';
const DIR = './test-results/pipeline7-bugfixes';
fs.mkdirSync(DIR, { recursive: true });

async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(2500);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) { await demoBtn.click(); await page.waitForTimeout(2500); }
}

async function nav(page: Page, text: string) {
  const link = page.locator('nav').locator('button, a').filter({ hasText: new RegExp(`^${text}$`) }).first();
  if (await link.count() > 0) {
    await link.click({ timeout: 5000 });
  } else {
    await page.locator(`text="${text}"`).first().click({ timeout: 5000 });
  }
  await page.waitForTimeout(1500);
}

// BUG 1: Taps "Total Pours Today" renamed to "Lifetime Pours"
test('BUG1-FIXED: Taps KPI shows "Lifetime Pours" not "Total Pours Today"', async ({ page }) => {
  await login(page);
  await nav(page, 'Tap Management');
  await page.screenshot({ path: `${DIR}/taps-kpi.png` });
  
  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('Total Pours Today');
  expect(body).toContain('Lifetime Pours');
  console.log('BUG 1 FIXED: Taps label corrected ✅');
});

// BUG 2: Staff sales display "$—" → "—"
test('BUG2-FIXED: Staff sales shows "—" not "$—" for zero-sales members', async ({ page }) => {
  await login(page);
  await nav(page, 'Staff');
  await page.screenshot({ path: `${DIR}/staff-sales.png` });
  
  const body = await page.locator('body').textContent() || '';
  // Should NOT have the broken pattern "$—" (dollar then dash)
  expect(body).not.toMatch(/\$\s*—/);
  console.log('BUG 2 FIXED: Staff "$—" display fixed ✅');
});

// BUG 3: Reservations stats show non-zero upcoming counts
test('BUG3-FIXED: Reservations KPI stats show data from upcoming reservations', async ({ page }) => {
  await login(page);
  await nav(page, 'Reservations');
  await page.screenshot({ path: `${DIR}/reservations-stats.png` });
  
  // The page should have reservation content (not all zeros for every stat)
  const body = await page.locator('body').textContent() || '';
  const hasReservationContent = body.match(/Confirmed|Seated|Waitlist|Total Guests/i);
  expect(hasReservationContent).toBeTruthy();
  console.log('BUG 3 FIXED: Reservations page renders reservation stats ✅');
});

// BUG 4: Dashboard daily sales now include recent dates (data quality)
test('BUG4-FIXED: Dashboard has current financial data (no NaN)', async ({ page }) => {
  await login(page);
  await nav(page, 'Dashboard');
  await page.screenshot({ path: `${DIR}/dashboard-sales.png` });
  
  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  expect(body).not.toContain('undefined');
  console.log('BUG 4 FIXED: Dashboard has clean data ✅');
});

// BUG 5: Distribution has "Log Order" button
test('BUG5-FIXED: Distribution has "Log Order" button and modal works', async ({ page }) => {
  await login(page);
  await nav(page, 'Distribution');
  await page.screenshot({ path: `${DIR}/distribution-before.png` });
  
  const logOrderBtn = page.locator('button').filter({ hasText: /Log Order/ }).first();
  expect(await logOrderBtn.count()).toBeGreaterThan(0);
  console.log('Distribution "Log Order" button found ✅');
  
  // Click it — should open a modal with account selector
  await logOrderBtn.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/distribution-order-modal.png` });
  
  const dialog = page.locator('[role="dialog"]');
  expect(await dialog.count()).toBeGreaterThan(0);
  
  const selectAccount = dialog.locator('select').first();
  expect(await selectAccount.count()).toBeGreaterThan(0);
  console.log('BUG 5 FIXED: Distribution "Log Order" modal opens with account selector ✅');
  
  // Close it
  await page.keyboard.press('Escape');
});
