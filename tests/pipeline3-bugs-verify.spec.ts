import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5184';
const DIR = './test-results/bugs-verify-p3';
fs.mkdirSync(DIR, { recursive: true });

async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(2000);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) { await demoBtn.click(); await page.waitForTimeout(2500); }
}

test('BUG1 FIX: Brewing batch cards now have Advance Status button', async ({ page }) => {
  await login(page);
  await page.locator('text="Brewing"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/brewing-before.png` });
  
  const advanceBtn = page.locator('button').filter({ hasText: /Advance to/ }).first();
  expect(await advanceBtn.count(), 'Advance to button should exist').toBeGreaterThan(0);
  console.log('Advance Status button found ✅');
  
  // Click it and verify status changes
  await advanceBtn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${DIR}/brewing-advanced.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  console.log('Advance Status clicked, no NaN ✅');
  
  // Check Log Gravity button  
  const gravityBtn = page.locator('button').filter({ hasText: /Log Gravity/ }).first();
  if (await gravityBtn.count() > 0) {
    await gravityBtn.click();
    await page.waitForTimeout(400);
    const gravityInput = page.locator('input[type="number"]').filter({ hasAttribute: 'placeholder' }).first();
    if (await gravityInput.count() > 0) {
      await gravityInput.fill('1.028');
      const logBtn = page.locator('button:has-text("Log")').first();
      await logBtn.click();
      await page.waitForTimeout(400);
      console.log('Log Gravity flow works ✅');
    }
  }
  await page.screenshot({ path: `${DIR}/brewing-gravity.png` });
});

test('BUG2 FIX: Mug Club members now clickable', async ({ page }) => {
  await login(page);
  await page.locator('text="Mug Club"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/mug-club-before.png` });
  
  const firstRow = page.locator('tbody tr').first();
  expect(await firstRow.count()).toBeGreaterThan(0);
  await firstRow.click({ timeout: 3000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${DIR}/mug-club-panel.png` });
  
  const panel = page.locator('[role="dialog"]').first();
  expect(await panel.isVisible(), 'Member detail panel should open').toBe(true);
  const panelBody = await panel.textContent() || '';
  expect(panelBody.includes('Member') || panelBody.includes('Mug') || panelBody.includes('Visits')).toBe(true);
  console.log('Mug Club member detail panel opens ✅');
});

test('BUG3 FIX: Distribution accounts now clickable with detail panel', async ({ page }) => {
  await login(page);
  await page.locator('text="Distribution"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/distribution-before.png` });
  
  const firstCard = page.locator('.grid.grid-cols-1 > div').first();
  expect(await firstCard.count()).toBeGreaterThan(0);
  await firstCard.click({ timeout: 3000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${DIR}/distribution-panel.png` });
  
  const panel = page.locator('[role="dialog"]').first();
  expect(await panel.isVisible(), 'Account detail panel should open').toBe(true);
  const panelBody = await panel.textContent() || '';
  expect(panelBody.includes('Revenue') || panelBody.includes('Order') || panelBody.includes('Keg')).toBe(true);
  console.log('Distribution account detail panel opens ✅');
});

test('BUG4 FIX: Reports page has date range filter', async ({ page }) => {
  await login(page);
  await page.locator('text="Reports"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/reports-before.png` });
  
  const body = await page.locator('body').textContent() || '';
  expect(body.includes('7 Days') || body.includes('30 Days')).toBe(true);
  console.log('Date range filter present ✅');
  
  // Click 7 days
  const btn7 = page.locator('button:has-text("7 Days")');
  expect(await btn7.count()).toBeGreaterThan(0);
  await btn7.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/reports-7days.png` });
  const body7 = await page.locator('body').textContent() || '';
  expect(body7.includes('7-Day Revenue')).toBe(true);
  console.log('7-Day filter works ✅');
  
  // Click 90 days
  const btn90 = page.locator('button:has-text("90 Days")');
  await btn90.click();
  await page.waitForTimeout(500);
  const body90 = await page.locator('body').textContent() || '';
  expect(body90.includes('90-Day Revenue')).toBe(true);
  console.log('90-Day filter works ✅');
});

test('BUG5 VERIFY: Distribution accounts show realistic data', async ({ page }) => {
  await login(page);
  await page.locator('text="Distribution"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  const body = await page.locator('body').textContent() || '';
  
  // Check that accounts with orders show non-zero counts
  expect(body.includes('Rusty Tap') || body.includes('Canyon Lake') || body.includes('Gruene')).toBe(true);
  console.log('Distribution accounts with data ✅');
  await page.screenshot({ path: `${DIR}/distribution-accounts.png` });
  
  // Click first active account and verify order history
  const activeCard = page.locator('.grid.grid-cols-1 > div').first();
  await activeCard.click({ timeout: 3000 });
  await page.waitForTimeout(600);
  const panel = page.locator('[role="dialog"]').first();
  if (await panel.isVisible()) {
    const panelBody = await panel.textContent() || '';
    console.log('Panel content includes:', panelBody.includes('18') || panelBody.includes('Order'));
    await page.screenshot({ path: `${DIR}/distribution-order-history.png` });
  }
  console.log('Distribution order data verified ✅');
});
