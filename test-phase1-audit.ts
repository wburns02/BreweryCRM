import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:5183';
const SCREENSHOT_DIR = './test-results/phase1-audit';

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function login(page: Page) {
  await page.goto(BASE_URL);
  await sleep(2000);
  // Try demo login
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) {
    await demoBtn.click();
    await sleep(2000);
  } else {
    // Try credentials
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    if (await emailInput.count() > 0) {
      await emailInput.fill('admin@beardedhop.com');
      const pwInput = page.locator('input[type="password"]').first();
      await pwInput.fill('BrewDay2026!');
      await page.locator('button[type="submit"]').first().click();
      await sleep(2000);
    }
  }
}

async function auditPage(page: Page, navText: string, pageId: string, issues: string[]) {
  console.log(`\n--- Auditing: ${pageId} ---`);

  // Click nav item
  const navLinks = page.locator(`nav a, nav button, [data-page], [role="navigation"] *`);
  const sidebar = page.locator('nav, aside, [role="navigation"]');

  // Try to find the nav item
  const link = page.locator(`text="${navText}"`).first();
  if (await link.count() > 0) {
    await link.click();
    await sleep(1500);
  }

  // Take screenshot
  await page.screenshot({ path: `${SCREENSHOT_DIR}/${pageId}.png`, fullPage: false });

  // Check for error messages
  const errorTexts = await page.locator(':text("Error"), :text("Something went wrong"), :text("Cannot read"), :text("undefined")').allTextContents();
  if (errorTexts.length > 0) {
    issues.push(`[${pageId}] Console/UI errors: ${errorTexts.slice(0, 3).join(', ')}`);
  }

  // Check console errors
  return await page.title();
}

interface FormResult {
  field: string;
  filled: boolean;
  error?: string;
}

async function testForms(page: Page, pageId: string, issues: string[]) {
  // Look for forms and buttons
  const buttons = await page.locator('button:not([disabled])').all();
  const formInputs = await page.locator('input:not([type="hidden"]), textarea, select').all();

  console.log(`  Buttons: ${buttons.length}, Inputs: ${formInputs.length}`);

  // Check for "Add" / "New" / "Save" / "Create" buttons
  const addBtn = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create")').first();
  if (await addBtn.count() > 0) {
    const btnText = await addBtn.textContent();
    console.log(`  Found action button: "${btnText}"`);
    await addBtn.click();
    await sleep(1000);

    // Check if modal/form opened
    const modal = page.locator('[role="dialog"], .modal, [class*="modal"]');
    if (await modal.count() > 0) {
      console.log(`  Modal opened successfully`);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/${pageId}-modal.png` });

      // Try to close
      const closeBtn = page.locator('[role="dialog"] button:has-text("Cancel"), [role="dialog"] button:has-text("Close"), [aria-label="Close"]').first();
      if (await closeBtn.count() > 0) {
        await closeBtn.click();
        await sleep(500);
      } else {
        await page.keyboard.press('Escape');
        await sleep(500);
      }
    } else {
      issues.push(`[${pageId}] "${btnText}" button clicked but no modal/form appeared`);
    }
  }

  // Check for save buttons that might not work
  const saveBtn = page.locator('button:has-text("Save"), button[type="submit"]').first();
  if (await saveBtn.count() > 0) {
    const isDisabled = await saveBtn.getAttribute('disabled');
    if (isDisabled === null) {
      // Button is enabled, but we should check if form context exists
    }
  }
}

async function main() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const issues: string[] = [];
  const working: string[] = [];
  const consoleErrors: string[] = [];

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(`${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(`PAGE ERROR: ${err.message}`);
  });

  // Login
  console.log('Logging in...');
  await login(page);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/00-login.png` });
  console.log('Logged in. Current URL:', page.url());

  // Pages to audit: [navText, pageId]
  const pages = [
    ['Dashboard', 'dashboard'],
    ['POS', 'pos'],
    ['Floor Plan', 'floor-plan'],
    ['Taps', 'taps'],
    ['Brewing', 'brewing'],
    ['Production', 'production'],
    ['Recipes', 'recipes'],
    ['Kegs', 'kegs'],
    ['Inventory', 'inventory'],
    ['Menu', 'menu'],
    ['Customers', 'customers'],
    ['Mug Club', 'mug-club'],
    ['Taproom Analytics', 'taproom-analytics'],
    ['Financials', 'financials'],
    ['Events', 'events'],
    ['Reservations', 'reservations'],
    ['Staff', 'staff'],
    ['Distribution', 'distribution'],
    ['Marketing', 'marketing'],
    ['Reports', 'reports'],
    ['Settings', 'settings'],
  ];

  for (const [navText, pageId] of pages) {
    try {
      await auditPage(page, navText, pageId, issues);
      await testForms(page, pageId, issues);
      working.push(pageId);
    } catch (err: any) {
      issues.push(`[${pageId}] CRASH: ${err.message}`);
    }
    await sleep(500);
  }

  // Final responsive check
  await page.setViewportSize({ width: 375, height: 812 });
  const dashLink = page.locator('text="Dashboard"').first();
  if (await dashLink.count() > 0) await dashLink.click();
  await sleep(1000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/mobile-dashboard.png` });
  await page.setViewportSize({ width: 1280, height: 900 });

  await browser.close();

  // Report
  const report = {
    timestamp: new Date().toISOString(),
    pagesAudited: working.length,
    issues,
    consoleErrors: consoleErrors.slice(0, 20),
  };

  fs.writeFileSync(`${SCREENSHOT_DIR}/report.json`, JSON.stringify(report, null, 2));

  console.log('\n==================== AUDIT REPORT ====================');
  console.log(`Pages audited: ${working.length}`);
  console.log(`\nISSUES FOUND (${issues.length}):`);
  issues.forEach((i, n) => console.log(`  ${n+1}. ${i}`));
  console.log(`\nCONSOLE ERRORS (${consoleErrors.length}):`);
  consoleErrors.slice(0, 15).forEach((e, n) => console.log(`  ${n+1}. ${e}`));
  console.log('======================================================');
}

main().catch(console.error);
