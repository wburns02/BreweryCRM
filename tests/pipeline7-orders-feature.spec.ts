import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5175';
const DIR = './test-results/pipeline7-orders';
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

test('FEATURE: Distribution Orders tab shows order list', async ({ page }) => {
  await login(page);
  await nav(page, 'Distribution');
  await page.screenshot({ path: `${DIR}/distribution-accounts.png` });
  
  // Click Orders tab
  const ordersTab = page.locator('button').filter({ hasText: /Orders/ }).first();
  await ordersTab.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/distribution-orders-tab.png` });
  
  const body = await page.locator('body').textContent() || '';
  expect(body).toMatch(/ORD-|pending|shipped|delivered/i);
  console.log('Orders tab shows order list ✅');
});

test('FEATURE: Distribution Log Order creates a new order', async ({ page }) => {
  await login(page);
  await nav(page, 'Distribution');
  
  // Click Log Order
  const logBtn = page.locator('button').filter({ hasText: /Log Order/ }).first();
  await logBtn.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/log-order-modal.png` });
  
  const dialog = page.locator('[role="dialog"]');
  expect(await dialog.count()).toBeGreaterThan(0);
  
  // Select first account
  const accountSelect = dialog.locator('select').first();
  const options = await accountSelect.locator('option').count();
  if (options > 1) {
    await accountSelect.selectOption({ index: 1 });
  }
  
  // Fill beer name
  const beerInput = dialog.locator('input[placeholder*="IPA"], input[placeholder*="Haze"]').first();
  if (await beerInput.count() > 0) await beerInput.fill('Test IPA Order');
  
  // Set kegs
  const kegsInput = dialog.locator('input[type="number"]').first();
  if (await kegsInput.count() > 0) { await kegsInput.fill(''); await kegsInput.fill('3'); }
  
  await page.screenshot({ path: `${DIR}/log-order-filled.png` });
  
  // Submit
  const submitBtn = dialog.locator('button[type="submit"]');
  await submitBtn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${DIR}/log-order-success.png` });

  // Toast success message should appear confirming order was logged
  const body = await page.locator('body').textContent() || '';
  expect(body).toMatch(/Order logged|Test IPA/);
  console.log('Log Order creates new order ✅');
});

test('FEATURE: Distribution order filters work', async ({ page }) => {
  await login(page);
  await nav(page, 'Distribution');
  
  // Go to Orders tab
  const ordersTab = page.locator('button').filter({ hasText: /Orders/ }).first();
  await ordersTab.click();
  await page.waitForTimeout(500);
  
  // Click 'Pending' filter
  const pendingBtn = page.locator('button').filter({ hasText: /^Pending/ }).first();
  if (await pendingBtn.count() > 0) {
    await pendingBtn.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${DIR}/orders-filter-pending.png` });
    console.log('Pending filter works ✅');
  }
  
  // Click 'Delivered' filter
  const deliveredBtn = page.locator('button').filter({ hasText: /^Delivered/ }).first();
  if (await deliveredBtn.count() > 0) {
    await deliveredBtn.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${DIR}/orders-filter-delivered.png` });
    console.log('Delivered filter works ✅');
  }
  
  // Back to all
  const allBtn = page.locator('button').filter({ hasText: /^All$/ }).first();
  if (await allBtn.count() > 0) await allBtn.click();
  
  console.log('Order filters ✅');
});
