import { test, Page } from '@playwright/test';

const BASE = 'http://localhost:5177';
const DIR = 'test-results/pipeline14-deep';

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

// BUG 1: POS Discount button
test('DEEP: POS — is discount button really missing?', async ({ page }) => {
  await login(page);
  await nav(page, 'POS');

  // Check all buttons on POS
  const allBtns = page.locator('button');
  const count = await allBtns.count();
  const btnTexts: string[] = [];
  for (let i = 0; i < Math.min(count, 60); i++) {
    const txt = await allBtns.nth(i).textContent();
    if (txt && txt.trim().length > 0) btnTexts.push(txt.trim().substring(0, 40));
  }
  console.log('POS buttons:', btnTexts.join(' | '));

  await page.screenshot({ path: `${DIR}/pos-buttons.png` });

  // Click a tab first (Walk-in has items)
  const walkInTab = page.locator('button, [class*="cursor"]').filter({ hasText: /walk.in/i }).first();
  if (await walkInTab.count() > 0) {
    await walkInTab.click();
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: `${DIR}/pos-walk-in-tab.png` });

  // Now check for discount button
  const discountBtn = page.locator('button').filter({ hasText: /discount/i }).first();
  console.log('Discount button after selecting tab:', await discountBtn.count() > 0);

  const discountText = page.locator('button').filter({ hasText: /%/ }).all();
  const pctBtns = await page.locator('button').filter({ hasText: /%/ }).count();
  console.log('Buttons with % sign:', pctBtns);

  // Check what's in the order area
  const orderArea = page.locator('[class*="order"], [class*="tab"], [class*="cart"]');
  const orderText = await orderArea.first().textContent().catch(() => '');
  console.log('Order area snippet:', orderText?.substring(0, 200));
});

// BUG 2: Recipe Lab — does save actually work?
test('DEEP: Recipe Lab — save new recipe', async ({ page }) => {
  await login(page);
  await nav(page, 'Recipe Lab');

  // Note existing recipes
  const body1 = await page.locator('body').textContent() || '';
  console.log('Has recipes before:', body1.includes('IPA') || body1.includes('Lager'));

  const addBtn = page.locator('button').filter({ hasText: /new recipe|add recipe/i }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${DIR}/recipe-form-open.png` });

    const dialog = page.locator('[role="dialog"]');
    // List all inputs in dialog
    const inputs = dialog.locator('input, textarea, select');
    const inputCount = await inputs.count();
    console.log('Recipe form fields:', inputCount);
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const placeholder = await input.getAttribute('placeholder') || '';
      const type = await input.getAttribute('type') || 'text';
      const tagName = await input.evaluate(el => el.tagName);
      console.log(`  Field ${i}: <${tagName}> type=${type} placeholder="${placeholder}"`);
    }

    // Fill name (first text input)
    const textInputs = dialog.locator('input[type="text"], input:not([type])');
    if (await textInputs.count() > 0) {
      await textInputs.first().fill('Pipeline14 Hazy IPA');
    }
    // Fill style if it exists
    if (await textInputs.count() > 1) {
      await textInputs.nth(1).fill('New England IPA');
    }

    // Fill number fields (batch size, OG, etc.)
    const numInputs = dialog.locator('input[type="number"]');
    const numCount = await numInputs.count();
    console.log('Number inputs:', numCount);

    await page.screenshot({ path: `${DIR}/recipe-form-filled.png` });

    // Find save button
    const saveBtn = dialog.locator('button').filter({ hasText: /save|create|add/i }).first();
    const saveBtnText = await saveBtn.textContent().catch(() => 'not found');
    console.log('Save button text:', saveBtnText);

    if (await saveBtn.count() > 0) {
      await saveBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${DIR}/recipe-after-save.png` });
      const body2 = await page.locator('body').textContent() || '';
      console.log('Recipe appears after save:', body2.includes('Hazy IPA') || body2.includes('Pipeline14'));
      // Check for error
      const hasError = body2.includes('error') || body2.includes('Error') || body2.includes('failed');
      console.log('Error on save:', hasError);
    }
  } else {
    console.log('No "New Recipe" button found');
  }
});

// BUG 3: Events — create event
test('DEEP: Events — save new event', async ({ page }) => {
  await login(page);
  await nav(page, 'Events');

  await page.screenshot({ path: `${DIR}/events-start.png` });

  const addBtn = page.locator('button').filter({ hasText: /new event|add event|create event/i }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${DIR}/events-form.png` });

    const dialog = page.locator('[role="dialog"]');
    const inputs = dialog.locator('input, textarea, select');
    const inputCount = await inputs.count();
    console.log('Events form fields:', inputCount);
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const placeholder = await input.getAttribute('placeholder') || '';
      const type = await input.getAttribute('type') || 'text';
      const tagName = await input.evaluate(el => el.tagName);
      console.log(`  Field ${i}: <${tagName}> type=${type} placeholder="${placeholder}"`);
    }

    // Fill name
    const textInputs = dialog.locator('input[type="text"], input:not([type])');
    if (await textInputs.count() > 0) await textInputs.first().fill('Pipeline14 Live Music Event');

    // Fill date if present
    const dateInput = dialog.locator('input[type="date"]').first();
    if (await dateInput.count() > 0) {
      await dateInput.fill('2026-04-15');
      console.log('Date filled');
    }

    const timeInput = dialog.locator('input[type="time"]').first();
    if (await timeInput.count() > 0) {
      await timeInput.fill('19:00');
    }

    await page.screenshot({ path: `${DIR}/events-form-filled.png` });

    const saveBtn = dialog.locator('button').filter({ hasText: /save|create|add/i }).first();
    console.log('Save button text:', await saveBtn.textContent().catch(() => 'not found'));

    if (await saveBtn.count() > 0) {
      await saveBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${DIR}/events-after-save.png` });
      const body2 = await page.locator('body').textContent() || '';
      console.log('Event appears after save:', body2.includes('Pipeline14') || body2.includes('Live Music Event'));
      const hasError = body2.includes('required') || body2.includes('Error') || body2.includes('invalid');
      console.log('Validation error on save:', hasError);
    }
  } else {
    console.log('No event add button found - checking page more carefully');
    const body = await page.locator('body').textContent() || '';
    console.log('Events page snippet:', body.substring(0, 500));
  }
});

