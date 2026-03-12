import { test, expect, Page } from '@playwright/test';

const BASE = 'http://localhost:5177';
const DIR = 'test-results/pipeline14-audit';

async function login(page: Page) {
  await page.goto(BASE);
  await page.waitForTimeout(1000);
  const demoBtn = page.locator('button').filter({ hasText: /explore demo/i }).first();
  if (await demoBtn.count() > 0) {
    await demoBtn.click();
    await page.waitForTimeout(2000);
  }
}

async function nav(page: Page, label: string) {
  const btn = page.locator('aside button').filter({ hasText: new RegExp(label, 'i') }).first();
  if (await btn.count() > 0) {
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForTimeout(1200);
    return true;
  }
  return false;
}

// ── TAPROOM ──────────────────────────────────────────────────────────────────

test('AUDIT: POS — tab management & order flow', async ({ page }) => {
  await login(page);
  await nav(page, 'POS');
  await page.screenshot({ path: `${DIR}/pos-start.png` });

  const body = await page.locator('body').textContent() || '';
  console.log('POS has tabs:', body.includes('Open Tab') || body.includes('Tab'));
  console.log('POS has beers:', body.includes('TAP') || body.includes('Draft'));

  // Click a beer to add to order
  const beerCard = page.locator('[class*="cursor-pointer"], button').filter({ hasText: /TAP|IPA|Lager|Porter/i }).first();
  if (await beerCard.count() > 0) {
    await beerCard.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${DIR}/pos-item-added.png` });
    const body2 = await page.locator('body').textContent() || '';
    console.log('Item added to order:', body2.includes('Subtotal') || body2.includes('$7'));
  }

  // Try applying a discount
  const discountBtn = page.locator('button').filter({ hasText: /discount/i }).first();
  if (await discountBtn.count() > 0) {
    await discountBtn.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${DIR}/pos-discount.png` });
    const discountBody = await page.locator('body').textContent() || '';
    console.log('Discount modal/input exists:', discountBody.includes('%') || discountBody.includes('Discount'));
    // Close if modal opened
    const closeBtn = page.locator('[role="dialog"] button').filter({ hasText: /cancel|close|×/i }).first();
    if (await closeBtn.count() > 0) await closeBtn.click();
  } else {
    console.log('BUG: No Discount button found on POS');
  }

  // Check payment flow
  const closeTabBtn = page.locator('button').filter({ hasText: /close tab/i }).first();
  if (await closeTabBtn.count() > 0) {
    await closeTabBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${DIR}/pos-close-tab.png` });
    const payBody = await page.locator('body').textContent() || '';
    console.log('Payment screen has tip UI:', payBody.includes('tip') || payBody.includes('Tip') || payBody.includes('gratuity'));
    console.log('Payment screen has split:', payBody.includes('split') || payBody.includes('Split'));
    const cancelPay = page.locator('button').filter({ hasText: /cancel|back/i }).first();
    if (await cancelPay.count() > 0) await cancelPay.click();
  }

  // Try creating new tab
  const newTabBtn = page.locator('button').filter({ hasText: /new tab/i }).first();
  if (await newTabBtn.count() > 0) {
    await newTabBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/pos-new-tab.png` });
    const cancelNew = page.locator('[role="dialog"] button').filter({ hasText: /cancel/i }).first();
    if (await cancelNew.count() > 0) await cancelNew.click();
  }

  console.log('POS audit done');
});

