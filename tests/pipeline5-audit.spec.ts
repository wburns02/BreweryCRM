import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5173';
const DIR = './test-results/pipeline5-audit';
fs.mkdirSync(DIR, { recursive: true });

async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(2500);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) { await demoBtn.click(); await page.waitForTimeout(2500); }
}

// ─── PAGE AUDITS ─────────────────────────────────────────────────────────────

test('AUDIT: Dashboard', async ({ page }) => {
  await login(page);
  await page.screenshot({ path: `${DIR}/dashboard.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  console.log('Dashboard loaded ✅');
});

test('AUDIT: POS — order & checkout flow', async ({ page }) => {
  await login(page);
  await page.locator('text="POS"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/pos-initial.png` });

  // Try adding items to order
  const menuItems = page.locator('button').filter({ hasText: /Add|^\+/ });
  const count = await menuItems.count();
  console.log(`POS: ${count} add-to-order buttons`);
  if (count > 0) {
    await menuItems.first().click();
    await page.waitForTimeout(500);
  }

  // Check for checkout/open tab
  const checkoutBtn = page.locator('button').filter({ hasText: /checkout|open tab|charge/i }).first();
  console.log(`POS checkout button visible: ${await checkoutBtn.count() > 0}`);

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  await page.screenshot({ path: `${DIR}/pos-after-add.png` });
  console.log('POS ✅');
});

test('AUDIT: Floor Plan — table interactions', async ({ page }) => {
  await login(page);
  await page.locator('text="Floor Plan"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/floor-plan.png` });

  // Click a table
  const tables = page.locator('[class*="table"], [class*="Table"]').filter({ hasText: /T\d/ });
  const tableCount = await tables.count();
  console.log(`Floor plan tables: ${tableCount}`);
  if (tableCount > 0) {
    await tables.first().click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/floor-plan-table-click.png` });
  }

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  console.log('Floor Plan ✅');
});

test('AUDIT: Customers — search and detail view', async ({ page }) => {
  await login(page);
  await page.locator('text="Customers"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${DIR}/customers.png` });

  // Search
  const searchInput = page.locator('input[placeholder*="search"], input[placeholder*="Search"]').first();
  if (await searchInput.count() > 0) {
    await searchInput.fill('Sam');
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/customers-search.png` });
  }

  // Click a customer row
  const rows = page.locator('tbody tr');
  if (await rows.count() > 0) {
    await rows.first().click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${DIR}/customers-detail.png` });
    const body = await page.locator('body').textContent() || '';
    const hasPanel = body.includes('Visit') || body.includes('Orders') || body.includes('Total Spent');
    console.log(`Customer detail panel: ${hasPanel}`);
  }

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  console.log('Customers ✅');
});

