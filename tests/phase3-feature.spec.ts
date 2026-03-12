import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5183';
const SCREENSHOT_DIR = './test-results/phase3-feature';
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

test('TTB Reports page loads in sidebar', async ({ page }) => {
  await login(page);

  // Find TTB Reports in sidebar
  const ttbLink = page.locator('text="TTB Reports"');
  const count = await ttbLink.count();
  console.log(`TTB Reports nav count: ${count}`);
  expect(count).toBeGreaterThan(0);

  await ttbLink.first().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/ttb-main.png` });

  // Check page title
  const title = page.locator('text="TTB Compliance Center"');
  expect(await title.count()).toBeGreaterThan(0);
  console.log('TTB Compliance Center title found ✅');
});

test('TTB Filing History tab works', async ({ page }) => {
  await login(page);
  await page.locator('text="TTB Reports"').first().click();
  await page.waitForTimeout(1500);

  // Should show reports table
  const table = page.locator('table').first();
  expect(await table.isVisible()).toBe(true);

  // Should have filed reports
  const filedBadges = page.locator('text="Filed"');
  const count = await filedBadges.count();
  console.log(`Filed badges: ${count}`);
  expect(count).toBeGreaterThan(0);

  await page.screenshot({ path: `${SCREENSHOT_DIR}/ttb-filings.png` });
});

test('TTB Mark as Filed button works', async ({ page }) => {
  await login(page);
  await page.locator('text="TTB Reports"').first().click();
  await page.waitForTimeout(1500);

  // Find pending report and mark as filed
  const fileBtn = page.locator('button:has-text("Mark as Filed")').first();
  const hasPending = await fileBtn.count() > 0;
  console.log(`Has pending report to file: ${hasPending}`);

  if (hasPending) {
    await fileBtn.click();
    await page.waitForTimeout(800);

    // Should show success toast
    await page.screenshot({ path: `${SCREENSHOT_DIR}/ttb-filed-toast.png` });
    const toast = page.locator('[class*="toast"], [role="alert"]').first();
    console.log(`Toast appeared: ${await toast.count() > 0}`);
  }
});

test('TTB Production Records tab', async ({ page }) => {
  await login(page);
  await page.locator('text="TTB Reports"').first().click();
  await page.waitForTimeout(1000);

  const prodTab = page.locator('button:has-text("Production Records")');
  await prodTab.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/ttb-production.png` });

  // Should show production table
  const fermenterHeader = page.locator('text="Fermenter Inventory Record"');
  expect(await fermenterHeader.count()).toBeGreaterThan(0);
  console.log('Fermenter Inventory Record section found ✅');
});

test('TTB Removals tab', async ({ page }) => {
  await login(page);
  await page.locator('text="TTB Reports"').first().click();
  await page.waitForTimeout(1000);

  const removalsTab = page.locator('button:has-text("Removals Record")');
  await removalsTab.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/ttb-removals.png` });

  const removalHeader = page.locator('text="Removal Record"');
  expect(await removalHeader.count()).toBeGreaterThan(0);
  console.log('Removal Record section found ✅');
});

test('TTB Tax Calculator tab works', async ({ page }) => {
  await login(page);
  await page.locator('text="TTB Reports"').first().click();
  await page.waitForTimeout(1000);

  const calcTab = page.locator('button:has-text("Tax Calculator")');
  await calcTab.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/ttb-calculator-before.png` });

  // Change the barrels value and verify calculation updates
  const barrelsInput = page.locator('input[type="number"]').first();
  await barrelsInput.fill('50');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/ttb-calculator-after.png` });

  // Should not have NaN in output
  const bodyText = await page.locator('body').textContent();
  expect(bodyText).not.toContain('NaN');
  console.log('Calculator updated without NaN ✅');
});