test('AUDIT: Floor Plan — table interactions', async ({ page }) => {
  await login(page);
  await nav(page, 'Floor Plan');
  await page.screenshot({ path: `${DIR}/floor-start.png` });

  const body = await page.locator('body').textContent() || '';
  console.log('Floor plan has tables:', body.includes('Table') || body.includes('P1'));
  console.log('Floor plan has alerts:', body.includes('Alert') || body.includes('alert'));

  // Click a table
  const table = page.locator('button, [class*="cursor"]').filter({ hasText: /P\d|T\d|table/i }).first();
  if (await table.count() > 0) {
    await table.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/floor-table-clicked.png` });
    const tableBody = await page.locator('body').textContent() || '';
    console.log('Table detail visible:', tableBody.includes('Seat') || tableBody.includes('seat') || tableBody.includes('status'));
    const closeBtn = page.locator('[role="dialog"] button').filter({ hasText: /close|cancel/i }).first();
    if (await closeBtn.count() > 0) await closeBtn.click();
  }
  console.log('Floor Plan audit done');
});

// ── GUESTS ───────────────────────────────────────────────────────────────────

test('AUDIT: Customers — detail panel & history', async ({ page }) => {
  await login(page);
  await nav(page, 'Customers');
  await page.screenshot({ path: `${DIR}/customers-start.png` });

  // Click a customer
  const customerRow = page.locator('tr, [class*="cursor"]').filter({ hasText: /Morrison|Gonzalez|Rivera|customer/i }).first();
  if (await customerRow.count() > 0) {
    await customerRow.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${DIR}/customers-detail.png` });
    const detailBody = await page.locator('body').textContent() || '';
    console.log('Customer detail has history:', detailBody.includes('Visit') || detailBody.includes('Order') || detailBody.includes('history'));
    console.log('Customer detail has notes:', detailBody.includes('Note') || detailBody.includes('note'));
    console.log('Customer detail has spend:', detailBody.includes('Total') || detailBody.includes('spend') || detailBody.includes('$'));
  }

  // Try adding a customer
  const addBtn = page.locator('button').filter({ hasText: /add customer|new customer/i }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/customers-add-modal.png` });
    const inputs = page.locator('[role="dialog"] input');
    const inputCount = await inputs.count();
    console.log('Add customer form inputs:', inputCount);
    if (inputCount > 0) await inputs.first().fill('Test Customer Pipeline14');
    await page.screenshot({ path: `${DIR}/customers-add-filled.png` });
    const saveBtn = page.locator('[role="dialog"] button').filter({ hasText: /save|add|create/i }).first();
    if (await saveBtn.count() > 0) {
      await saveBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${DIR}/customers-added.png` });
      const saved = await page.locator('body').textContent() || '';
      console.log('Customer saved:', saved.includes('Pipeline14') || saved.includes('Test Customer'));
    } else {
      console.log('BUG: No save button in add customer form');
    }
  }
  console.log('Customers audit done');
});

test('AUDIT: Mug Club — add member flow', async ({ page }) => {
  await login(page);
  await nav(page, 'Mug Club');
  await page.screenshot({ path: `${DIR}/mugclub-start.png` });

  const addBtn = page.locator('button').filter({ hasText: /add member/i }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/mugclub-add.png` });
    const dialog = page.locator('[role="dialog"]');
    const inputs = dialog.locator('input');
    console.log('Add member form inputs:', await inputs.count());
    if (await inputs.count() > 0) {
      await inputs.first().fill('Pipeline14 Test');
    }
    const saveBtn = dialog.locator('button').filter({ hasText: /save|add|create/i }).first();
    if (await saveBtn.count() > 0) {
      await saveBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${DIR}/mugclub-added.png` });
    }
  }
  console.log('Mug Club audit done');
});

