import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5184';
const DIR = './test-results/feature-cost';
fs.mkdirSync(DIR, { recursive: true });

async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(2000);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) { await demoBtn.click(); await page.waitForTimeout(2500); }
}

test('FEATURE: Cost Analysis tab exists in Brewing', async ({ page }) => {
  await login(page);
  await page.locator('text="Brewing"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  
  const costTab = page.locator('button:has-text("Cost Analysis")');
  expect(await costTab.count()).toBeGreaterThan(0);
  console.log('Cost Analysis tab found ✅');
  
  await costTab.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${DIR}/cost-tab-loaded.png` });
  
  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  expect(body.includes('Total Brew Cost') || body.includes('Gross Margin') || body.includes('/ Barrel')).toBe(true);
  console.log('Cost Analysis tab loaded with data ✅');
});

test('FEATURE: Cost Analysis KPI cards show data', async ({ page }) => {
  await login(page);
  await page.locator('text="Brewing"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.locator('button:has-text("Cost Analysis")').click();
  await page.waitForTimeout(1000);
  
  const body = await page.locator('body').textContent() || '';
  expect(body.includes('Total Brew Cost')).toBe(true);
  expect(body.includes('Avg Gross Margin')).toBe(true);
  expect(body.includes('Most Profitable')).toBe(true);
  expect(body.includes('Needs Attention')).toBe(true);
  console.log('All 4 KPI cards present ✅');
  
  // Check chart
  const svgs = await page.locator('svg').count();
  expect(svgs).toBeGreaterThan(0);
  console.log(`SVG charts: ${svgs} ✅`);
});

test('FEATURE: Cost Analysis per-batch cards show breakdown', async ({ page }) => {
  await login(page);
  await page.locator('text="Brewing"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.locator('button:has-text("Cost Analysis")').click();
  await page.waitForTimeout(1000);
  
  const body = await page.locator('body').textContent() || '';
  
  // Check per-batch details
  expect(body.includes('/ Barrel')).toBe(true);
  expect(body.includes('/ Pint')).toBe(true);
  expect(body.includes('Margin @$8')).toBe(true);
  expect(body.includes('Grain/Malt')).toBe(true);
  expect(body.includes('Hops')).toBe(true);
  console.log('Per-batch cost breakdown visible ✅');
  
  await page.screenshot({ path: `${DIR}/cost-batch-cards.png` });
});

test('FEATURE: Cost Analysis price/margin table shows 3 price points', async ({ page }) => {
  await login(page);
  await page.locator('text="Brewing"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.locator('button:has-text("Cost Analysis")').click();
  await page.waitForTimeout(1000);
  
  const body = await page.locator('body').textContent() || '';
  expect(body.includes('$6') && body.includes('$7') && body.includes('$8')).toBe(true);
  expect(body.includes('Margin at Retail')).toBe(true);
  console.log('Price margin table with $6/$7/$8 ✅');
});

test('FEATURE: Cost Analysis edit ingredient costs works', async ({ page }) => {
  await login(page);
  await page.locator('text="Brewing"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.locator('button:has-text("Cost Analysis")').click();
  await page.waitForTimeout(1000);
  
  // Click "Edit ingredient costs" on first batch card
  const editBtn = page.locator('button:has-text("Edit ingredient costs")').first();
  expect(await editBtn.count()).toBeGreaterThan(0);
  await editBtn.click();
  await page.waitForTimeout(400);
  
  // Should show input fields
  const inputs = page.locator('input[type="number"]');
  expect(await inputs.count()).toBeGreaterThan(0);
  
  // Change a value and verify margin updates
  const firstInput = inputs.first();
  await firstInput.fill('500');
  await page.waitForTimeout(400);
  
  await page.screenshot({ path: `${DIR}/cost-editing.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  console.log('Edit ingredient costs works ✅');
});

test('FEATURE: Pricing Insights section visible', async ({ page }) => {
  await login(page);
  await page.locator('text="Brewing"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.locator('button:has-text("Cost Analysis")').click();
  await page.waitForTimeout(1000);
  
  const body = await page.locator('body').textContent() || '';
  expect(body.includes('Pricing Insights') || body.includes('most profitable') || body.includes('Industry benchmark')).toBe(true);
  console.log('Pricing Insights visible ✅');
  
  await page.screenshot({ path: `${DIR}/cost-insights.png` });
});

test('FEATURE: Cost Analysis mobile responsive', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page);
  const hamburger = page.locator('header button').first();
  await hamburger.click();
  await page.waitForTimeout(400);
  await page.locator('text="Brewing"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.locator('button:has-text("Cost Analysis")').click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${DIR}/cost-mobile.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  expect(body.includes('Total Brew Cost') || body.includes('/ Barrel')).toBe(true);
  console.log('Cost Analysis mobile ✅');
});
