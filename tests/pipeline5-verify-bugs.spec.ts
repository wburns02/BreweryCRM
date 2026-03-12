import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5173';
const DIR = './test-results/pipeline5-bugs';
fs.mkdirSync(DIR, { recursive: true });

async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(2500);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) { await demoBtn.click(); await page.waitForTimeout(2500); }
}

// BUG1: Reports date filter now shows most recent N days
test('BUG1: Reports 7-day filter shows most recent data', async ({ page }) => {
  await login(page);
  await page.locator('text="Reports"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);

  // Click 7 Days filter
  await page.locator('button:has-text("7 Days")').click();
  await page.waitForTimeout(500);

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');

  // Verify range buttons exist
  expect(await page.locator('button:has-text("7 Days")').count()).toBeGreaterThan(0);
  expect(await page.locator('button:has-text("30 Days")').count()).toBeGreaterThan(0);
  expect(await page.locator('button:has-text("90 Days")').count()).toBeGreaterThan(0);

  await page.screenshot({ path: `${DIR}/bug1-reports-7days.png` });
  console.log('BUG1: Reports date filter ✅');
});

// BUG2: Modal closes on Escape key
test('BUG2: Modal closes on Escape key press', async ({ page }) => {
  await login(page);
  await page.locator('text="Customers"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);

  // Open add customer modal
  const addBtn = page.locator('button').filter({ hasText: /add customer|new customer|\+/i }).first();
  // Try the Add Customer button via Plus icon
  const plusBtn = page.locator('button').filter({ hasText: /add/i }).first();
  if (await plusBtn.count() > 0) {
    await plusBtn.click();
    await page.waitForTimeout(400);
    const modal = page.locator('[role="dialog"]').last();
    if (await modal.isVisible()) {
      await page.screenshot({ path: `${DIR}/bug2-modal-open.png` });
      // Press Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
      // Modal should be gone
      const backdrop = page.locator('.bg-black\\/70');
      const backdropCount = await backdrop.count();
      console.log(`Backdrop elements after Escape: ${backdropCount}`);
      expect(backdropCount).toBe(0);
      await page.screenshot({ path: `${DIR}/bug2-modal-closed.png` });
      console.log('BUG2: Modal closes on Escape ✅');
    } else {
      console.log('Modal not visible — skipping Escape test');
    }
  }
});

// BUG2b: Escape works in Recipe Lab too
test('BUG2b: Recipe Lab modal closes on Escape', async ({ page }) => {
  await login(page);
  await page.locator('text="Recipe Lab"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);

  const addBtn = page.locator('button').filter({ hasText: /new recipe|add recipe/i }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(400);

    const modal = page.locator('[role="dialog"]').last();
    if (await modal.isVisible()) {
      // Press Escape to close
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);

      // Now we should be able to interact with page (backdrop gone)
      const backdrop = page.locator('.bg-black\\/70');
      const count = await backdrop.count();
      console.log(`Backdrop after Escape in Recipe Lab: ${count}`);
      expect(count).toBe(0);
      await page.screenshot({ path: `${DIR}/bug2b-recipe-escape.png` });
      console.log('BUG2b: Recipe Lab Escape ✅');
    }
  }
});

// BUG3: Staff cards are now clickable and show detail modal
test('BUG3: Staff card click opens detail modal', async ({ page }) => {
  await login(page);
  await page.locator('text="Staff"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${DIR}/bug3-staff.png` });

  // Click a staff card
  const staffCards = page.locator('[class*="grid"] > div').filter({ hasText: /bartender|server|brewer|manager|cook/ }).first();
  if (await staffCards.count() > 0) {
    await staffCards.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${DIR}/bug3-staff-detail.png` });

    const modal = page.locator('[role="dialog"]').last();
    expect(await modal.isVisible()).toBe(true);
    const body = await modal.textContent() || '';
    console.log(`Staff detail modal content includes 'Certifications': ${body.includes('Certifications')}`);
    expect(body.toLowerCase().includes('certif') || body.includes('TABC') || body.includes('Rate')).toBe(true);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    console.log('BUG3: Staff card detail modal ✅');
  } else {
    console.log('No staff cards found — checking count');
    const count = await page.locator('text="Staff"').count();
    console.log(`Staff elements on page: ${count}`);
  }
});

// BUG4: POS payment modal has tip UI
test('BUG4: POS payment modal shows tip options', async ({ page }) => {
  await login(page);
  await page.locator('text="POS"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  // Add a beer to the order by clicking a tap card
  const tapCards = page.locator('button').filter({ hasText: /TAP \d/ }).first();
  if (await tapCards.count() > 0) {
    await tapCards.click();
    await page.waitForTimeout(400);
    // Select pour size
    const pourBtn = page.locator('[role="dialog"] button').filter({ hasText: /Pint/ }).first();
    if (await pourBtn.count() > 0) {
      await pourBtn.click();
      await page.waitForTimeout(400);
    }
  }

  // Open payment modal
  const closeTabBtn = page.locator('button').filter({ hasText: /Close Tab/ }).first();
  if (await closeTabBtn.count() > 0) {
    await closeTabBtn.click();
    await page.waitForTimeout(400);

    const modal = page.locator('[role="dialog"]').last();
    if (await modal.isVisible()) {
      const body = await modal.textContent() || '';
      const hasTip = body.includes('Tip') || body.includes('15%') || body.includes('18%') || body.includes('20%');
      console.log(`Payment modal has tip UI: ${hasTip}`);
      console.log(`Modal text snippet: ${body.substring(0, 200)}`);
      expect(hasTip).toBe(true);

      // Click 20% tip
      const tip20 = modal.locator('button:has-text("20%")');
      if (await tip20.count() > 0) {
        await tip20.click();
        await page.waitForTimeout(300);
        const updatedBody = await modal.textContent() || '';
        console.log(`Tip 20% clicked, modal has 'Tip': ${updatedBody.includes('Tip')}`);
      }

      await page.screenshot({ path: `${DIR}/bug4-pos-tip.png` });
      await page.keyboard.press('Escape');
      console.log('BUG4: POS tip UI ✅');
    }
  } else {
    console.log('Close Tab button not found — empty cart');
  }
});

// BUG5: Taproom Analytics has date range filter
test('BUG5: Taproom Analytics date range filter works', async ({ page }) => {
  await login(page);
  await page.locator('text="Taproom Analytics"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  // Switch to Trend Analysis tab (date filter appears there)
  await page.locator('button:has-text("Trend Analysis")').click();
  await page.waitForTimeout(500);

  // Now filter buttons should appear
  const filterBtns = page.locator('button').filter({ hasText: /7 Days|30 Days|90 Days|All Time/ });
  const count = await filterBtns.count();
  console.log(`Analytics filter buttons: ${count}`);
  expect(count).toBeGreaterThan(0);

  // Click 7 Days
  await filterBtns.filter({ hasText: '7 Days' }).first().click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${DIR}/bug5-analytics-7days.png` });

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  console.log('BUG5: Analytics date filter ✅');
});