test('AUDIT: Beer Ratings — log rating flow', async ({ page }) => {
  await login(page);
  await nav(page, 'Beer Ratings');
  await page.screenshot({ path: `${DIR}/ratings-start.png` });

  // Log a rating
  const logBtn = page.locator('button').filter({ hasText: /log rating/i }).first();
  if (await logBtn.count() > 0) {
    await logBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/ratings-modal.png` });
    const dialog = page.locator('[role="dialog"]');
    const inputs = dialog.locator('input');
    if (await inputs.count() > 0) await inputs.first().fill('John Tester');
    // pick stars
    const starBtns = dialog.locator('button').filter({ has: page.locator('[class*="star"], svg') });
    if (await starBtns.count() >= 4) await starBtns.nth(4).click();
    await page.screenshot({ path: `${DIR}/ratings-filled.png` });
    const saveBtn = dialog.locator('button').filter({ hasText: /save|log|submit/i }).first();
    if (await saveBtn.count() > 0) {
      await saveBtn.click();
      await page.waitForTimeout(600);
    } else {
      console.log('BUG: No save button in log rating modal');
      const cancelBtn = dialog.locator('button').filter({ hasText: /cancel/i }).first();
      if (await cancelBtn.count() > 0) await cancelBtn.click();
    }
  }
  console.log('Beer Ratings audit done');
});

test('AUDIT: Reservations — create reservation', async ({ page }) => {
  await login(page);
  await nav(page, 'Reservations');
  await page.screenshot({ path: `${DIR}/reservations-start.png` });

  const body = await page.locator('body').textContent() || '';
  console.log('Reservations has calendar:', body.includes('calendar') || body.includes('Calendar') || body.includes('Date'));

  const addBtn = page.locator('button').filter({ hasText: /new reservation|add reservation|book/i }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/reservations-modal.png` });
    const dialog = page.locator('[role="dialog"]');
    const inputs = dialog.locator('input');
    console.log('Reservation form inputs:', await inputs.count());
    if (await inputs.count() > 0) await inputs.first().fill('Pipeline14 Guest');
    const saveBtn = dialog.locator('button').filter({ hasText: /save|book|create/i }).first();
    if (await saveBtn.count() > 0) {
      await saveBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${DIR}/reservations-saved.png` });
    }
  }
  console.log('Reservations audit done');
});

// ── BREWERY ───────────────────────────────────────────────────────────────────

test('AUDIT: Taps — assign beer to tap', async ({ page }) => {
  await login(page);
  await nav(page, 'Tap Management');
  await page.screenshot({ path: `${DIR}/taps-start.png` });

  const body = await page.locator('body').textContent() || '';
  console.log('Taps page has tap list:', body.includes('TAP') || body.includes('Tap'));

  // Try clicking a tap to edit
  const tapCard = page.locator('[class*="cursor-pointer"], button').filter({ hasText: /TAP \d/i }).first();
  if (await tapCard.count() > 0) {
    await tapCard.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${DIR}/taps-edit.png` });
    const tapBody = await page.locator('body').textContent() || '';
    console.log('Tap edit dialog open:', tapBody.includes('Assign') || tapBody.includes('Beer') || tapBody.includes('Select'));
    const closeBtn = page.locator('[role="dialog"] button').filter({ hasText: /cancel|close/i }).first();
    if (await closeBtn.count() > 0) await closeBtn.click();
  }
  console.log('Taps audit done');
});

test('AUDIT: Brewing — batch pipeline interactions', async ({ page }) => {
  await login(page);
  await nav(page, 'Brewing');
  await page.screenshot({ path: `${DIR}/brewing-start.png` });

  const body = await page.locator('body').textContent() || '';
  console.log('Brewing has batches:', body.includes('Batch') || body.includes('batch'));
  console.log('Brewing has status:', body.includes('fermenting') || body.includes('conditioning') || body.includes('Active'));

  // Try advancing a batch
  const advanceBtn = page.locator('button').filter({ hasText: /advance|next stage|move/i }).first();
  if (await advanceBtn.count() > 0) {
    await advanceBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/brewing-advanced.png` });
    const cancelBtn = page.locator('[role="dialog"] button').filter({ hasText: /cancel/i }).first();
    if (await cancelBtn.count() > 0) await cancelBtn.click();
  } else {
    console.log('No advance button on brewing page');
  }
  console.log('Brewing audit done');
});

test('AUDIT: Recipe Lab — add/edit recipe', async ({ page }) => {
  await login(page);
  await nav(page, 'Recipe Lab');
  await page.screenshot({ path: `${DIR}/recipes-start.png` });

  const addBtn = page.locator('button').filter({ hasText: /new recipe|add recipe/i }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${DIR}/recipes-new.png` });
    const dialog = page.locator('[role="dialog"]');
    const inputs = dialog.locator('input[type="text"], input:not([type])');
    console.log('Recipe form text inputs:', await inputs.count());
    if (await inputs.count() > 0) await inputs.first().fill('Pipeline14 Test IPA');
    await page.screenshot({ path: `${DIR}/recipes-filled.png` });
    const saveBtn = dialog.locator('button').filter({ hasText: /save|create/i }).first();
    if (await saveBtn.count() > 0) {
      await saveBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: `${DIR}/recipes-saved.png` });
      const saved = await page.locator('body').textContent() || '';
      console.log('Recipe saved:', saved.includes('Pipeline14'));
    } else {
      console.log('BUG: No save in recipe form');
      const cancelBtn = dialog.locator('button').filter({ hasText: /cancel/i }).first();
      if (await cancelBtn.count() > 0) await cancelBtn.click();
    }
  }
  console.log('Recipe Lab audit done');
});

