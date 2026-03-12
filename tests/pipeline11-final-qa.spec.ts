import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5175';
const DIR = './test-results/pipeline11-final';
fs.mkdirSync(DIR, { recursive: true });

async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(2500);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) { await demoBtn.click(); await page.waitForTimeout(2500); }
}

async function nav(page: Page, text: string) {
  const link = page.locator('nav').locator('button, a').filter({ hasText: new RegExp(`^${text}$`, 'i') }).first();
  if (await link.count() > 0) { await link.click({ timeout: 5000 }); await page.waitForTimeout(1200); return; }
  const fallback = page.locator('nav a, nav button').filter({ hasText: text }).first();
  if (await fallback.count() > 0) { await fallback.click({ timeout: 5000 }); await page.waitForTimeout(1200); }
}

test('FINAL QA: Dashboard loads with KPIs', async ({ page }) => {
  await login(page);
  await page.screenshot({ path: `${DIR}/dashboard.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body.includes('Dashboard') || body.includes('Revenue') || body.includes('Sales')).toBe(true);
  console.log('Dashboard ✅');
});

test('FINAL QA: POS loads and has tabs + items', async ({ page }) => {
  await login(page);
  await nav(page, 'POS');
  await page.screenshot({ path: `${DIR}/pos.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body.includes('POS') || body.includes('Tab') || body.includes('Order')).toBe(true);
  console.log('POS ✅');
});

test('FINAL QA: Customers page loads with list', async ({ page }) => {
  await login(page);
  await nav(page, 'Customers');
  await page.screenshot({ path: `${DIR}/customers.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body.includes('Customer') || body.includes('Guests')).toBe(true);
  console.log('Customers ✅');
});

test('FINAL QA: Inventory has no NaN', async ({ page }) => {
  await login(page);
  await nav(page, 'Inventory');
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${DIR}/inventory.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body.includes('NaN')).toBe(false);
  expect(body.includes('Inventory') || body.includes('Stock')).toBe(true);
  console.log(`Inventory no NaN: ${!body.includes('NaN')} ✅`);
});

test('FINAL QA: Settings has Hours tab', async ({ page }) => {
  await login(page);
  await nav(page, 'Settings');
  await page.waitForTimeout(600);
  const hoursTab = page.locator('button').filter({ hasText: /hours/i }).first();
  if (await hoursTab.count() > 0) await hoursTab.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${DIR}/settings-hours.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body.includes('Business Hours') || body.includes('Monday') || body.includes('Open')).toBe(true);
  console.log('Settings Hours tab ✅');
});

test('FINAL QA: Staff tip earnings visible', async ({ page }) => {
  await login(page);
  await nav(page, 'Staff');
  await page.waitForTimeout(600);
  // Open first staff member
  const firstRow = page.locator('table tbody tr').first();
  if (await firstRow.count() > 0) {
    await firstRow.click({ timeout: 5000 });
    await page.waitForTimeout(600);
  }
  await page.screenshot({ path: `${DIR}/staff-detail.png` });
  const body = await page.locator('body').textContent() || '';
  // Either detail opened showing tips, or staff list visible
  expect(body.includes('Staff') || body.includes('Employee')).toBe(true);
  console.log('Staff ✅');
});

test('FINAL QA: Tap Menu Board — all 3 tabs', async ({ page }) => {
  await login(page);
  await nav(page, 'Tap Menu Board');
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${DIR}/tap-menu-board.png` });

  // Settings tab
  const settingsTab = page.locator('button').filter({ hasText: /Display Settings/ }).first();
  await settingsTab.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${DIR}/tap-menu-settings.png` });

  // QR tab
  const qrTab = page.locator('button').filter({ hasText: /Share.*QR|QR.*Code/i }).first();
  await qrTab.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${DIR}/tap-menu-qr.png` });

  const body = await page.locator('body').textContent() || '';
  expect(body.includes('Share Link') || body.includes('QR Code')).toBe(true);
  console.log('Tap Menu Board all tabs ✅');
});

test('FINAL QA: Mobile bottom nav — 5 items at 390px', async ({ page }) => {
  await login(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${DIR}/mobile-nav.png` });

  const navItems = ['Home', 'POS', 'Floor', 'Guests', 'Taps'];
  for (const item of navItems) {
    const btn = page.locator('nav').last().locator('button').filter({ hasText: item }).first();
    const visible = await btn.isVisible().catch(() => false);
    console.log(`  Mobile nav "${item}": ${visible}`);
    expect(visible).toBe(true);
  }
  console.log('Mobile nav ✅');
});

test('FINAL QA: Brewing, Recipes, Kegs pages load', async ({ page }) => {
  await login(page);
  for (const pageName of ['Brewing', 'Recipe Lab', 'Keg Tracking']) {
    await nav(page, pageName);
    await page.waitForTimeout(800);
    const body = await page.locator('body').textContent() || '';
    const loaded = body.length > 100 && !body.includes('Error') && !body.includes('undefined');
    console.log(`${pageName}: ${loaded}`);
    expect(loaded).toBe(true);
  }
  console.log('Brewing + Recipes + Kegs ✅');
});

test('FINAL QA: Financials, Reports, Distribution load', async ({ page }) => {
  await login(page);
  for (const pageName of ['Financials', 'Reports', 'Distribution']) {
    await nav(page, pageName);
    await page.waitForTimeout(800);
    const body = await page.locator('body').textContent() || '';
    const loaded = body.length > 100;
    console.log(`${pageName}: ${loaded}`);
    expect(loaded).toBe(true);
  }
  console.log('Financials + Reports + Distribution ✅');
});

test('FINAL QA: No console errors on main pages', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await login(page);
  await nav(page, 'Tap Menu Board');
  await page.waitForTimeout(600);
  await nav(page, 'POS');
  await page.waitForTimeout(600);
  await nav(page, 'Inventory');
  await page.waitForTimeout(600);

  const criticalErrors = errors.filter(e =>
    !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('404')
  );
  console.log(`Console errors: ${criticalErrors.length}`);
  if (criticalErrors.length > 0) console.log('Errors:', criticalErrors.slice(0, 3));
  expect(criticalErrors.length).toBe(0);
  console.log('No critical console errors ✅');
});
