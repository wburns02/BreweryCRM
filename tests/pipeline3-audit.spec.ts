import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5184';
const DIR = './test-results/audit-p3';
fs.mkdirSync(DIR, { recursive: true });

async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(2000);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) {
    await demoBtn.click();
    await page.waitForTimeout(2500);
  }
}

const PAGES = [
  ['Dashboard', 'dashboard'],
  ['POS', 'pos'],
  ['Floor Plan', 'floor-plan'],
  ['Customers', 'customers'],
  ['Mug Club', 'mug-club'],
  ['Reservations', 'reservations'],
  ['Tap Management', 'taps'],
  ['Brewing', 'brewing'],
  ['Production', 'production'],
  ['Recipe Lab', 'recipes'],
  ['Keg Tracking', 'kegs'],
  ['Keg Monitor', 'keg-monitor'],
  ['Food & Menu', 'menu'],
  ['Inventory', 'inventory'],
  ['Taproom Analytics', 'analytics'],
  ['Events', 'events'],
  ['Marketing', 'marketing'],
  ['Financials', 'financials'],
  ['Staff', 'staff'],
  ['Distribution', 'distribution'],
  ['Reports', 'reports'],
  ['TTB Reports', 'ttb'],
  ['Settings', 'settings'],
];

test('AUDIT: All pages — NaN, blank, console errors', async ({ page }) => {
  const issues: string[] = [];
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const t = msg.text();
      if (!t.includes('net::') && !t.includes('favicon') && !t.includes('Failed to load resource') && !t.includes('CORS')) {
        consoleErrors.push(t.substring(0, 150));
      }
    }
  });

  await login(page);
  
  for (const [label, id] of PAGES) {
    try {
      await page.locator(`text="${label}"`).first().click({ timeout: 8000 });
      await page.waitForTimeout(1500);
      const body = await page.locator('body').textContent() || '';
      await page.screenshot({ path: `${DIR}/${id}.png` });
      
      if (body.includes('NaN')) issues.push(`${label}: NaN`);
      if (body.includes('Loading') && body.length < 500) issues.push(`${label}: possible blank/loading`);
      if (body.trim().length < 100) issues.push(`${label}: very short content (${body.trim().length} chars)`);
    } catch (e: any) {
      issues.push(`${label}: nav failed - ${e.message?.substring(0,60)}`);
    }
  }
  
  console.log('=== PAGE ISSUES ===');
  issues.forEach(i => console.log(' ISSUE:', i));
  console.log('=== CONSOLE ERRORS ===');
  consoleErrors.forEach(e => console.log(' ERR:', e));
  console.log(`Total issues: ${issues.length}, Console errors: ${consoleErrors.length}`);
});