test('AUDIT: Keg Tracking — keg fill/transfer', async ({ page }) => {
  await login(page);
  await nav(page, 'Keg Tracking');
  await page.screenshot({ path: `${DIR}/kegs-start.png` });

  const body = await page.locator('body').textContent() || '';
  console.log('Kegs has keg list:', body.includes('keg') || body.includes('Keg'));
  console.log('Kegs has status:', body.includes('Full') || body.includes('Empty') || body.includes('taproom'));

  // Try adding keg
  const addBtn = page.locator('button').filter({ hasText: /add keg|new keg/i }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/kegs-add.png` });
    const cancelBtn = page.locator('[role="dialog"] button').filter({ hasText: /cancel/i }).first();
    if (await cancelBtn.count() > 0) await cancelBtn.click();
    console.log('Keg add modal: works');
  }
  console.log('Keg Tracking audit done');
});

// ── OPERATIONS ────────────────────────────────────────────────────────────────

test('AUDIT: Inventory — add item & adjust stock', async ({ page }) => {
  await login(page);
  await nav(page, 'Inventory');
  await page.screenshot({ path: `${DIR}/inventory-start.png` });

  // Test Adjust button
  const adjustBtn = page.locator('button[title*="Adjust" i]').first();
  if (await adjustBtn.count() > 0) {
    await adjustBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/inventory-adjust.png` });
    const adjustBody = await page.locator('body').textContent() || '';
    console.log('Adjust modal opened:', adjustBody.includes('Receive') || adjustBody.includes('Use'));
    // Fill amount
    const amtInput = page.locator('[role="dialog"] input[type="number"]').first();
    if (await amtInput.count() > 0) {
      await amtInput.fill('10');
      await page.screenshot({ path: `${DIR}/inventory-adjust-filled.png` });
    }
    const closeBtn = page.locator('[role="dialog"] button').filter({ hasText: /cancel/i }).first();
    if (await closeBtn.count() > 0) await closeBtn.click();
  }
  console.log('Inventory audit done');
});

test('AUDIT: Events — create event', async ({ page }) => {
  await login(page);
  await nav(page, 'Events');
  await page.screenshot({ path: `${DIR}/events-start.png` });

  const addBtn = page.locator('button').filter({ hasText: /new event|add event|create event/i }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/events-form.png` });
    const dialog = page.locator('[role="dialog"]');
    const inputs = dialog.locator('input[type="text"], input:not([type])');
    console.log('Event form text inputs:', await inputs.count());
    if (await inputs.count() > 0) await inputs.first().fill('Pipeline14 Live Music');
    const saveBtn = dialog.locator('button').filter({ hasText: /save|create|add/i }).first();
    if (await saveBtn.count() > 0) {
      await saveBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${DIR}/events-saved.png` });
      const saved = await page.locator('body').textContent() || '';
      console.log('Event saved:', saved.includes('Pipeline14'));
    } else {
      console.log('BUG: No save in event form');
      const cancelBtn = dialog.locator('button').filter({ hasText: /cancel/i }).first();
      if (await cancelBtn.count() > 0) await cancelBtn.click();
    }
  }
  console.log('Events audit done');
});

// ── MARKETING ─────────────────────────────────────────────────────────────────

test('AUDIT: Marketing — campaign create', async ({ page }) => {
  await login(page);
  await nav(page, 'Marketing');
  await page.screenshot({ path: `${DIR}/marketing-start.png` });

  const newBtn = page.locator('button').filter({ hasText: /new campaign/i }).first();
  if (await newBtn.count() > 0) {
    await newBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/marketing-form.png` });
    const dialog = page.locator('[role="dialog"]');
    const inputs = dialog.locator('input[type="text"], input:not([type])');
    console.log('Campaign form inputs:', await inputs.count());
    if (await inputs.count() > 0) await inputs.first().fill('Pipeline14 Campaign');
    const textarea = dialog.locator('textarea');
    if (await textarea.count() > 0) {
      await textarea.fill('Test email body for pipeline 14.');
      console.log('Email body textarea: works');
    } else {
      console.log('BUG: No email body textarea in campaign form');
    }
    const saveBtn = dialog.locator('button').filter({ hasText: /create campaign|save/i }).first();
    if (await saveBtn.count() > 0) {
      await saveBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${DIR}/marketing-saved.png` });
      const saved = await page.locator('body').textContent() || '';
      console.log('Campaign saved:', saved.includes('Pipeline14'));
    }
  }
  console.log('Marketing audit done');
});

