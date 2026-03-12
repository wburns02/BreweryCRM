import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5183';
const DIR = './test-results/pipeline2-audit';
fs.mkdirSync(DIR, { recursive: true });

async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(2000);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) {
    await demoBtn.click();
    await page.waitForTimeout(2000);
  }
}

async function nav(page: Page, label: string) {
  const link = page.locator(`text="${label}"`).first();
  await link.click({ timeout: 8000 });
  await page.waitForTimeout(1200);
}

// ─── PAGE LOAD AUDIT ─────────────────────────────────────────────────────────

const PAGES = [
  { nav: 'Dashboard', id: 'dashboard' },
  { nav: 'POS', id: 'pos' },
  { nav: 'Floor Plan', id: 'floor-plan' },
  { nav: 'Customers', id: 'customers' },
  { nav: 'Mug Club', id: 'mug-club' },
  { nav: 'Reservations', id: 'reservations' },
  { nav: 'Tap Management', id: 'taps' },
  { nav: 'Brewing', id: 'brewing' },
  { nav: 'Production', id: 'production' },
  { nav: 'Recipe Lab', id: 'recipes' },
  { nav: 'Keg Tracking', id: 'kegs' },
  { nav: 'Food & Menu', id: 'menu' },
  { nav: 'Inventory', id: 'inventory' },
  { nav: 'Taproom Analytics', id: 'taproom-analytics' },
  { nav: 'Events', id: 'events' },
  { nav: 'Marketing', id: 'marketing' },
  { nav: 'Financials', id: 'financials' },
  { nav: 'Staff', id: 'staff' },
  { nav: 'Distribution', id: 'distribution' },
  { nav: 'Reports', id: 'reports' },
  { nav: 'TTB Reports', id: 'ttb-reports' },
  { nav: 'Settings', id: 'settings' },
];

test('AUDIT: All pages load without NaN or errors', async ({ page }) => {
  await login(page);
  const issues: string[] = [];

  for (const p of PAGES) {
    try {
      await nav(page, p.nav);
      await page.screenshot({ path: `${DIR}/${p.id}.png` });
      const body = await page.locator('body').textContent() || '';
      if (body.includes('NaN')) issues.push(`${p.nav}: contains NaN`);
      if (body.includes('undefined')) issues.push(`${p.nav}: contains "undefined" text`);
      if (body.includes('Error') && !body.includes('Error:') && body.includes('Component')) {
        issues.push(`${p.nav}: possible React error boundary`);
      }
      console.log(`✅ ${p.nav}`);
    } catch (e: any) {
      issues.push(`${p.nav}: FAILED TO LOAD — ${e.message.split('\n')[0]}`);
      console.log(`❌ ${p.nav}: ${e.message.split('\n')[0]}`);
    }
  }

  console.log('\n=== ISSUES FOUND ===');
  issues.forEach(i => console.log(' •', i));
  fs.writeFileSync(`${DIR}/issues.json`, JSON.stringify(issues, null, 2));
});

// ─── BUTTON & FORM AUDIT ─────────────────────────────────────────────────────

test('AUDIT: POS — tab creation and item addition', async ({ page }) => {
  await login(page);
  await nav(page, 'POS');
  await page.screenshot({ path: `${DIR}/pos-initial.png` });

  // Try to open a tab
  const openBtn = page.locator('button').filter({ hasText: /open tab|new tab|start tab/i }).first();
  if (await openBtn.count() > 0) {
    await openBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${DIR}/pos-tab-opened.png` });
    console.log('POS: Open tab button worked ✅');
  } else {
    console.log('POS: No "open tab" button found');
  }

  // Check for table selector or tab list
  const tabList = page.locator('[data-testid="tab-list"], .tab-item, button:has-text("Table")');
  console.log(`POS: Tab list items: ${await tabList.count()}`);
});

test('AUDIT: Reservations — new reservation form', async ({ page }) => {
  await login(page);
  await nav(page, 'Reservations');
  await page.screenshot({ path: `${DIR}/reservations-initial.png` });

  const addBtn = page.locator('button').filter({ hasText: /new reservation|add reservation|book/i }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${DIR}/reservations-modal.png` });

    const modal = page.locator('[role="dialog"]');
    if (await modal.isVisible()) {
      console.log('Reservations: Modal opens ✅');
      // Try to fill name field
      const nameInput = modal.locator('input').first();
      await nameInput.fill('Test Guest');
      await page.screenshot({ path: `${DIR}/reservations-filled.png` });
    }
    await page.keyboard.press('Escape');
  } else {
    console.log('Reservations: No add button found ❌');
  }
});