test('AUDIT: Forms — try filling and saving each major form', async ({ page }) => {
  const results: string[] = [];
  await login(page);

  // Staff form
  try {
    await page.locator('text="Staff"').first().click({ timeout: 8000 });
    await page.waitForTimeout(1000);
    await page.locator('button').filter({ hasText: /Add Staff/ }).first().click({ timeout: 5000 });
    await page.waitForTimeout(500);
    const dialog = page.locator('[role="dialog"]');
    if (await dialog.isVisible()) {
      const firstInput = dialog.locator('input').first();
      await firstInput.fill('TestName');
      await dialog.locator('button[type="submit"]').click({ timeout: 3000 });
      await page.waitForTimeout(800);
      const body = await page.locator('body').textContent() || '';
      results.push(`Staff form: ${body.includes('TestName') ? 'SAVED ✅' : 'not visible after save ⚠️'}`);
    } else {
      results.push('Staff form: dialog did not open ❌');
    }
  } catch(e: any) { results.push(`Staff form: error - ${e.message?.substring(0,60)}`); }

  // Inventory form
  try {
    await page.locator('text="Inventory"').first().click({ timeout: 8000 });
    await page.waitForTimeout(1000);
    const addBtn = page.locator('button').filter({ hasText: /Add Item/ }).first();
    if (await addBtn.count() > 0) {
      await addBtn.click({ timeout: 3000 });
      await page.waitForTimeout(500);
      const dialog = page.locator('[role="dialog"]');
      if (await dialog.isVisible()) {
        await dialog.locator('input').first().fill('Test Hops');
        await dialog.locator('button[type="submit"]').click({ timeout: 3000 });
        await page.waitForTimeout(800);
        const body = await page.locator('body').textContent() || '';
        results.push(`Inventory form: ${body.includes('Test Hops') ? 'SAVED ✅' : 'not visible after save ⚠️'}`);
      } else {
        results.push('Inventory form: dialog did not open ❌');
      }
    } else {
      results.push('Inventory form: Add Item button missing ❌');
    }
  } catch(e: any) { results.push(`Inventory form: error - ${e.message?.substring(0,60)}`); }

  // Reservations form
  try {
    await page.locator('text="Reservations"').first().click({ timeout: 8000 });
    await page.waitForTimeout(1000);
    const addBtn = page.locator('button').filter({ hasText: /New Reservation|Add Reservation|Reserve/ }).first();
    if (await addBtn.count() > 0) {
      await addBtn.click({ timeout: 3000 });
      await page.waitForTimeout(500);
      const dialog = page.locator('[role="dialog"]');
      results.push(`Reservations form: dialog ${await dialog.isVisible() ? 'opened ✅' : 'did NOT open ❌'}`);
      if (await dialog.isVisible()) await page.keyboard.press('Escape');
    } else {
      results.push('Reservations form: New Reservation button missing ❌');
    }
  } catch(e: any) { results.push(`Reservations form: error - ${e.message?.substring(0,60)}`); }

  // Events form
  try {
    await page.locator('text="Events"').first().click({ timeout: 8000 });
    await page.waitForTimeout(1000);
    const addBtn = page.locator('button').filter({ hasText: /Add Event|New Event|Create Event/ }).first();
    if (await addBtn.count() > 0) {
      await addBtn.click({ timeout: 3000 });
      await page.waitForTimeout(500);
      const dialog = page.locator('[role="dialog"]');
      results.push(`Events form: dialog ${await dialog.isVisible() ? 'opened ✅' : 'did NOT open ❌'}`);
      if (await dialog.isVisible()) await page.keyboard.press('Escape');
    } else {
      results.push('Events form: Add Event button missing ❌');
    }
  } catch(e: any) { results.push(`Events form: error - ${e.message?.substring(0,60)}`); }

  // Marketing form
  try {
    await page.locator('text="Marketing"').first().click({ timeout: 8000 });
    await page.waitForTimeout(1000);
    const addBtn = page.locator('button').filter({ hasText: /New Campaign|Create Campaign|Add Campaign/ }).first();
    if (await addBtn.count() > 0) {
      await addBtn.click({ timeout: 3000 });
      await page.waitForTimeout(500);
      const dialog = page.locator('[role="dialog"]');
      results.push(`Marketing form: dialog ${await dialog.isVisible() ? 'opened ✅' : 'did NOT open ❌'}`);
      if (await dialog.isVisible()) await page.keyboard.press('Escape');
    } else {
      results.push('Marketing form: New Campaign button missing ❌');
    }
  } catch(e: any) { results.push(`Marketing form: error - ${e.message?.substring(0,60)}`); }

  // Recipe Lab
  try {
    await page.locator('text="Recipe Lab"').first().click({ timeout: 8000 });
    await page.waitForTimeout(1000);
    const addBtn = page.locator('button').filter({ hasText: /New Recipe|Add Recipe|Create Recipe/ }).first();
    if (await addBtn.count() > 0) {
      await addBtn.click({ timeout: 3000 });
      await page.waitForTimeout(800);
      const body = await page.locator('body').textContent() || '';
      results.push(`Recipe Lab: ${body.includes('Recipe') ? 'opened ✅' : 'may have issues ⚠️'}`);
    } else {
      results.push('Recipe Lab: New Recipe button missing ❌');
    }
  } catch(e: any) { results.push(`Recipe Lab: error - ${e.message?.substring(0,60)}`); }

  console.log('=== FORM RESULTS ===');
  results.forEach(r => console.log(' -', r));
});

test('AUDIT: Data quality — check for placeholder/stub data', async ({ page }) => {
  await login(page);
  const stubIssues: string[] = [];

  for (const [label, id] of PAGES) {
    try {
      await page.locator(`text="${label}"`).first().click({ timeout: 8000 });
      await page.waitForTimeout(1200);
      const body = await page.locator('body').textContent() || '';
      if (body.includes('TODO') || body.includes('placeholder') || body.includes('Coming soon') || body.includes('Under construction')) {
        stubIssues.push(`${label}: stub/TODO content`);
      }
      if (body.includes('$0.00') && body.includes('0%') && (label === 'Financials' || label === 'Reports' || label === 'Dashboard')) {
        stubIssues.push(`${label}: possible zero/empty data`);
      }
    } catch(e: any) { /* skip nav failures */ }
  }

  console.log('=== DATA QUALITY ===');
  stubIssues.forEach(i => console.log(' STUB:', i));
  if (stubIssues.length === 0) console.log(' All pages have real content ✅');
});
