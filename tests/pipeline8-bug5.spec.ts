import { test, Page } from '@playwright/test';
import * as fs from 'fs';
const DIR = './test-results/pipeline8-deep';
fs.mkdirSync(DIR, { recursive: true });
async function login(page: Page) {
  await page.goto('http://localhost:5175');
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
test('Brewing - advance batch to next stage', async ({ page }) => {
  await login(page);
  await nav(page, 'Brewing');
  await page.screenshot({ path: `${DIR}/brewing-list.png` });
  const advanceBtn = page.locator('button').filter({ hasText: /Advance|packaged|conditioning|Next/ }).first();
  if (await advanceBtn.count() > 0) {
    await advanceBtn.click(); await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/brewing-advance.png` });
    const body = await page.locator('body').textContent() || '';
    console.log(`Advance worked: ${body.includes('packaged') || body.includes('success') || body.includes('advanced')}`);
  } else {
    console.log('No advance button found in Brewing');
  }
});
test('Food & Menu - add menu item', async ({ page }) => {
  await login(page);
  await nav(page, 'Food & Menu');
  await page.screenshot({ path: `${DIR}/food-menu-main.png` });
  const addBtn = page.locator('button').filter({ hasText: /Add Item|New Item|Add Menu/ }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click(); await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/food-menu-modal.png` });
    const dialog = page.locator('[role="dialog"]');
    const inputs = await dialog.locator('input').count();
    console.log(`Food menu form inputs: ${inputs}`);
    if (inputs > 0) {
      await dialog.locator('input').first().fill('Test Pretzel Bites');
      const submitBtn = dialog.locator('button[type="submit"]').first();
      if (await submitBtn.count() > 0) {
        await submitBtn.click(); await page.waitForTimeout(500);
        await page.screenshot({ path: `${DIR}/food-menu-saved.png` });
        const body = await page.locator('body').textContent() || '';
        console.log(`Menu item saved: ${body.includes('Test Pretzel')}`);
      }
    }
  } else {
    console.log('⚠️ No add menu item button found');
    const body = await page.locator('body').textContent() || '';
    console.log(`Food menu content: ${body.substring(0, 200)}`);
  }
});
test('Keg Monitor page loads', async ({ page }) => {
  await login(page);
  await nav(page, 'Keg Monitor');
  await page.screenshot({ path: `${DIR}/keg-monitor-main.png` });
  const body = await page.locator('body').textContent() || '';
  console.log(`Keg Monitor has data: ${/keg|level|fill|BBL/i.test(body)}`);
  // Check for alert indicators
  const alerts = page.locator('[class*="red"], [class*="alert"], [class*="warning"]').first();
  console.log(`Keg Monitor has alerts: ${await alerts.count() > 0}`);
});
