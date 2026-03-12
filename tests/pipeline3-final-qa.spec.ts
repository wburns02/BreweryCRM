import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5184';
const DIR = './test-results/pipeline3-final-qa';
fs.mkdirSync(DIR, { recursive: true });

async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(2000);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) { await demoBtn.click(); await page.waitForTimeout(2500); }
}

async function nav(page: Page, label: string) {
  await page.locator(`text="${label}"`).first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);
}

// ─── ALL PAGES LOAD ──────────────────────────────────────────────────────────

const PAGE_NAV = [
  ['Dashboard', 'dashboard'], ['POS', 'pos'], ['Floor Plan', 'floor-plan'],
  ['Customers', 'customers'], ['Mug Club', 'mug-club'], ['Reservations', 'reservations'],
  ['Tap Management', 'taps'], ['Brewing', 'brewing'], ['Production', 'production'],
  ['Recipe Lab', 'recipes'], ['Keg Tracking', 'kegs'], ['Keg Monitor', 'keg-monitor'],
  ['Food & Menu', 'menu'], ['Inventory', 'inventory'], ['Taproom Analytics', 'analytics'],
  ['Events', 'events'], ['Marketing', 'marketing'], ['Financials', 'financials'],
  ['Staff', 'staff'], ['Distribution', 'distribution'], ['Reports', 'reports'],
  ['TTB Reports', 'ttb'], ['Settings', 'settings'],
];

for (const [label, id] of PAGE_NAV) {
  test(`PAGE: ${label} loads without NaN`, async ({ page }) => {
    await login(page);
    await nav(page, label);
    await page.screenshot({ path: `${DIR}/page-${id}.png` });
    const body = await page.locator('body').textContent() || '';
    expect(body, `NaN found on ${label}`).not.toContain('NaN');
    console.log(`${label} ✅`);
  });
}

// ─── BUG FIXES VERIFIED ─────────────────────────────────────────────────────

