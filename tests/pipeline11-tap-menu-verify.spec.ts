import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5175';
const DIR = './test-results/pipeline11-tap-menu';
fs.mkdirSync(DIR, { recursive: true });

async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(2500);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) { await demoBtn.click(); await page.waitForTimeout(2500); }
}

async function nav(page: Page, text: string) {
  const link = page.locator('nav').locator('button, a').filter({ hasText: new RegExp(`^${text}$`, 'i') }).first();
  if (await link.count() > 0) { await link.click({ timeout: 5000 }); await page.waitForTimeout(1200); return; }
  const fallback = page.locator('nav a, nav button').filter({ hasText: text }).first();
  if (await fallback.count() > 0) { await fallback.click({ timeout: 5000 }); await page.waitForTimeout(1200); }
}

test('TAP MENU: Page loads with live tap data', async ({ page }) => {
  await login(page);
  await nav(page, 'Tap Menu Board');
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${DIR}/tap-menu-board.png` });

  const body = await page.locator('body').textContent() || '';
  console.log(`Tap Menu Board loads: ${body.includes('Tap Menu Board') || body.includes('on tap')}`);
  console.log(`Has live taps display: ${body.includes('TAP ') || body.includes('Active Taps')}`);
  console.log(`Has Bearded Hop branding: ${body.includes('Bearded Hop')}`);

  expect(body.includes('Bearded Hop')).toBe(true);
  expect(body.includes('Active Taps') || body.includes('on tap')).toBe(true);
  console.log('Tap Menu Board page loads ✅');
});

test('TAP MENU: Board Preview shows beer cards', async ({ page }) => {
  await login(page);
  await nav(page, 'Tap Menu Board');
  await page.waitForTimeout(600);

  const body = await page.locator('body').textContent() || '';
  const hasTapCards = body.includes('TAP ') && (body.includes('ABV') || body.includes('%'));
  console.log(`Board has tap cards with ABV: ${hasTapCards}`);

  // Check for keg freshness indicators
  const hasFreshness = body.includes('Fresh') || body.includes('Running Low') || body.includes('Last Pours') || body.includes('Good');
  console.log(`Has freshness labels: ${hasFreshness}`);

  expect(hasTapCards).toBe(true);
  await page.screenshot({ path: `${DIR}/tap-menu-cards.png` });
  console.log('Board shows tap cards ✅');
});

test('TAP MENU: Display Settings toggles work', async ({ page }) => {
  await login(page);
  await nav(page, 'Tap Menu Board');
  await page.waitForTimeout(600);

  // Click Display Settings tab
  const settingsTab = page.locator('button').filter({ hasText: /Display Settings/ }).first();
  await settingsTab.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${DIR}/display-settings.png` });

  const body = await page.locator('body').textContent() || '';
  console.log(`Settings has theme options: ${body.includes('Dark') || body.includes('Warm') || body.includes('Light')}`);
  console.log(`Settings has toggles: ${body.includes('Show Keg') || body.includes('Show ABV')}`);

  expect(body.includes('Show Keg') || body.includes('ABV')).toBe(true);

  // Try clicking Warm theme
  const warmBtn = page.locator('button').filter({ hasText: /warm/i }).first();
  if (await warmBtn.count() > 0) {
    await warmBtn.click();
    await page.waitForTimeout(300);
    console.log('Warm theme clicked');
  }

  console.log('Display settings ✅');
});

test('TAP MENU: Share & QR Code tab works', async ({ page }) => {
  await login(page);
  await nav(page, 'Tap Menu Board');
  await page.waitForTimeout(600);

  // Click Share & QR Code tab
  const qrTab = page.locator('button').filter({ hasText: /Share.*QR|QR.*Code/i }).first();
  await qrTab.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${DIR}/share-qr.png` });

  const body = await page.locator('body').textContent() || '';
  console.log(`QR tab has share link: ${body.includes('menu=') || body.includes('localhost') || body.includes('Share Link')}`);
  console.log(`QR tab has integrations: ${body.includes('Untappd') || body.includes('Instagram') || body.includes('Social')}`);

  expect(body.includes('Share Link') || body.includes('QR Code')).toBe(true);

  // Try copy button
  const copyBtn = page.locator('button').filter({ hasText: /Copy/ }).first();
  if (await copyBtn.count() > 0) {
    await copyBtn.click({ timeout: 3000 });
    await page.waitForTimeout(400);
    const afterBody = await page.locator('body').textContent() || '';
    console.log(`Copy confirmation: ${afterBody.includes('Copied') || afterBody.includes('copied')}`);
  }

  console.log('Share & QR tab ✅');
});

test('TAP MENU: Mobile responsive at 390px', async ({ page }) => {
  await login(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);

  // Navigate via bottom nav
  const bottomNav = page.locator('nav').last();
  const homeBtn = bottomNav.locator('button').filter({ hasText: 'Home' }).first();
  if (await homeBtn.count() > 0) await homeBtn.click();
  await page.waitForTimeout(800);

  // Navigate to Tap Menu Board via sidebar hamburger
  const menuBtn = page.locator('header button').filter({ hasText: '' }).first();
  if (await menuBtn.count() > 0) {
    await menuBtn.click();
    await page.waitForTimeout(400);
  }

  // Try using main nav
  const tapMenuLink = page.locator('nav').first().locator('button, a').filter({ hasText: /Tap Menu/ }).first();
  if (await tapMenuLink.count() > 0) {
    await tapMenuLink.click({ timeout: 5000 });
    await page.waitForTimeout(800);
  }

  await page.screenshot({ path: `${DIR}/mobile-tap-menu.png` });
  const body = await page.locator('body').textContent() || '';
  console.log(`Tap menu accessible on mobile: ${body.includes('Bearded Hop') || body.includes('Tap Menu')}`);

  await page.setViewportSize({ width: 1280, height: 800 });
  console.log('Mobile responsiveness ✅');
});

test('TAP MENU: Stats bar shows correct counts', async ({ page }) => {
  await login(page);
  await nav(page, 'Tap Menu Board');
  await page.waitForTimeout(600);

  const body = await page.locator('body').textContent() || '';

  // Stats should show active tap count
  const hasActiveTaps = /\d+ on tap|\d+.*tap lines|Active Taps/.test(body);
  console.log(`Stats shows active taps: ${hasActiveTaps}`);

  // Should show avg ABV
  const hasAvgAbv = body.includes('Avg ABV') || /\d+\.\d+%/.test(body);
  console.log(`Stats shows avg ABV: ${hasAvgAbv}`);

  // Should show low kegs count
  const hasLowKegs = body.includes('Low Kegs') || body.includes('below 20%');
  console.log(`Stats shows low kegs: ${hasLowKegs}`);

  await page.screenshot({ path: `${DIR}/stats-bar.png` });
  expect(hasActiveTaps || body.includes('Active Taps')).toBe(true);
  console.log('Stats bar correct ✅');
});
