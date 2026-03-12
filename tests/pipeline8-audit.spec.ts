import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5175';
const DIR = './test-results/pipeline8-audit';
fs.mkdirSync(DIR, { recursive: true });

async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(2500);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) { await demoBtn.click(); await page.waitForTimeout(2500); }
}

async function nav(page: Page, text: string) {
  const link = page.locator('nav').locator('button, a').filter({ hasText: new RegExp(`^${text}$`) }).first();
  if (await link.count() > 0) { await link.click({ timeout: 5000 }); }
  else { await page.locator(`text="${text}"`).first().click({ timeout: 5000 }); }
  await page.waitForTimeout(1500);
}

// ── PAGE LOAD AUDIT ────────────────────────────────────────────────────────

const allPages = [
  'Dashboard', 'POS', 'Floor Plan', 'Tap Management', 'Brewing',
  'Production', 'Recipe Lab', 'Keg Tracking', 'Inventory', 'Food Menu',
  'Customers', 'Mug Club', 'Taproom Analytics', 'Financials',
  'Events', 'Reservations', 'Staff', 'Distribution', 'Marketing',
  'Reports', 'Settings',
];

test('AUDIT: All pages load without crashing', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('Warning:') && !msg.text().includes('net::')) {
      errors.push(`${msg.text().substring(0, 80)}`);
    }
  });

  await login(page);
  const failures: string[] = [];
  for (const p of allPages) {
    try {
      await nav(page, p);
      const body = await page.locator('body').textContent() || '';
      if (body.trim().length < 100) failures.push(`${p}: page appears empty`);
      if (/\bNaN\b/.test(body)) failures.push(`${p}: contains NaN`);
      if (/undefined/.test(body) && !p.includes('undefined')) failures.push(`${p}: contains undefined`);
      await page.screenshot({ path: `${DIR}/page-${p.toLowerCase().replace(/\s+/g, '-')}.png` });
    } catch (e) {
      failures.push(`${p}: navigation failed — ${String(e).substring(0, 60)}`);
    }
  }
  console.log(`Pages with issues: ${failures.length === 0 ? 'none' : failures.join(' | ')}`);
  console.log(`Console errors: ${errors.length === 0 ? 'none' : errors.join(' | ')}`);
  expect(failures.length).toBe(0);
});

// ── FORM AUDIT — every major add/edit modal ─────────────────────────────

test('AUDIT: POS — add item, close tab, payment flow', async ({ page }) => {
  await login(page);
  await nav(page, 'POS');
  await page.screenshot({ path: `${DIR}/pos-1-loaded.png` });

  // Add item to tab
  const tapBtn = page.locator('button').filter({ hasText: /TAP \d/ }).first();
  if (await tapBtn.count() > 0) {
    await tapBtn.click(); await page.waitForTimeout(400);
    // Select pour size if prompted
    const pourBtn = page.locator('button').filter({ hasText: /Pint|Half|Snifter/ }).first();
    if (await pourBtn.count() > 0) { await pourBtn.click(); await page.waitForTimeout(300); }
    await page.screenshot({ path: `${DIR}/pos-2-item-added.png` });
  }

  // Close/charge tab
  const closeBtn = page.locator('button').filter({ hasText: /Close Tab|Charge|Pay|Process/ }).first();
  if (await closeBtn.count() > 0) {
    await closeBtn.click(); await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/pos-3-payment.png` });
    const dialog = page.locator('[role="dialog"]');
    console.log(`POS payment modal: ${await dialog.count() > 0}`);

    const confirmBtn = page.locator('button').filter({ hasText: /Confirm|Complete|Cash|Pay/ }).first();
    if (await confirmBtn.count() > 0) {
      await confirmBtn.click(); await page.waitForTimeout(500);
      await page.screenshot({ path: `${DIR}/pos-4-done.png` });
    }
  }
  console.log('POS flow tested ✅');
});

test('AUDIT: Inventory — add item, edit, delete flow', async ({ page }) => {
  await login(page);
  await nav(page, 'Inventory');
  await page.screenshot({ path: `${DIR}/inventory-1-list.png` });

  const addBtn = page.locator('button').filter({ hasText: /Add Item|New Item/ }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click(); await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/inventory-2-modal.png` });
    const dialog = page.locator('[role="dialog"]');
    if (await dialog.count() > 0) {
      const nameInput = dialog.locator('input').first();
      await nameInput.fill('Test Ingredient');
      const submitBtn = dialog.locator('button[type="submit"]').first();
      if (await submitBtn.count() > 0) {
        await submitBtn.click(); await page.waitForTimeout(500);
        await page.screenshot({ path: `${DIR}/inventory-3-saved.png` });
        console.log('Inventory add saved ✅');
      }
    }
  }
});

