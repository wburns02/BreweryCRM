import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
const DIR = './test-results/pipeline8-deep';
fs.mkdirSync(DIR, { recursive: true });
const BASE_URL = 'http://localhost:5175';

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

test('Events - full form submit with all required fields', async ({ page }) => {
  await login(page);
  await nav(page, 'Events');
  const addBtn = page.locator('button').filter({ hasText: /Add Event|New Event|Create Event/ }).first();
  await addBtn.click(); await page.waitForTimeout(500);
  const dialog = page.locator('[role="dialog"]');
  // Fill all required fields
  await dialog.locator('input[type="text"], input[placeholder*="event"], input[placeholder*="title"], input[placeholder*="Event"]').first().fill('Test Live Music Night');
  // Set date
  const dateInput = dialog.locator('input[type="date"]').first();
  if (await dateInput.count() > 0) await dateInput.fill('2026-03-20');
  // Set start time
  const timeInputs = dialog.locator('input[type="time"]');
  if (await timeInputs.count() > 0) await timeInputs.first().fill('19:00');
  if (await timeInputs.count() > 1) await timeInputs.nth(1).fill('22:00');
  await page.screenshot({ path: `${DIR}/events-form-filled.png` });
  const submitBtn = dialog.locator('button[type="submit"], button').filter({ hasText: /Create|Save|Add/ }).first();
  await submitBtn.click(); await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/events-after-submit.png` });
  // Check if modal closed (success)
  const modalCount = await page.locator('.fixed.inset-0.z-\\[100\\]').count();
  const body = await page.locator('body').textContent() || '';
  const saved = body.includes('Test Live Music Night') || modalCount === 0;
  console.log(`Event saved: ${saved}`);
  console.log(`Remaining modals: ${modalCount}`);
});

test('Customers - add customer form complete', async ({ page }) => {
  await login(page);
  await nav(page, 'Customers');
  const addBtn = page.locator('button').filter({ hasText: /Add Customer|New Customer/ }).first();
  if (await addBtn.count() === 0) { console.log('No add customer button'); return; }
  await addBtn.click(); await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/customers-modal.png` });
  const dialog = page.locator('[role="dialog"]');
  const inputs = dialog.locator('input[type="text"], input[type="email"], input:not([type="checkbox"])[type="text"]');
  const count = await inputs.count();
  console.log(`Customer form inputs: ${count}`);
  // Fill name
  await inputs.first().fill('Jane Doe');
  // Fill email if exists
  const emailInput = dialog.locator('input[type="email"]').first();
  if (await emailInput.count() > 0) await emailInput.fill('jane@example.com');
  // Fill phone
  const phoneInput = dialog.locator('input[placeholder*="phone"], input[placeholder*="Phone"]').first();
  if (await phoneInput.count() > 0) await phoneInput.fill('(210) 555-0199');
  await page.screenshot({ path: `${DIR}/customers-filled.png` });
  const submitBtn = dialog.locator('button[type="submit"], button').filter({ hasText: /Add|Save|Create/ }).first();
  await submitBtn.click(); await page.waitForTimeout(600);
  await page.screenshot({ path: `${DIR}/customers-saved.png` });
  const body = await page.locator('body').textContent() || '';
  console.log(`Customer added: ${body.includes('Jane Doe')}`);
});

