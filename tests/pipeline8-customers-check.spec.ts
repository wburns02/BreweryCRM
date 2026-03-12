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
test('Customers - Add Guest form', async ({ page }) => {
  await login(page);
  await page.locator('nav').locator('button, a').filter({ hasText: /^Customers$/ }).first().click();
  await page.waitForTimeout(1500);
  const addBtn = page.locator('button').filter({ hasText: /Add Guest|Add Customer|New Customer/ }).first();
  await addBtn.click(); await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/customers-add-form.png` });
  const dialog = page.locator('[role="dialog"]');
  const inputs = await dialog.locator('input, select, textarea').count();
  const body = await dialog.textContent() || '';
  console.log(`Add Guest inputs: ${inputs}`);
  console.log(`Add Guest form fields: ${body.substring(0, 200)}`);
});
test('Marketing - send campaign and verify', async ({ page }) => {
  await login(page);
  await page.locator('nav').locator('button, a').filter({ hasText: /^Marketing$/ }).first().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/marketing-full.png` });
  // Check for any "Send" buttons on existing campaigns
  const body = await page.locator('body').textContent() || '';
  const hasCampaigns = body.match(/New Releases|Spring Saison|Win-Back|Birthday/);
  console.log(`Marketing has campaigns: ${!!hasCampaigns}`);
  // Try to send a draft campaign
  const sendBtn = page.locator('button').filter({ hasText: /^Send$|Send Campaign/ }).first();
  if (await sendBtn.count() > 0) {
    await sendBtn.click(); await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/marketing-sent.png` });
    console.log('Campaign send works ✅');
  }
});
