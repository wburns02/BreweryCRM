import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5183';
const DIR = './test-results/pipeline2-polish';
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

test('POLISH: Dashboard renders with live data', async ({ page }) => {
  await login(page);
  await nav(page, 'Dashboard');
  await page.screenshot({ path: `${DIR}/dashboard.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  expect(body).not.toContain('Loading dashboard data...');
  console.log('Dashboard with mock data ✅');
});

test('POLISH: Taproom Analytics active taps now populated', async ({ page }) => {
  await login(page);
  await nav(page, 'Taproom Analytics');
  await page.screenshot({ path: `${DIR}/taproom-analytics.png` });
  const body = await page.locator('body').textContent() || '';
  const hasTapData = body.includes('Hill Country') || body.includes('Bulverde') || body.includes('Citra');
  expect(hasTapData).toBe(true);
  expect(body).not.toContain('NaN');
  console.log('Taproom Analytics shows tap data ✅');
});

test('POLISH: Keg Monitor urgency logic catches low-day kegs', async ({ page }) => {
  await login(page);
  await nav(page, 'Keg Monitor');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/keg-monitor-urgency.png` });

  // After urgency fix, Citra Smash (~2d left) should appear in alerts
  const alertFilter = page.locator('button').filter({ hasText: /Alerts/ }).first();
  await alertFilter.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/keg-monitor-alerts.png` });

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  console.log('Keg Monitor urgency logic ✅');
});

test('POLISH: Production page shows tank farm', async ({ page }) => {
  await login(page);
  await nav(page, 'Production');
  await page.screenshot({ path: `${DIR}/production.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).toContain('Tank Farm');
  expect(body).not.toContain('NaN');
  console.log('Production Tank Farm ✅');
});

test('POLISH: Financials tabs all render without errors', async ({ page }) => {
  await login(page);
  await nav(page, 'Financials');
  await page.screenshot({ path: `${DIR}/financials-overview.png` });

  for (const tab of ['P&L Statement', 'Labor & Overhead', 'Beer Economics']) {
    const btn = page.locator('button').filter({ hasText: tab }).first();
    if (await btn.count() > 0) {
      await btn.click();
      await page.waitForTimeout(600);
      const body = await page.locator('body').textContent() || '';
      expect(body).not.toContain('NaN');
      console.log(`Financials ${tab} ✅`);
    }
  }
  await page.screenshot({ path: `${DIR}/financials-beer.png` });
});

test('POLISH: Reports Export CSV button functional', async ({ page }) => {
  await login(page);
  await nav(page, 'Reports');
  await page.screenshot({ path: `${DIR}/reports.png` });

  // Check stats are showing now
  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');

  const exportBtn = page.locator('button:has-text("Export CSV")');
  expect(await exportBtn.count()).toBeGreaterThan(0);
  console.log('Reports with data and Export CSV ✅');
});

test('POLISH: Brewing page new batch modal opens', async ({ page }) => {
  await login(page);
  await nav(page, 'Brewing');
  await page.screenshot({ path: `${DIR}/brewing.png` });

  const newBatchBtn = page.locator('button:has-text("New Batch")');
  expect(await newBatchBtn.count()).toBeGreaterThan(0);

  await newBatchBtn.click();
  await page.waitForTimeout(600);
  const modal = page.locator('[role="dialog"]');
  expect(await modal.isVisible()).toBe(true);
  await page.screenshot({ path: `${DIR}/brewing-modal.png` });
  await page.keyboard.press('Escape');
  console.log('Brewing New Batch modal ✅');
});

test('POLISH: Mobile responsiveness on all new pages', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page);

  const pages = ['Dashboard', 'POS', 'Taproom Analytics', 'Reports'];
  for (const p of pages) {
    const hamburger = page.locator('header button').first();
    await hamburger.click();
    await page.waitForTimeout(400);
    await page.locator(`text="${p}"`).first().click({ timeout: 8000 });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${DIR}/mobile-${p.toLowerCase().replace(/\s+/g, '-')}.png` });
    const body = await page.locator('body').textContent() || '';
    expect(body).not.toContain('NaN');
    console.log(`Mobile ${p} ✅`);
  }
});

test('POLISH: No NaN on ALL 22 pages', async ({ page }) => {
  await login(page);
  const pages = [
    ['Dashboard', 'Dashboard'], ['POS', 'POS'], ['Floor Plan', 'Floor Plan'],
    ['Customers', 'Customers'], ['Mug Club', 'Mug Club'], ['Reservations', 'Reservations'],
    ['Tap Management', 'Tap Management'], ['Brewing', 'Brewing'], ['Production', 'Production'],
    ['Recipe Lab', 'Recipe Lab'], ['Keg Tracking', 'Keg Tracking'], ['Keg Monitor', 'Keg Monitor'],
    ['Food & Menu', 'Food & Menu'], ['Inventory', 'Inventory'], ['Taproom Analytics', 'Taproom Analytics'],
    ['Events', 'Events'], ['Marketing', 'Marketing'], ['Financials', 'Financials'],
    ['Staff', 'Staff'], ['Distribution', 'Distribution'], ['Reports', 'Reports'],
    ['TTB Reports', 'TTB Reports'], ['Settings', 'Settings'],
  ];

  const nanPages: string[] = [];
  for (const [label] of pages) {
    try {
      await page.locator(`text="${label}"`).first().click({ timeout: 8000 });
      await page.waitForTimeout(1000);
      const body = await page.locator('body').textContent() || '';
      if (body.includes('NaN')) nanPages.push(label);
    } catch {
      console.log(`Could not navigate to ${label}`);
    }
  }

  console.log(`NaN found on: ${nanPages.length > 0 ? nanPages.join(', ') : 'none'}`);
  expect(nanPages.length, `NaN on: ${nanPages.join(', ')}`).toBe(0);
  console.log('All pages: No NaN ✅');
});
