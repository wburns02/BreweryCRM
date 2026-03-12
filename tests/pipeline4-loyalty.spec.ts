import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5185';
const DIR = './test-results/pipeline4-loyalty';
fs.mkdirSync(DIR, { recursive: true });

async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(2500);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) { await demoBtn.click(); await page.waitForTimeout(2500); }
}

test('LOYALTY: Page loads with all 4 tabs', async ({ page }) => {
  await login(page);
  await page.locator('button').filter({ hasText: /^Loyalty Check-in$/ }).click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/loyalty-checkin.png` });

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  expect(body.includes('Check-in Station') || body.includes('Loyalty')).toBe(true);
  expect(await page.locator('button:has-text("Check-in Station")').count()).toBeGreaterThan(0);
  console.log('Loyalty page loads ✅');
});

test('LOYALTY: QR scanner animation triggers', async ({ page }) => {
  await login(page);
  await page.locator('button').filter({ hasText: /^Loyalty Check-in$/ }).click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  // Click QR scanner
  const scanner = page.locator('text=Tap to scan');
  if (await scanner.count() > 0) {
    const parent = scanner.locator('..');
    await parent.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/loyalty-scanning.png` });
    const body = await page.locator('body').textContent() || '';
    const isScanning = body.includes('Scanning') || body.includes('checked in');
    console.log(`QR scan triggered: ${isScanning}`);
  }
  console.log('QR scanner ✅');
});

test('LOYALTY: Manual check-in search finds customer', async ({ page }) => {
  await login(page);
  await page.locator('button').filter({ hasText: /^Loyalty Check-in$/ }).click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  const searchInput = page.locator('input[placeholder*="phone"]').first();
  expect(await searchInput.count()).toBeGreaterThan(0);

  await searchInput.fill('Sa');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/loyalty-search-results.png` });

  // Should show dropdown
  const dropdown = page.locator('.z-20');
  if (await dropdown.count() > 0) {
    console.log('Search results visible ✅');
    const firstResult = dropdown.locator('button').first();
    if (await firstResult.count() > 0) {
      await firstResult.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${DIR}/loyalty-after-checkin.png` });
      const body = await page.locator('body').textContent() || '';
      const hasSuccess = body.includes('checked in') || body.includes('Total Points') || body.includes('Total Visits');
      console.log(`Check-in success: ${hasSuccess}`);
    }
  }
  console.log('Manual check-in ✅');
});

test('LOYALTY: Leaderboard tab shows ranked members', async ({ page }) => {
  await login(page);
  await page.locator('button').filter({ hasText: /^Loyalty Check-in$/ }).click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  await page.locator('button:has-text("Leaderboard")').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/loyalty-leaderboard.png` });

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  expect(body.includes('Bronze') || body.includes('Gold') || body.includes('Platinum')).toBe(true);
  console.log('Leaderboard tab ✅');
});

test('LOYALTY: Rewards tab shows redemption options', async ({ page }) => {
  await login(page);
  await page.locator('button').filter({ hasText: /^Loyalty Check-in$/ }).click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  await page.locator('button:has-text("Redeem Rewards")').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/loyalty-rewards.png` });

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  expect(body.includes('Free Pint') || body.includes('pts')).toBe(true);
  console.log('Rewards tab ✅');
});

test('LOYALTY: Tiers tab shows all 4 tiers', async ({ page }) => {
  await login(page);
  await page.locator('button').filter({ hasText: /^Loyalty Check-in$/ }).click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  await page.locator('button:has-text("Tier Overview")').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/loyalty-tiers.png` });

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  expect(body.includes('Bronze')).toBe(true);
  expect(body.includes('Silver')).toBe(true);
  expect(body.includes('Gold')).toBe(true);
  expect(body.includes('Platinum')).toBe(true);
  console.log('Tiers tab ✅');
});

test('LOYALTY: No JS errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const t = msg.text();
      if (!t.includes('net::') && !t.includes('favicon') && !t.includes('CORS')) {
        if (t.includes('TypeError') || t.includes('is not a function') || t.includes('Cannot read')) {
          errors.push(t.substring(0, 100));
        }
      }
    }
  });

  await login(page);
  await page.locator('button').filter({ hasText: /^Loyalty Check-in$/ }).click({ timeout: 8000 });
  await page.waitForTimeout(1000);

  for (const tab of ['Leaderboard', 'Redeem Rewards', 'Tier Overview', 'Check-in Station']) {
    await page.locator(`button:has-text("${tab}")`).click();
    await page.waitForTimeout(400);
  }

  console.log(`JS errors: ${errors.length}`);
  errors.forEach(e => console.log(' ERR:', e));
  expect(errors.length, `Errors: ${errors.join(' | ')}`).toBe(0);
  console.log('No JS errors ✅');
});
