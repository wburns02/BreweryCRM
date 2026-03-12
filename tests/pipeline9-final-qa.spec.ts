import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5175';
const DIR = './test-results/pipeline9-final';
fs.mkdirSync(DIR, { recursive: true });

async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(2500);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) { await demoBtn.click(); await page.waitForTimeout(2500); }
}

async function nav(page: Page, text: string) {
  const link = page.locator('nav').locator('button, a').filter({ hasText: new RegExp(`^${text}$`) }).first();
  if (await link.count() > 0) { await link.click({ timeout: 5000 }); }
  else { await page.locator(`text="${text}"`).first().click({ timeout: 5000 }); }
  await page.waitForTimeout(1500);
}

test('FINAL QA P9: Core pages — no blank, no NaN, no $undefined', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('net::') && !msg.text().includes('favicon')) {
      consoleErrors.push(msg.text().substring(0, 100));
    }
  });

  await login(page);

  const pages = ['Dashboard', 'POS', 'Brewing', 'Production', 'Customers', 'Financials', 'Distribution', 'Reports', 'Settings', 'Taproom Analytics', 'Staff', 'Inventory'];
  const failures: string[] = [];

  for (const p of pages) {
    await nav(page, p);
    const body = await page.locator('body').textContent() || '';
    if (body.trim().length < 50) failures.push(`${p}: empty`);
    if (/\bNaN\b/.test(body)) failures.push(`${p}: NaN`);
    if (/\$undefined/.test(body)) failures.push(`${p}: $undefined`);
    await page.screenshot({ path: `${DIR}/page-${p.toLowerCase().replace(/[\s\/]+/g, '-')}.png` });
  }

  console.log(`Page failures: ${failures.length === 0 ? 'none' : failures.join(' | ')}`);
  console.log(`Console errors: ${consoleErrors.length === 0 ? 'none' : consoleErrors.join(' | ')}`);
  expect(failures).toHaveLength(0);
});

test('FINAL QA P9: No single-decimal currency', async ({ page }) => {
  await login(page);
  const issues: string[] = [];

  for (const p of ['Dashboard', 'Customers', 'Financials', 'Reports', 'Staff']) {
    await nav(page, p);
    const body = await page.locator('body').textContent() || '';
    if (/\$\d+\.\d(?![kKm\d])/.test(body)) issues.push(`${p}: single-decimal $`);
    if (/\$\s*—/.test(body)) issues.push(`${p}: broken $—`);
  }

  console.log(`Currency issues: ${issues.length === 0 ? 'none' : issues.join(' | ')}`);
  expect(issues).toHaveLength(0);
});

test('FINAL QA P9: Financials — Avg Daily Revenue not NaN', async ({ page }) => {
  await login(page);
  await nav(page, 'Financials');
  const body = await page.locator('body').textContent() || '';
  expect(/\bNaN\b/.test(body)).toBe(false);
  expect(body.includes('Avg Daily Revenue')).toBe(true);
  const hasRevenue = /\$[\d,]+/.test(body);
  expect(hasRevenue).toBe(true);
  console.log('Financials avgDaily fix verified ✅');
});

test('FINAL QA P9: POS keg decrement feature — end-to-end', async ({ page }) => {
  await login(page);
  await nav(page, 'POS');

  // Get initial keg levels via DOM
  const getKegLevels = () => page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const tapButtons = buttons.filter(b => b.textContent?.includes('TAP'));
    return tapButtons.map(btn => {
      const spans = Array.from(btn.querySelectorAll('span'));
      const levelSpan = spans.reverse().find(s => /^\d+(\.\d+)?%$/.test((s.textContent || '').trim()));
      return { level: levelSpan ? parseFloat(levelSpan.textContent || '0') : -1 };
    });
  });

  const before = await getKegLevels();
  console.log(`Tap card count: ${before.length}`);
  console.log(`First keg level before: ${before[0]?.level}%`);

  // Click first tap card and pour a taster
  const firstTap = page.locator('button').filter({ hasText: /TAP/ }).first();
  await firstTap.click();
  await page.waitForTimeout(400);

  const modal = page.locator('[role="dialog"]');
  if (await modal.count() > 0) {
    // Verify modal has keg level info
    const modalText = await modal.textContent() || '';
    const hasKegBar = modalText.includes('oz left') || modalText.includes('bbl keg');
    console.log(`Pour modal shows keg info: ${hasKegBar}`);
    expect(hasKegBar).toBe(true);

    // Pour a Taster
    const tasterBtn = modal.locator('button').filter({ hasText: 'Taster' }).first();
    await tasterBtn.click();
    await page.waitForTimeout(400);
  }

  const after = await getKegLevels();
  console.log(`First keg level after Taster: ${after[0]?.level}%`);

  const anyDecreased = before.some((b, i) => after[i] && after[i].level < b.level);
  console.log(`Keg level decreased: ${anyDecreased}`);
  expect(anyDecreased).toBe(true);
  await page.screenshot({ path: `${DIR}/pos-keg-decrement.png` });
  console.log('POS keg decrement E2E ✅');
});

test('FINAL QA P9: Mobile responsiveness', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page);

  const overflowPages: string[] = [];
  for (const p of ['Dashboard', 'Customers', 'POS']) {
    const link = page.locator('nav').locator('button, a').filter({ hasText: new RegExp(`^${p}$`) }).first();
    if (await link.count() > 0) {
      await link.evaluate((el: HTMLElement) => el.click());
    } else {
      await page.locator(`text="${p}"`).first().evaluate((el: HTMLElement) => el.click());
    }
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${DIR}/mobile-${p.toLowerCase()}.png` });
    const hasOverflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth + 5);
    if (hasOverflow) overflowPages.push(p);
  }

  console.log(`Mobile overflow pages: ${overflowPages.length === 0 ? 'none' : overflowPages.join(', ')}`);
  expect(overflowPages).toHaveLength(0);
  console.log('Mobile responsive ✅');
});

test('FINAL QA P9: Brewing — new batch form submits', async ({ page }) => {
  await login(page);
  await nav(page, 'Brewing');

  const addBtn = page.locator('button').filter({ hasText: /New Batch/ }).first();
  await addBtn.click();
  await page.waitForTimeout(400);

  const dialog = page.locator('[role="dialog"]');
  expect(await dialog.count()).toBeGreaterThan(0);

  await dialog.locator('input').first().fill('P9 Test Brew');
  await dialog.locator('input').nth(1).fill('American Pale Ale');

  const submitBtn = dialog.locator('button[type="submit"]').first();
  await submitBtn.click();
  await page.waitForTimeout(700);

  const body = await page.locator('body').textContent() || '';
  expect(body.includes('P9 Test Brew')).toBe(true);
  console.log('Brewing batch creation (UUID beerId) ✅');
});