test('AUDIT: Brewing — batch operations', async ({ page }) => {
  await login(page);
  await nav(page, 'Brewing');
  await page.screenshot({ path: `${DIR}/brewing-initial.png` });

  // Check for batch list
  const body = await page.locator('body').textContent() || '';
  console.log(`Brewing: Has batch data: ${body.includes('batch') || body.includes('Batch') || body.includes('brew')}`);

  // Try new batch button
  const newBtn = page.locator('button').filter({ hasText: /new batch|start batch|brew/i }).first();
  if (await newBtn.count() > 0) {
    await newBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${DIR}/brewing-modal.png` });
    const modal = page.locator('[role="dialog"]');
    console.log(`Brewing: New batch modal opens: ${await modal.isVisible()}`);
    await page.keyboard.press('Escape');
  }
});

test('AUDIT: Recipe Lab — recipe CRUD', async ({ page }) => {
  await login(page);
  await nav(page, 'Recipe Lab');
  await page.screenshot({ path: `${DIR}/recipes-initial.png` });

  const newBtn = page.locator('button').filter({ hasText: /new recipe|create recipe|add recipe/i }).first();
  if (await newBtn.count() > 0) {
    await newBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${DIR}/recipes-modal.png` });
    const panel = page.locator('[role="dialog"], aside, [data-testid="slide-panel"]');
    console.log(`Recipe Lab: New recipe panel opens: ${await panel.first().isVisible()}`);
    await page.keyboard.press('Escape');
  } else {
    console.log('Recipe Lab: No new recipe button ❌');
  }
});

test('AUDIT: Keg Tracking — keg CRUD', async ({ page }) => {
  await login(page);
  await nav(page, 'Keg Tracking');
  await page.screenshot({ path: `${DIR}/kegs-initial.png` });

  const body = await page.locator('body').textContent() || '';
  const hasNaN = body.includes('NaN');
  console.log(`Kegs: Has NaN: ${hasNaN}`);

  const newBtn = page.locator('button').filter({ hasText: /add keg|new keg|log keg/i }).first();
  if (await newBtn.count() > 0) {
    await newBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${DIR}/kegs-modal.png` });
    const modal = page.locator('[role="dialog"]');
    console.log(`Kegs: Add modal opens: ${await modal.isVisible()}`);
    await page.keyboard.press('Escape');
  }
});

test('AUDIT: Inventory — item CRUD', async ({ page }) => {
  await login(page);
  await nav(page, 'Inventory');

  const addBtn = page.locator('button').filter({ hasText: /add item|new item/i }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${DIR}/inventory-modal.png` });
    const modal = page.locator('[role="dialog"]');
    if (await modal.isVisible()) {
      // Fill the form
      const inputs = modal.locator('input');
      const count = await inputs.count();
      console.log(`Inventory: Modal input count: ${count}`);
      if (count > 0) {
        await inputs.first().fill('Test Ingredient');
        await page.screenshot({ path: `${DIR}/inventory-filled.png` });
      }
    }
    await page.keyboard.press('Escape');
  }
});

