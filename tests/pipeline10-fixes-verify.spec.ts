import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5175';
const DIR = './test-results/pipeline10-fixes';
fs.mkdirSync(DIR, { recursive: true });

async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(2500);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) { await demoBtn.click(); await page.waitForTimeout(2500); }
}

async function nav(page: Page, text: string) {
  const link = page.locator('nav').locator('button, a').filter({ hasText: new RegExp(`^${text}$`) }).first();
  if (await link.count() > 0) { await link.click({ timeout: 5000 }); await page.waitForTimeout(1500); return; }
  const fallback = page.locator('nav a, nav button').filter({ hasText: text }).first();
  if (await fallback.count() > 0) { await fallback.click({ timeout: 5000 }); await page.waitForTimeout(1500); }
}

test('FIX 1: Reservations — time displays in 12h format', async ({ page }) => {
  await login(page);
  await nav(page, 'Reservations');

  // Create a PM reservation
  const addBtn = page.locator('button').filter({ hasText: /Add Reservation|New/ }).first();
  await addBtn.click();
  await page.waitForTimeout(500);

  const modal = page.locator('[role="dialog"]').last();
  await modal.locator('input').first().fill('Fix Test Guest');
  await modal.locator('input[type="date"]').first().fill(new Date().toISOString().split('T')[0]);
  await modal.locator('input[type="time"]').first().fill('18:30');
  await modal.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(700);

  await page.screenshot({ path: `${DIR}/reservations-fix.png` });
  const body = await page.locator('body').textContent() || '';

  // Should show 6:30 PM, not 18 PM
  const has24hDisplay = /\b18\s*PM\b/.test(body);
  const has12hDisplay = /6:30\s*PM/.test(body) || /6:30PM/.test(body);
  console.log(`Has 24h "18 PM" bug: ${has24hDisplay}`);
  console.log(`Has 12h "6:30 PM": ${has12hDisplay}`);
  expect(has24hDisplay).toBe(false);
  expect(has12hDisplay).toBe(true);
  console.log('Reservations time display fix ✅');
});

test('FIX 2: SlidePanel — aria-hidden when closed', async ({ page }) => {
  await login(page);
  await nav(page, 'Events');

  // Check that closed SlidePanel has aria-hidden="true"
  const closedPanel = await page.evaluate(() => {
    const panels = Array.from(document.querySelectorAll('[role="dialog"]'));
    // Find the SlidePanel (the one with slide-panel-title)
    const slidePanel = panels.find(p => p.querySelector('#slide-panel-title'));
    return slidePanel ? slidePanel.getAttribute('aria-hidden') : null;
  });

  console.log(`Closed SlidePanel aria-hidden: "${closedPanel}"`);
  expect(closedPanel).toBe('true');

  // Now open a modal (New Event)
  const newEventBtn = page.locator('button').filter({ hasText: /New Event/ }).first();
  await newEventBtn.click();
  await page.waitForTimeout(400);

  // Verify only 1 non-hidden dialog is present
  const openDialogs = await page.evaluate(() => {
    const dialogs = Array.from(document.querySelectorAll('[role="dialog"]'));
    return dialogs.filter(d => d.getAttribute('aria-hidden') !== 'true').length;
  });
  console.log(`Open (non-hidden) dialogs: ${openDialogs}`);
  expect(openDialogs).toBe(1);

  await page.keyboard.press('Escape');
  console.log('SlidePanel aria-hidden fix ✅');
});

test('FIX 3: Marketing — campaign uses UUID id', async ({ page }) => {
  await login(page);
  await nav(page, 'Marketing');

  const createBtn = page.locator('button').filter({ hasText: /New Campaign/ }).first();
  await createBtn.click();
  await page.waitForTimeout(400);

  const modal = page.locator('[role="dialog"]').last();
  await modal.locator('input').first().fill('UUID Test Campaign');
  await modal.locator('input').nth(1).fill('Test Subject');
  await modal.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(700);

  await page.screenshot({ path: `${DIR}/marketing-fix.png` });
  const body = await page.locator('body').textContent() || '';
  const saved = body.includes('UUID Test Campaign');
  console.log(`Campaign saved: ${saved}`);
  expect(saved).toBe(true);

  // Verify no "camp-" prefixed ID appears in the DOM
  const hasCampId = await page.evaluate(() => {
    const html = document.documentElement.innerHTML;
    return /camp-\d{13}/.test(html);
  });
  console.log(`Has old camp-timestamp ID: ${hasCampId}`);
  expect(hasCampId).toBe(false);
  console.log('Marketing campaign UUID fix ✅');
});

test('FIX 4: Taproom Analytics — no $undefined in tooltip', async ({ page }) => {
  await login(page);
  await nav(page, 'Taproom Analytics');

  const trendsTab = page.locator('button').filter({ hasText: /Trends/ }).first();
  if (await trendsTab.count() > 0) {
    await trendsTab.click();
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: `${DIR}/taproom-analytics-fix.png` });
  const body = await page.locator('body').textContent() || '';
  const hasUndefined = body.includes('$undefined');
  console.log(`Has $undefined: ${hasUndefined}`);
  expect(hasUndefined).toBe(false);
  console.log('Taproom Analytics $undefined fix ✅');
});

test('FIX 5: Taps — revenue formatted with toLocaleString', async ({ page }) => {
  await login(page);
  await nav(page, 'Tap Management');
  await page.screenshot({ path: `${DIR}/taps-fix.png` });

  const body = await page.locator('body').textContent() || '';
  // Should have currency with decimal places
  const hasCurrency = /\$[\d,]+\.\d{2}/.test(body);
  console.log(`Taps has properly formatted currency: ${hasCurrency}`);
  // Should NOT have large unformatted amounts (>4 digits without comma)
  const hasUnformatted = /\$\d{5,}[^,\d]/.test(body);
  console.log(`Has unformatted large amount: ${hasUnformatted}`);
  expect(hasUnformatted).toBe(false);
  console.log('Taps revenue formatting fix ✅');
});