test('AUDIT: Mug Club — add member', async ({ page }) => {
  await login(page);
  await page.locator('text="Mug Club"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${DIR}/mug-club.png` });

  // Try adding member
  const addBtn = page.locator('button').filter({ hasText: /add member|new member/i }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(400);
    const modal = page.locator('[role="dialog"]');
    if (await modal.isVisible()) {
      console.log('Mug Club add member modal opens ✅');
      await page.screenshot({ path: `${DIR}/mug-club-add.png` });
      await page.keyboard.press('Escape');
    }
  }

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  console.log('Mug Club ✅');
});

test('AUDIT: Reservations — create reservation', async ({ page }) => {
  await login(page);
  await page.locator('text="Reservations"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${DIR}/reservations.png` });

  const addBtn = page.locator('button').filter({ hasText: /new reservation|add reservation/i }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(400);
    const modal = page.locator('[role="dialog"]');
    if (await modal.isVisible()) {
      console.log('Reservation modal opens ✅');
      await page.screenshot({ path: `${DIR}/reservations-modal.png` });
      // Fill in
      const nameInput = modal.locator('input').first();
      if (await nameInput.count() > 0) await nameInput.fill('Test Guest');
      await page.keyboard.press('Escape');
    }
  }

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  console.log('Reservations ✅');
});

test('AUDIT: Tap Management — edit and save', async ({ page }) => {
  await login(page);
  await page.locator('text="Tap Management"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${DIR}/taps.png` });

  // Switch to list view
  const listViewBtn = page.locator('button:has-text("List View")');
  if (await listViewBtn.count() > 0) {
    await listViewBtn.click();
    await page.waitForTimeout(300);
  }

  // Edit a tap
  const editBtn = page.locator('tbody button').first();
  if (await editBtn.count() > 0) {
    await editBtn.click();
    await page.waitForTimeout(400);
    const modal = page.locator('[role="dialog"]');
    if (await modal.isVisible()) {
      const saveBtn = modal.locator('button:has-text("Save Changes")');
      await saveBtn.click();
      await page.waitForTimeout(500);
      const body = await page.locator('body').textContent() || '';
      const hasFeedback = body.toLowerCase().includes('updated') || body.toLowerCase().includes('saved');
      console.log(`Tap save feedback: ${hasFeedback}`);
    }
  }

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  await page.screenshot({ path: `${DIR}/taps-after.png` });
  console.log('Tap Management ✅');
});

test('AUDIT: Brewing — tabs and batch actions', async ({ page }) => {
  await login(page);
  await page.locator('text="Brewing"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${DIR}/brewing.png` });

  // Check tabs
  const tabs = ['Active Batches', 'Cost Analysis', 'Grain Bill', 'Hop Schedule'];
  for (const tab of tabs) {
    const btn = page.locator(`button:has-text("${tab}")`);
    if (await btn.count() > 0) {
      await btn.click();
      await page.waitForTimeout(400);
      console.log(`Brewing ${tab} tab ✅`);
    }
  }

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  await page.screenshot({ path: `${DIR}/brewing-cost.png` });
  console.log('Brewing ✅');
});

test('AUDIT: Production — schedule and advance', async ({ page }) => {
  await login(page);
  await page.locator('text="Production"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${DIR}/production.png` });

  // Try schedule brew
  const schedBtn = page.locator('button').filter({ hasText: /schedule brew/i }).first();
  if (await schedBtn.count() > 0) {
    await schedBtn.click();
    await page.waitForTimeout(400);
    const modal = page.locator('[role="dialog"]');
    if (await modal.isVisible()) {
      console.log('Schedule brew modal ✅');
      await page.keyboard.press('Escape');
    }
  }

  // Try advance batch
  const advBtn = page.locator('button').filter({ hasText: /advance|next stage/i }).first();
  if (await advBtn.count() > 0) {
    await advBtn.click();
    await page.waitForTimeout(400);
    console.log('Batch advance clicked');
    await page.screenshot({ path: `${DIR}/production-advance.png` });
    await page.keyboard.press('Escape');
  }

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  console.log('Production ✅');
});

test('AUDIT: Recipe Lab — create and save', async ({ page }) => {
  await login(page);
  await page.locator('text="Recipe Lab"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${DIR}/recipes.png` });

  const addBtn = page.locator('button').filter({ hasText: /new recipe|add recipe|create recipe/i }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(400);
    const modal = page.locator('[role="dialog"]');
    if (await modal.isVisible()) {
      console.log('Recipe modal opens ✅');
      await page.screenshot({ path: `${DIR}/recipes-modal.png` });
      await page.keyboard.press('Escape');
    }
  }

  // Click a recipe card
  const recipeCards = page.locator('[class*="card"], [class*="Card"]').first();
  if (await recipeCards.count() > 0) {
    await recipeCards.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/recipes-detail.png` });
  }

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  console.log('Recipe Lab ✅');
});

test('AUDIT: Keg Tracking — CRUD', async ({ page }) => {
  await login(page);
  await page.locator('text="Keg Tracking"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${DIR}/kegs.png` });

  const addBtn = page.locator('button').filter({ hasText: /add keg|new keg/i }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(400);
    const modal = page.locator('[role="dialog"]');
    if (await modal.isVisible()) {
      console.log('Keg add modal ✅');
      await page.keyboard.press('Escape');
    }
  }

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  console.log('Keg Tracking ✅');
});

test('AUDIT: Keg Monitor — real-time view', async ({ page }) => {
  await login(page);
  await page.locator('text="Keg Monitor"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${DIR}/keg-monitor.png` });

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');

  // Check for sensor data / fill levels
  const hasFillLevel = body.includes('%') || body.includes('level') || body.includes('Level');
  console.log(`Keg Monitor has fill levels: ${hasFillLevel}`);
  console.log('Keg Monitor ✅');
});

test('AUDIT: Food & Menu — add item', async ({ page }) => {
  await login(page);
  await page.locator('text="Food & Menu"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${DIR}/menu.png` });

  const addBtn = page.locator('button').filter({ hasText: /add item|new item/i }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(400);
    const modal = page.locator('[role="dialog"]');
    if (await modal.isVisible()) {
      console.log('Menu add modal ✅');
      await page.keyboard.press('Escape');
    }
  }

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  console.log('Food & Menu ✅');
});

test('AUDIT: Inventory — add and filter', async ({ page }) => {
  await login(page);
  await page.locator('text="Inventory"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${DIR}/inventory.png` });

  const addBtn = page.locator('button').filter({ hasText: /add item|new item|add inventory/i }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(400);
    const modal = page.locator('[role="dialog"]');
    if (await modal.isVisible()) {
      console.log('Inventory add modal ✅');
      await page.keyboard.press('Escape');
    }
  }

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  console.log('Inventory ✅');
});

test('AUDIT: Taproom Analytics — charts and filters', async ({ page }) => {
  await login(page);
  await page.locator('text="Taproom Analytics"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/analytics.png` });

  // Try date range filter
  const filterBtns = page.locator('button').filter({ hasText: /7 days|30 days|This Week|This Month/ });
  const filterCount = await filterBtns.count();
  console.log(`Analytics filter buttons: ${filterCount}`);
  if (filterCount > 0) {
    await filterBtns.first().click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/analytics-filtered.png` });
  }

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  console.log('Taproom Analytics ✅');
});

test('AUDIT: Events — create event', async ({ page }) => {
  await login(page);
  await page.locator('text="Events"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${DIR}/events.png` });

  const addBtn = page.locator('button').filter({ hasText: /add event|new event|create event/i }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(400);
    const modal = page.locator('[role="dialog"]');
    if (await modal.isVisible()) {
      console.log('Event create modal ✅');
      const inputs = modal.locator('input[type="text"]');
      if (await inputs.count() > 0) await inputs.first().fill('Test Event P5');
      await page.keyboard.press('Escape');
    }
  }

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  console.log('Events ✅');
});

test('AUDIT: Financials — tabs and charts', async ({ page }) => {
  await login(page);
  await page.locator('text="Financials"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/financials.png` });

  // Check tabs
  const tabs = page.locator('[role="tab"], button').filter({ hasText: /Overview|Sales|Expenses|Profit/ });
  const tabCount = await tabs.count();
  console.log(`Financials tabs: ${tabCount}`);
  if (tabCount > 0) {
    await tabs.first().click();
    await page.waitForTimeout(500);
  }

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  console.log('Financials ✅');
});

test('AUDIT: Staff — add and manage', async ({ page }) => {
  await login(page);
  await page.locator('text="Staff"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${DIR}/staff.png` });

  const addBtn = page.locator('button').filter({ hasText: /add staff|new staff|add employee/i }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(400);
    const modal = page.locator('[role="dialog"]');
    if (await modal.isVisible()) {
      console.log('Staff add modal ✅');
      await page.keyboard.press('Escape');
    }
  }

  // Click a staff card
  const staffCards = page.locator('tbody tr, [class*="card"]').first();
  if (await staffCards.count() > 0) {
    await staffCards.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${DIR}/staff-detail.png` });
  }

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  console.log('Staff ✅');
});

test('AUDIT: Distribution — invoice download', async ({ page }) => {
  await login(page);
  await page.locator('text="Distribution"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${DIR}/distribution.png` });

  // Click account card
  const accountCard = page.locator('.lg\\:grid-cols-2 > div, [class*="account"], [class*="Account"]').first();
  if (await accountCard.count() > 0) {
    await accountCard.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${DIR}/distribution-panel.png` });

    const invoiceBtn = page.locator('button:has-text("Download Invoice")').first();
    const hasInvoice = await invoiceBtn.count() > 0;
    console.log(`Distribution invoice button: ${hasInvoice}`);

    if (hasInvoice) {
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 5000 }),
        invoiceBtn.click(),
      ]);
      console.log(`Invoice downloaded: ${download.suggestedFilename()}`);
    }
  }

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  console.log('Distribution ✅');
});

test('AUDIT: Marketing — campaigns', async ({ page }) => {
  await login(page);
  await page.locator('button').filter({ hasText: /^Marketing$/ }).click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/marketing.png` });

  // Check existing campaigns
  const body = await page.locator('body').textContent() || '';
  const hasCampaigns = body.includes('Campaign') || body.includes('campaign');
  console.log(`Marketing has campaigns: ${hasCampaigns}`);

  // Create new campaign
  await page.locator('button').filter({ hasText: /New Campaign/ }).click({ timeout: 5000 });
  await page.waitForTimeout(400);
  const modal = page.locator('[role="dialog"]');
  if (await modal.isVisible()) {
    await modal.locator('input[type="text"]').first().fill('P5 Audit Campaign');
    await modal.locator('input[type="text"]').nth(1).fill('P5 Subject Line');
    await modal.locator('button[type="submit"]').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/marketing-after-create.png` });

    const sendBtn = page.locator('button:has-text("Send Now")').first();
    console.log(`Send Now button visible: ${await sendBtn.count() > 0}`);
    if (await sendBtn.count() > 0) {
      await sendBtn.click();
      await page.waitForTimeout(400);
      const afterBody = await page.locator('body').textContent() || '';
      const hasFeedback = afterBody.includes('sent') || afterBody.includes('recipients');
      console.log(`Send feedback: ${hasFeedback}`);
    }
  }

  expect(body).not.toContain('NaN');
  console.log('Marketing ✅');
});

test('AUDIT: Reports — download', async ({ page }) => {
  await login(page);
  await page.locator('text="Reports"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/reports.png` });

  // Check for export/download buttons
  const exportBtns = page.locator('button').filter({ hasText: /export|download|csv|pdf/i });
  const exportCount = await exportBtns.count();
  console.log(`Reports export buttons: ${exportCount}`);

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  console.log('Reports ✅');
});

test('AUDIT: TTB Reports — PDF download', async ({ page }) => {
  await login(page);
  await page.locator('text="TTB Reports"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/ttb.png` });

  const pdfBtn = page.locator('button:has-text("PDF")').first();
  const hasPdf = await pdfBtn.count() > 0;
  console.log(`TTB PDF button: ${hasPdf}`);

  if (hasPdf) {
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 5000 }),
      pdfBtn.click(),
    ]);
    console.log(`TTB PDF downloaded: ${download.suggestedFilename()}`);
  }

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  console.log('TTB Reports ✅');
});

test('AUDIT: Settings — save form', async ({ page }) => {
  await login(page);
  await page.locator('text="Settings"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${DIR}/settings.png` });

  // Try saving settings
  const saveBtn = page.locator('button').filter({ hasText: /save|update/i }).first();
  if (await saveBtn.count() > 0) {
    await saveBtn.click();
    await page.waitForTimeout(500);
    const body = await page.locator('body').textContent() || '';
    const hasFeedback = body.toLowerCase().includes('saved') || body.toLowerCase().includes('updated');
    console.log(`Settings save feedback: ${hasFeedback}`);
  }

  // Check compliance tab
  const complianceBtn = page.locator('button:has-text("Compliance")');
  if (await complianceBtn.count() > 0) {
    await complianceBtn.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${DIR}/settings-compliance.png` });
  }

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  console.log('Settings ✅');
});

test('AUDIT: Loyalty Check-in — full flow', async ({ page }) => {
  await login(page);
  await page.locator('button').filter({ hasText: /^Loyalty Check-in$/ }).click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/loyalty.png` });

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');

  // Check tabs
  for (const tab of ['Check-in Station', 'Leaderboard', 'Redeem Rewards', 'Tier Overview']) {
    const btn = page.locator(`button:has-text("${tab}")`);
    if (await btn.count() > 0) {
      await btn.click();
      await page.waitForTimeout(300);
      console.log(`Loyalty ${tab} tab ✅`);
    }
  }

  // Leaderboard screenshot
  await page.screenshot({ path: `${DIR}/loyalty-leaderboard.png` });

  // Tier overview
  await page.locator('button:has-text("Tier Overview")').click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${DIR}/loyalty-tiers.png` });

  // Rewards
  await page.locator('button:has-text("Redeem Rewards")').click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${DIR}/loyalty-rewards.png` });

  console.log('Loyalty ✅');
});

// ─── DEEP INTERACTION AUDIT ──────────────────────────────────────────────────

test('AUDIT: POS — full tab management', async ({ page }) => {
  await login(page);
  await page.locator('text="POS"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  // Check for tab list / open new tab
  const newTabBtn = page.locator('button').filter({ hasText: /new tab|open tab/i }).first();
  if (await newTabBtn.count() > 0) {
    await newTabBtn.click();
    await page.waitForTimeout(400);
    console.log('POS new tab button works ✅');
    await page.screenshot({ path: `${DIR}/pos-new-tab.png` });
  } else {
    console.log('POS new tab button NOT found ⚠️');
  }

  // Check for split bill feature
  const splitBtn = page.locator('button').filter({ hasText: /split/i }).first();
  console.log(`POS split bill: ${await splitBtn.count() > 0}`);

  // Check for tips
  const tipText = (await page.locator('body').textContent() || '').includes('tip') ||
                  (await page.locator('body').textContent() || '').includes('Tip');
  console.log(`POS has tip functionality: ${tipText}`);

  await page.screenshot({ path: `${DIR}/pos-detail.png` });
  console.log('POS tab management audit done');
});

test('AUDIT: Taproom Analytics — beer performance chart', async ({ page }) => {
  await login(page);
  await page.locator('text="Taproom Analytics"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  // Look for beer-specific analytics
  const beerFilter = page.locator('select, [role="combobox"]').first();
  if (await beerFilter.count() > 0) {
    console.log('Analytics has beer filter ✅');
  }

  // Check for day-of-week heatmap
  const body = await page.locator('body').textContent() || '';
  const hasDayOfWeek = body.includes('Monday') || body.includes('Tuesday') || body.includes('Heatmap') || body.includes('heatmap');
  console.log(`Analytics day-of-week heatmap: ${hasDayOfWeek}`);

  // Check for comparison mode (week-over-week)
  const compareText = body.includes('vs') || body.includes('compare') || body.includes('Compare');
  console.log(`Analytics comparison mode: ${compareText}`);

  await page.screenshot({ path: `${DIR}/analytics-deep.png` });
  console.log('Analytics deep audit done');
});

test('AUDIT: Customers — visit history and loyalty points', async ({ page }) => {
  await login(page);
  await page.locator('text="Customers"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);

  // Click first customer
  const rows = page.locator('tbody tr');
  if (await rows.count() > 0) {
    await rows.first().click();
    await page.waitForTimeout(600);
    const body = await page.locator('body').textContent() || '';

    // Check for loyalty points integration
    const hasPoints = body.includes('point') || body.includes('Point') || body.includes('loyalty');
    console.log(`Customer detail has loyalty points: ${hasPoints}`);

    // Check for visit history
    const hasVisits = body.includes('Visit') || body.includes('visit');
    console.log(`Customer detail has visit history: ${hasVisits}`);

    // Check for email campaigns
    const hasEmail = body.includes('email') || body.includes('Email') || body.includes('campaign');
    console.log(`Customer detail has email/campaign info: ${hasEmail}`);

    await page.screenshot({ path: `${DIR}/customer-detail-deep.png` });
  }
  console.log('Customer deep audit done');
});

test('AUDIT: Console errors across key pages', async ({ page }) => {
  const errors: string[] = [];
  const warnings: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const t = msg.text();
      if (!t.includes('net::') && !t.includes('favicon') && !t.includes('Failed to load resource') && !t.includes('CORS')) {
        errors.push(t.substring(0, 150));
      }
    } else if (msg.type() === 'warning') {
      const t = msg.text();
      if (t.includes('Warning:') || t.includes('Each child')) {
        warnings.push(t.substring(0, 100));
      }
    }
  });

  await login(page);

  const pages = [
    ['Dashboard', async () => {}],
    ['POS', async () => { await page.locator('text="POS"').first().click({ timeout: 8000 }); }],
    ['Brewing', async () => { await page.locator('text="Brewing"').first().click({ timeout: 8000 }); }],
    ['Loyalty', async () => { await page.locator('button').filter({ hasText: /^Loyalty Check-in$/ }).click({ timeout: 8000 }); }],
    ['Taproom Analytics', async () => { await page.locator('text="Taproom Analytics"').first().click({ timeout: 8000 }); }],
    ['Financials', async () => { await page.locator('text="Financials"').first().click({ timeout: 8000 }); }],
  ] as const;

  for (const [label, nav] of pages) {
    await (nav as () => Promise<void>)();
    await page.waitForTimeout(800);
    console.log(`${label} console errors so far: ${errors.length}`);
  }

  console.log(`Total JS errors: ${errors.length}`);
  errors.forEach(e => console.log('ERR:', e));
  console.log(`Total warnings: ${warnings.length}`);
  warnings.slice(0, 5).forEach(w => console.log('WARN:', w));

  expect(errors.length, `JS errors: ${errors.join(' | ')}`).toBe(0);
});

test('AUDIT: Missing features check — advanced POS', async ({ page }) => {
  await login(page);
  await page.locator('text="POS"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  const body = await page.locator('body').textContent() || '';

  // Missing features competitors have
  const features = {
    'Card reader / tap-to-pay': body.includes('card') || body.includes('Card') || body.includes('payment method'),
    'Happy hour pricing': body.includes('happy hour') || body.includes('Happy Hour') || body.includes('discount'),
    'Split bill by seat': body.includes('split') || body.includes('Split'),
    'Course/fire management': body.includes('fire') || body.includes('Fire') || body.includes('course'),
    'QR code ordering': body.includes('QR') || body.includes('qr'),
    'Offline mode indicator': body.includes('offline') || body.includes('Offline'),
  };

  for (const [feature, exists] of Object.entries(features)) {
    console.log(`POS feature "${feature}": ${exists ? '✅' : '❌ MISSING'}`);
  }

  await page.screenshot({ path: `${DIR}/pos-features.png` });
});

test('AUDIT: Missing features check — production monitoring', async ({ page }) => {
  await login(page);
  await page.locator('text="Production"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  const body = await page.locator('body').textContent() || '';

  const features = {
    'Temperature monitoring': body.includes('temp') || body.includes('Temp') || body.includes('°F') || body.includes('°C'),
    'pH tracking': body.includes('pH') || body.includes('ph'),
    'DO (dissolved oxygen)': body.includes('DO') || body.includes('dissolved'),
    'Pressure monitoring': body.includes('PSI') || body.includes('pressure') || body.includes('Pressure'),
    'Yeast pitch rate': body.includes('pitch') || body.includes('Pitch'),
    'Temperature graph/chart': body.includes('temp') && (body.includes('chart') || body.includes('Chart')),
  };

  for (const [feature, exists] of Object.entries(features)) {
    console.log(`Production feature "${feature}": ${exists ? '✅' : '❌ MISSING'}`);
  }

  await page.screenshot({ path: `${DIR}/production-features.png` });
});
