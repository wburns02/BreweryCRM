import { test, Page } from '@playwright/test';

const BASE = 'http://localhost:5177';
const DIR = 'test-results/pipeline14-bugs';

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
  }
}

// BUG 1: Brew Cost Lab NaN
test('BUG 1: Brew Cost Lab NaN investigation', async ({ page }) => {
  await login(page);
  await nav(page, 'Brew Cost Lab');
  await page.screenshot({ path: `${DIR}/brew-cost-nan.png` });

  const body = await page.locator('body').textContent() || '';
  const hasNaN = body.includes('NaN');
  console.log('Has NaN values:', hasNaN);

  // Check specific values
  const kpiValues = await page.locator('.text-2xl, .text-xl, [class*="font-bold"]').allTextContents();
  const nanValues = kpiValues.filter(v => v.includes('NaN'));
  console.log('NaN values found:', nanValues.length, '->', nanValues.slice(0, 5));

  // Expand first recipe to see ingredients
  const firstRow = page.locator('[class*="border"][class*="rounded"]').first();
  await firstRow.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/brew-cost-expanded.png` });
  const expandedBody = await page.locator('body').textContent() || '';
  console.log('Expanded recipe has cost data:', expandedBody.includes('$/unit') || expandedBody.includes('Total'));
  console.log('Expanded recipe has NaN:', expandedBody.includes('NaN'));
});

// BUG 2: POS Discount button - does it actually work?
test('BUG 2: POS Discount — does clicking work?', async ({ page }) => {
  await login(page);
  await nav(page, 'POS');

  // Select Jake Morrison tab (has 3 items)
  const jakesTab = page.locator('button, [class*="cursor"]').filter({ hasText: /Jake Morrison/i }).first();
  if (await jakesTab.count() > 0) {
    await jakesTab.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${DIR}/pos-jake-tab.png` });
  }

  // Click Discount
  const discountBtn = page.locator('button').filter({ hasText: /discount/i }).first();
  console.log('Discount button present:', await discountBtn.count() > 0);
  if (await discountBtn.count() > 0) {
    await discountBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${DIR}/pos-discount-clicked.png` });
    const body = await page.locator('body').textContent() || '';
    console.log('Discount modal opened:', body.includes('%') && (body.includes('Apply') || body.includes('Discount Amount') || body.includes('percentage')));
    console.log('Discount body snippet:', body.substring(body.indexOf('Discount') - 20, body.indexOf('Discount') + 200));
    // Check for input in modal
    const discountInput = page.locator('[role="dialog"] input, [class*="modal"] input, input[type="number"]').first();
    const hasInput = await discountInput.count() > 0;
    console.log('Discount has input field:', hasInput);
    if (hasInput) {
      await discountInput.fill('15');
      await page.screenshot({ path: `${DIR}/pos-discount-filled.png` });
      const applyBtn = page.locator('button').filter({ hasText: /apply/i }).first();
      if (await applyBtn.count() > 0) {
        await applyBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${DIR}/pos-discount-applied.png` });
        const afterBody = await page.locator('body').textContent() || '';
        console.log('Discount applied to total:', afterBody.includes('%') || afterBody.includes('discount') || afterBody.includes('Discount'));
      }
    }
  }
});

// BUG 3: Reports custom date range
test('BUG 3: Reports custom date range filter', async ({ page }) => {
  await login(page);
  await nav(page, 'Reports');

  await page.screenshot({ path: `${DIR}/reports-start.png` });

  // Get the two date inputs
  const inputs = page.locator('input[type="date"], input[placeholder*="mm/dd"]');
  const count = await inputs.count();
  console.log('Date inputs found:', count);

  if (count >= 2) {
    await inputs.first().fill('2026-01-01');
    await inputs.nth(1).fill('2026-02-28');
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${DIR}/reports-custom-range.png` });
    const body = await page.locator('body').textContent() || '';
    console.log('Custom range updates KPIs:', body.includes('Custom') || body.includes('Jan') || body.includes('Feb'));
  } else {
    // Try just regular inputs
    const allInputs = page.locator('input');
    const allCount = await allInputs.count();
    console.log('All inputs on reports page:', allCount);
    for (let i = 0; i < Math.min(allCount, 5); i++) {
      const type = await allInputs.nth(i).getAttribute('type') || '';
      const placeholder = await allInputs.nth(i).getAttribute('placeholder') || '';
      console.log(`  Input ${i}: type=${type} placeholder="${placeholder}"`);
    }
  }

  // Check if Custom button exists to reveal the date inputs
  const customBtn = page.locator('button').filter({ hasText: /custom/i }).first();
  const hasCustomBtn = await customBtn.count() > 0;
  console.log('Has Custom button:', hasCustomBtn);
});

// BUG 4: Tap Management — can you edit what's on a tap?
test('BUG 4: Tap Management — tap edit modal', async ({ page }) => {
  await login(page);
  await nav(page, 'Tap Management');
  await page.screenshot({ path: `${DIR}/taps-start.png` });

  // Try clicking on a tap number/row/card
  const tapCards = page.locator('[class*="cursor-pointer"], [class*="tap"], button').filter({ hasText: /TAP \d|Tap \d/i });
  console.log('Tap cards/buttons:', await tapCards.count());

  // Look at all buttons more carefully
  const allBtns = page.locator('button');
  const btnCount = await allBtns.count();
  const btnTexts: string[] = [];
  for (let i = 0; i < Math.min(btnCount, 30); i++) {
    const txt = await allBtns.nth(i).textContent();
    if (txt && txt.trim().length > 0 && txt.length < 60) btnTexts.push(txt.trim());
  }
  console.log('Taps page buttons:', btnTexts.slice(0, 20).join(' | '));

  // Try clicking the first non-sidebar button
  const mainContent = page.locator('main button, [class*="card"] button, td button').first();
  if (await mainContent.count() > 0) {
    await mainContent.click({ force: true });
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${DIR}/taps-click-result.png` });
    const body = await page.locator('body').textContent() || '';
    const hasModal = body.includes('Assign') || body.includes('Beer') || body.includes('Select') || body.includes('[role="dialog"]');
    console.log('Tap click opened modal/panel:', hasModal);
  }

  // Look for edit/assign buttons
  const editBtns = page.locator('button[title*="edit" i], button[title*="assign" i], button').filter({ hasText: /edit|assign|change/i });
  console.log('Edit/assign buttons:', await editBtns.count());
});

