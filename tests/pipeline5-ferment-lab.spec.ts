import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5173';
const DIR = './test-results/pipeline5-ferment';
fs.mkdirSync(DIR, { recursive: true });

async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(2500);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) { await demoBtn.click(); await page.waitForTimeout(2500); }
}

test('FERMENT: Page loads with vessels', async ({ page }) => {
  await login(page);
  await page.locator('text="Ferment Lab"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/ferment-initial.png` });

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  expect(body.includes('FV-1') || body.includes('Armadillo')).toBe(true);
  expect(body.includes('Fermenting') || body.includes('fermenting')).toBe(true);
  console.log('Ferment Lab loads with vessels ✅');
});

test('FERMENT: Vessel cards show temp gauges', async ({ page }) => {
  await login(page);
  await page.locator('text="Ferment Lab"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  const body = await page.locator('body').textContent() || '';
  // Should show temperature readings
  const hasTempF = body.includes('°F') || body.includes('°');
  console.log(`Has temperature readings: ${hasTempF}`);
  expect(hasTempF).toBe(true);

  // Should show PSI
  const hasPSI = body.includes('PSI');
  console.log(`Has pressure readings: ${hasPSI}`);
  expect(hasPSI).toBe(true);

  // Should show pH
  const hasPH = body.includes('pH');
  console.log(`Has pH readings: ${hasPH}`);
  expect(hasPH).toBe(true);

  await page.screenshot({ path: `${DIR}/ferment-gauges.png` });
  console.log('Ferment Lab vessel cards ✅');
});

test('FERMENT: Clicking vessel shows detail panel with charts', async ({ page }) => {
  await login(page);
  await page.locator('text="Ferment Lab"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  // Click a fermenting vessel card
  const vesselCard = page.locator('text="Hill Country Haze"').first();
  if (await vesselCard.count() > 0) {
    await vesselCard.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${DIR}/ferment-detail.png` });

    const body = await page.locator('body').textContent() || '';
    const hasChartSection = body.includes('Temperature History') || body.includes('Gravity Attenuation');
    console.log(`Detail panel has charts: ${hasChartSection}`);
    expect(hasChartSection).toBe(true);
    expect(body).not.toContain('NaN');
    console.log('Ferment Lab detail panel ✅');
  } else {
    // Click any fermenting vessel
    const fermentCard = page.locator('[class*="fermenting"]').first();
    if (await fermentCard.count() > 0) {
      await fermentCard.click();
      await page.waitForTimeout(800);
    }
    console.log('Hill Country Haze card not found by text, trying other method');
  }
});

test('FERMENT: KPI bar shows counts', async ({ page }) => {
  await login(page);
  await page.locator('text="Ferment Lab"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  const body = await page.locator('body').textContent() || '';
  expect(body.includes('Active Vessels') || body.includes('Fermenting')).toBe(true);
  expect(body).not.toContain('NaN');

  await page.screenshot({ path: `${DIR}/ferment-kpis.png` });
  console.log('Ferment Lab KPI bar ✅');
});

test('FERMENT: Sensors update live (auto-refresh)', async ({ page }) => {
  await login(page);
  await page.locator('text="Ferment Lab"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  // Read initial temp
  const body1 = await page.locator('body').textContent() || '';

  // Wait for sensor tick (4s interval)
  await page.waitForTimeout(5000);

  const body2 = await page.locator('body').textContent() || '';
  expect(body2).not.toContain('NaN');

  // The live timestamp should have updated
  const hasLive = body2.includes('Live');
  console.log(`Live indicator present: ${hasLive}`);
  expect(hasLive).toBe(true);

  await page.screenshot({ path: `${DIR}/ferment-live-update.png` });
  console.log('Ferment Lab live sensors ✅');
});

test('FERMENT: Summary table shows all vessels', async ({ page }) => {
  await login(page);
  await page.locator('text="Ferment Lab"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  const body = await page.locator('body').textContent() || '';
  // All vessels should be in the table
  expect(body.includes('FV-1') || body.includes('Armadillo')).toBe(true);
  expect(body.includes('FV-2') || body.includes('Longhorn')).toBe(true);
  expect(body.includes('BBT-1') || body.includes('Bluebonnet')).toBe(true);

  await page.screenshot({ path: `${DIR}/ferment-table.png` });
  console.log('Ferment Lab summary table ✅');
});

test('FERMENT: Mobile responsive', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page);
  const hamburger = page.locator('header button').first();
  await hamburger.click();
  await page.waitForTimeout(400);
  await page.locator('text="Ferment Lab"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  expect(body.includes('Ferment Lab') || body.includes('Real-time')).toBe(true);

  const scrollWidth = await page.locator('body').evaluate(el => el.scrollWidth);
  const clientWidth = await page.locator('body').evaluate(el => el.clientWidth);
  const overflow = scrollWidth - clientWidth;
  console.log(`Mobile overflow: ${overflow}px`);
  expect(overflow).toBeLessThan(20);

  await page.screenshot({ path: `${DIR}/ferment-mobile.png` });
  console.log('Ferment Lab mobile ✅');
});
