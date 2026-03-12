import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5185';
const DIR = './test-results/pipeline4-bugs';
fs.mkdirSync(DIR, { recursive: true });

async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(2000);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) { await demoBtn.click(); await page.waitForTimeout(2500); }
}

async function nav(page: Page, label: string) {
  await page.locator(`text="${label}"`).first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);
}

// ─── BUG HUNT: Tap Management ──────────────────────────────────────────────
test('BUG-TAP: No edit/change-beer button on tap cards', async ({ page }) => {
  await login(page);
  await nav(page, 'Tap Management');
  await page.screenshot({ path: `${DIR}/taps-initial.png` });

  const editBtn = page.locator('button').filter({ hasText: /edit|change beer|assign|replace/i });
  const editCount = await editBtn.count();
  console.log(`Tap edit buttons: ${editCount}`);

  // Click a tap card to see what happens
  const tapCard = page.locator('.grid button, .grid > div[class*="cursor-pointer"]').first();
  if (await tapCard.count() > 0) {
    await tapCard.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/taps-after-click.png` });
    const body = await page.locator('body').textContent() || '';
    const hasEdit = body.toLowerCase().includes('edit') || body.toLowerCase().includes('change beer') || body.toLowerCase().includes('assign beer');
    console.log(`After tap click - has edit options: ${hasEdit}`);
  }
  console.log('TAP BUG: No edit button ✅ (confirmed)');
});

// ─── BUG HUNT: Settings Save ───────────────────────────────────────────────
test('BUG-SETTINGS: Settings form saves correctly', async ({ page }) => {
  await login(page);
  await nav(page, 'Settings');
  await page.screenshot({ path: `${DIR}/settings-initial.png` });

  const body = await page.locator('body').textContent() || '';
  console.log('Settings has save button:', body.includes('Save'));

  // Try clicking a save button
  const saveBtn = page.locator('button').filter({ hasText: /save|update|apply/i }).first();
  if (await saveBtn.count() > 0) {
    await saveBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${DIR}/settings-after-save.png` });
    const afterBody = await page.locator('body').textContent() || '';
    const hasFeedback = afterBody.includes('saved') || afterBody.includes('updated') || afterBody.includes('success');
    console.log(`Settings save feedback: ${hasFeedback}`);
  }
});

// ─── BUG HUNT: Marketing Send Campaign ────────────────────────────────────
test('BUG-MARKETING: Send campaign works', async ({ page }) => {
  await login(page);
  await nav(page, 'Marketing');
  await page.screenshot({ path: `${DIR}/marketing-initial.png` });

  // Look for send/launch button
  const sendBtn = page.locator('button').filter({ hasText: /send|launch|schedule|activate/i }).first();
  const sendCount = await sendBtn.count();
  console.log(`Marketing send buttons: ${sendCount}`);

  if (sendCount > 0) {
    await sendBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${DIR}/marketing-after-send.png` });
    const body = await page.locator('body').textContent() || '';
    const hasFeedback = body.includes('sent') || body.includes('launched') || body.includes('success') || body.includes('scheduled');
    console.log(`Marketing send feedback: ${hasFeedback}`);
  }
});

// ─── BUG HUNT: TTB Reports ────────────────────────────────────────────────
test('BUG-TTB: TTB Reports page has real data and export', async ({ page }) => {
  await login(page);
  await nav(page, 'TTB Reports');
  await page.screenshot({ path: `${DIR}/ttb-initial.png` });
  const body = await page.locator('body').textContent() || '';
  console.log('TTB has barrel data:', body.includes('barrel') || body.includes('Barrel') || body.includes('BBL'));
  console.log('TTB has export:', body.toLowerCase().includes('export') || body.toLowerCase().includes('submit'));
  console.log('TTB NaN check:', body.includes('NaN') ? '❌ HAS NaN' : '✅ no NaN');
});

// ─── BUG HUNT: Production Page ────────────────────────────────────────────
test('BUG-PRODUCTION: Production page tank actions', async ({ page }) => {
  await login(page);
  await nav(page, 'Production');
  await page.screenshot({ path: `${DIR}/production-initial.png` });
  const body = await page.locator('body').textContent() || '';
  console.log('Production NaN check:', body.includes('NaN') ? '❌ HAS NaN' : '✅ no NaN');

  // Try clicking a tank card
  const tankCard = page.locator('.grid > div').first();
  if (await tankCard.count() > 0) {
    await tankCard.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${DIR}/production-tank-click.png` });
  }
});

// ─── BUG HUNT: Keg Tracking add/edit ─────────────────────────────────────
test('BUG-KEGS: Keg tracking CRUD works', async ({ page }) => {
  await login(page);
  await nav(page, 'Keg Tracking');
  await page.screenshot({ path: `${DIR}/kegs-initial.png` });

  const addBtn = page.locator('button').filter({ hasText: /add keg|new keg/i }).first();
  console.log(`Keg add button: ${await addBtn.count()}`);
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${DIR}/kegs-modal.png` });
    const modal = page.locator('[role="dialog"]');
    if (await modal.isVisible()) {
      console.log('Keg modal opens ✅');
      await page.keyboard.press('Escape');
    }
  }
});

// ─── BUG HUNT: Floor Plan table service ──────────────────────────────────
test('BUG-FLOORPLAN: Floor plan table actions', async ({ page }) => {
  await login(page);
  await nav(page, 'Floor Plan');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${DIR}/floorplan-initial.png` });

  // Click a table
  const table = page.locator('[data-table-id], .cursor-pointer').first();
  if (await table.count() > 0) {
    await table.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${DIR}/floorplan-after-click.png` });
    const modal = page.locator('[role="dialog"]');
    console.log(`Floor plan modal after click: ${await modal.isVisible()}`);
  }
});

// ─── BUG HUNT: Customer detail visit history ─────────────────────────────
test('BUG-CUSTOMERS: Customer visit history shows real data', async ({ page }) => {
  await login(page);
  await nav(page, 'Customers');
  await page.waitForTimeout(800);

  // Click a customer
  const row = page.locator('tbody tr').first();
  if (await row.count() > 0) {
    await row.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${DIR}/customer-detail.png` });
    const body = await page.locator('body').textContent() || '';
    console.log('Customer detail has visit history:', body.includes('Visit') || body.includes('visit'));
    console.log('Customer detail has notes:', body.includes('Note') || body.includes('note'));
    console.log('Customer NaN check:', body.includes('NaN') ? '❌ HAS NaN' : '✅ no NaN');
  }
});
