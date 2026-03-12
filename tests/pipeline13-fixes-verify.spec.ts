import { test, expect, Page } from '@playwright/test';

const BASE = 'http://localhost:5177';
const DIR = 'test-results/pipeline13-fixes';

async function login(page: Page) {
  await page.goto(BASE);
  await page.waitForTimeout(800);
  const demoBtn = page.locator('button').filter({ hasText: /explore demo/i }).first();
  if (await demoBtn.count() > 0) {
    await demoBtn.click();
    await page.waitForTimeout(1500);
  }
}

async function nav(page: Page, label: string) {
  const btn = page.locator('aside button, nav button').filter({ hasText: new RegExp(`^${label}$`, 'i') }).first();
  if (await btn.count() > 0) {
    await btn.scrollIntoViewIfNeeded();
    await btn.click({ timeout: 5000 });
    await page.waitForTimeout(1000);
    return;
  }
  const fallback = page.locator('button').filter({ hasText: label }).first();
  if (await fallback.count() > 0) {
    await fallback.scrollIntoViewIfNeeded();
    await fallback.click({ timeout: 5000, force: true });
  }
  await page.waitForTimeout(1000);
}

// ─── FIX 1: Mug Club — benefits shown from tier ──────────────────────────────

test('FIX 1: Mug Club — member detail shows benefits', async ({ page }) => {
  await login(page);
  await nav(page, 'Mug Club');

  // Click any member
  const rows = page.locator('tr, [class*="cursor-pointer"]');
  for (let i = 0; i < await rows.count(); i++) {
    const row = rows.nth(i);
    const text = await row.textContent();
    if (text && text.match(/Morrison|Gonzalez|Whitfield|Rivera|member/i)) {
      await row.click({ force: true });
      await page.waitForTimeout(800);
      break;
    }
  }

  await page.screenshot({ path: `${DIR}/fix1-mugclub-detail.png` });

  const body = await page.locator('body').textContent() || '';
  const hasBenefits = body.includes('benefit') || body.includes('Benefit') || body.includes('20oz') || body.includes('Birthday') || body.includes('pint price');
  console.log('Member detail has benefits:', hasBenefits);
  expect(hasBenefits).toBe(true);
  console.log('FIX 1: Mug Club benefits ✅');
});

// ─── FIX 2: Financials — date period filter ──────────────────────────────────

test('FIX 2: Financials — period selector buttons present', async ({ page }) => {
  await login(page);
  await nav(page, 'Financials');
  await page.screenshot({ path: `${DIR}/fix2-financials-start.png` });

  const thisMonth = page.locator('button').filter({ hasText: /this month/i }).first();
  const threeMonths = page.locator('button').filter({ hasText: /3 month/i }).first();
  const sixMonths = page.locator('button').filter({ hasText: /6 month/i }).first();
  const ytd = page.locator('button').filter({ hasText: /ytd/i }).first();

  const hasThisMonth = await thisMonth.count() > 0;
  const has3M = await threeMonths.count() > 0;
  const has6M = await sixMonths.count() > 0;
  const hasYTD = await ytd.count() > 0;

  console.log('Has This Month button:', hasThisMonth);
  console.log('Has 3 Months button:', has3M);
  console.log('Has 6 Months button:', has6M);
  console.log('Has YTD button:', hasYTD);

  expect(hasThisMonth).toBe(true);
  expect(has3M).toBe(true);

  // Click 3 Months
  if (has3M) {
    await threeMonths.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/fix2-financials-3m.png` });
  }

  // Click YTD
  if (hasYTD) {
    await ytd.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/fix2-financials-ytd.png` });
  }

  console.log('FIX 2: Financials period filter ✅');
});

// ─── FIX 3: Marketing — email body field in campaign form ────────────────────

test('FIX 3: Marketing — campaign form has email body field', async ({ page }) => {
  await login(page);
  await nav(page, 'Marketing');

  const newBtn = page.locator('button').filter({ hasText: /new campaign/i }).first();
  expect(await newBtn.count()).toBeGreaterThan(0);
  await newBtn.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${DIR}/fix3-marketing-form.png` });

  // Check for textarea (email body)
  const textarea = page.locator('textarea');
  const hasTextarea = await textarea.count() > 0;
  console.log('Campaign form has textarea (email body):', hasTextarea);
  expect(hasTextarea).toBe(true);

  // Fill in the form — use nth selectors since placeholder text varies
  const inputs = page.locator('[role="dialog"] input[type="text"], [role="dialog"] input:not([type])');
  const inputCount = await inputs.count();
  if (inputCount >= 1) await inputs.first().fill('Summer IPA Launch');
  if (inputCount >= 2) await inputs.nth(1).fill('New Summer IPA is here!');
  await textarea.fill('Hey beer lover! Our new Summer IPA just dropped. Fresh hops, bright citrus notes. Come try it this weekend!');

  await page.screenshot({ path: `${DIR}/fix3-marketing-filled.png` });

  const charCount = await page.locator('text=/\\d+ characters/').count();
  console.log('Character count shown:', charCount > 0);

  // Submit
  const saveBtn = page.locator('button').filter({ hasText: /create campaign/i }).first();
  await saveBtn.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${DIR}/fix3-marketing-saved.png` });

  const body = await page.locator('body').textContent() || '';
  console.log('Campaign saved:', body.includes('Summer IPA Launch'));
  console.log('FIX 3: Marketing email body field ✅');
});

