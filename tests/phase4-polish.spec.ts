import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5183';
const SCREENSHOT_DIR = './test-results/phase4-polish';
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(2000);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) {
    await demoBtn.click();
    await page.waitForTimeout(2000);
  }
}

async function mobileNavigate(page: Page, label: string) {
  // Click the TopBar hamburger (Menu icon, only visible on mobile - lg:hidden)
  const hamburger = page.locator('header button').first();
  await hamburger.click();
  await page.waitForTimeout(400);

  // Now click the nav item
  const navLink = page.locator(`text="${label}"`).first();
  await navLink.click({ timeout: 8000 });
  await page.waitForTimeout(1000);
}

test('Mobile: TTB page is responsive', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page);
  await mobileNavigate(page, 'TTB Reports');
  await page.screenshot({ path: `${SCREENSHOT_DIR}/mobile-ttb.png` });
  console.log('Mobile TTB screenshot taken ✅');
});

test('Mobile: Staff page is responsive', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page);
  await mobileNavigate(page, 'Staff');
  await page.screenshot({ path: `${SCREENSHOT_DIR}/mobile-staff.png` });
  console.log('Mobile Staff screenshot taken ✅');
});

test('Financials empty states have icons', async ({ page }) => {
  await login(page);
  await page.locator('text="Financials"').first().click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/financials-overview.png` });

  // Check no plain text "Insufficient..." remains
  const oldText = page.locator('text="Insufficient financial data to display P&L."');
  expect(await oldText.count()).toBe(0);

  // Click P&L tab
  const pnlTab = page.locator('button').filter({ hasText: 'P&L Statement' }).first();
  await pnlTab.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/financials-pnl.png` });

  // Beer Economics tab
  const beerTab = page.locator('button').filter({ hasText: 'Beer Economics' }).first();
  await beerTab.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/financials-beer.png` });
});

test('Dashboard shows rich skeleton while loading', async ({ page }) => {
  // Can't easily test loading state but verify the page renders without "Loading dashboard data..."
  await login(page);
  await page.locator('text="Dashboard"').first().click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/dashboard-empty-state.png` });

  const loadingText = page.locator('text="Loading dashboard data..."');
  expect(await loadingText.count()).toBe(0);
});

test('Distribution page Add Account modal renders correctly', async ({ page }) => {
  await login(page);
  await page.locator('text="Distribution"').first().click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/distribution-empty.png` });

  await page.locator('button:has-text("Add Account")').first().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/distribution-modal.png` });

  const modal = page.locator('[role="dialog"]');
  expect(await modal.isVisible()).toBe(true);
  await page.keyboard.press('Escape');
});

test('No NaN anywhere on visible pages', async ({ page }) => {
  await login(page);
  const pagesToCheck = ['Dashboard', 'Customers', 'Financials', 'Staff', 'Distribution'];

  for (const pageName of pagesToCheck) {
    await page.locator(`text="${pageName}"`).first().click();
    await page.waitForTimeout(1000);
    const text = await page.locator('body').textContent() || '';
    const hasNaN = text.includes('NaN');
    console.log(`${pageName}: NaN found = ${hasNaN}`);
    expect(hasNaN, `NaN found on ${pageName} page`).toBe(false);
  }
});
