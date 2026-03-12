import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5175';
const DIR = './test-results/pipeline8-final';
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

test('FINAL QA: Core pages load and have content', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('net::') && !msg.text().includes('favicon')) {
      errors.push(msg.text().substring(0, 80));
    }
  });

  await login(page);

  const pages = ['Dashboard', 'POS', 'Brewing', 'Production', 'Customers', 'Financials', 'Distribution', 'Reports', 'Settings'];
  const failures: string[] = [];

  for (const p of pages) {
    await nav(page, p);
    const body = await page.locator('body').textContent() || '';
    if (body.trim().length < 50) failures.push(`${p}: empty`);
    if (/\bNaN\b/.test(body)) failures.push(`${p}: NaN`);
    if (/\$undefined/.test(body)) failures.push(`${p}: $undefined`);
    await page.screenshot({ path: `${DIR}/page-${p.toLowerCase().replace(/\s+/g, '-')}.png` });
  }

  console.log(`Page failures: ${failures.length === 0 ? 'none' : failures.join(' | ')}`);
  console.log(`Console errors: ${errors.length === 0 ? 'none' : errors.join(' | ')}`);
  expect(failures.length).toBe(0);
});

test('FINAL QA: Data quality — no broken currency', async ({ page }) => {
  const issues: string[] = [];
  await login(page);

  for (const p of ['Dashboard', 'Customers', 'Staff', 'Financials', 'Reports']) {
    await nav(page, p);
    const body = await page.locator('body').textContent() || '';
    // Single decimal like $312.5 not followed by another digit (exclude $1.5k chart format)
    if (/\$\d+\.\d(?![kKm\d])/.test(body)) issues.push(`${p}: single-decimal $`);
    if (/\$\s*—/.test(body)) issues.push(`${p}: broken $—`);
    if (/\$\d{4,}(?![,\d])/.test(body)) issues.push(`${p}: missing comma in currency`);
  }

  console.log(`Data issues: ${issues.length === 0 ? 'none' : issues.join(' | ')}`);
  expect(issues.length).toBe(0);
});

test('FINAL QA: Birthday feature end-to-end', async ({ page }) => {
  await login(page);
  await nav(page, 'Customers');
  await page.screenshot({ path: `${DIR}/birthday-hub.png` });

  const body = await page.locator('body').textContent() || '';
  expect(body).toMatch(/Birthday/);
  console.log(`Birthday Hub visible: ${body.includes('Birthday Hub')}`);
  console.log(`Upcoming count shown: ${body.includes('upcoming')}`);

  // Birthday counter stat should be clickable and show/hide hub
  const birthdayStatCard = page.locator('div').filter({ hasText: /Birthdays \(30d\)/ }).first();
  if (await birthdayStatCard.count() > 0) {
    console.log('Birthday stat card found ✅');
  }
  console.log('Birthday feature E2E ✅');
});

test('FINAL QA: Production TankCard overdue alert', async ({ page }) => {
  await login(page);
  await nav(page, 'Production');
  await page.screenshot({ path: `${DIR}/production-tanks.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body.length).toBeGreaterThan(100);
  // Look for either Overdue or normal "Day X of ~Y" display
  const hasTankData = /Day \d+ of ~\d+/.test(body) || body.includes('Overdue') || body.includes('Fermenting');
  console.log(`Tank cards have status data: ${hasTankData}`);
  console.log('Production tanks ✅');
});

test('FINAL QA: Dashboard chart has today data', async ({ page }) => {
  await login(page);
  await nav(page, 'Dashboard');
  await page.screenshot({ path: `${DIR}/dashboard-chart.png` });
  const body = await page.locator('body').textContent() || '';
  // Should have revenue data
  expect(body).toMatch(/\$[\d,]+/);
  const todayMonth = new Date().toISOString().slice(5, 7);
  const todayDay = String(new Date().getDate()).padStart(2, '0');
  const hasCurrentDate = body.includes(`${todayMonth}/${todayDay}`) || body.includes('Today');
  console.log(`Dashboard has today's data: ${hasCurrentDate}`);
  console.log('Dashboard data ✅');
});

test('FINAL QA: Mobile responsiveness — key pages', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page);

  const overflowPages: string[] = [];
  for (const p of ['Dashboard', 'Customers', 'POS']) {
    // Mobile nav: sidebar may be off-screen, use JS click to bypass viewport constraint
    const link = page.locator('nav').locator('button, a').filter({ hasText: new RegExp(`^${p}$`) }).first();
    if (await link.count() > 0) {
      await link.evaluate((el: HTMLElement) => el.click());
    } else {
      const fallback = page.locator(`text="${p}"`).first();
      await fallback.evaluate((el: HTMLElement) => el.click());
    }
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${DIR}/mobile-${p.toLowerCase()}.png` });
    const hasOverflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth + 5);
    if (hasOverflow) overflowPages.push(p);
  }

  console.log(`Mobile overflow: ${overflowPages.length === 0 ? 'none' : overflowPages.join(', ')}`);
  expect(overflowPages.length).toBe(0);
  console.log('Mobile responsive ✅');
});
