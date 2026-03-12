import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5183';
const SCREENSHOT_DIR = './test-results/phase1-audit';
const issues: string[] = [];
const working: string[] = [];

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(2000);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) {
    await demoBtn.click();
    await page.waitForTimeout(2000);
  } else {
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.count() > 0) {
      await emailInput.fill('admin@beardedhop.com');
      await page.locator('input[type="password"]').first().fill('BrewDay2026!');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(2000);
    }
  }
}

async function navigateTo(page: Page, navText: string) {
  const link = page.locator(`text="${navText}"`).first();
  if (await link.count() > 0) {
    await link.click();
    await page.waitForTimeout(1500);
    return true;
  }
  return false;
}

test.describe('Phase 1: Full App Audit', () => {
  let consoleErrors: string[] = [];

  test.beforeAll(async ({ browser }) => {});

  test('Login page works', async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    await login(page);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/00-after-login.png` });
    const url = page.url();
    console.log('After login URL:', url);
    // Verify we're past login
    const sidebar = page.locator('nav, aside, [class*="sidebar"]').first();
    expect(await sidebar.count()).toBeGreaterThan(0);
  });

  const pages = [
    { nav: 'Dashboard', id: 'dashboard' },
    { nav: 'POS', id: 'pos' },
    { nav: 'Floor Plan', id: 'floor-plan' },
    { nav: 'Taps', id: 'taps' },
    { nav: 'Brewing', id: 'brewing' },
    { nav: 'Production', id: 'production' },
    { nav: 'Recipes', id: 'recipes' },
    { nav: 'Kegs', id: 'kegs' },
    { nav: 'Inventory', id: 'inventory' },
    { nav: 'Menu', id: 'menu' },
    { nav: 'Customers', id: 'customers' },
    { nav: 'Mug Club', id: 'mug-club' },
    { nav: 'Taproom Analytics', id: 'taproom-analytics' },
    { nav: 'Financials', id: 'financials' },
    { nav: 'Events', id: 'events' },
    { nav: 'Reservations', id: 'reservations' },
    { nav: 'Staff', id: 'staff' },
    { nav: 'Distribution', id: 'distribution' },
    { nav: 'Marketing', id: 'marketing' },
    { nav: 'Reports', id: 'reports' },
    { nav: 'Settings', id: 'settings' },
  ];

  for (const { nav, id } of pages) {
    test(`Page: ${nav}`, async ({ page }) => {
      const pageErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') pageErrors.push(msg.text());
      });
      page.on('pageerror', err => {
        pageErrors.push(`PAGE ERROR: ${err.message}`);
      });

      await login(page);
      const found = await navigateTo(page, nav);

      if (!found) {
        console.log(`  WARN: Nav item "${nav}" not found`);
        issues.push(`[${id}] Nav link "${nav}" not found in sidebar`);
      }

      await page.screenshot({ path: `${SCREENSHOT_DIR}/${id}.png`, fullPage: false });

      // Check for blank/error content
      const body = await page.locator('main, [class*="content"], [class*="page"]').first().textContent().catch(() => '');
      console.log(`  Content preview: "${body?.slice(0, 80)}"`);

      // Check for Add/New buttons
      const addButtons = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create")');
      const addCount = await addButtons.count();
      console.log(`  Add/New buttons: ${addCount}`);

      if (addCount > 0) {
        const firstBtn = addButtons.first();
        const btnText = await firstBtn.textContent();
        await firstBtn.click();
        await page.waitForTimeout(1000);

        const modal = page.locator('[role="dialog"]');
        if (await modal.count() > 0) {
          console.log(`  ✅ Modal opened for "${btnText}"`);
          await page.screenshot({ path: `${SCREENSHOT_DIR}/${id}-modal.png` });
          // Close modal
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        } else {
          // Check if a form appeared inline
          const form = page.locator('form');
          if (await form.count() > 0) {
            console.log(`  ✅ Inline form appeared for "${btnText}"`);
          } else {
            console.log(`  ❌ "${btnText}" clicked but nothing appeared`);
            issues.push(`[${id}] "${btnText?.trim()}" button clicked — no modal or form appeared`);
          }
        }
      }

      if (pageErrors.length > 0) {
        console.log(`  Console errors (${pageErrors.length}): ${pageErrors[0]}`);
        issues.push(`[${id}] ${pageErrors.length} console error(s): ${pageErrors[0].slice(0, 100)}`);
      }

      working.push(id);
    });
  }

  test('Mobile responsive check', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await login(page);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/mobile-dashboard.png` });

    // Check if sidebar is hidden or hamburger exists on mobile
    const hamburger = page.locator('[aria-label*="menu"], button:has-text("☰"), button[class*="hamburger"], button[class*="menu"]');
    const sidebar = page.locator('nav, aside');

    const hamburgerVisible = await hamburger.first().isVisible().catch(() => false);
    const sidebarVisible = await sidebar.first().isVisible().catch(() => false);

    console.log(`Mobile: hamburger=${hamburgerVisible}, sidebar visible=${sidebarVisible}`);
    if (!hamburgerVisible && sidebarVisible) {
      // Sidebar might overlay content on mobile — check width
      const sidebarBox = await sidebar.first().boundingBox();
      if (sidebarBox && sidebarBox.width > 300) {
        issues.push('[mobile] Sidebar takes full width on mobile — no hamburger menu');
      }
    }
    await page.screenshot({ path: `${SCREENSHOT_DIR}/mobile-check.png` });
  });

  test.afterAll(async () => {
    const report = {
      timestamp: new Date().toISOString(),
      issues,
      working,
    };
    fs.writeFileSync(`${SCREENSHOT_DIR}/report.json`, JSON.stringify(report, null, 2));
    console.log('\n====== PHASE 1 REPORT ======');
    console.log(`Pages working: ${working.length}`);
    console.log(`Issues found: ${issues.length}`);
    issues.forEach((i, n) => console.log(`  ${n+1}. ${i}`));
    console.log('============================');
  });
});
