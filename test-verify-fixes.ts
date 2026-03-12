import { chromium, Page } from 'playwright';

const BASE_URL = 'https://brewery-frontend-production.up.railway.app';

async function main() {
  const { execSync } = await import('child_process');
  execSync('mkdir -p test-results/qa-verify');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  const jsErrors: string[] = [];
  page.on('pageerror', err => jsErrors.push(err.message.substring(0, 200)));

  // Login
  await page.goto(BASE_URL, { timeout: 20000 });
  await page.waitForTimeout(2000);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.isVisible().catch(() => false)) {
    await demoBtn.click();
    await page.waitForTimeout(3000);
  }
  console.log('Logged in\n');

  async function clickSidebar(name: string) {
    const items = page.locator('aside button, aside a');
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      const text = (await items.nth(i).textContent())?.trim();
      if (text === name) {
        try { await items.nth(i).click({ timeout: 3000 }); }
        catch { await items.nth(i).click({ force: true }); }
        await page.waitForTimeout(1500);
        return true;
      }
    }
    return false;
  }

  async function dismissModal() {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const cancel = page.locator('button:has-text("Cancel"):visible').first();
    if (await cancel.isVisible().catch(() => false)) {
      await cancel.click({ force: true });
      await page.waitForTimeout(300);
    }
  }

  let passed = 0;
  let failed = 0;

  function pass(test: string) { passed++; console.log(`  PASS: ${test}`); }
  function fail(test: string, detail: string) { failed++; console.log(`  FAIL: ${test} — ${detail}`); }

  // ──── FIX 1: Mug Club Add Member ────
  console.log('=== FIX 1: Mug Club Add Member ===');
  await clickSidebar('Mug Club');
  const addMemberBtn = page.locator('button:has-text("Add Member")');
  await addMemberBtn.click();
  await page.waitForTimeout(1000);

  // Check for role="dialog"
  const dialog1 = page.locator('[role="dialog"]').first();
  if (await dialog1.isVisible().catch(() => false)) {
    pass('Modal has role="dialog"');
  } else {
    fail('Modal role="dialog"', 'Not found');
  }

  // Fill form
  const inputs1 = page.locator('[role="dialog"] input:visible');
  const count1 = await inputs1.count();
  console.log(`  Form inputs: ${count1}`);

  // First input = customer name
  if (count1 > 0) await inputs1.nth(0).fill('QA Test Member');
  // Mug number (if present)
  if (count1 > 1) await inputs1.nth(1).fill('999');
  // Email
  if (count1 > 2) await inputs1.nth(2).fill('qa@test.com');
  // Phone
  if (count1 > 3) await inputs1.nth(3).fill('555-0199');

  // Submit
  const submitBtn1 = page.locator('[role="dialog"] button:has-text("Add Member")');
  const respP1 = page.waitForResponse(
    r => r.url().includes('/api/') && r.request().method() === 'POST',
    { timeout: 5000 }
  ).catch(() => null);

  await submitBtn1.click();
  await page.waitForTimeout(2000);

  const resp1 = await respP1;
  if (resp1) {
    const status = resp1.status();
    const ep = resp1.url().split('/api/v1/')[1] || '';
    console.log(`  API: POST ${ep.substring(0, 30)} -> ${status}`);
    if (status < 400) pass('Mug Club form submits successfully');
    else {
      let body = ''; try { body = await resp1.text(); } catch {}
      fail('Mug Club form submit', `${status}: ${body.substring(0, 100)}`);
    }
  } else {
    fail('Mug Club form submit', 'No API response');
  }
  await dismissModal();

  // ──── FIX 2: Recipe Lab New Recipe ────
  console.log('\n=== FIX 2: Recipe Lab New Recipe ===');
  await clickSidebar('Recipe Lab');
  const newRecipeBtn = page.locator('button:has-text("New Recipe")');
  await newRecipeBtn.click();
  await page.waitForTimeout(1000);

  const dialog2 = page.locator('[role="dialog"]').first();
  if (await dialog2.isVisible().catch(() => false)) pass('Recipe modal has role="dialog"');
  else fail('Recipe modal role="dialog"', 'Not found');

  // Fill recipe form
  const inputs2 = page.locator('[role="dialog"] input:visible');
  const count2 = await inputs2.count();
  console.log(`  Form inputs: ${count2}`);
  for (let i = 0; i < count2; i++) {
    try {
      const type = await inputs2.nth(i).getAttribute('type') || 'text';
      if (type === 'number') {
        const val = await inputs2.nth(i).inputValue();
        if (!val || val === '0') await inputs2.nth(i).fill('10');
      } else {
        const val = await inputs2.nth(i).inputValue();
        if (!val) await inputs2.nth(i).fill(i === 0 ? 'QA Test IPA' : 'American IPA');
      }
    } catch {}
  }

  const submitBtn2 = page.locator('[role="dialog"] button:has-text("Create Recipe")');
  const respP2 = page.waitForResponse(
    r => r.url().includes('/api/') && r.request().method() === 'POST',
    { timeout: 5000 }
  ).catch(() => null);

  if (await submitBtn2.isVisible().catch(() => false)) {
    await submitBtn2.click();
    await page.waitForTimeout(2000);

    const resp2 = await respP2;
    if (resp2) {
      const status = resp2.status();
      const ep = resp2.url().split('/api/v1/')[1] || '';
      console.log(`  API: POST ${ep.substring(0, 30)} -> ${status}`);
      if (status < 400) pass('Recipe form submits successfully');
      else {
        let body = ''; try { body = await resp2.text(); } catch {}
        fail('Recipe form submit', `${status}: ${body.substring(0, 100)}`);
      }
    } else {
      fail('Recipe form submit', 'No API response');
    }
  }
  await dismissModal();

  // ──── FIX 3: Keg Tracking Add Keg ────
  console.log('\n=== FIX 3: Keg Tracking Add Keg ===');
  await clickSidebar('Keg Tracking');
  const addKegBtn = page.locator('button:has-text("Add Keg")');
  await addKegBtn.click();
  await page.waitForTimeout(1000);

  const dialog3 = page.locator('[role="dialog"]').first();
  if (await dialog3.isVisible().catch(() => false)) pass('Keg modal has role="dialog"');
  else fail('Keg modal role="dialog"', 'Not found');

  // Fill keg form
  const inputs3 = page.locator('[role="dialog"] input:visible');
  const count3 = await inputs3.count();
  console.log(`  Form inputs: ${count3}`);
  for (let i = 0; i < count3; i++) {
    try {
      const type = await inputs3.nth(i).getAttribute('type') || 'text';
      const val = await inputs3.nth(i).inputValue();
      if (!val || val === '0') {
        if (type === 'number') await inputs3.nth(i).fill('100');
        else await inputs3.nth(i).fill(i === 0 ? 'BH-QA-001' : 'Cold Room');
      }
    } catch {}
  }

  const submitBtn3 = page.locator('[role="dialog"] button:has-text("Add Keg")');
  const respP3 = page.waitForResponse(
    r => r.url().includes('/api/') && r.request().method() === 'POST',
    { timeout: 5000 }
  ).catch(() => null);

  if (await submitBtn3.isVisible().catch(() => false)) {
    await submitBtn3.click();
    await page.waitForTimeout(2000);

    const resp3 = await respP3;
    if (resp3) {
      const status = resp3.status();
      const ep = resp3.url().split('/api/v1/')[1] || '';
      console.log(`  API: POST ${ep.substring(0, 30)} -> ${status}`);
      if (status < 400) pass('Keg form submits successfully');
      else {
        let body = ''; try { body = await resp3.text(); } catch {}
        fail('Keg form submit', `${status}: ${body.substring(0, 100)}`);
      }
    } else {
      fail('Keg form submit', 'No API response');
    }
  }
  await dismissModal();

  // ──── FIX 4: Brewing New Batch ────
  console.log('\n=== FIX 4: Brewing New Batch ===');
  await clickSidebar('Brewing');
  await page.waitForTimeout(500);
  const newBatchBtn = page.locator('button:has-text("New Batch")');
  if (await newBatchBtn.isVisible().catch(() => false)) {
    await newBatchBtn.click();
    await page.waitForTimeout(1000);

    const dialog4 = page.locator('[role="dialog"]').first();
    if (await dialog4.isVisible().catch(() => false)) {
      pass('Brewing modal has role="dialog"');

      // Fill brewing form
      const inputs4 = page.locator('[role="dialog"] input:visible');
      const count4 = await inputs4.count();
      console.log(`  Form inputs: ${count4}`);
      for (let i = 0; i < count4; i++) {
        try {
          const type = await inputs4.nth(i).getAttribute('type') || 'text';
          const placeholder = await inputs4.nth(i).getAttribute('placeholder') || '';
          const val = await inputs4.nth(i).inputValue();
          if (!val) {
            if (placeholder.toLowerCase().includes('name') || i === 0) await inputs4.nth(i).fill('QA Test Ale');
            else if (placeholder.toLowerCase().includes('style') || i === 1) await inputs4.nth(i).fill('American Pale Ale');
            else if (type === 'number') await inputs4.nth(i).fill('1.055');
            else await inputs4.nth(i).fill('7');
          }
        } catch {}
      }

      // Fill textareas
      const tas4 = page.locator('[role="dialog"] textarea:visible');
      for (let i = 0; i < await tas4.count(); i++) {
        try { await tas4.nth(i).fill('QA test batch'); } catch {}
      }

      const submitBtn4 = page.locator('[role="dialog"] button:has-text("Create"), [role="dialog"] button:has-text("Save"), [role="dialog"] button:has-text("Add")').first();
      const respP4 = page.waitForResponse(
        r => r.url().includes('/api/') && r.request().method() === 'POST',
        { timeout: 5000 }
      ).catch(() => null);

      if (await submitBtn4.isVisible().catch(() => false)) {
        await submitBtn4.click();
        await page.waitForTimeout(2000);

        const resp4 = await respP4;
        if (resp4) {
          const status = resp4.status();
          const ep = resp4.url().split('/api/v1/')[1] || '';
          console.log(`  API: POST ${ep.substring(0, 30)} -> ${status}`);
          if (status < 400) pass('Batch form submits successfully');
          else {
            let body = ''; try { body = await resp4.text(); } catch {}
            fail('Batch form submit', `${status}: ${body.substring(0, 100)}`);
          }
        } else {
          fail('Batch form submit', 'No API response');
        }
      }
      await dismissModal();
    } else {
      fail('Brewing modal', 'Dialog not visible');
    }
  } else {
    fail('New Batch button', 'Not visible');
  }

  // ──── FIX 5: Modal accessibility ────
  console.log('\n=== FIX 5: Modal/SlidePanel Accessibility ===');
  // Already tested role="dialog" above — check all modals had it
  // Test one more: Customers Add Guest
  await clickSidebar('Customers');
  const addGuestBtn = page.locator('button:has-text("Add Guest")');
  await addGuestBtn.click();
  await page.waitForTimeout(1000);

  const dialog5 = page.locator('[role="dialog"]').first();
  if (await dialog5.isVisible().catch(() => false)) {
    pass('Customer modal has role="dialog"');

    const ariaModal = await dialog5.getAttribute('aria-modal');
    if (ariaModal === 'true') pass('aria-modal="true" present');
    else fail('aria-modal', `Got: ${ariaModal}`);

    const titleEl = page.locator('#modal-title');
    if (await titleEl.isVisible().catch(() => false)) pass('aria-labelledby target exists');
    else fail('aria-labelledby', 'modal-title element not found');
  } else {
    fail('Customer modal', 'Not visible');
  }
  await dismissModal();

  // Screenshot final state
  await page.screenshot({ path: 'test-results/qa-verify/final.png' });

  // SUMMARY
  console.log('\n' + '='.repeat(50));
  console.log(`  PASSED: ${passed}  |  FAILED: ${failed}`);
  console.log('='.repeat(50));

  if (jsErrors.length > 0) {
    console.log('\nJS Errors:');
    jsErrors.forEach(e => console.log(`  ${e}`));
  }

  await browser.close();
}

main().catch(console.error);
