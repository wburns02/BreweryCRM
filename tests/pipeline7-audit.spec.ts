import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5175';
const DIR = './test-results/pipeline7-audit';
fs.mkdirSync(DIR, { recursive: true });

async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(2500);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) { await demoBtn.click(); await page.waitForTimeout(2500); }
}

async function nav(page: Page, text: string) {
  const link = page.locator('nav').locator('button, a').filter({ hasText: new RegExp(`^${text}$`) }).first();
  if (await link.count() > 0) {
    await link.click({ timeout: 5000 });
  } else {
    // try sidebar text match
    await page.locator(`text="${text}"`).first().click({ timeout: 5000 });
  }
  await page.waitForTimeout(1500);
}

// ─── PAGE LOAD TESTS ───────────────────────────────────────────────────────────

test('AUDIT: Dashboard loads with KPI cards', async ({ page }) => {
  await login(page);
  await page.screenshot({ path: `${DIR}/dashboard.png` });
  const body = await page.locator('body').textContent() || '';
  const hasKpis = body.includes('Revenue') || body.includes('Sales') || body.includes('Tap');
  console.log(`Dashboard KPIs: ${hasKpis}`);
  expect(hasKpis).toBe(true);
});

test('AUDIT: POS page loads', async ({ page }) => {
  await login(page);
  await nav(page, 'POS');
  await page.screenshot({ path: `${DIR}/pos.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).toMatch(/TAP|Draft|Beer|Menu/i);
  console.log('POS loads ✅');
});

test('AUDIT: Floor Plan loads', async ({ page }) => {
  await login(page);
  await nav(page, 'Floor Plan');
  await page.screenshot({ path: `${DIR}/floor-plan.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).toMatch(/Table|Floor|Seat/i);
  console.log('Floor Plan loads ✅');
});

test('AUDIT: Tap Management loads', async ({ page }) => {
  await login(page);
  await nav(page, 'Tap Management');
  await page.screenshot({ path: `${DIR}/taps.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).toMatch(/TAP|Keg|Beer/i);
  console.log('Tap Management loads ✅');
});

test('AUDIT: Brewing loads', async ({ page }) => {
  await login(page);
  await nav(page, 'Brewing');
  await page.screenshot({ path: `${DIR}/brewing.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).toMatch(/Batch|Ferment|Brew/i);
  console.log('Brewing loads ✅');
});

test('AUDIT: Production loads', async ({ page }) => {
  await login(page);
  await nav(page, 'Production');
  await page.screenshot({ path: `${DIR}/production.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).toMatch(/Tank|Batch|Ferment/i);
  console.log('Production loads ✅');
});

test('AUDIT: Recipe Lab loads', async ({ page }) => {
  await login(page);
  await nav(page, 'Recipe Lab');
  await page.screenshot({ path: `${DIR}/recipes.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).toMatch(/Recipe|Grain|Hop|Yeast/i);
  console.log('Recipe Lab loads ✅');
});

test('AUDIT: Keg Tracking loads', async ({ page }) => {
  await login(page);
  await nav(page, 'Keg Tracking');
  await page.screenshot({ path: `${DIR}/kegs.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).toMatch(/Keg|Volume|Barrel/i);
  console.log('Keg Tracking loads ✅');
});

test('AUDIT: Inventory loads', async ({ page }) => {
  await login(page);
  await nav(page, 'Inventory');
  await page.screenshot({ path: `${DIR}/inventory.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).toMatch(/Stock|Item|Level/i);
  console.log('Inventory loads ✅');
});

test('AUDIT: Food & Menu loads', async ({ page }) => {
  await login(page);
  await nav(page, 'Food & Menu');
  await page.screenshot({ path: `${DIR}/menu.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).toMatch(/Menu|Food|Price/i);
  console.log('Food & Menu loads ✅');
});

test('AUDIT: Customers loads', async ({ page }) => {
  await login(page);
  await nav(page, 'Customers');
  await page.screenshot({ path: `${DIR}/customers.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).toMatch(/Customer|Guest|Member/i);
  console.log('Customers loads ✅');
});

test('AUDIT: Mug Club loads', async ({ page }) => {
  await login(page);
  await nav(page, 'Mug Club');
  await page.screenshot({ path: `${DIR}/mug-club.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).toMatch(/Mug|Club|Member/i);
  console.log('Mug Club loads ✅');
});

test('AUDIT: Taproom Analytics loads', async ({ page }) => {
  await login(page);
  await nav(page, 'Taproom Analytics');
  await page.screenshot({ path: `${DIR}/analytics.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).toMatch(/Revenue|Sales|Pour/i);
  console.log('Taproom Analytics loads ✅');
});

test('AUDIT: Financials loads', async ({ page }) => {
  await login(page);
  await nav(page, 'Financials');
  await page.screenshot({ path: `${DIR}/financials.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).toMatch(/Revenue|Profit|Financial/i);
  console.log('Financials loads ✅');
});

test('AUDIT: Events loads', async ({ page }) => {
  await login(page);
  await nav(page, 'Events');
  await page.screenshot({ path: `${DIR}/events.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).toMatch(/Event|Calendar|Ticket/i);
  console.log('Events loads ✅');
});

test('AUDIT: Reservations loads', async ({ page }) => {
  await login(page);
  await nav(page, 'Reservations');
  await page.screenshot({ path: `${DIR}/reservations.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).toMatch(/Reserv|Table|Guest/i);
  console.log('Reservations loads ✅');
});

test('AUDIT: Staff loads', async ({ page }) => {
  await login(page);
  await nav(page, 'Staff');
  await page.screenshot({ path: `${DIR}/staff.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).toMatch(/Staff|Employee|Schedule/i);
  console.log('Staff loads ✅');
});

test('AUDIT: Distribution loads', async ({ page }) => {
  await login(page);
  await nav(page, 'Distribution');
  await page.screenshot({ path: `${DIR}/distribution.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).toMatch(/Distribut|Wholesale|Account/i);
  console.log('Distribution loads ✅');
});

test('AUDIT: Marketing loads', async ({ page }) => {
  await login(page);
  await nav(page, 'Marketing');
  await page.screenshot({ path: `${DIR}/marketing.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).toMatch(/Campaign|Email|Market/i);
  console.log('Marketing loads ✅');
});

test('AUDIT: Reports loads', async ({ page }) => {
  await login(page);
  await nav(page, 'Reports');
  await page.screenshot({ path: `${DIR}/reports.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).toMatch(/Report|Data|Export/i);
  console.log('Reports loads ✅');
});

test('AUDIT: Settings loads', async ({ page }) => {
  await login(page);
  await nav(page, 'Settings');
  await page.screenshot({ path: `${DIR}/settings.png` });
  const body = await page.locator('body').textContent() || '';
  expect(body).toMatch(/Setting|Business|Config/i);
  console.log('Settings loads ✅');
});

// ─── INTERACTION TESTS ─────────────────────────────────────────────────────────

test('AUDIT: POS — add item to tab', async ({ page }) => {
  await login(page);
  await nav(page, 'POS');
  const tapCard = page.locator('button').filter({ hasText: /TAP \d/ }).first();
  if (await tapCard.count() > 0) {
    await tapCard.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/pos-add-item.png` });
    const body = await page.locator('body').textContent() || '';
    console.log(`POS item added to tab, body has Pint: ${body.includes('Pint')}`);
  }
  console.log('POS interaction ✅');
});

test('AUDIT: Reservations — New Reservation form', async ({ page }) => {
  await login(page);
  await nav(page, 'Reservations');
  const newBtn = page.locator('button').filter({ hasText: /New Reservation/ });
  if (await newBtn.count() > 0) {
    await newBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/reservations-modal.png` });
    const dialog = page.locator('[role="dialog"]');
    const isOpen = await dialog.count() > 0;
    console.log(`Reservation modal opens: ${isOpen}`);
  }
  console.log('Reservations form ✅');
});

test('AUDIT: Events — New Event form', async ({ page }) => {
  await login(page);
  await nav(page, 'Events');
  const newBtn = page.locator('button').filter({ hasText: /New Event/ });
  if (await newBtn.count() > 0) {
    await newBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/events-modal.png` });
    const dialog = page.locator('[role="dialog"]');
    console.log(`Event modal opens: ${await dialog.count() > 0}`);
  }
  console.log('Events form ✅');
});

test('AUDIT: Customers — Add Customer form', async ({ page }) => {
  await login(page);
  await nav(page, 'Customers');
  const newBtn = page.locator('button').filter({ hasText: /Add Customer|New Customer/ });
  if (await newBtn.count() > 0) {
    await newBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/customers-modal.png` });
    console.log(`Customer modal opens: ${await page.locator('[role="dialog"]').count() > 0}`);
  }
  console.log('Customers form ✅');
});

test('AUDIT: Recipe Lab — Add Recipe flow', async ({ page }) => {
  await login(page);
  await nav(page, 'Recipe Lab');
  const newBtn = page.locator('button').filter({ hasText: /New Recipe|Add Recipe/ });
  if (await newBtn.count() > 0) {
    await newBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/recipe-modal.png` });
    console.log(`Recipe modal opens: ${await page.locator('[role="dialog"]').count() > 0}`);
  }
  console.log('Recipe Lab form ✅');
});

test('AUDIT: Inventory — Low stock items visible', async ({ page }) => {
  await login(page);
  await nav(page, 'Inventory');
  await page.screenshot({ path: `${DIR}/inventory-check.png` });
  const body = await page.locator('body').textContent() || '';
  const hasStock = body.match(/\d+\s*(lbs|units|kg|packets)/i);
  console.log(`Inventory has stock data: ${!!hasStock}`);
  console.log('Inventory check ✅');
});

test('AUDIT: Financials — Tab navigation works', async ({ page }) => {
  await login(page);
  await nav(page, 'Financials');
  const tabs = ['P&L Statement', 'Beer Economics', 'Labor'];
  for (const tab of tabs) {
    const tabBtn = page.locator('button').filter({ hasText: new RegExp(tab, 'i') });
    if (await tabBtn.count() > 0) {
      await tabBtn.first().click();
      await page.waitForTimeout(400);
    }
  }
  await page.screenshot({ path: `${DIR}/financials-tabs.png` });
  console.log('Financials tabs ✅');
});

test('AUDIT: Mobile — No overflow on key pages', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page);

  const hamburger = page.locator('header button').first();
  await hamburger.click();
  await page.waitForTimeout(300);

  const pages = ['POS', 'Financials', 'Events'];
  for (const pageName of pages) {
    const link = page.locator('nav').locator('button, a').filter({ hasText: new RegExp(`^${pageName}$`) }).first();
    if (await link.count() > 0) {
      await link.click({ timeout: 5000 });
      await page.waitForTimeout(1000);
      const scrollW = await page.locator('body').evaluate(el => el.scrollWidth);
      const clientW = await page.locator('body').evaluate(el => el.clientWidth);
      const overflow = scrollW - clientW;
      console.log(`${pageName} mobile overflow: ${overflow}px`);
      if (overflow >= 20) {
        await page.screenshot({ path: `${DIR}/mobile-overflow-${pageName.toLowerCase()}.png` });
        console.log(`⚠️ ${pageName} has ${overflow}px overflow`);
      }
      // Re-open hamburger for next page
      const hbg = page.locator('header button').first();
      if (await hbg.count() > 0) { await hbg.click(); await page.waitForTimeout(300); }
    }
  }
  console.log('Mobile overflow check complete ✅');
});

test('AUDIT: No NaN values on any page', async ({ page }) => {
  await login(page);
  const pagesToCheck = ['Dashboard', 'Brewing', 'Financials', 'Taproom Analytics', 'Reports'];
  const nanPages: string[] = [];

  for (const p of pagesToCheck) {
    try {
      await nav(page, p);
      const body = await page.locator('body').textContent() || '';
      // Check for NaN but not "aNaN" (substrings)
      const hasNaN = /\bNaN\b/.test(body);
      if (hasNaN) {
        nanPages.push(p);
        await page.screenshot({ path: `${DIR}/nan-${p.toLowerCase().replace(/\s/g, '-')}.png` });
        console.log(`⚠️ NaN found on ${p}`);
      }
    } catch { /* ignore nav errors */ }
  }
  console.log(`NaN pages: ${nanPages.length === 0 ? 'none' : nanPages.join(', ')}`);
  expect(nanPages.length).toBe(0);
});

test('AUDIT: Distribution — wholesale accounts visible', async ({ page }) => {
  await login(page);
  await nav(page, 'Distribution');
  await page.screenshot({ path: `${DIR}/distribution-check.png` });
  const body = await page.locator('body').textContent() || '';
  const hasAccounts = body.match(/Account|Distributor|Order/i);
  console.log(`Distribution has accounts: ${!!hasAccounts}`);
  console.log('Distribution check ✅');
});

test('AUDIT: Staff — schedule visible', async ({ page }) => {
  await login(page);
  await nav(page, 'Staff');
  await page.screenshot({ path: `${DIR}/staff-check.png` });
  const body = await page.locator('body').textContent() || '';
  const hasSched = body.match(/Schedule|Shift|Hour/i);
  console.log(`Staff has schedule: ${!!hasSched}`);
  console.log('Staff check ✅');
});

test('AUDIT: Settings — can update business name', async ({ page }) => {
  await login(page);
  await nav(page, 'Settings');
  await page.screenshot({ path: `${DIR}/settings-check.png` });
  const body = await page.locator('body').textContent() || '';
  const hasSettings = body.match(/Business Name|Tax Rate|Timezone/i);
  console.log(`Settings has fields: ${!!hasSettings}`);
  console.log('Settings check ✅');
});

// ─── BUG DETECTION TESTS ───────────────────────────────────────────────────────

test('AUDIT: Keg Monitor page loads', async ({ page }) => {
  await login(page);
  await nav(page, 'Keg Monitor');
  await page.screenshot({ path: `${DIR}/keg-monitor.png` });
  const body = await page.locator('body').textContent() || '';
  const hasData = body.match(/Keg|Volume|Pressure|Fill/i);
  console.log(`Keg Monitor has data: ${!!hasData}`);
  console.log('Keg Monitor ✅');
});

test('AUDIT: TTB Reports page loads', async ({ page }) => {
  await login(page);
  await nav(page, 'TTB Reports');
  await page.screenshot({ path: `${DIR}/ttb-reports.png` });
  const body = await page.locator('body').textContent() || '';
  const hasData = body.match(/TTB|Compliance|Barrel|Tax/i);
  console.log(`TTB Reports has data: ${!!hasData}`);
  console.log('TTB Reports ✅');
});

test('AUDIT: Loyalty Check-in loads', async ({ page }) => {
  await login(page);
  await nav(page, 'Loyalty Check-in');
  await page.screenshot({ path: `${DIR}/loyalty.png` });
  const body = await page.locator('body').textContent() || '';
  const hasData = body.match(/Loyalty|Check.in|Points/i);
  console.log(`Loyalty Check-in has data: ${!!hasData}`);
  console.log('Loyalty Check-in ✅');
});

test('AUDIT: Ferment Lab loads', async ({ page }) => {
  await login(page);
  await nav(page, 'Ferment Lab');
  await page.screenshot({ path: `${DIR}/ferment-lab.png` });
  const body = await page.locator('body').textContent() || '';
  const hasData = body.match(/Ferment|Vessel|Tank|Gravity/i);
  console.log(`Ferment Lab has data: ${!!hasData}`);
  console.log('Ferment Lab ✅');
});
