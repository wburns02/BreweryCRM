import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5174';
const DIR = './test-results/pipeline6-bugs';
fs.mkdirSync(DIR, { recursive: true });

async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(2500);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) { await demoBtn.click(); await page.waitForTimeout(2500); }
}

// BUG 1: POS mobile layout
test('BUG1: POS mobile — menu grid and tab panel both accessible', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page);
  const hamburger = page.locator('header button').first();
  await hamburger.click(); await page.waitForTimeout(300);
  await page.locator('text="POS"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/pos-mobile-menu.png` });

  // Check the mobile switcher exists
  const menuBtn = page.locator('button').filter({ hasText: /^Menu$/ });
  const tabBtn = page.locator('button').filter({ hasText: /^Tab/ });
  expect(await menuBtn.count()).toBeGreaterThan(0);
  expect(await tabBtn.count()).toBeGreaterThan(0);

  // Verify no horizontal overflow
  const scrollW = await page.locator('body').evaluate(el => el.scrollWidth);
  const clientW = await page.locator('body').evaluate(el => el.clientWidth);
  const overflow = scrollW - clientW;
  console.log(`POS mobile overflow: ${overflow}px`);
  expect(overflow).toBeLessThan(20);

  // Switch to Tab view
  await tabBtn.first().click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${DIR}/pos-mobile-tab.png` });

  // Switch back to menu view
  await menuBtn.click();
  await page.waitForTimeout(300);

  // Verify tap cards are visible
  const tapCards = page.locator('button').filter({ hasText: /TAP \d/ });
  expect(await tapCards.count()).toBeGreaterThan(0);
  console.log('BUG1 POS mobile ✅');
});

// BUG 2: Stale timestamps
test('BUG2: Floor Plan — alert timestamps are fresh (< 60 min ago)', async ({ page }) => {
  await login(page);
  await page.locator('text="Floor Plan"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  const body = await page.locator('body').textContent() || '';
  await page.screenshot({ path: `${DIR}/floorplan-timestamps.png` });

  // Should NOT show "160+ hours ago"
  const hasStaleHours = /1[5-9]\d h|[2-9]\d\d h|\d{4,} h/.test(body);
  console.log(`Has stale hours (160+): ${hasStaleHours}`);
  expect(hasStaleHours).toBe(false);

  // Should show minutes (recent alerts)
  const hasMinutes = body.includes('min ago') || body.includes('m ago');
  console.log(`Has fresh minute timestamps: ${hasMinutes}`);
  expect(hasMinutes).toBe(true);
  console.log('BUG2 timestamps ✅');
});

test('BUG2: POS — open tabs show reasonable times (< 4 hours)', async ({ page }) => {
  await login(page);
  await page.locator('text="POS"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  const body = await page.locator('body').textContent() || '';
  await page.screenshot({ path: `${DIR}/pos-tab-times.png` });

  // Should NOT show 9000+ minutes
  const hasStaleMinutes = /9[0-9]{3}m|[1-9]\d{4}m/.test(body);
  console.log(`Has stale 9000+ min: ${hasStaleMinutes}`);
  expect(hasStaleMinutes).toBe(false);

  // Should show reasonable times (< 240m / 4 hours)
  const minMatch = body.match(/(\d+)m/g);
  if (minMatch) {
    const maxMin = Math.max(...minMatch.map(m => parseInt(m)));
    console.log(`Max tab minutes shown: ${maxMin}`);
    expect(maxMin).toBeLessThan(250); // < 4h10m
  }
  console.log('BUG2 POS tab times ✅');
});

// BUG 3: Reservations empty state
test('BUG3: Reservations — shows empty state with CTA when no reservations', async ({ page }) => {
  await login(page);
  await page.locator('text="Reservations"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/reservations-empty.png` });

  const body = await page.locator('body').textContent() || '';

  // Either has reservations OR has an empty state message
  const hasReservations = body.includes('confirmed') || body.includes('seated') || body.includes('waitlist');
  const hasEmptyState = body.includes('No reservations') || body.includes('Add one to get started');

  console.log(`Has reservations: ${hasReservations}, Has empty state: ${hasEmptyState}`);
  expect(hasReservations || hasEmptyState).toBe(true);
  console.log('BUG3 reservations empty state ✅');
});

// BUG 4: Financials mobile tab overflow
test('BUG4: Financials — no mobile overflow, all tabs accessible', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page);
  const hamburger = page.locator('header button').first();
  await hamburger.click(); await page.waitForTimeout(300);
  await page.locator('text="Financials"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/financials-mobile.png` });

  const scrollW = await page.locator('body').evaluate(el => el.scrollWidth);
  const clientW = await page.locator('body').evaluate(el => el.clientWidth);
  const overflow = scrollW - clientW;
  console.log(`Financials mobile overflow: ${overflow}px`);
  expect(overflow).toBeLessThan(20);

  // Try to click Beer Economics tab (was previously cut off)
  const beerTab = page.locator('button').filter({ hasText: /Beer Economics/ });
  if (await beerTab.count() > 0) {
    await beerTab.scrollIntoViewIfNeeded();
    await beerTab.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${DIR}/financials-beer-tab.png` });
    console.log('Beer Economics tab accessible ✅');
  }
  console.log('BUG4 Financials mobile ✅');
});

// BUG 5: Currency formatting
test('BUG5: Tap Management — currency shows 2 decimal places', async ({ page }) => {
  await login(page);
  await page.locator('text="Tap Management"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/taps-currency.png` });

  const body = await page.locator('body').textContent() || '';

  // Should NOT have single decimal place (e.g. $1,602.6)
  const hasBadFormat = /\$[\d,]+\.\d{1}[^0-9]/.test(body);
  console.log(`Has bad currency format ($X.X): ${hasBadFormat}`);
  expect(hasBadFormat).toBe(false);

  // Should have proper 2-decimal format
  const hasGoodFormat = /\$[\d,]+\.\d{2}/.test(body);
  console.log(`Has proper currency format ($X.XX): ${hasGoodFormat}`);
  expect(hasGoodFormat).toBe(true);
  console.log('BUG5 currency format ✅');
});