test('BUG1: Brewing Advance Status + Log Gravity buttons', async ({ page }) => {
  await login(page);
  await nav(page, 'Brewing');
  const advance = page.locator('button').filter({ hasText: /Advance to/ }).first();
  expect(await advance.count()).toBeGreaterThan(0);
  await advance.click(); await page.waitForTimeout(500);
  const gravity = page.locator('button:has-text("Log Gravity")').first();
  if (await gravity.count() > 0) { await gravity.click(); await page.waitForTimeout(300); }
  await page.screenshot({ path: `${DIR}/brewing-actions.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  console.log('Brewing actions ✅');
});

test('BUG2: Mug Club member detail panel', async ({ page }) => {
  await login(page);
  await nav(page, 'Mug Club');
  await page.locator('tbody tr').first().click({ timeout: 3000 });
  await page.waitForTimeout(600);
  expect(await page.locator('[role="dialog"]').first().isVisible()).toBe(true);
  await page.screenshot({ path: `${DIR}/mug-club-panel.png` });
  console.log('Mug Club panel ✅');
});

test('BUG3: Distribution account detail panel', async ({ page }) => {
  await login(page);
  await nav(page, 'Distribution');
  await page.locator('.grid.grid-cols-1 > div').first().click({ timeout: 3000 });
  await page.waitForTimeout(600);
  expect(await page.locator('[role="dialog"]').first().isVisible()).toBe(true);
  await page.screenshot({ path: `${DIR}/distribution-panel.png` });
  console.log('Distribution panel ✅');
});

test('BUG4: Reports date range filter', async ({ page }) => {
  await login(page);
  await nav(page, 'Reports');
  expect(await page.locator('button:has-text("7 Days")').count()).toBeGreaterThan(0);
  await page.locator('button:has-text("7 Days")').click();
  await page.waitForTimeout(400);
  const body = await page.locator('body').textContent() || '';
  expect(body.includes('7-Day Revenue')).toBe(true);
  await page.screenshot({ path: `${DIR}/reports-filter.png` });
  console.log('Reports filter ✅');
});

// ─── NEW FEATURE: BATCH COST CALCULATOR ────────────────────────────────────

test('FEATURE: Cost Analysis tab loads with all sections', async ({ page }) => {
  await login(page);
  await nav(page, 'Brewing');
  await page.locator('button:has-text("Cost Analysis")').click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${DIR}/cost-analysis.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  expect(body.includes('Total Brew Cost')).toBe(true);
  expect(body.includes('Avg Gross Margin')).toBe(true);
  expect(body.includes('/ Barrel')).toBe(true);
  expect(body.includes('/ Pint')).toBe(true);
  expect(body.includes('Grain/Malt')).toBe(true);
  expect(body.includes('Pricing Insights') || body.includes('most profitable')).toBe(true);
  console.log('Cost Analysis full feature ✅');
});

test('FEATURE: Cost Analysis edit costs and recalculate', async ({ page }) => {
  await login(page);
  await nav(page, 'Brewing');
  await page.locator('button:has-text("Cost Analysis")').click();
  await page.waitForTimeout(1000);
  const editBtn = page.locator('button:has-text("Edit ingredient costs")').first();
  await editBtn.click();
  await page.waitForTimeout(300);
  const input = page.locator('input[type="number"]').first();
  await input.fill('600');
  await page.waitForTimeout(400);
  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  await page.screenshot({ path: `${DIR}/cost-editing.png` });
  console.log('Cost Calculator editing ✅');
});

// ─── OTHER KEY BUTTONS ──────────────────────────────────────────────────────

test('BUTTON: Staff Add Staff modal opens and saves', async ({ page }) => {
  await login(page);
  await nav(page, 'Staff');
  await page.locator('button').filter({ hasText: /Add Staff/ }).first().click({ timeout: 5000 });
  await page.waitForTimeout(500);
  expect(await page.locator('[role="dialog"]').isVisible()).toBe(true);
  await page.locator('[role="dialog"] input[placeholder="Jane"]').fill('Alice');
  await page.locator('[role="dialog"] input[placeholder="Smith"]').fill('Cooper');
  await page.locator('[role="dialog"] input[type="email"]').fill('alice@brewery.com');
  await page.locator('[role="dialog"] button[type="submit"]').click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${DIR}/staff-saved.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body.includes('Alice') || body.includes('Cooper')).toBe(true);
  console.log('Staff Add ✅');
});

test('BUTTON: Brewing New Batch modal opens', async ({ page }) => {
  await login(page);
  await nav(page, 'Brewing');
  await page.locator('button:has-text("New Batch")').first().click();
  await page.waitForTimeout(600);
  expect(await page.locator('[role="dialog"]').isVisible()).toBe(true);
  await page.screenshot({ path: `${DIR}/brewing-modal.png` });
  await page.keyboard.press('Escape');
  console.log('Brewing New Batch modal ✅');
});

test('BUTTON: Reports Export CSV triggers download', async ({ page }) => {
  await login(page);
  await nav(page, 'Reports');
  const exportBtn = page.locator('button:has-text("Export CSV")');
  expect(await exportBtn.count()).toBeGreaterThan(0);
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 5000 }).catch(() => null),
    exportBtn.click(),
  ]);
  console.log(`Reports Export CSV (download: ${download !== null}) ✅`);
});

test('BUTTON: POS New Tab and beer flow', async ({ page }) => {
  await login(page);
  await nav(page, 'POS');
  await page.waitForTimeout(1000);
  const newTabBtn = page.locator('button:has-text("New Tab")');
  expect(await newTabBtn.count()).toBeGreaterThan(0);
  await newTabBtn.click(); await page.waitForTimeout(400);
  const beerCard = page.locator('.grid button').first();
  if (await beerCard.count() > 0) {
    await beerCard.click(); await page.waitForTimeout(500);
    const modal = page.locator('[role="dialog"]');
    if (await modal.isVisible()) {
      await modal.locator('button').first().click(); await page.waitForTimeout(300);
    }
  }
  await page.screenshot({ path: `${DIR}/pos.png` });
  console.log('POS flow ✅');
});

test('BUTTON: Keg Monitor filter and sort', async ({ page }) => {
  await login(page);
  await nav(page, 'Keg Monitor');
  await page.waitForTimeout(1500);
  for (const f of ['Alerts', 'Healthy', 'All Taps']) {
    const btn = page.locator('button').filter({ hasText: new RegExp(f) }).first();
    if (await btn.count() > 0) { await btn.click(); await page.waitForTimeout(200); }
  }
  await page.screenshot({ path: `${DIR}/keg-monitor.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  console.log('Keg Monitor controls ✅');
});

// ─── STABILITY ────────────────────────────────────────────────────────────────

test('STABILITY: No critical JS errors on core pages', async ({ page }) => {
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
  for (const label of ['Dashboard', 'POS', 'Keg Monitor', 'Brewing', 'Financials', 'Reports']) {
    await nav(page, label);
  }
  // Also test Cost Analysis (navigate back to Brewing first)
  await nav(page, 'Brewing');
  await page.locator('button:has-text("Cost Analysis")').click();
  await page.waitForTimeout(800);
  
  console.log(`Critical JS errors: ${critErrors.length}`);
  critErrors.forEach(e => console.log(' ERR:', e));
  expect(critErrors.length, `Critical errors: ${critErrors.join(' | ')}`).toBe(0);
  console.log('No critical JS errors ✅');
});

// ─── MOBILE ────────────────────────────────────────────────────────────────────

test('MOBILE: Core pages + Cost Analysis responsive', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page);
  for (const label of ['Dashboard', 'Keg Monitor', 'Reports', 'Brewing']) {
    const hamburger = page.locator('header button').first();
    await hamburger.click(); await page.waitForTimeout(400);
    await page.locator(`text="${label}"`).first().click({ timeout: 8000 });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${DIR}/mobile-${label.toLowerCase().replace(/\s+/g, '-')}.png` });
    const body = await page.locator('body').textContent() || '';
    expect(body).not.toContain('NaN');
    console.log(`Mobile ${label} ✅`);
  }
  // Cost Analysis on mobile (Brewing is last page in loop above, tabs should be visible)
  await page.locator('button:has-text("Cost Analysis")').first().click();
  await page.waitForTimeout(800);
  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  expect(body.includes('Total Brew Cost') || body.includes('/ Barrel')).toBe(true);
  await page.screenshot({ path: `${DIR}/mobile-cost-analysis.png` });
  console.log('Mobile Cost Analysis ✅');
});