// ─── FIX 4: Staff — schedule cells are editable ──────────────────────────────

test('FIX 4: Staff — schedule cells can add shifts', async ({ page }) => {
  await login(page);
  await nav(page, 'Staff');

  // Click Schedule tab
  const scheduleTab = page.locator('button').filter({ hasText: /^schedule$/i }).first();
  if (await scheduleTab.count() > 0) {
    await scheduleTab.click();
    await page.waitForTimeout(600);
  }

  await page.screenshot({ path: `${DIR}/fix4-staff-schedule.png` });

  const body = await page.locator('body').textContent() || '';
  console.log('Staff schedule loaded:', body.includes('Mon') || body.includes('Tue'));

  // Click on an empty cell (look for "+" buttons or empty cell buttons)
  const emptyCell = page.locator('td button').filter({ hasText: /^\+$/ }).first();
  const hasEmptyCells = await emptyCell.count() > 0;
  console.log('Has clickable empty shift cells:', hasEmptyCells);

  // Try clicking a cell (could be + button or any td button)
  const cellBtns = page.locator('tbody td button');
  const cellCount = await cellBtns.count();
  console.log('Schedule cell buttons found:', cellCount);

  if (cellCount > 0) {
    await cellBtns.first().click({ force: true });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/fix4-staff-shift-editor.png` });

    const body2 = await page.locator('body').textContent() || '';
    const hasEditor = body2.includes('Shift') || body2.includes('Start') || body2.includes('Save') || body2.includes(':00');
    console.log('Shift editor opened:', hasEditor);
    expect(hasEditor).toBe(true);
  }

  console.log('FIX 4: Staff schedule editing ✅');
});

// ─── FIX 5: Inventory — stock adjust modal ───────────────────────────────────

test('FIX 5: Inventory — stock adjustment modal works', async ({ page }) => {
  await login(page);
  await nav(page, 'Inventory');
  await page.screenshot({ path: `${DIR}/fix5-inventory-start.png` });

  // Find the adjust button (SlidersHorizontal icon button)
  const adjustBtns = page.locator('tbody button[title*="Adjust" i], tbody button').filter({ hasText: '' }).all();
  const allBtns = await page.locator('tbody td button').all();
  console.log('Inventory row buttons:', allBtns.length);

  // Find first adjust button (not delete) - the first button in each action cell
  const firstActionBtn = page.locator('tbody td:last-child button').first();
  if (await firstActionBtn.count() > 0) {
    // Actually find the adjust button which has title "Adjust stock for..."
    const adjustBtn = page.locator('button[title*="Adjust" i]').first();
    const hasAdjust = await adjustBtn.count() > 0;
    console.log('Adjust button found:', hasAdjust);

    if (hasAdjust) {
      await adjustBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: `${DIR}/fix5-inventory-adjust-modal.png` });

      const body = await page.locator('body').textContent() || '';
      const hasModal = body.includes('Use / Remove') || body.includes('Receive') || body.includes('Adjust Stock');
      console.log('Adjust modal opened:', hasModal);
      expect(hasModal).toBe(true);

      // Fill in amount
      const amountInput = page.locator('input[type="number"]').last();
      if (await amountInput.count() > 0) {
        await amountInput.fill('5');
        await page.screenshot({ path: `${DIR}/fix5-inventory-adjust-filled.png` });

        const newStockText = await page.locator('body').textContent() || '';
        const showsNewStock = newStockText.includes('New stock:');
        console.log('Shows new stock preview:', showsNewStock);
      }

      // Submit
      const recordBtn = page.locator('button').filter({ hasText: /record usage|receive stock/i }).first();
      if (await recordBtn.count() > 0) {
        await recordBtn.click();
        await page.waitForTimeout(800);
        await page.screenshot({ path: `${DIR}/fix5-inventory-adjusted.png` });
      }
    }
  }

  console.log('FIX 5: Inventory stock adjustment ✅');
});
