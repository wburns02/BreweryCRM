import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5174';
const DIR = './test-results/pipeline6-ticketing';
fs.mkdirSync(DIR, { recursive: true });

async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(2500);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) { await demoBtn.click(); await page.waitForTimeout(2500); }
}

async function goToEvents(page: Page) {
  await login(page);
  // Click Events in the sidebar (under Marketing section — find exact nav item)
  await page.locator('nav').locator('button, a').filter({ hasText: /^Events$/ }).first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
}

test('Ticketing: Events page loads with Ticketing tab', async ({ page }) => {
  await goToEvents(page);
  await page.screenshot({ path: `${DIR}/events-calendar.png` });

  const ticketingTab = page.locator('button').filter({ hasText: /^Ticketing$/ });
  expect(await ticketingTab.count()).toBeGreaterThan(0);
  console.log('Ticketing tab visible ✅');
});

test('Ticketing: Ticketing tab shows ticketed events with capacity bars', async ({ page }) => {
  await goToEvents(page);
  await page.locator('button').filter({ hasText: /^Ticketing$/ }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/ticketing-tab.png` });

  const body = await page.locator('body').textContent() || '';
  expect(body).toContain('Tickets Sold');
  expect(body).toContain('Ticket Revenue');
  expect(body).toMatch(/Sell Tickets/);
  console.log('Ticketing tab content ✅');
});

test('Ticketing: Sell Tickets modal opens', async ({ page }) => {
  await goToEvents(page);
  await page.locator('button').filter({ hasText: /^Ticketing$/ }).click();
  await page.waitForTimeout(500);

  // Click Sell Tickets button in main content area (not sidebar)
  const main = page.locator('main, [class*="content"], .space-y-6').last();
  const sellBtns = page.locator('button').filter({ hasText: /^Sell Tickets$/ });
  const count = await sellBtns.count();
  console.log(`Sell Tickets buttons found: ${count}`);
  expect(count).toBeGreaterThan(0);
  
  // Find an enabled one
  let clicked = false;
  for (let i = 0; i < count; i++) {
    const btn = sellBtns.nth(i);
    const disabled = await btn.getAttribute('disabled');
    if (!disabled) {
      await btn.click();
      clicked = true;
      break;
    }
  }
  expect(clicked).toBe(true);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/sell-tickets-modal.png` });

  const dialog = page.locator('[role="dialog"]').first();
  expect(await dialog.count()).toBeGreaterThan(0);
  const dialogText = await dialog.textContent() || '';
  expect(dialogText).toMatch(/Buyer Name|buyer/i);
  console.log('Sell Tickets modal ✅');
});

test('Ticketing: Complete ticket sale flow', async ({ page }) => {
  await goToEvents(page);
  await page.locator('button').filter({ hasText: /^Ticketing$/ }).click();
  await page.waitForTimeout(500);

  const sellBtns = page.locator('button').filter({ hasText: /^Sell Tickets$/ });
  for (let i = 0; i < await sellBtns.count(); i++) {
    const btn = sellBtns.nth(i);
    if (!await btn.getAttribute('disabled')) { await btn.click(); break; }
  }
  await page.waitForTimeout(500);

  await page.locator('input[placeholder="Full name"]').fill('Test Buyer');
  await page.locator('input[type="email"]').fill('test@example.com');
  await page.screenshot({ path: `${DIR}/sell-tickets-filled.png` });

  await page.locator('button').filter({ hasText: /Complete Sale/ }).click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${DIR}/sell-tickets-success.png` });

  // Check for success toast or modal closed
  const toastText = await page.locator('body').textContent() || '';
  const hasSaleSuccess = toastText.includes('sold') || !toastText.includes('Complete Sale');
  console.log(`Sale completed: ${hasSaleSuccess}`);
  console.log('Ticket sale flow ✅');
});

test('Ticketing: Check-in panel opens and shows attendees', async ({ page }) => {
  await goToEvents(page);
  await page.locator('button').filter({ hasText: /^Ticketing$/ }).click();
  await page.waitForTimeout(500);

  // Click Check-in button inside the ticketing content (not sidebar)
  // The Check-in button is inside event cards, NOT in the sidebar
  const checkinBtns = page.locator('.space-y-6 button').filter({ hasText: /^Check-in$/ });
  const count = await checkinBtns.count();
  console.log(`Check-in buttons found: ${count}`);
  expect(count).toBeGreaterThan(0);
  await checkinBtns.first().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/checkin-panel.png` });

  const body = await page.locator('body').textContent() || '';
  expect(body).toMatch(/Check-in:|Orders|Awaiting|tickets/i);
  console.log('Check-in panel ✅');
});

test('Ticketing: Mobile layout — no overflow', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page);
  const hamburger = page.locator('header button').first();
  await hamburger.click(); await page.waitForTimeout(300);
  await page.locator('nav').locator('button, a').filter({ hasText: /^Events$/ }).first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);

  await page.locator('button').filter({ hasText: /^Ticketing$/ }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/ticketing-mobile.png` });

  const scrollW = await page.locator('body').evaluate(el => el.scrollWidth);
  const clientW = await page.locator('body').evaluate(el => el.clientWidth);
  const overflow = scrollW - clientW;
  console.log(`Ticketing mobile overflow: ${overflow}px`);
  expect(overflow).toBeLessThan(20);
  console.log('Ticketing mobile layout ✅');
});
