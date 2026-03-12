import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE = 'http://localhost:5184';
const DIR = './test-results/audit-p4';
fs.mkdirSync(DIR, { recursive: true });

async function login(page: Page) {
  await page.goto(BASE);
  await page.waitForTimeout(2000);
  const btn = page.locator('button:has-text("Explore Demo")');
  if (await btn.count() > 0) { await btn.click(); await page.waitForTimeout(2500); }
}

const PAGES = [
  ['Dashboard','dashboard'],['POS','pos'],['Floor Plan','floor-plan'],
  ['Customers','customers'],['Mug Club','mug-club'],['Reservations','reservations'],
  ['Tap Management','taps'],['Brewing','brewing'],['Production','production'],
  ['Recipe Lab','recipes'],['Keg Tracking','kegs'],['Keg Monitor','keg-monitor'],
  ['Food & Menu','menu'],['Inventory','inventory'],['Taproom Analytics','analytics'],
  ['Events','events'],['Marketing','marketing'],['Financials','financials'],
  ['Staff','staff'],['Distribution','distribution'],['Reports','reports'],
  ['TTB Reports','ttb'],['Settings','settings'],
];

test('AUDIT: scan all pages for issues', async ({ page }) => {
  const issues: Record<string, string[]> = {};
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const t = msg.text();
      if (!t.includes('net::') && !t.includes('favicon') && !t.includes('Failed to load') && !t.includes('CORS'))
        consoleErrors.push(t.substring(0, 120));
    }
  });
  await login(page);

  for (const [label, id] of PAGES) {
    try {
      await page.locator(`text="${label}"`).first().click({ timeout: 6000 });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${DIR}/${id}.png` });
      const body = await page.locator('body').textContent() || '';
      const pg: string[] = [];
      if (body.includes('NaN')) pg.push('NaN');
      if (body.includes('undefined') && !body.includes('undefined behavior')) pg.push('undefined');
      if (body.trim().length < 200) pg.push(`short:${body.trim().length}`);
      if (pg.length) issues[label] = pg;
      console.log(`${label}: ${pg.length ? pg.join(',') : '✅'}`);
    } catch(e: any) {
      issues[label] = [`nav-fail:${e.message?.substring(0,40)}`];
    }
  }
  console.log('=== ISSUES ===');
  Object.entries(issues).forEach(([k,v]) => console.log(` ${k}: ${v.join(', ')}`));
  console.log('=== CONSOLE ERRORS ===');
  consoleErrors.slice(0,10).forEach(e => console.log(` ERR: ${e.substring(0,100)}`));
});

test('AUDIT: deep interaction test', async ({ page }) => {
  const results: Record<string, string> = {};
  await login(page);

  // 1. Tap Management - can we update a tap?
  try {
    await page.locator('text="Tap Management"').first().click({ timeout: 6000 });
    await page.waitForTimeout(1200);
    const body = await page.locator('body').textContent() || '';
    const tapCount = (body.match(/Tap\s*\d+/g) || []).length;
    results['Taps'] = `taps visible:${tapCount}`;
    // Try clicking a tap to edit
    const tapCard = page.locator('button').filter({ hasText: /Edit|Update|Assign/ }).first();
    if (await tapCard.count() > 0) {
      await tapCard.click(); await page.waitForTimeout(500);
      results['Taps edit'] = 'edit button clicked';
      await page.keyboard.press('Escape');
    } else {
      results['Taps edit'] = 'no edit button ❌';
    }
  } catch(e: any) { results['Taps'] = `err: ${e.message?.substring(0,40)}`; }

  // 2. Floor Plan - can we seat/clear tables?
  try {
    await page.locator('text="Floor Plan"').first().click({ timeout: 6000 });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${DIR}/floor-plan-deep.png` });
    const body = await page.locator('body').textContent() || '';
    const tableCount = (body.match(/Table\s*\d+|T-\d+/gi) || []).length;
    results['Floor Plan'] = `tables:${tableCount}`;
    // Try clicking a table
    const tableEl = page.locator('[class*="table"], [class*="Table"], .cursor-pointer').first();
    if (await tableEl.count() > 0) {
      await tableEl.click({ timeout: 2000 });
      await page.waitForTimeout(500);
      results['Floor Plan click'] = 'table clicked';
    }
  } catch(e: any) { results['Floor Plan'] = `err`; }

  // 3. Inventory - add and delete item
  try {
    await page.locator('text="Inventory"').first().click({ timeout: 6000 });
    await page.waitForTimeout(1200);
    const addBtn = page.locator('button').filter({ hasText: /Add Item/ }).first();
    if (await addBtn.count() > 0) {
      await addBtn.click(); await page.waitForTimeout(500);
      const dialog = page.locator('[role="dialog"]');
      if (await dialog.isVisible()) {
        await dialog.locator('input').first().fill('Citra Hops 2oz');
        await dialog.locator('button[type="submit"]').click(); await page.waitForTimeout(600);
        const body = await page.locator('body').textContent() || '';
        results['Inventory add'] = body.includes('Citra Hops') ? 'saved ✅' : 'not visible ❌';
      }
    }
  } catch(e: any) { results['Inventory'] = `err`; }

  // 4. Events - create event
  try {
    await page.locator('text="Events"').first().click({ timeout: 6000 });
    await page.waitForTimeout(1200);
    const addBtn = page.locator('button').filter({ hasText: /Add Event|New Event|Create/ }).first();
    if (await addBtn.count() > 0) {
      await addBtn.click(); await page.waitForTimeout(500);
      const dialog = page.locator('[role="dialog"]');
      if (await dialog.isVisible()) {
        await dialog.locator('input').first().fill('Oktoberfest Night');
        const submitBtn = dialog.locator('button[type="submit"]');
        if (await submitBtn.count() > 0) {
          await submitBtn.click(); await page.waitForTimeout(600);
          const body = await page.locator('body').textContent() || '';
          results['Events add'] = body.includes('Oktoberfest') ? 'saved ✅' : 'not visible ❌';
        } else {
          await page.keyboard.press('Escape');
          results['Events'] = 'no submit button ❌';
        }
      }
    }
  } catch(e: any) { results['Events'] = `err`; }

  // 5. Recipe Lab - click a recipe and see detail
  try {
    await page.locator('text="Recipe Lab"').first().click({ timeout: 6000 });
    await page.waitForTimeout(1200);
    const newBtn = page.locator('button').filter({ hasText: /New Recipe|Create Recipe/ }).first();
    if (await newBtn.count() > 0) {
      results['Recipe Lab'] = 'has New Recipe button ✅';
    } else {
      results['Recipe Lab'] = 'no New Recipe button ❌';
    }
    // Click existing recipe
    const recipeCard = page.locator('.cursor-pointer, [onclick]').first();
    if (await recipeCard.count() > 0) {
      await recipeCard.click({ timeout: 2000 }); await page.waitForTimeout(600);
      await page.screenshot({ path: `${DIR}/recipe-detail.png` });
    }
  } catch(e: any) { results['Recipe Lab'] = `err`; }

  // 6. Marketing - create campaign
  try {
    await page.locator('text="Marketing"').first().click({ timeout: 6000 });
    await page.waitForTimeout(1200);
    const body = await page.locator('body').textContent() || '';
    results['Marketing data'] = body.includes('Campaign') || body.includes('Email') ? 'has data ✅' : 'empty ❌';
    const sendBtn = page.locator('button').filter({ hasText: /Send|Launch|Activate/ }).first();
    results['Marketing send'] = await sendBtn.count() > 0 ? 'Send button present ✅' : 'no Send button ❌';
  } catch(e: any) { results['Marketing'] = `err`; }

  // 7. Staff scheduling
  try {
    await page.locator('text="Staff"').first().click({ timeout: 6000 });
    await page.waitForTimeout(1200);
    const body = await page.locator('body').textContent() || '';
    results['Staff schedule'] = body.includes('schedule') || body.includes('Schedule') || body.includes('shift') ? 'has schedule ✅' : 'no schedule ❌';
    // Click a staff member
    const staffRow = page.locator('tbody tr, [class*="staff-card"]').first();
    if (await staffRow.count() > 0) {
      await staffRow.click({ timeout: 2000 }); await page.waitForTimeout(600);
      await page.screenshot({ path: `${DIR}/staff-detail.png` });
      const panel = page.locator('[role="dialog"]').first();
      results['Staff detail'] = await panel.isVisible() ? 'panel opened ✅' : 'no detail panel ❌';
      if (await panel.isVisible()) await page.keyboard.press('Escape');
    }
  } catch(e: any) { results['Staff'] = `err`; }

  // 8. Taproom Analytics - check chart data richness
  try {
    await page.locator('text="Taproom Analytics"').first().click({ timeout: 6000 });
    await page.waitForTimeout(1500);
    const body = await page.locator('body').textContent() || '';
    const svgCount = await page.locator('svg').count();
    results['Analytics'] = `SVGs:${svgCount} hasRevenue:${body.includes('Revenue') || body.includes('revenue')}`;
    await page.screenshot({ path: `${DIR}/analytics.png` });
  } catch(e: any) { results['Analytics'] = `err`; }

  // 9. Financials - check all tabs
  try {
    await page.locator('text="Financials"').first().click({ timeout: 6000 });
    await page.waitForTimeout(1200);
    for (const tab of ["P&L Statement", "Labor & Overhead", "Beer Economics"]) {
      const btn = page.locator('button').filter({ hasText: tab }).first();
      if (await btn.count() > 0) {
        await btn.click(); await page.waitForTimeout(500);
        const body = await page.locator('body').textContent() || '';
        results[`Financials ${tab}`] = body.includes('NaN') ? 'NaN ❌' : '✅';
      }
    }
    // Check for Cash Flow / Budget tab
    const cashFlow = page.locator('button').filter({ hasText: /Cash Flow|Budget|Forecast/ }).first();
    results['Financials cash flow'] = await cashFlow.count() > 0 ? 'has tab ✅' : 'no cash flow tab ❌';
  } catch(e: any) { results['Financials'] = `err`; }

  // 10. Production - check tank detail
  try {
    await page.locator('text="Production"').first().click({ timeout: 6000 });
    await page.waitForTimeout(1500);
    const body = await page.locator('body').textContent() || '';
    results['Production'] = body.includes('Tank Farm') ? 'Tank Farm ✅' : '❌';
    await page.screenshot({ path: `${DIR}/production.png` });
  } catch(e: any) { results['Production'] = `err`; }

  console.log('=== INTERACTION RESULTS ===');
  Object.entries(results).forEach(([k,v]) => console.log(`  ${k}: ${v}`));
});