// BUG 4: Marketing — campaign save
test('DEEP: Marketing — campaign save issue', async ({ page }) => {
  await login(page);
  await nav(page, 'Marketing');

  const newBtn = page.locator('button').filter({ hasText: /new campaign/i }).first();
  if (await newBtn.count() > 0) {
    await newBtn.click();
    await page.waitForTimeout(600);

    const dialog = page.locator('[role="dialog"]');
    const inputs = dialog.locator('input, textarea, select');
    const inputCount = await inputs.count();
    console.log('Campaign form fields:', inputCount);
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const placeholder = await input.getAttribute('placeholder') || '';
      const type = await input.getAttribute('type') || 'text';
      const tagName = await input.evaluate(el => el.tagName);
      console.log(`  Field ${i}: <${tagName}> type=${type} placeholder="${placeholder}"`);
    }

    // Fill all required fields
    const textInputs = dialog.locator('input[type="text"], input:not([type])');
    if (await textInputs.count() > 0) await textInputs.nth(0).fill('Pipeline14 Campaign Title');
    if (await textInputs.count() > 1) await textInputs.nth(1).fill('Summer Special — P14 Test');
    if (await textInputs.count() > 2) await textInputs.nth(2).fill('all@beardedhop.com');

    const textarea = dialog.locator('textarea');
    if (await textarea.count() > 0) await textarea.first().fill('This is the email body for pipeline 14 test.');

    await page.screenshot({ path: `${DIR}/marketing-form-filled.png` });

    const saveBtn = dialog.locator('button').filter({ hasText: /create campaign|save/i }).first();
    console.log('Save button:', await saveBtn.textContent().catch(() => 'not found'));
    if (await saveBtn.count() > 0) {
      await saveBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${DIR}/marketing-after-save.png` });
      const body2 = await page.locator('body').textContent() || '';
      console.log('Campaign appears:', body2.includes('Pipeline14') || body2.includes('Summer Special'));
      // Check if modal is still open (failed validation)
      const dialogStillOpen = await dialog.count() > 0;
      console.log('Dialog still open after save:', dialogStillOpen);
    }
  }
});

// BUG 5: Reports — investigate what's missing
test('DEEP: Reports — what filters exist?', async ({ page }) => {
  await login(page);
  await nav(page, 'Reports');
  await page.screenshot({ path: `${DIR}/reports-start.png` });

  // Get all buttons
  const allBtns = page.locator('button');
  const count = await allBtns.count();
  const btnTexts: string[] = [];
  for (let i = 0; i < Math.min(count, 40); i++) {
    const txt = await allBtns.nth(i).textContent();
    if (txt && txt.trim().length > 0) btnTexts.push(txt.trim().substring(0, 30));
  }
  console.log('Reports buttons:', btnTexts.join(' | '));

  // Check for selects or inputs
  const selects = page.locator('select');
  const inputs = page.locator('input');
  console.log('Reports selects:', await selects.count());
  console.log('Reports inputs:', await inputs.count());

  // Full page text
  const body = await page.locator('body').textContent() || '';
  console.log('Reports page snippet:', body.substring(0, 800));
});

// FEATURE GAP: investigate QR / mobile ordering possibility
test('DEEP: Feature gap — what competitive features are missing', async ({ page }) => {
  await login(page);

  // Check if there's any QR code display anywhere
  await nav(page, 'Loyalty Check-in');
  await page.screenshot({ path: `${DIR}/loyalty-checkin.png` });
  const loyaltyBody = await page.locator('body').textContent() || '';
  console.log('Loyalty page snippet:', loyaltyBody.substring(0, 400));

  // Check events for ticket sales
  await nav(page, 'Events');
  await page.screenshot({ path: `${DIR}/events-overview.png` });
  const eventsBody = await page.locator('body').textContent() || '';
  console.log('Events has ticketing:', eventsBody.includes('ticket') || eventsBody.includes('Ticket'));
  console.log('Events has capacity:', eventsBody.includes('capacity') || eventsBody.includes('Capacity'));
  console.log('Events has RSVP:', eventsBody.includes('RSVP') || eventsBody.includes('rsvp'));

  // Check production for batch costing detail
  await nav(page, 'Brew Cost Lab');
  await page.screenshot({ path: `${DIR}/brew-cost.png` });
  const brewBody = await page.locator('body').textContent() || '';
  console.log('Brew Cost has cost per BBL:', brewBody.includes('BBL') || brewBody.includes('barrel'));
  console.log('Brew Cost has ingredient costs:', brewBody.includes('grain') || brewBody.includes('hop'));

  console.log('Feature gap deep dive done');
});
