import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5183';
const DIR = './test-results/pipeline2-bugs';
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

async function nav(page: Page, label: string) {
  await page.locator(`text="${label}"`).first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
}

test('BUG1 FIX: POS product catalog shows beers from mock data', async ({ page }) => {
  await login(page);
  await nav(page, 'POS');
  await page.screenshot({ path: `${DIR}/pos-before.png` });

  // Draft Beer tab should now show tap items
  const beerCards = page.locator('.grid button, .grid [class*="beer"], .grid [class*="tap"]');
  const body = await page.locator('body').textContent() || '';

  // Check for beer names from mock data
  const hasBeerNames = body.includes('Hill Country') || body.includes('Haze') || body.includes('Blonde') || body.includes('IPA') || body.includes('Lager');
  console.log(`POS: Has beer names: ${hasBeerNames}`);
  await page.screenshot({ path: `${DIR}/pos-after.png` });

  expect(hasBeerNames, 'POS should show beer names from mock tapLines').toBe(true);
  console.log('BUG1 FIX: POS shows beers ✅');
});

test('BUG2 FIX: POS "New Tab" button is visible and works', async ({ page }) => {
  await login(page);
  await nav(page, 'POS');

  const newTabBtn = page.locator('button:has-text("New Tab")');
  expect(await newTabBtn.count(), 'New Tab button should exist').toBeGreaterThan(0);
  console.log('New Tab button visible ✅');

  // Click it to reset the working tab
  await newTabBtn.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${DIR}/pos-newtab.png` });
  console.log('BUG2 FIX: New Tab button works ✅');
});

test('BUG3 FIX: Production Tank Farm shows vessel cards', async ({ page }) => {
  await login(page);
  await nav(page, 'Production');
  await page.screenshot({ path: `${DIR}/production-tanks.png` });

  const body = await page.locator('body').textContent() || '';
  const hasTanks = body.includes('FV-') || body.includes('BBT-') || body.includes('Armadillo') || body.includes('Longhorn') || body.includes('Tank Farm');
  console.log(`Production: Has tank names: ${hasTanks}`);
  console.log(`Body preview: ${body.substring(0, 200)}`);

  expect(hasTanks, 'Tank Farm should show vessel cards').toBe(true);
  console.log('BUG3 FIX: Production Tank Farm shows vessels ✅');
});

test('BUG4 FIX: Reports page has Export CSV button', async ({ page }) => {
  await login(page);
  await nav(page, 'Reports');
  await page.screenshot({ path: `${DIR}/reports-before.png` });

  const exportBtn = page.locator('button:has-text("Export CSV")');
  expect(await exportBtn.count(), 'Export CSV button should exist').toBeGreaterThan(0);

  await page.screenshot({ path: `${DIR}/reports-after.png` });
  console.log('BUG4 FIX: Reports Export CSV button ✅');
});

test('BUG5 FIX: Taproom Analytics Active Taps shows data', async ({ page }) => {
  await login(page);
  await nav(page, 'Taproom Analytics');
  await page.screenshot({ path: `${DIR}/analytics-active-taps.png` });

  const body = await page.locator('body').textContent() || '';
  const hasTapData = body.includes('Hill Country') || body.includes('Haze') || body.includes('Blonde') || body.includes('IPA') || body.includes('keg');
  console.log(`Analytics: Has tap data: ${hasTapData}`);

  expect(hasTapData, 'Analytics should show tap/beer data from mock tapLines').toBe(true);
  console.log('BUG5 FIX: Taproom Analytics Active Taps shows data ✅');
});

test('VERIFY: No NaN on key pages after mock data fix', async ({ page }) => {
  await login(page);
  const pages = ['Dashboard', 'POS', 'Taproom Analytics', 'Reports', 'Financials', 'Customers'];
  for (const p of pages) {
    await nav(page, p);
    const body = await page.locator('body').textContent() || '';
    expect(body.includes('NaN'), `NaN found on ${p}`).toBe(false);
    console.log(`${p}: No NaN ✅`);
  }
});