test('AUDIT: UX gaps vs competitors', async ({ page }) => {
  await login(page);
  const gaps: string[] = [];

  // Check for customer loyalty/points redemption (Arryved)
  await page.locator('text="Customers"').first().click({ timeout: 6000 });
  await page.waitForTimeout(1200);
  const custBody = await page.locator('body').textContent() || '';
  if (!custBody.includes('Redeem') && !custBody.includes('redeem')) gaps.push('No loyalty point redemption (Arryved feature)');
  if (!custBody.includes('Check In') && !custBody.includes('check-in') && !custBody.includes('checkin')) gaps.push('No customer check-in flow (Arryved)');

  // Check for menu publishing with ratings (Untappd)
  await page.locator('text="Food & Menu"').first().click({ timeout: 6000 });
  await page.waitForTimeout(1200);
  const menuBody = await page.locator('body').textContent() || '';
  if (!menuBody.includes('rating') && !menuBody.includes('Rating') && !menuBody.includes('star')) gaps.push('No customer ratings on menu (Untappd feature)');
  if (!menuBody.includes('publish') && !menuBody.includes('Publish') && !menuBody.includes('QR')) gaps.push('No menu publishing/QR code (Untappd feature)');

  // Check for event ticketing (Arryved)
  await page.locator('text="Events"').first().click({ timeout: 6000 });
  await page.waitForTimeout(1200);
  const evBody = await page.locator('body').textContent() || '';
  if (!evBody.includes('ticket') && !evBody.includes('Ticket') && !evBody.includes('RSVP')) gaps.push('No event ticketing/RSVP (Arryved feature)');

  // Check for distributor portal (Ollie)
  await page.locator('text="Distribution"').first().click({ timeout: 6000 });
  await page.waitForTimeout(1200);
  const distBody = await page.locator('body').textContent() || '';
  if (!distBody.includes('invoice') && !distBody.includes('Invoice')) gaps.push('No invoice generation for distributors (Ollie feature)');

  // Check for staff scheduling completeness
  await page.locator('text="Staff"').first().click({ timeout: 6000 });
  await page.waitForTimeout(1200);
  const staffBody = await page.locator('body').textContent() || '';
  if (!staffBody.includes('Schedule') && !staffBody.includes('schedule')) {
    gaps.push('No staff scheduling calendar (basic HR feature)');
  } else {
    // Does it have a weekly view with shift editing?
    const editShiftBtn = page.locator('button').filter({ hasText: /Edit Shift|Add Shift|Schedule/ }).first();
    if (await editShiftBtn.count() === 0) gaps.push('Staff has schedule display but no shift editing');
  }

  // Check Recipe Lab for costing integration
  await page.locator('text="Recipe Lab"').first().click({ timeout: 6000 });
  await page.waitForTimeout(1200);
  const recipeBody = await page.locator('body').textContent() || '';
  if (!recipeBody.includes('cost') && !recipeBody.includes('Cost')) gaps.push('Recipe Lab has no cost integration (now have in Brewing tab but not recipes)');

  console.log('=== COMPETITOR GAPS ===');
  gaps.forEach((g, i) => console.log(`  ${i+1}. ${g}`));
  console.log(`\nTotal gaps: ${gaps.length}`);
});