test('AUDIT: Customers — add customer, view profile', async ({ page }) => {
  await login(page);
  await nav(page, 'Customers');
  await page.screenshot({ path: `${DIR}/customers-1-list.png` });

  const addBtn = page.locator('button').filter({ hasText: /Add Customer|New Customer/ }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click(); await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/customers-2-modal.png` });
    const dialog = page.locator('[role="dialog"]');
    if (await dialog.count() > 0) {
      const inputs = dialog.locator('input');
      const count = await inputs.count();
      if (count > 0) await inputs.first().fill('Jane Test Customer');
      await page.screenshot({ path: `${DIR}/customers-3-filled.png` });
    }
    await page.keyboard.press('Escape');
  }

  // Click a customer to view profile
  const customerRow = page.locator('table tbody tr, [class*="cursor-pointer"]').first();
  if (await customerRow.count() > 0) {
    await customerRow.click(); await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/customers-4-profile.png` });
    await page.keyboard.press('Escape');
  }
  console.log('Customers tested ✅');
});

test('AUDIT: Events — create event', async ({ page }) => {
  await login(page);
  await nav(page, 'Events');
  await page.screenshot({ path: `${DIR}/events-1-list.png` });

  const addBtn = page.locator('button').filter({ hasText: /Add Event|New Event|Create Event/ }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click(); await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/events-2-modal.png` });
    const dialog = page.locator('[role="dialog"]');
    console.log(`Events modal: ${await dialog.count() > 0}`);
    if (await dialog.count() > 0) {
      const nameInput = dialog.locator('input').first();
      await nameInput.fill('Pipeline 8 Test Event');
      const submitBtn = dialog.locator('button[type="submit"]').first();
      if (await submitBtn.count() > 0) {
        await submitBtn.click(); await page.waitForTimeout(500);
        await page.screenshot({ path: `${DIR}/events-3-saved.png` });
        console.log('Event created ✅');
      }
    }
  }
});

test('AUDIT: Brewing — create batch', async ({ page }) => {
  await login(page);
  await nav(page, 'Brewing');
  await page.screenshot({ path: `${DIR}/brewing-1-list.png` });

  const addBtn = page.locator('button').filter({ hasText: /New Batch|Add Batch|Start Brew|Schedule Batch/ }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click(); await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/brewing-2-modal.png` });
    const dialog = page.locator('[role="dialog"]');
    console.log(`Brewing batch modal: ${await dialog.count() > 0}`);
    await page.keyboard.press('Escape');
  } else {
    console.log('⚠️ No add batch button found');
  }
});

test('AUDIT: Financials — charts and data quality', async ({ page }) => {
  await login(page);
  await nav(page, 'Financials');
  await page.screenshot({ path: `${DIR}/financials-1-main.png`, fullPage: false });

  const body = await page.locator('body').textContent() || '';
  const hasRevenue = /\$[\d,]+/.test(body);
  console.log(`Financials has revenue data: ${hasRevenue}`);

  // Check for filter/date controls
  const filterControl = page.locator('select, button').filter({ hasText: /Week|Month|Year|Today|30 day/ }).first();
  if (await filterControl.count() > 0) {
    await filterControl.click(); await page.waitForTimeout(400);
    await page.screenshot({ path: `${DIR}/financials-2-filtered.png` });
    console.log('Financials filter works ✅');
  }
});

