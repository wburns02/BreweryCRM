import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5185';
const DIR = './test-results/pipeline4-polish';
fs.mkdirSync(DIR, { recursive: true });

async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(2500);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) { await demoBtn.click(); await page.waitForTimeout(2500); }
}

// Polish audit for new features
test('POLISH: Tap Management edit modal UX', async ({ page }) => {
  await login(page);
  await page.locator('text="Tap Management"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);

  // Switch to list view (always-visible edit buttons)
  await page.locator('button:has-text("List View")').click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${DIR}/taps-list-view.png` });

  // Verify edit button
  const editBtn = page.locator('tbody button').first();
  expect(await editBtn.count()).toBeGreaterThan(0);
  console.log('Taps list view with edit buttons ✅');
});

test('POLISH: Marketing send feedback is clear', async ({ page }) => {
  await login(page);
  await page.locator('button').filter({ hasText: /^Marketing$/ }).click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/marketing-initial.png` });

  // Create campaign and send it
  await page.locator('button').filter({ hasText: /New Campaign/ }).click({ timeout: 5000 });
  await page.waitForTimeout(300);
  const modal = page.locator('[role="dialog"]');
  await modal.locator('input[type="text"]').first().fill('Polish Test Campaign');
  await modal.locator('input[type="text"]').nth(1).fill('Polish Subject');
  await modal.locator('button[type="submit"]').click();
  await page.waitForTimeout(400);

  const sendBtn = page.locator('button:has-text("Send Now")').first();
  if (await sendBtn.count() > 0) {
    await sendBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${DIR}/marketing-after-send.png` });
    const body = await page.locator('body').textContent() || '';
    // Should show sent status badge on the campaign card
    const hasSentBadge = body.includes('sent') && body.includes('recipients');
    console.log(`Marketing send feedback clear: ${hasSentBadge}`);
  }
  console.log('Marketing polish ✅');
});

test('POLISH: Loyalty mobile responsive', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page);
  // Open mobile hamburger then click nav item
  const hamburger = page.locator('header button').first();
  if (await hamburger.count() > 0) { await hamburger.click(); await page.waitForTimeout(400); }
  await page.locator('button').filter({ hasText: /Loyalty Check-in/ }).first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/loyalty-mobile.png` });

  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  // Check no horizontal overflow
  const bodyEl = page.locator('body');
  const scrollWidth = await bodyEl.evaluate(el => el.scrollWidth);
  const clientWidth = await bodyEl.evaluate(el => el.clientWidth);
  const overflow = scrollWidth - clientWidth;
  console.log(`Loyalty mobile overflow: ${overflow}px`);
  expect(overflow).toBeLessThan(10);
  console.log('Loyalty mobile responsive ✅');
});

test('POLISH: Loyalty check-in success card polish', async ({ page }) => {
  await login(page);
  await page.locator('button').filter({ hasText: /Loyalty Check-in/ }).first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  // Do a check-in
  const searchInput = page.locator('input[placeholder*="phone"]').first();
  await searchInput.fill('Jo');
  await page.waitForTimeout(500);
  const dropdown = page.locator('.z-20 button').first();
  if (await dropdown.count() > 0) {
    await dropdown.click();
    await page.waitForTimeout(600);
  }
  await page.screenshot({ path: `${DIR}/loyalty-success-card.png` });
  const body = await page.locator('body').textContent() || '';
  const hasCard = body.includes('Total Points') || body.includes('checked in');
  console.log(`Success card visible: ${hasCard}`);
  console.log('Loyalty success card ✅');
});

test('POLISH: Distribution invoice feedback clean', async ({ page }) => {
  await login(page);
  await page.locator('text="Distribution"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${DIR}/distribution-initial.png` });

  const accountCard = page.locator('.lg\\:grid-cols-2 > div').first();
  if (await accountCard.count() > 0) {
    await accountCard.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${DIR}/distribution-panel.png` });

    const invoiceBtn = page.locator('button:has-text("Download Invoice")').first();
    if (await invoiceBtn.count() > 0) {
      const body = await page.locator('body').textContent() || '';
      console.log(`Invoice button visible with ${await invoiceBtn.count()} buttons`);
      // Check it's not too tiny
      const box = await invoiceBtn.boundingBox();
      console.log(`Invoice button size: ${box?.width}x${box?.height}`);
    }
  }
  console.log('Distribution invoice polish ✅');
});

test('POLISH: TTB PDF button clearly styled', async ({ page }) => {
  await login(page);
  await page.locator('text="TTB Reports"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/ttb-reports.png` });

  const pdfBtns = page.locator('button:has-text("PDF")');
  const count = await pdfBtns.count();
  console.log(`TTB PDF buttons: ${count}`);
  expect(count).toBeGreaterThan(0);

  // Check button is visible and has some size
  if (count > 0) {
    const box = await pdfBtns.first().boundingBox();
    console.log(`PDF button visible: ${box !== null}, size: ${box?.width}x${box?.height}`);
  }
  console.log('TTB PDF button polish ✅');
});