// BUG 5: Beer Ratings — does the Log Rating modal actually save?
test('BUG 5: Beer Ratings — does Log Rating actually save?', async ({ page }) => {
  await login(page);
  await nav(page, 'Beer Ratings');

  // Count current ratings
  const body1 = await page.locator('body').textContent() || '';
  const ratingsBefore = (body1.match(/\d+ ratings/g) || []).join(', ');
  console.log('Ratings before:', ratingsBefore);
  const totalBefore = body1.match(/Total Ratings[\s\S]*?(\d+)/)?.[1] || '?';
  console.log('Total ratings before:', totalBefore);

  // Log a rating
  const logBtn = page.locator('button').filter({ hasText: /log rating/i }).first();
  if (await logBtn.count() > 0) {
    await logBtn.click();
    await page.waitForTimeout(600);

    const dialog = page.locator('[role="dialog"]');
    const inputs = dialog.locator('input[type="text"], input:not([type])');
    if (await inputs.count() > 0) await inputs.first().fill('Pipeline14 Tester');

    // Select a beer from dropdown
    const beerSelect = dialog.locator('select').first();
    if (await beerSelect.count() > 0) {
      const options = await beerSelect.locator('option').allTextContents();
      console.log('Beer options:', options.slice(0, 5).join(', '));
      await beerSelect.selectOption({ index: 1 });
    }

    // Click star 5
    const starBtns = dialog.locator('button');
    const totalBtns = await starBtns.count();
    console.log('Dialog buttons total:', totalBtns);
    // Stars are usually the first 5 buttons
    if (totalBtns >= 5) {
      await starBtns.nth(4).click({ force: true }); // 5th star
      await page.waitForTimeout(200);
    }

    await page.screenshot({ path: `${DIR}/ratings-modal-filled.png` });

    // Find and click Save
    const saveBtn = dialog.locator('button').filter({ hasText: /save|log|submit/i }).first();
    const saveBtnText = await saveBtn.textContent().catch(() => 'not found');
    console.log('Save button text:', saveBtnText);
    if (await saveBtn.count() > 0) {
      await saveBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: `${DIR}/ratings-after-save.png` });
      const body2 = await page.locator('body').textContent() || '';
      const totalAfter = body2.match(/Total Ratings[\s\S]*?(\d+)/)?.[1] || '?';
      console.log('Total ratings after:', totalAfter);
      console.log('Rating count increased:', totalAfter !== totalBefore);
    } else {
      console.log('BUG: No save button in log rating modal');
      await page.screenshot({ path: `${DIR}/ratings-modal-no-save.png` });
      // List all buttons in dialog
      const allDlgBtns = await dialog.locator('button').allTextContents();
      console.log('Dialog buttons:', allDlgBtns.join(' | '));
    }
  }
});

// Check Taproom Analytics for any broken charts
test('CHECK: Taproom Analytics for NaN or blank data', async ({ page }) => {
  await login(page);
  await nav(page, 'Taproom Analytics');
  await page.screenshot({ path: `${DIR}/taproom-analytics.png` });
  const body = await page.locator('body').textContent() || '';
  console.log('Has NaN:', body.includes('NaN'));
  console.log('Has data:', body.includes('$') && body.includes('%'));
});

// Check Distribution page
test('CHECK: Distribution — order/invoice creation', async ({ page }) => {
  await login(page);
  await nav(page, 'Distribution');
  await page.screenshot({ path: `${DIR}/distribution-start.png` });
  const body = await page.locator('body').textContent() || '';
  console.log('Has accounts:', body.includes('Account') || body.includes('wholesale'));
  console.log('Has orders:', body.includes('Order') || body.includes('invoice') || body.includes('Invoice'));
  console.log('Has add button:', await page.locator('button').filter({ hasText: /new account|add account|new order/i }).count() > 0);

  // Look at all buttons
  const btns = await page.locator('button').allTextContents();
  console.log('Distribution buttons:', btns.filter(b => b.trim().length > 0).slice(0, 20).join(' | '));
});
