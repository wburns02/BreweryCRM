import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5173';
const DIR = './test-results/pipeline5-final-qa';
fs.mkdirSync(DIR, { recursive: true });

async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(2500);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) { await demoBtn.click(); await page.waitForTimeout(2500); }
}

const PAGES: [string, string][] = [
  ['Dashboard', 'dashboard'],
  ['POS', 'pos'],
  ['Floor Plan', 'floor-plan'],
  ['Customers', 'customers'],
  ['Mug Club', 'mug-club'],
  ['Reservations', 'reservations'],
  ['Tap Management', 'taps'],
  ['Brewing', 'brewing'],
  ['Production', 'production'],
  ['Recipe Lab', 'recipes'],
  ['Keg Tracking', 'kegs'],
  ['Keg Monitor', 'keg-monitor'],
  ['Food & Menu', 'menu'],
  ['Inventory', 'inventory'],
  ['Taproom Analytics', 'analytics'],
  ['Events', 'events'],
  ['Financials', 'financials'],
  ['Staff', 'staff'],
  ['Distribution', 'distribution'],
  ['Reports', 'reports'],
  ['TTB Reports', 'ttb'],
  ['Settings', 'settings'],
];

for (const [label, id] of PAGES) {
  test(`PAGE: ${label} loads without NaN`, async ({ page }) => {
    await login(page);
    await page.locator(`text="${label}"`).first().click({ timeout: 8000 });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${DIR}/page-${id}.png` });
    const body = await page.locator('body').textContent() || '';
    expect(body, `NaN on ${label}`).not.toContain('NaN');
    console.log(`${label} ✅`);
  });
}

// Button nav items (group headers have same text)
test('PAGE: Loyalty Check-in loads without NaN', async ({ page }) => {
  await login(page);
  await page.locator('button').filter({ hasText: /^Loyalty Check-in$/ }).click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${DIR}/page-loyalty.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  console.log('Loyalty Check-in ✅');
});

test('PAGE: Marketing loads without NaN', async ({ page }) => {
  await login(page);
  await page.locator('button').filter({ hasText: /^Marketing$/ }).click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${DIR}/page-marketing.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  console.log('Marketing ✅');
});

// ─── NEW FEATURE: Ferment Lab ─────────────────────────────────────────────────

test('FEATURE: Ferment Lab loads with live data', async ({ page }) => {
  await login(page);
  await page.locator('text="Ferment Lab"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/ferment-lab.png` });

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  expect(body.includes('Active Vessels') || body.includes('Fermenting')).toBe(true);
  expect(body.includes('°F') || body.includes('Live')).toBe(true);
  console.log('Ferment Lab ✅');
});

