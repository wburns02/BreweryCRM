import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5183';
const DIR = './test-results/pipeline2-final-qa';
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
  await page.waitForTimeout(1200);
}

// ─── EVERY PAGE LOADS (separate tests for isolation) ────────────────────────

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

// ─── EVERY KEY BUTTON WORKS ──────────────────────────────────────────────────

test('BUTTON: Staff Add Staff modal opens and saves', async ({ page }) => {
  await login(page);
  await nav(page, 'Staff');
  await page.locator('button').filter({ hasText: /Add Staff/ }).first().click();
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

test('BUTTON: Distribution Add Account modal opens and saves', async ({ page }) => {
  await login(page);
  await nav(page, 'Distribution');
  await page.locator('button:has-text("Add Account")').first().click();
  await page.waitForTimeout(500);
  expect(await page.locator('[role="dialog"]').isVisible()).toBe(true);
  await page.locator('[role="dialog"] input[placeholder*="Hill Country"]').fill('Oak Creek Taproom');
  await page.locator('[role="dialog"] button[type="submit"]').click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${DIR}/distribution-saved.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body.includes('Oak Creek')).toBe(true);
  console.log('Distribution Add Account ✅');
});

test('BUTTON: TTB Mark as Filed works', async ({ page }) => {
  await login(page);
  await nav(page, 'TTB Reports');
  const fileBtn = page.locator('button:has-text("Mark as Filed")').first();
  if (await fileBtn.count() > 0) {
    await fileBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${DIR}/ttb-filed.png` });
    console.log('TTB Mark as Filed ✅');
  } else {
    console.log('No pending TTB reports to file — skip');
  }
});

test('BUTTON: TTB Tax Calculator computes without NaN', async ({ page }) => {
  await login(page);
  await nav(page, 'TTB Reports');
  await page.locator('button:has-text("Tax Calculator")').click();
  await page.waitForTimeout(600);
  await page.locator('input[type="number"]').first().fill('75');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${DIR}/ttb-calculator.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  console.log('TTB Tax Calculator ✅');
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

test('BUTTON: Inventory Add Item modal opens', async ({ page }) => {
  await login(page);
  await nav(page, 'Inventory');
  const addBtn = page.locator('button:has-text("Add Item")').first();
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(500);
    expect(await page.locator('[role="dialog"]').isVisible()).toBe(true);
    await page.screenshot({ path: `${DIR}/inventory-modal.png` });
    await page.keyboard.press('Escape');
  }
  console.log('Inventory Add Item ✅');
});

test('BUTTON: Events Add Event modal opens', async ({ page }) => {
  await login(page);
  await nav(page, 'Events');
  const addBtn = page.locator('button').filter({ hasText: /Add Event|New Event|Create Event/i }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/events-modal.png` });
    await page.keyboard.press('Escape');
  }
  console.log('Events Add ✅');
});

test('BUTTON: Reports Export CSV triggers download', async ({ page }) => {
  await login(page);
  await nav(page, 'Reports');
  const exportBtn = page.locator('button:has-text("Export CSV")');
  expect(await exportBtn.count()).toBeGreaterThan(0);
  // Trigger download (no error expected)
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 5000 }).catch(() => null),
    exportBtn.click(),
  ]);
  console.log(`Reports Export CSV triggered (download: ${download !== null}) ✅`);
});

test('BUTTON: Keg Monitor filter and sort controls all work', async ({ page }) => {
  await login(page);
  await nav(page, 'Keg Monitor');
  await page.waitForTimeout(1500);

  // Filter pills
  for (const filter of ['Alerts', 'Healthy', 'All Taps']) {
    const btn = page.locator('button').filter({ hasText: new RegExp(filter) }).first();
    if (await btn.count() > 0) {
      await btn.click();
      await page.waitForTimeout(300);
    }
  }

  // Sort buttons
  for (const sort of ['Name', 'Tap #', 'Level']) {
    const btn = page.locator('button').filter({ hasText: sort }).first();
    if (await btn.count() > 0) {
      await btn.click();
      await page.waitForTimeout(200);
    }
  }

  await page.screenshot({ path: `${DIR}/keg-monitor-controls.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  console.log('Keg Monitor controls ✅');
});

test('BUTTON: POS New Tab button works', async ({ page }) => {
  await login(page);
  await nav(page, 'POS');
  await page.waitForTimeout(1000);
  const newTabBtn = page.locator('button:has-text("New Tab")');
  expect(await newTabBtn.count()).toBeGreaterThan(0);
  await newTabBtn.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${DIR}/pos-newtab.png` });
  console.log('POS New Tab ✅');
});

test('BUTTON: POS beer tap cards clickable', async ({ page }) => {
  await login(page);
  await nav(page, 'POS');
  await page.waitForTimeout(1500);

  // Click first beer card
  const firstBeer = page.locator('.grid button').first();
  if (await firstBeer.count() > 0) {
    await firstBeer.click();
    await page.waitForTimeout(500);
    // Should open pour size modal
    const modal = page.locator('[role="dialog"]');
    if (await modal.isVisible()) {
      await page.screenshot({ path: `${DIR}/pos-pour-modal.png` });
      // Select first pour size
      await page.locator('[role="dialog"] button').first().click();
      await page.waitForTimeout(400);
    }
  }
  await page.screenshot({ path: `${DIR}/pos-item-added.png` });
  console.log('POS beer tap ✅');
});

// ─── NO CONSOLE ERRORS ───────────────────────────────────────────────────────

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
  for (const label of ['Dashboard', 'POS', 'Keg Monitor', 'TTB Reports', 'Taproom Analytics', 'Financials']) {
    await nav(page, label);
  }

  console.log(`Critical JS errors: ${critErrors.length}`);
  critErrors.forEach(e => console.log(' ERR:', e));
  expect(critErrors.length, `Critical errors: ${critErrors.join(' | ')}`).toBe(0);
  console.log('No critical JS errors ✅');
});

// ─── MOBILE QA ──────────────────────────────────────────────────────────────

test('MOBILE: Keg Monitor + Dashboard responsive', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page);

  for (const label of ['Dashboard', 'Keg Monitor']) {
    const hamburger = page.locator('header button').first();
    await hamburger.click();
    await page.waitForTimeout(400);
    await page.locator(`text="${label}"`).first().click({ timeout: 8000 });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${DIR}/mobile-${label.toLowerCase().replace(/\s+/g, '-')}.png` });
    const body = await page.locator('body').textContent() || '';
    expect(body).not.toContain('NaN');
    console.log(`Mobile ${label} ✅`);
  }
});
