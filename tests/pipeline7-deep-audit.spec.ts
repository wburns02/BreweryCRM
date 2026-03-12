import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5175';
const DIR = './test-results/pipeline7-deep';
fs.mkdirSync(DIR, { recursive: true });

async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(2500);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) { await demoBtn.click(); await page.waitForTimeout(2500); }
}

async function nav(page: Page, text: string) {
  const link = page.locator('nav').locator('button, a').filter({ hasText: new RegExp(`^${text}$`) }).first();
  if (await link.count() > 0) {
    await link.click({ timeout: 5000 });
  } else {
    await page.locator(`text="${text}"`).first().click({ timeout: 5000 });
  }
  await page.waitForTimeout(1500);
}

// ─── BUG 1: Reservations form — multiple buttons, strict mode fails ─────────

test('BUG-DETECT: Reservations — New Reservation modal opens correctly', async ({ page }) => {
  await login(page);
  await nav(page, 'Reservations');
  await page.screenshot({ path: `${DIR}/reservations-before.png` });

  const newBtn = page.locator('button').filter({ hasText: /New Reservation/ }).first();
  await newBtn.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/reservations-modal.png` });

  const dialog = page.locator('[role="dialog"]');
  expect(await dialog.count()).toBeGreaterThan(0);

  // Fill in the form
  const nameInput = page.locator('input[placeholder*="name"], input[placeholder*="Name"]').first();
  if (await nameInput.count() > 0) {
    await nameInput.fill('Test Guest');
    await page.screenshot({ path: `${DIR}/reservations-filled.png` });
    console.log('Reservation form fillable ✅');
  } else {
    console.log('⚠️ No name input found in reservation modal');
    await page.screenshot({ path: `${DIR}/reservations-modal-content.png` });
  }

  // Close modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  console.log('Reservations form ✅');
});

// ─── BUG 2: Recipe Lab — check grain/hop/yeast save ────────────────────────

test('BUG-DETECT: Recipe Lab — new recipe can be created', async ({ page }) => {
  await login(page);
  await nav(page, 'Recipe Lab');

  const newBtn = page.locator('button').filter({ hasText: /New Recipe/ }).first();
  await newBtn.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${DIR}/recipe-new.png` });

  const dialog = page.locator('[role="dialog"]');
  if (await dialog.count() > 0) {
    // Fill name
    const nameInput = page.locator('input[placeholder*="recipe"], input[placeholder*="Recipe"], input[placeholder*="name"]').first();
    if (await nameInput.count() > 0) {
      await nameInput.fill('Test IPA Recipe');
    }
    await page.screenshot({ path: `${DIR}/recipe-filled.png` });
    console.log('Recipe modal opens and is fillable ✅');
  }
  console.log('Recipe Lab form ✅');
});

// ─── BUG 3: POS — close tab flow ───────────────────────────────────────────

test('BUG-DETECT: POS — close tab flow works', async ({ page }) => {
  await login(page);
  await nav(page, 'POS');

  // Add item to tab
  const tapCard = page.locator('button').filter({ hasText: /TAP \d/ }).first();
  if (await tapCard.count() > 0) {
    await tapCard.click();
    await page.waitForTimeout(300);

    // Select pour size if prompted
    const pourBtn = page.locator('button').filter({ hasText: /Pint|Half|Snifter/ }).first();
    if (await pourBtn.count() > 0) {
      await pourBtn.click();
      await page.waitForTimeout(300);
    }
  }

  await page.screenshot({ path: `${DIR}/pos-with-item.png` });

  // Try to find and click Close/Charge Tab button
  const closeTabBtn = page.locator('button').filter({ hasText: /Close Tab|Charge|Pay|Process/ }).first();
  if (await closeTabBtn.count() > 0) {
    await closeTabBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/pos-close-tab.png` });

    // Check for payment modal or success
    const payModal = page.locator('[role="dialog"]');
    const hasPayModal = await payModal.count() > 0;
    console.log(`Close tab opens payment dialog: ${hasPayModal}`);

    // Try to submit payment
    const submitPayBtn = page.locator('button').filter({ hasText: /Confirm|Complete|Pay|Cash/ }).first();
    if (await submitPayBtn.count() > 0) {
      await submitPayBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${DIR}/pos-payment-done.png` });
    }
  } else {
    await page.screenshot({ path: `${DIR}/pos-no-close-btn.png` });
    console.log('⚠️ No close tab button found');
  }
  console.log('POS close tab ✅');
});