// ── FINANCE / MGMT ────────────────────────────────────────────────────────────

test('AUDIT: Financials — period filter & P&L', async ({ page }) => {
  await login(page);
  await nav(page, 'Financials');
  await page.screenshot({ path: `${DIR}/financials-start.png` });

  const body = await page.locator('body').textContent() || '';
  console.log('Has period selector:', body.includes('This Month') || body.includes('3 Months'));
  console.log('Has P&L tab:', body.includes('P&L'));

  // Click 3 Months
  const threeM = page.locator('button').filter({ hasText: /3 month/i }).first();
  if (await threeM.count() > 0) {
    await threeM.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/financials-3m.png` });
  }

  // Click P&L tab
  const plTab = page.locator('button').filter({ hasText: /p&l/i }).first();
  if (await plTab.count() > 0) {
    await plTab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/financials-pl.png` });
    const plBody = await page.locator('body').textContent() || '';
    console.log('P&L has data:', plBody.includes('Revenue') || plBody.includes('Expense') || plBody.includes('Profit'));
  }
  console.log('Financials audit done');
});

test('AUDIT: Staff — schedule editing', async ({ page }) => {
  await login(page);
  await nav(page, 'Staff');
  await page.screenshot({ path: `${DIR}/staff-start.png` });

  const scheduleTab = page.locator('button').filter({ hasText: /schedule/i }).first();
  if (await scheduleTab.count() > 0) {
    await scheduleTab.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${DIR}/staff-schedule.png` });
    const schedBody = await page.locator('body').textContent() || '';
    console.log('Schedule has days:', schedBody.includes('Mon') || schedBody.includes('Tue'));

    // Click a cell
    const cellBtns = page.locator('tbody td button');
    if (await cellBtns.count() > 0) {
      await cellBtns.first().click({ force: true });
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${DIR}/staff-shift-editor.png` });
      const editorBody = await page.locator('body').textContent() || '';
      console.log('Shift editor opened:', editorBody.includes('Start') || editorBody.includes('Save') || editorBody.includes(':00'));
      const saveShift = page.locator('button').filter({ hasText: /save/i }).first();
      if (await saveShift.count() > 0) await saveShift.click();
    }
  }
  console.log('Staff audit done');
});

test('AUDIT: Distribution — wholesaler account detail', async ({ page }) => {
  await login(page);
  await nav(page, 'Distribution');
  await page.screenshot({ path: `${DIR}/distribution-start.png` });

  const body = await page.locator('body').textContent() || '';
  console.log('Distribution has accounts:', body.includes('Account') || body.includes('Wholesale'));

  // Click an account
  const acct = page.locator('tr, [class*="cursor"]').filter({ hasText: /brewery|distribut|wholesale/i }).first();
  if (await acct.count() > 0) {
    await acct.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${DIR}/distribution-detail.png` });
  }
  console.log('Distribution audit done');
});

test('AUDIT: Settings — update business info', async ({ page }) => {
  await login(page);
  await nav(page, 'Settings');
  await page.screenshot({ path: `${DIR}/settings-start.png` });

  const body = await page.locator('body').textContent() || '';
  console.log('Settings has business fields:', body.includes('Business') || body.includes('brewery'));

  // Try editing a field
  const inputs = page.locator('input[type="text"], input:not([type])');
  const inputCount = await inputs.count();
  console.log('Settings text inputs:', inputCount);

  // Look for save button
  const saveBtn = page.locator('button').filter({ hasText: /save|update/i }).first();
  console.log('Settings has save button:', await saveBtn.count() > 0);
  console.log('Settings audit done');
});

test('AUDIT: Reports — filter & export', async ({ page }) => {
  await login(page);
  await nav(page, 'Reports');
  await page.screenshot({ path: `${DIR}/reports-start.png` });

  const body = await page.locator('body').textContent() || '';
  console.log('Reports has date filters:', body.includes('Date') || body.includes('filter') || body.includes('Filter'));
  console.log('Reports has export:', body.includes('Export') || body.includes('export') || body.includes('CSV'));

  // Try clicking a report type
  const reportBtns = page.locator('button').filter({ hasText: /sales|revenue|staff|inventory/i });
  const count = await reportBtns.count();
  console.log('Report type buttons:', count);
  if (count > 0) {
    await reportBtns.first().click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/reports-filtered.png` });
  }
  console.log('Reports audit done');
});