test('AUDIT: Events — event creation and RSVP tracking', async ({ page }) => {
  await login(page);
  await nav(page, 'Events');
  await page.screenshot({ path: `${DIR}/events-initial.png` });

  // Check what exists
  const body = await page.locator('body').textContent() || '';
  const hasEvents = body.includes('event') || body.includes('Event');
  console.log(`Events: Has event data: ${hasEvents}`);

  // Try add event
  const addBtn = page.locator('button').filter({ hasText: /add event|new event|create event/i }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${DIR}/events-modal.png` });
    const modal = page.locator('[role="dialog"]');
    console.log(`Events: Add modal opens: ${await modal.isVisible()}`);

    if (await modal.isVisible()) {
      const nameInput = modal.locator('input').first();
      await nameInput.fill('Test Event');
      // Check for date input
      const dateInput = modal.locator('input[type="date"]');
      if (await dateInput.count() > 0) {
        await dateInput.first().fill('2026-04-01');
        console.log('Events: Date input works ✅');
      }
      await page.screenshot({ path: `${DIR}/events-filled.png` });
    }
    await page.keyboard.press('Escape');
  }
});

test('AUDIT: Marketing — campaign creation', async ({ page }) => {
  await login(page);
  await nav(page, 'Marketing');
  await page.screenshot({ path: `${DIR}/marketing-initial.png` });

  const body = await page.locator('body').textContent() || '';
  console.log(`Marketing: Has NaN: ${body.includes('NaN')}`);

  const addBtn = page.locator('button').filter({ hasText: /new campaign|create campaign|compose/i }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${DIR}/marketing-modal.png` });
    const modal = page.locator('[role="dialog"]');
    console.log(`Marketing: Campaign modal opens: ${await modal.isVisible()}`);
    await page.keyboard.press('Escape');
  }
});

test('AUDIT: Financials — all tabs render cleanly', async ({ page }) => {
  await login(page);
  await nav(page, 'Financials');
  await page.screenshot({ path: `${DIR}/financials-overview.png` });

  const tabs = ['P&L Statement', 'Labor & Overhead', 'Beer Economics'];
  for (const tab of tabs) {
    const tabBtn = page.locator('button').filter({ hasText: tab }).first();
    if (await tabBtn.count() > 0) {
      await tabBtn.click();
      await page.waitForTimeout(800);
      const body = await page.locator('body').textContent() || '';
      const hasNaN = body.includes('NaN');
      console.log(`Financials ${tab}: NaN=${hasNaN}`);
      await page.screenshot({ path: `${DIR}/financials-${tab.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png` });
    }
  }
});

test('AUDIT: TTB Reports — all tabs and calculator', async ({ page }) => {
  await login(page);
  await nav(page, 'TTB Reports');

  const tabs = ['Production Records', 'Removals Record', 'Tax Calculator'];
  for (const tab of tabs) {
    const tabBtn = page.locator(`button:has-text("${tab}")`);
    if (await tabBtn.count() > 0) {
      await tabBtn.click();
      await page.waitForTimeout(600);
      const body = await page.locator('body').textContent() || '';
      console.log(`TTB ${tab}: NaN=${body.includes('NaN')}`);
      await page.screenshot({ path: `${DIR}/ttb-${tab.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png` });
    }
  }
});

test('AUDIT: Settings — form fields present and saveable', async ({ page }) => {
  await login(page);
  await nav(page, 'Settings');
  await page.screenshot({ path: `${DIR}/settings-initial.png` });

  const saveBtn = page.locator('button').filter({ hasText: /save|update|apply/i }).first();
  console.log(`Settings: Has save button: ${await saveBtn.count() > 0}`);

  const inputs = page.locator('input:not([type="hidden"]):not([type="checkbox"])');
  const inputCount = await inputs.count();
  console.log(`Settings: Input field count: ${inputCount}`);

  if (inputCount > 0) {
    // Just verify inputs are editable
    const firstInput = inputs.first();
    const currentVal = await firstInput.inputValue();
    await firstInput.fill(currentVal + ' ');
    await firstInput.fill(currentVal); // restore
  }
});