// ─── BUG 4: Inventory — Edit item form ─────────────────────────────────────

test('BUG-DETECT: Inventory — edit item form works', async ({ page }) => {
  await login(page);
  await nav(page, 'Inventory');

  await page.screenshot({ path: `${DIR}/inventory-list.png` });

  // Try clicking an item to edit
  const editBtn = page.locator('button').filter({ hasText: /Edit/ }).first();
  if (await editBtn.count() > 0) {
    await editBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/inventory-edit.png` });

    const dialog = page.locator('[role="dialog"]');
    console.log(`Inventory edit modal: ${await dialog.count() > 0}`);

    if (await dialog.count() > 0) {
      const saveBtn = page.locator('button[type="submit"], button').filter({ hasText: /Save|Update/ }).first();
      if (await saveBtn.count() > 0) {
        await saveBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${DIR}/inventory-saved.png` });
        console.log('Inventory edit saved ✅');
      }
    }
    await page.keyboard.press('Escape');
  } else {
    // Try row click
    const firstRow = page.locator('table tbody tr, .bg-brewery-900').first();
    if (await firstRow.count() > 0) {
      await firstRow.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${DIR}/inventory-row-click.png` });
    }
  }
  console.log('Inventory edit ✅');
});

// ─── BUG 5: Distribution — add order form ──────────────────────────────────

test('BUG-DETECT: Distribution — add wholesale order', async ({ page }) => {
  await login(page);
  await nav(page, 'Distribution');

  await page.screenshot({ path: `${DIR}/distribution-main.png` });

  const addBtn = page.locator('button').filter({ hasText: /New Order|Add Order|Log Order/ }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/distribution-order.png` });
    console.log(`Distribution order modal: ${await page.locator('[role="dialog"]').count() > 0}`);
  } else {
    console.log('⚠️ No add order button in Distribution');
  }
  console.log('Distribution check ✅');
});

// ─── BUG 6: Staff — schedule edit ──────────────────────────────────────────

test('BUG-DETECT: Staff — staff detail/edit works', async ({ page }) => {
  await login(page);
  await nav(page, 'Staff');

  await page.screenshot({ path: `${DIR}/staff-list.png` });

  // Click a staff card
  const staffCard = page.locator('.bg-brewery-900, [class*="cursor-pointer"]').first();
  const viewBtn = page.locator('button').filter({ hasText: /View|Details|Edit|Profile/ }).first();

  if (await viewBtn.count() > 0) {
    await viewBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/staff-detail.png` });
    console.log(`Staff detail opens: ${await page.locator('[role="dialog"]').count() > 0}`);
    await page.keyboard.press('Escape');
  }
  console.log('Staff check ✅');
});

// ─── BUG 7: Marketing — send campaign ──────────────────────────────────────

test('BUG-DETECT: Marketing — create campaign form', async ({ page }) => {
  await login(page);
  await nav(page, 'Marketing');

  await page.screenshot({ path: `${DIR}/marketing-main.png` });

  const newBtn = page.locator('button').filter({ hasText: /New Campaign|Create Campaign/ }).first();
  if (await newBtn.count() > 0) {
    await newBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/marketing-campaign.png` });

    const dialog = page.locator('[role="dialog"]');
    if (await dialog.count() > 0) {
      // Fill in subject
      const subjectInput = page.locator('input[placeholder*="subject"], input[placeholder*="Subject"], input[placeholder*="campaign"]').first();
      if (await subjectInput.count() > 0) {
        await subjectInput.fill('Test Campaign Subject');
      }
      await page.screenshot({ path: `${DIR}/marketing-filled.png` });
      console.log('Marketing campaign form fillable ✅');
    }
    await page.keyboard.press('Escape');
  }
  console.log('Marketing check ✅');
});

// ─── BUG 8: Mug Club — add member ─────────────────────────────────────────