// ── FEATURE GAPS (competitor check) ───────────────────────────────────────────

test('AUDIT: Feature gaps vs competitors', async ({ page }) => {
  await login(page);

  // Check dashboard for live metrics / real-time data
  await nav(page, 'Dashboard');
  await page.screenshot({ path: `${DIR}/dashboard.png` });
  const dashBody = await page.locator('body').textContent() || '';
  console.log('Dashboard has real-time indicator:', dashBody.includes('live') || dashBody.includes('Live') || dashBody.includes('●'));
  console.log('Dashboard has today revenue:', dashBody.includes("Today") && dashBody.includes('$'));

  // Check if there's a distributor portal / order portal
  const distBtn = page.locator('aside button').filter({ hasText: /distribut/i }).first();
  console.log('Has distribution page:', await distBtn.count() > 0);

  // Check TTB compliance
  const ttbBtn = page.locator('aside button').filter({ hasText: /TTB/i }).first();
  console.log('Has TTB reports:', await ttbBtn.count() > 0);

  // Check social integration (Untappd)
  const untappdLink = page.locator('a, button').filter({ hasText: /untappd|social/i }).first();
  console.log('Has Untappd/social integration:', await untappdLink.count() > 0);

  // Check mobile ordering (Arryved)
  const mobileOrder = page.locator('button, a').filter({ hasText: /mobile order|QR order/i }).first();
  console.log('Has mobile ordering:', await mobileOrder.count() > 0);

  // Check batch costing (Breww)
  const costBtn = page.locator('aside button').filter({ hasText: /cost|brew cost/i }).first();
  console.log('Has brew cost lab:', await costBtn.count() > 0);

  // Check fermentation monitoring
  const fermentBtn = page.locator('aside button').filter({ hasText: /ferment/i }).first();
  console.log('Has fermentation monitoring:', await fermentBtn.count() > 0);

  // Check if production page has tank monitoring
  await nav(page, 'Production');
  await page.screenshot({ path: `${DIR}/production.png` });
  const prodBody = await page.locator('body').textContent() || '';
  console.log('Production has tank monitoring:', prodBody.includes('Tank') || prodBody.includes('fermenter'));
  console.log('Production has real-time temps:', prodBody.includes('temp') || prodBody.includes('°F') || prodBody.includes('°C'));

  // Check keg monitor
  await nav(page, 'Keg Monitor');
  await page.screenshot({ path: `${DIR}/keg-monitor.png` });
  const kegBody = await page.locator('body').textContent() || '';
  console.log('Keg Monitor has flow/pressure:', kegBody.includes('flow') || kegBody.includes('pressure') || kegBody.includes('PSI'));
  console.log('Keg Monitor has predictive alerts:', kegBody.includes('days') || kegBody.includes('low') || kegBody.includes('alert'));

  console.log('Feature gap audit done');
});

test('AUDIT: Console errors sweep', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await login(page);

  const pageList = ['Dashboard', 'POS', 'Customers', 'Mug Club', 'Beer Ratings', 'Tap Management', 'Brewing', 'Recipe Lab', 'Keg Tracking', 'Inventory', 'Financials', 'Marketing', 'Staff'];
  for (const p of pageList) {
    await nav(page, p);
  }

  console.log('Total console errors:', errors.length);
  if (errors.length > 0) {
    console.log('Errors:', errors.slice(0, 10).join('\n'));
  }
  console.log('Console sweep done');
});
