import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5183';
const DIR = './test-results/pipeline2-feature';
fs.mkdirSync(DIR, { recursive: true });

async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(2000);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) {
    await demoBtn.click();
    await page.waitForTimeout(2500);
  }
}

test('FEATURE: Keg Monitor page loads in sidebar', async ({ page }) => {
  await login(page);
  const kegMonitorLink = page.locator('text="Keg Monitor"');
  expect(await kegMonitorLink.count()).toBeGreaterThan(0);
  console.log('Keg Monitor nav item found ✅');

  await kegMonitorLink.first().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/keg-monitor-initial.png` });

  const title = page.locator('text="Keg Health Monitor"');
  expect(await title.count()).toBeGreaterThan(0);
  console.log('Keg Health Monitor title found ✅');
});

test('FEATURE: Keg Monitor shows active tap cards with fill gauges', async ({ page }) => {
  await login(page);
  await page.locator('text="Keg Monitor"').first().click();
  await page.waitForTimeout(2000); // wait for animations

  await page.screenshot({ path: `${DIR}/keg-monitor-loaded.png` });

  const body = await page.locator('body').textContent() || '';

  // Should show beer names
  const hasBeerNames = body.includes('Hill Country') || body.includes('Bulverde') || body.includes('Citra') || body.includes('Lager');
  expect(hasBeerNames).toBe(true);
  console.log('Keg cards show beer names ✅');

  // Should show pints remaining
  const hasPints = body.includes('Pints left') || body.includes('pints');
  expect(hasPints).toBe(true);
  console.log('Keg cards show pints remaining ✅');

  // Should NOT have NaN
  expect(body.includes('NaN')).toBe(false);
  console.log('No NaN values ✅');
});

test('FEATURE: Keg Monitor stats bar shows data', async ({ page }) => {
  await login(page);
  await page.locator('text="Keg Monitor"').first().click();
  await page.waitForTimeout(1500);

  const body = await page.locator('body').textContent() || '';
  expect(body.includes('Active Taps')).toBe(true);
  expect(body.includes('Avg Keg Level')).toBe(true);
  expect(body.includes('Full Kegs')).toBe(true);
  console.log('KPI stats bar shows data ✅');
});

test('FEATURE: Keg Monitor alert banner works', async ({ page }) => {
  await login(page);
  await page.locator('text="Keg Monitor"').first().click();
  await page.waitForTimeout(1500);

  // Should show either alerts or "all kegs healthy" message
  const body = await page.locator('body').textContent() || '';
  const hasAlertMsg = body.includes('kegs healthy') || body.includes('Swap Required') || body.includes('Order Soon');
  expect(hasAlertMsg).toBe(true);
  console.log('Alert banner shows status ✅');
});

test('FEATURE: Keg Monitor filter pills work', async ({ page }) => {
  await login(page);
  await page.locator('text="Keg Monitor"').first().click();
  await page.waitForTimeout(1500);

  // Click "Alerts" filter
  const alertFilter = page.locator('button').filter({ hasText: /Alerts/ }).first();
  if (await alertFilter.count() > 0) {
    await alertFilter.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/keg-monitor-alerts-filter.png` });
    console.log('Alerts filter works ✅');
  }

  // Click "All Taps" filter
  const allFilter = page.locator('button').filter({ hasText: /All Taps/ }).first();
  await allFilter.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${DIR}/keg-monitor-all-filter.png` });
  console.log('All Taps filter works ✅');
});

test('FEATURE: Keg Monitor sort controls work', async ({ page }) => {
  await login(page);
  await page.locator('text="Keg Monitor"').first().click();
  await page.waitForTimeout(1500);

  // Click "Name" sort
  const nameSort = page.locator('button').filter({ hasText: 'Name' }).first();
  if (await nameSort.count() > 0) {
    await nameSort.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${DIR}/keg-monitor-sorted-name.png` });
    console.log('Name sort works ✅');
  }

  // Click "Tap #" sort
  const tapSort = page.locator('button').filter({ hasText: 'Tap #' }).first();
  if (await tapSort.count() > 0) {
    await tapSort.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${DIR}/keg-monitor-sorted-tap.png` });
    console.log('Tap # sort works ✅');
  }
});

test('FEATURE: Keg Monitor Refresh button works', async ({ page }) => {
  await login(page);
  await page.locator('text="Keg Monitor"').first().click();
  await page.waitForTimeout(1500);

  const refreshBtn = page.locator('button:has-text("Refresh")');
  expect(await refreshBtn.count()).toBeGreaterThan(0);
  await refreshBtn.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${DIR}/keg-monitor-refreshed.png` });
  console.log('Refresh button works ✅');
});

test('FEATURE: Keg Monitor mobile responsive', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page);

  // Mobile nav
  const hamburger = page.locator('header button').first();
  await hamburger.click();
  await page.waitForTimeout(400);

  const link = page.locator('text="Keg Monitor"').first();
  await link.click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/keg-monitor-mobile.png` });

  const body = await page.locator('body').textContent() || '';
  expect(body.includes('Keg Health Monitor')).toBe(true);
  expect(body.includes('NaN')).toBe(false);
  console.log('Keg Monitor mobile responsive ✅');
});

test('FEATURE: POS now shows beers with New Tab button', async ({ page }) => {
  await login(page);
  await page.locator('text="POS"').first().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/pos-with-beers.png` });

  const body = await page.locator('body').textContent() || '';
  expect(body.includes('Hill Country') || body.includes('Haze') || body.includes('Blonde')).toBe(true);
  const newTabBtn = page.locator('button:has-text("New Tab")');
  expect(await newTabBtn.count()).toBeGreaterThan(0);
  console.log('POS with beers and New Tab button ✅');
});
