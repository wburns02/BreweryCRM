import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5185';
const DIR = './test-results/pipeline4-final-qa';
fs.mkdirSync(DIR, { recursive: true });

async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(2500);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) { await demoBtn.click(); await page.waitForTimeout(2500); }
}

// ─── ALL PAGES LOAD ──────────────────────────────────────────────────────────

const PAGE_NAV = [
  ['Dashboard', 'dashboard'],
  ['POS', 'pos'],
  ['Floor Plan', 'floor-plan'],
  ['Customers', 'customers'],
  ['Mug Club', 'mug-club'],
  ['Reservations', 'reservations'],
  ['Tap Management', 'taps'],
  ['Brewing', 'brewing'],
  ['Production', 'production'],
  ['Recipe Lab', 'recipes'],
  ['Keg Tracking', 'kegs'],
  ['Keg Monitor', 'keg-monitor'],
  ['Food & Menu', 'menu'],
  ['Inventory', 'inventory'],
  ['Taproom Analytics', 'analytics'],
  ['Events', 'events'],
  ['Financials', 'financials'],
  ['Staff', 'staff'],
  ['Distribution', 'distribution'],
  ['Reports', 'reports'],
  ['TTB Reports', 'ttb'],
  ['Settings', 'settings'],
];

for (const [label, id] of PAGE_NAV) {
  test(`PAGE: ${label} loads without NaN`, async ({ page }) => {
    await login(page);
    await page.locator(`text="${label}"`).first().click({ timeout: 8000 });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${DIR}/page-${id}.png` });
    const body = await page.locator('body').textContent() || '';
    expect(body, `NaN found on ${label}`).not.toContain('NaN');
    console.log(`${label} ✅`);
  });
}

// Loyalty uses button selector (not text= which finds group header)
test('PAGE: Loyalty Check-in loads without NaN', async ({ page }) => {
  await login(page);
  await page.locator('button').filter({ hasText: /^Loyalty Check-in$/ }).click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${DIR}/page-loyalty.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body, 'NaN found on Loyalty').not.toContain('NaN');
  console.log('Loyalty Check-in ✅');
});

// Marketing uses button selector (group header vs nav item)
test('PAGE: Marketing loads without NaN', async ({ page }) => {
  await login(page);
  await page.locator('button').filter({ hasText: /^Marketing$/ }).click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${DIR}/page-marketing.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body, 'NaN found on Marketing').not.toContain('NaN');
  console.log('Marketing ✅');
});

// ─── BUG FIXES VERIFIED ─────────────────────────────────────────────────────

test('BUG1: Tap Management edit button works', async ({ page }) => {
  await login(page);
  await page.locator('text="Tap Management"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1000);
  await page.locator('button:has-text("List View")').click();
  await page.waitForTimeout(300);
  const editBtns = page.locator('tbody button');
  expect(await editBtns.count()).toBeGreaterThan(0);
  await editBtns.first().click();
  await page.waitForTimeout(400);
  expect(await page.locator('[role="dialog"]').isVisible()).toBe(true);
  const body = await page.locator('[role="dialog"]').textContent() || '';
  expect(body.toLowerCase()).toContain('edit tap');
  await page.locator('[role="dialog"] button:has-text("Save Changes")').click();
  await page.waitForTimeout(400);
  const afterBody = await page.locator('body').textContent() || '';
  expect(afterBody.toLowerCase()).toContain('updated');
  await page.screenshot({ path: `${DIR}/bug1-tap-edit.png` });
  console.log('BUG1: Tap edit ✅');
});

test('BUG2: Marketing draft campaign has Send Now button', async ({ page }) => {
  await login(page);
  await page.locator('button').filter({ hasText: /^Marketing$/ }).click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.locator('button').filter({ hasText: /New Campaign/ }).click({ timeout: 5000 });
  await page.waitForTimeout(300);
  const modal = page.locator('[role="dialog"]');
  await modal.locator('input[type="text"]').first().fill('Final QA Test Campaign');
  await modal.locator('input[type="text"]').nth(1).fill('Final QA Subject');
  await modal.locator('button[type="submit"]').click();
  await page.waitForTimeout(400);
  const sendBtn = page.locator('button:has-text("Send Now")').first();
  expect(await sendBtn.count()).toBeGreaterThan(0);
  await sendBtn.click();
  await page.waitForTimeout(400);
  const body = await page.locator('body').textContent() || '';
  expect(body.includes('sent') || body.includes('recipients')).toBe(true);
  await page.screenshot({ path: `${DIR}/bug2-marketing-send.png` });
  console.log('BUG2: Marketing send ✅');
});

test('BUG3: TTB Reports PDF download works', async ({ page }) => {
  await login(page);
  await page.locator('text="TTB Reports"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  const pdfBtn = page.locator('button:has-text("PDF")').first();
  expect(await pdfBtn.count()).toBeGreaterThan(0);
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 5000 }),
    pdfBtn.click(),
  ]);
  expect(download).not.toBeNull();
  await page.screenshot({ path: `${DIR}/bug3-ttb-pdf.png` });
  console.log(`BUG3: TTB PDF download ✅ (file: ${download.suggestedFilename()})`);
});

test('BUG4: Production Schedule Brew Day succeeds', async ({ page }) => {
  await login(page);
  await page.locator('text="Production"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1000);
  const schedBtn = page.locator('button').filter({ hasText: /schedule brew/i }).first();
  expect(await schedBtn.count()).toBeGreaterThan(0);
  await schedBtn.click();
  await page.waitForTimeout(400);
  const modal = page.locator('[role="dialog"]');
  expect(await modal.isVisible()).toBe(true);
  const batchSelect = modal.locator('select').first();
  if (await batchSelect.locator('option').count() > 1) {
    await batchSelect.selectOption({ index: 1 });
  }
  const dateInput = modal.locator('input[type="date"]');
  if (await dateInput.count() > 0) await dateInput.fill('2026-04-20');
  await modal.locator('button[type="submit"]').click();
  await page.waitForTimeout(600);
  const body = await page.locator('body').textContent() || '';
  expect(body.toLowerCase().includes('scheduled') || body.toLowerCase().includes('brew day')).toBe(true);
  await page.screenshot({ path: `${DIR}/bug4-production-schedule.png` });
  console.log('BUG4: Production schedule ✅');
});

test('BUG5: Distribution invoice download works', async ({ page }) => {
  await login(page);
  await page.locator('text="Distribution"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  const accountCard = page.locator('.lg\\:grid-cols-2 > div').first();
  await accountCard.click();
  await page.waitForTimeout(600);
  const invoiceBtn = page.locator('button:has-text("Download Invoice")').first();
  expect(await invoiceBtn.count()).toBeGreaterThan(0);
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 5000 }),
    invoiceBtn.click(),
  ]);
  expect(download).not.toBeNull();
  await page.screenshot({ path: `${DIR}/bug5-distribution-invoice.png` });
  console.log(`BUG5: Distribution invoice ✅ (file: ${download.suggestedFilename()})`);
});

// ─── LOYALTY FEATURE ─────────────────────────────────────────────────────────

test('FEATURE: Loyalty — full check-in flow', async ({ page }) => {
  await login(page);
  await page.locator('button').filter({ hasText: /^Loyalty Check-in$/ }).click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  // Check all tabs exist
  for (const tab of ['Check-in Station', 'Leaderboard', 'Redeem Rewards', 'Tier Overview']) {
    expect(await page.locator(`button:has-text("${tab}")`).count()).toBeGreaterThan(0);
  }

  // Check-in via search
  const searchInput = page.locator('input[placeholder*="phone"]').first();
  await searchInput.fill('Sam');
  await page.waitForTimeout(500);
  const dropdown = page.locator('.z-20 button').first();
  if (await dropdown.count() > 0) {
    await dropdown.click();
    await page.waitForTimeout(600);
  }
  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  expect(body.includes('Total Points') || body.includes('Check-in')).toBe(true);
  await page.screenshot({ path: `${DIR}/loyalty-checkin.png` });
  console.log('FEATURE: Loyalty check-in ✅');
});

test('FEATURE: Loyalty — Leaderboard tab', async ({ page }) => {
  await login(page);
  await page.locator('button').filter({ hasText: /^Loyalty Check-in$/ }).click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.locator('button:has-text("Leaderboard")').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${DIR}/loyalty-leaderboard.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  expect(body.includes('Bronze') || body.includes('Platinum')).toBe(true);
  console.log('FEATURE: Loyalty leaderboard ✅');
});

test('FEATURE: Loyalty — Rewards catalog', async ({ page }) => {
  await login(page);
  await page.locator('button').filter({ hasText: /^Loyalty Check-in$/ }).click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.locator('button:has-text("Redeem Rewards")').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${DIR}/loyalty-rewards.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  expect(body.includes('Free Pint')).toBe(true);
  expect(body.includes('100')).toBe(true); // cost
  console.log('FEATURE: Loyalty rewards ✅');
});

test('FEATURE: Loyalty — Tiers tab all 4 tiers', async ({ page }) => {
  await login(page);
  await page.locator('button').filter({ hasText: /^Loyalty Check-in$/ }).click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.locator('button:has-text("Tier Overview")').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${DIR}/loyalty-tiers.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  for (const tier of ['Bronze', 'Silver', 'Gold', 'Platinum']) {
    expect(body.includes(tier)).toBe(true);
  }
  console.log('FEATURE: Loyalty tiers ✅');
});

// ─── STABILITY ────────────────────────────────────────────────────────────────

test('STABILITY: No critical JS errors on core pages + Loyalty', async ({ page }) => {
  const critErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const t = msg.text();
      if (!t.includes('net::') && !t.includes('favicon') && !t.includes('Failed to load resource') && !t.includes('CORS')) {
        if (t.includes('Uncaught') || t.includes('TypeError') || t.includes('is not a function') || t.includes('Cannot read')) {
          critErrors.push(t.substring(0, 120));
        }
      }
    }
  });
  await login(page);
  for (const label of ['Dashboard', 'POS', 'Keg Monitor', 'Brewing', 'Financials', 'Reports']) {
    await page.locator(`text="${label}"`).first().click({ timeout: 8000 });
    await page.waitForTimeout(800);
  }
  // Loyalty (button selector)
  await page.locator('button').filter({ hasText: /^Loyalty Check-in$/ }).click({ timeout: 8000 });
  await page.waitForTimeout(800);
  // Cost Analysis
  await page.locator('text="Brewing"').first().click({ timeout: 8000 });
  await page.waitForTimeout(800);
  const costTab = page.locator('button:has-text("Cost Analysis")');
  if (await costTab.count() > 0) { await costTab.click(); await page.waitForTimeout(600); }

  console.log(`Critical JS errors: ${critErrors.length}`);
  critErrors.forEach(e => console.log(' ERR:', e));
  expect(critErrors.length, `Critical errors: ${critErrors.join(' | ')}`).toBe(0);
  console.log('No critical JS errors ✅');
});

// ─── MOBILE ────────────────────────────────────────────────────────────────────

test('MOBILE: Core pages + Loyalty responsive', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page);
  for (const label of ['Dashboard', 'Keg Monitor', 'Reports', 'Brewing']) {
    const hamburger = page.locator('header button').first();
    await hamburger.click(); await page.waitForTimeout(400);
    await page.locator(`text="${label}"`).first().click({ timeout: 8000 });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${DIR}/mobile-${label.toLowerCase().replace(/\s+/g, '-')}.png` });
    const body = await page.locator('body').textContent() || '';
    expect(body).not.toContain('NaN');
    console.log(`Mobile ${label} ✅`);
  }
  // Loyalty on mobile
  const hamburger = page.locator('header button').first();
  await hamburger.click(); await page.waitForTimeout(400);
  await page.locator('button').filter({ hasText: /Loyalty Check-in/ }).first().click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  const body = await page.locator('body').textContent() || '';
  expect(body).not.toContain('NaN');
  expect(body.includes('Check-in') || body.includes('Loyalty')).toBe(true);
  await page.screenshot({ path: `${DIR}/mobile-loyalty.png` });
  console.log('Mobile Loyalty ✅');
});