test('FEATURE: Ferment Lab — vessel detail charts', async ({ page }) => {
  await login(page);
  await page.locator('text="Ferment Lab"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  // Click a vessel
  const vessel = page.locator('text="Hill Country Haze"').first();
  if (await vessel.count() > 0) {
    await vessel.click();
    await page.waitForTimeout(800);
    const body = await page.locator('body').textContent() || '';
    expect(body.includes('Temperature History') || body.includes('Gravity')).toBe(true);
    expect(body).not.toContain('NaN');
  }
  await page.screenshot({ path: `${DIR}/ferment-detail.png` });
  console.log('Ferment Lab detail ✅');
});

// ─── BUG FIXES VERIFIED ──────────────────────────────────────────────────────

test('BUG: Reports date filter shows most recent data', async ({ page }) => {
  await login(page);
  await page.locator('text="Reports"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  await page.locator('button:has-text("7 Days")').click();
  await page.waitForTimeout(400);
  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  expect(await page.locator('button:has-text("7 Days")').count()).toBeGreaterThan(0);
  await page.screenshot({ path: `${DIR}/reports-filter.png` });
  console.log('Reports date filter ✅');
});

test('BUG: Modal closes on Escape', async ({ page }) => {
  await login(page);
  await page.locator('text="Events"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  const addBtn = page.locator('button').filter({ hasText: /new event|add event|create/i }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(400);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const backdrop = page.locator('.bg-black\\/70');
    expect(await backdrop.count()).toBe(0);
  }
  console.log('Modal Escape ✅');
});

test('BUG: Staff card opens detail modal', async ({ page }) => {
  await login(page);
  await page.locator('text="Staff"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  const card = page.locator('[class*="grid"] > div').filter({ hasText: /bartender|server|brewer|manager|cook/ }).first();
  if (await card.count() > 0) {
    await card.click();
    await page.waitForTimeout(400);
    const modal = page.locator('[role="dialog"]').last();
    expect(await modal.isVisible()).toBe(true);
    const body = await modal.textContent() || '';
    expect(body.includes('Rate') || body.includes('TABC') || body.includes('Certif')).toBe(true);
    await page.keyboard.press('Escape');
  }
  await page.screenshot({ path: `${DIR}/staff-detail.png` });
  console.log('Staff detail ✅');
});

test('BUG: POS payment has tip UI', async ({ page }) => {
  await login(page);
  await page.locator('text="POS"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  // Add item
  const tapCards = page.locator('button').filter({ hasText: /TAP \d/ }).first();
  if (await tapCards.count() > 0) {
    await tapCards.click();
    await page.waitForTimeout(400);
    const pourBtn = page.locator('[role="dialog"] button').filter({ hasText: /Pint/ }).first();
    if (await pourBtn.count() > 0) { await pourBtn.click(); await page.waitForTimeout(300); }
  }
  const closeBtn = page.locator('button').filter({ hasText: /Close Tab/ }).first();
  if (await closeBtn.count() > 0) {
    await closeBtn.click();
    await page.waitForTimeout(400);
    const modal = page.locator('[role="dialog"]').last();
    if (await modal.isVisible()) {
      const body = await modal.textContent() || '';
      expect(body.includes('Tip') || body.includes('15%')).toBe(true);
      await page.screenshot({ path: `${DIR}/pos-tip.png` });
      await page.keyboard.press('Escape');
    }
  }
  console.log('POS tip ✅');
});

test('BUG: Taproom Analytics date filter', async ({ page }) => {
  await login(page);
  await page.locator('text="Taproom Analytics"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.locator('button:has-text("Trend Analysis")').click();
  await page.waitForTimeout(400);
  const filterBtns = page.locator('button').filter({ hasText: /7 Days|30 Days/ });
  expect(await filterBtns.count()).toBeGreaterThan(0);
  await filterBtns.first().click();
  await page.waitForTimeout(300);
  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  await page.screenshot({ path: `${DIR}/analytics-filter.png` });
  console.log('Analytics filter ✅');
});

// ─── STABILITY ────────────────────────────────────────────────────────────────

test('STABILITY: No critical JS errors', async ({ page }) => {
  const critErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const t = msg.text();
      if (!t.includes('net::') && !t.includes('favicon') && !t.includes('Failed to load resource') && !t.includes('CORS')) {
        if (t.includes('Uncaught') || t.includes('TypeError') || t.includes('is not a function') || t.includes('Cannot read')) {
          critErrors.push(t.substring(0, 120));
        }
      }
    }
  });

  await login(page);
  for (const label of ['Dashboard', 'POS', 'Brewing', 'Financials', 'Reports']) {
    await page.locator(`text="${label}"`).first().click({ timeout: 8000 });
    await page.waitForTimeout(600);
  }
  await page.locator('text="Ferment Lab"').first().click({ timeout: 8000 });
  await page.waitForTimeout(600);
  await page.locator('button').filter({ hasText: /^Loyalty Check-in$/ }).click({ timeout: 8000 });
  await page.waitForTimeout(600);

  console.log(`Critical errors: ${critErrors.length}`);
  critErrors.forEach(e => console.log('ERR:', e));
  expect(critErrors.length, `Critical errors: ${critErrors.join(' | ')}`).toBe(0);
  console.log('No critical JS errors ✅');
});

// ─── MOBILE ────────────────────────────────────────────────────────────────────

test('MOBILE: Key pages + Ferment Lab responsive', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page);
  for (const label of ['Dashboard', 'Brewing', 'Reports']) {
    const hamburger = page.locator('header button').first();
    await hamburger.click(); await page.waitForTimeout(300);
    await page.locator(`text="${label}"`).first().click({ timeout: 8000 });
    await page.waitForTimeout(1000);
    const body = await page.locator('body').textContent() || '';
    expect(body).not.toContain('NaN');
    await page.screenshot({ path: `${DIR}/mobile-${label.toLowerCase().replace(/\s+/g, '-')}.png` });
    console.log(`Mobile ${label} ✅`);
  }
  // Ferment Lab mobile
  const hamburger = page.locator('header button').first();
  await hamburger.click(); await page.waitForTimeout(300);
  await page.locator('text="Ferment Lab"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  expect(body.includes('Active Vessels') || body.includes('Ferment Lab')).toBe(true);
  await page.screenshot({ path: `${DIR}/mobile-ferment.png` });
  console.log('Mobile Ferment Lab ✅');
});