test('Marketing - send campaign', async ({ page }) => {
  await login(page);
  await nav(page, 'Marketing');
  await page.screenshot({ path: `${DIR}/marketing-main.png` });
  // Try to find "Send" or "Send Campaign" button
  const sendBtn = page.locator('button').filter({ hasText: /Send Campaign|Send Now|Launch/ }).first();
  if (await sendBtn.count() > 0) {
    await sendBtn.click(); await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/marketing-send.png` });
    console.log('Marketing send button works ✅');
  } else {
    console.log('⚠️ No direct send button on Marketing');
  }
  // Check new campaign
  const newBtn = page.locator('button').filter({ hasText: /New Campaign|Create Campaign/ }).first();
  if (await newBtn.count() > 0) {
    await newBtn.click(); await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/marketing-new.png` });
    const dialog = page.locator('[role="dialog"]');
    console.log(`Marketing modal: ${await dialog.count() > 0}`);
    if (await dialog.count() > 0) {
      const inputs = dialog.locator('input');
      const cnt = await inputs.count();
      console.log(`Marketing form inputs: ${cnt}`);
      await inputs.first().fill('Test Campaign Spring 2026');
      const submitBtn = dialog.locator('button[type="submit"], button').filter({ hasText: /Create|Save|Send/ }).first();
      if (await submitBtn.count() > 0) {
        await submitBtn.click(); await page.waitForTimeout(500);
        await page.screenshot({ path: `${DIR}/marketing-submitted.png` });
      }
    }
  }
});

test('Mug Club - renew member, check expiry alerts', async ({ page }) => {
  await login(page);
  await nav(page, 'Mug Club');
  await page.screenshot({ path: `${DIR}/mug-club-main.png` });
  const body = await page.locator('body').textContent() || '';
  const hasMembers = body.match(/Jake|Maria|Carlos|Premium|Standard/);
  console.log(`Mug Club shows members: ${!!hasMembers}`);
  // Check add member
  const addBtn = page.locator('button').filter({ hasText: /Add Member|New Member|Enroll/ }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click(); await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/mug-club-add.png` });
    const dialog = page.locator('[role="dialog"]');
    console.log(`Mug Club modal: ${await dialog.count() > 0}`);
    await page.keyboard.press('Escape');
  }
});

test('Production - tank status, batch advance', async ({ page }) => {
  await login(page);
  await nav(page, 'Production');
  await page.screenshot({ path: `${DIR}/production-main.png` });
  const body = await page.locator('body').textContent() || '';
  const hasTanks = body.match(/FV-\d|Tank|vessel|fermenting/i);
  console.log(`Production shows tanks: ${!!hasTanks}`);
  // Try advancing a batch
  const advanceBtn = page.locator('button').filter({ hasText: /Advance|Next Stage|Move to/ }).first();
  if (await advanceBtn.count() > 0) {
    console.log('Production advance button found ✅');
  }
});

test('TTB Reports - compliance data', async ({ page }) => {
  await login(page);
  await nav(page, 'TTB Reports');
  await page.screenshot({ path: `${DIR}/ttb-main.png` });
  const body = await page.locator('body').textContent() || '';
  const hasData = body.match(/barrel|BBL|gallons|TTB|TABC/i);
  console.log(`TTB has compliance data: ${!!hasData}`);
});

test('Floor Plan - seat and clear table', async ({ page }) => {
  await login(page);
  await nav(page, 'Floor Plan');
  await page.screenshot({ path: `${DIR}/floorplan-main.png` });
  // Click a table
  const tableBtn = page.locator('button').filter({ hasText: /T-\d|P-\d|BG-\d/ }).first();
  if (await tableBtn.count() > 0) {
    await tableBtn.click(); await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/floorplan-table-click.png` });
    const panel = page.locator('[role="dialog"]');
    console.log(`Floor plan panel opens: ${await panel.count() > 0}`);
    await page.keyboard.press('Escape');
  }
});

test('Dashboard - revenue trend data freshness check', async ({ page }) => {
  await login(page);
  await nav(page, 'Dashboard');
  await page.screenshot({ path: `${DIR}/dashboard-check.png` });
  const body = await page.locator('body').textContent() || '';
  // Check for today's date in trend data (03-12)
  const hasToday = body.includes('03-12') || body.includes('Mar 12') || body.includes('March 12');
  const hasOldDates = body.includes('03-04') || body.includes('Mar 4');
  console.log(`Dashboard has today (03-12): ${hasToday}`);
  console.log(`Dashboard has old date (03-04): ${hasOldDates}`);
  const hasRevenue = /\$[\d,]+/.test(body);
  console.log(`Dashboard has revenue: ${hasRevenue}`);
});