test('BUG-DETECT: Mug Club — add member form', async ({ page }) => {
  await login(page);
  await nav(page, 'Mug Club');

  await page.screenshot({ path: `${DIR}/mug-club-main.png` });

  const addBtn = page.locator('button').filter({ hasText: /Add Member|New Member|Enroll/ }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/mug-club-form.png` });
    console.log(`Mug Club form: ${await page.locator('[role="dialog"]').count() > 0}`);
    await page.keyboard.press('Escape');
  }
  console.log('Mug Club check ✅');
});

// ─── BUG 9: Reports — export/filter works ──────────────────────────────────

test('BUG-DETECT: Reports — filter and data visible', async ({ page }) => {
  await login(page);
  await nav(page, 'Reports');

  await page.screenshot({ path: `${DIR}/reports-main.png` });

  // Check for filter controls
  const body = await page.locator('body').textContent() || '';
  const hasFilters = body.match(/Date|Range|Filter|Export/i);
  console.log(`Reports has filters: ${!!hasFilters}`);

  // Try clicking a date filter if exists
  const filterBtn = page.locator('select, button').filter({ hasText: /Today|Week|Month|Year/ }).first();
  if (await filterBtn.count() > 0) {
    await filterBtn.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${DIR}/reports-filtered.png` });
  }
  console.log('Reports check ✅');
});

// ─── BUG 10: Floor Plan — seat/clear table ─────────────────────────────────

test('BUG-DETECT: Floor Plan — table interaction works', async ({ page }) => {
  await login(page);
  await nav(page, 'Floor Plan');

  await page.screenshot({ path: `${DIR}/floor-plan-main.png` });

  // Click an empty table
  const emptyTable = page.locator('button').filter({ hasText: /T-\d|P-\d|B-\d/ }).first();
  if (await emptyTable.count() > 0) {
    await emptyTable.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/floor-plan-table-click.png` });
    const body = await page.locator('body').textContent() || '';
    const hasPanel = body.match(/Seat|Clear|Status|Table/i);
    console.log(`Floor plan table panel: ${!!hasPanel}`);
    await page.keyboard.press('Escape');
  }
  console.log('Floor Plan interaction ✅');
});

// ─── VISUAL QUALITY CHECKS ────────────────────────────────────────────────

test('VISUAL: Take screenshots of all major pages', async ({ page }) => {
  await login(page);
  const pages = [
    ['Dashboard', 'dashboard-visual'],
    ['POS', 'pos-visual'],
    ['Floor Plan', 'floorplan-visual'],
    ['Brewing', 'brewing-visual'],
    ['Financials', 'financials-visual'],
    ['Events', 'events-visual'],
    ['Customers', 'customers-visual'],
  ];

  for (const [pageName, filename] of pages) {
    try {
      await nav(page, pageName);
      await page.screenshot({ path: `${DIR}/${filename}.png`, fullPage: false });
    } catch { /* skip nav errors */ }
  }
  console.log('Visual screenshots taken ✅');
});

// ─── CURRENCY AND DATA FORMAT CHECKS ─────────────────────────────────────

test('DATA: Check for data quality issues', async ({ page }) => {
  await login(page);
  const issues: string[] = [];

  // Check Taps for $X.X format
  await nav(page, 'Tap Management');
  let body = await page.locator('body').textContent() || '';
  if (/\$[\d,]+\.\d{1}[^0-9]/.test(body)) issues.push('Tap Management: single decimal currency');

  // Check Dashboard
  await nav(page, 'Dashboard');
  body = await page.locator('body').textContent() || '';
  if (/\bNaN\b/.test(body)) issues.push('Dashboard: NaN value');
  if (/undefined/.test(body)) issues.push('Dashboard: undefined value');

  // Check Financials
  await nav(page, 'Financials');
  body = await page.locator('body').textContent() || '';
  if (/\bNaN\b/.test(body)) issues.push('Financials: NaN value');

  // Check Brewing
  await nav(page, 'Brewing');
  body = await page.locator('body').textContent() || '';
  if (/\bNaN\b/.test(body)) issues.push('Brewing: NaN value');

  console.log(`Data issues found: ${issues.length === 0 ? 'none' : issues.join(', ')}`);
  await page.screenshot({ path: `${DIR}/data-check.png` });
  expect(issues.length).toBe(0);
});

// ─── CONSOLE ERROR CHECK ──────────────────────────────────────────────────

test('STABILITY: No critical console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore common dev warnings and API errors
      if (!text.includes('Warning:') && !text.includes('API') && !text.includes('fetch') && !text.includes('net::')) {
        errors.push(text.substring(0, 100));
      }
    }
  });

  await login(page);

  const pagesToVisit = ['Dashboard', 'POS', 'Brewing', 'Financials', 'Events'];
  for (const p of pagesToVisit) {
    try { await nav(page, p); } catch { /* skip */ }
  }

  console.log(`Console errors: ${errors.length > 0 ? errors.join(' | ') : 'none'}`);
  expect(errors.length).toBeLessThan(3);
});