test('AUDIT: Tap Management — tap assignment', async ({ page }) => {
  await login(page);
  await nav(page, 'Tap Management');
  await page.screenshot({ path: `${DIR}/taps-initial.png` });

  const body = await page.locator('body').textContent() || '';
  console.log(`Taps: Has NaN: ${body.includes('NaN')}`);
  console.log(`Taps: Has tap data: ${body.toLowerCase().includes('tap') || body.toLowerCase().includes('keg')}`);

  // Look for any "assign" or "change" buttons
  const assignBtn = page.locator('button').filter({ hasText: /assign|change|swap|update/i }).first();
  if (await assignBtn.count() > 0) {
    await assignBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${DIR}/taps-modal.png` });
    await page.keyboard.press('Escape');
  }
});

test('AUDIT: Mug Club — member management', async ({ page }) => {
  await login(page);
  await nav(page, 'Mug Club');
  await page.screenshot({ path: `${DIR}/mug-club-initial.png` });

  const body = await page.locator('body').textContent() || '';
  console.log(`Mug Club: Has NaN: ${body.includes('NaN')}`);

  const addBtn = page.locator('button').filter({ hasText: /add member|new member|enroll/i }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${DIR}/mug-club-modal.png` });
    const modal = page.locator('[role="dialog"]');
    console.log(`Mug Club: Add member modal: ${await modal.isVisible()}`);
    await page.keyboard.press('Escape');
  }
});

test('AUDIT: Production page — batch pipeline', async ({ page }) => {
  await login(page);
  await nav(page, 'Production');
  await page.screenshot({ path: `${DIR}/production-initial.png` });

  const body = await page.locator('body').textContent() || '';
  console.log(`Production: Has NaN: ${body.includes('NaN')}`);

  // Check for tank/batch widgets
  const hasTanks = body.toLowerCase().includes('tank') || body.toLowerCase().includes('fermenter') || body.toLowerCase().includes('batch');
  console.log(`Production: Has tank/batch data: ${hasTanks}`);
});

test('AUDIT: Taproom Analytics — charts render', async ({ page }) => {
  await login(page);
  await nav(page, 'Taproom Analytics');
  await page.screenshot({ path: `${DIR}/taproom-analytics-initial.png` });

  const body = await page.locator('body').textContent() || '';
  console.log(`Taproom Analytics: Has NaN: ${body.includes('NaN')}`);

  // Check recharts are present (not just empty divs)
  const charts = page.locator('.recharts-wrapper, .recharts-responsive-container');
  const chartCount = await charts.count();
  console.log(`Taproom Analytics: Chart count: ${chartCount}`);
});

test('AUDIT: Reports — report generation', async ({ page }) => {
  await login(page);
  await nav(page, 'Reports');
  await page.screenshot({ path: `${DIR}/reports-initial.png` });

  const body = await page.locator('body').textContent() || '';
  console.log(`Reports: Has NaN: ${body.includes('NaN')}`);

  // Check for report tabs or download buttons
  const downloadBtn = page.locator('button').filter({ hasText: /download|export|generate/i }).first();
  console.log(`Reports: Has download/export button: ${await downloadBtn.count() > 0}`);
});

test('AUDIT: Customers — detail view and search', async ({ page }) => {
  await login(page);
  await nav(page, 'Customers');
  await page.screenshot({ path: `${DIR}/customers-initial.png` });

  const body = await page.locator('body').textContent() || '';
  console.log(`Customers: Has NaN: ${body.includes('NaN')}`);

  // Try search
  const searchInput = page.locator('input[placeholder*="search" i], input[placeholder*="Search" i]').first();
  if (await searchInput.count() > 0) {
    await searchInput.fill('brew');
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/customers-searched.png` });
    console.log('Customers: Search works ✅');
    await searchInput.fill('');
  }

  // Try clicking a customer row
  const customerRow = page.locator('tbody tr, [data-testid="customer-row"]').first();
  if (await customerRow.count() > 0) {
    await customerRow.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${DIR}/customers-detail.png` });
    const detail = page.locator('[role="dialog"], aside');
    console.log(`Customers: Detail panel/modal opens: ${await detail.first().isVisible()}`);
    await page.keyboard.press('Escape');
  }
});