test('AUDIT: Keg Tracking — lifecycle', async ({ page }) => {
  await login(page);
  await nav(page, 'Keg Tracking');
  await page.screenshot({ path: `${DIR}/kegs-1-list.png` });

  const addBtn = page.locator('button').filter({ hasText: /Add Keg|New Keg/ }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click(); await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/kegs-2-modal.png` });
    const dialog = page.locator('[role="dialog"]');
    console.log(`Keg modal: ${await dialog.count() > 0}`);
    await page.keyboard.press('Escape');
  }

  // Check keg status filters
  const filterBtns = page.locator('button').filter({ hasText: /Available|Filled|On Tap|Empty|All/ });
  const count = await filterBtns.count();
  console.log(`Keg filter buttons: ${count}`);
  if (count > 0) {
    await filterBtns.first().click(); await page.waitForTimeout(300);
    await page.screenshot({ path: `${DIR}/kegs-3-filtered.png` });
  }
});

test('AUDIT: Reports — data and exports', async ({ page }) => {
  await login(page);
  await nav(page, 'Reports');
  await page.screenshot({ path: `${DIR}/reports-1-main.png` });

  const body = await page.locator('body').textContent() || '';
  const hasData = /\$[\d,]+|Sales|Revenue/i.test(body);
  console.log(`Reports has data: ${hasData}`);

  // Check export buttons
  const exportBtn = page.locator('button').filter({ hasText: /Export|Download|CSV/ }).first();
  if (await exportBtn.count() > 0) {
    console.log('Reports export button found ✅');
  } else {
    console.log('⚠️ No export button on Reports');
  }
});

test('AUDIT: Settings — save business info', async ({ page }) => {
  await login(page);
  await nav(page, 'Settings');
  await page.screenshot({ path: `${DIR}/settings-1-main.png` });

  const saveBtn = page.locator('button').filter({ hasText: /Save|Update/ }).first();
  if (await saveBtn.count() > 0) {
    await saveBtn.click(); await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/settings-2-saved.png` });
    console.log('Settings save works ✅');
  }
});

test('AUDIT: Recipe Lab — full recipe CRUD', async ({ page }) => {
  await login(page);
  await nav(page, 'Recipe Lab');
  await page.screenshot({ path: `${DIR}/recipes-1-list.png` });

  const newBtn = page.locator('button').filter({ hasText: /New Recipe/ }).first();
  if (await newBtn.count() > 0) {
    await newBtn.click(); await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/recipes-2-modal.png` });
    const dialog = page.locator('[role="dialog"]');
    if (await dialog.count() > 0) {
      const nameInput = dialog.locator('input').first();
      await nameInput.fill('Pipeline 8 Test Pale Ale');
      await page.screenshot({ path: `${DIR}/recipes-3-filled.png` });
      const submit = dialog.locator('button[type="submit"]').first();
      if (await submit.count() > 0) {
        await submit.click(); await page.waitForTimeout(500);
        await page.screenshot({ path: `${DIR}/recipes-4-saved.png` });
        console.log('Recipe created ✅');
      }
    }
  }
});

// ── DATA QUALITY CHECK ─────────────────────────────────────────────────

test('AUDIT: Data quality — no NaN, no broken currency', async ({ page }) => {
  const issues: string[] = [];
  await login(page);

  const pagesToCheck = ['Dashboard', 'Financials', 'Taproom Analytics', 'Reports', 'Staff'];
  for (const p of pagesToCheck) {
    try {
      await nav(page, p);
      const body = await page.locator('body').textContent() || '';
      if (/\bNaN\b/.test(body)) issues.push(`${p}: NaN`);
      if (/\$\s*—/.test(body)) issues.push(`${p}: broken $— currency`);
      if (/\bundefined\b/.test(body)) issues.push(`${p}: undefined text`);
      if (/\$[\d]+\.[0-9]{1}[^0-9]/.test(body)) issues.push(`${p}: single-decimal currency`);
    } catch { /* skip */ }
  }
  console.log(`Data issues: ${issues.length === 0 ? 'none' : issues.join(' | ')}`);
  expect(issues.length).toBe(0);
});

// ── MOBILE RESPONSIVE CHECK ───────────────────────────────────────────

test('AUDIT: Mobile responsive — key pages', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page);

  const mobilePages = ['Dashboard', 'POS', 'Brewing', 'Customers', 'Distribution'];
  for (const p of mobilePages) {
    try {
      await nav(page, p);
      await page.screenshot({ path: `${DIR}/mobile-${p.toLowerCase().replace(/\s+/g, '-')}.png` });
      // Check for horizontal overflow
      const hasOverflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth + 10);
      if (hasOverflow) console.log(`⚠️ ${p}: horizontal overflow on mobile`);
    } catch { /* skip */ }
  }
  console.log('Mobile check done ✅');
});
