import { test, Page } from '@playwright/test';

const BASE = 'http://localhost:5177';
const DIR = 'test-results/pipeline13-polish';

async function login(page: Page) {
  await page.goto(BASE);
  await page.waitForTimeout(800);
  const demoBtn = page.locator('button').filter({ hasText: /explore demo/i }).first();
  if (await demoBtn.count() > 0) {
    await demoBtn.click();
    await page.waitForTimeout(1500);
  }
}

async function nav(page: Page, label: string) {
  const btn = page.locator('aside button').filter({ hasText: new RegExp(label, 'i') }).first();
  if (await btn.count() > 0) {
    await btn.scrollIntoViewIfNeeded();
    await btn.click({ timeout: 5000 });
    await page.waitForTimeout(900);
  }
}

const pages = [
  'Dashboard', 'POS', 'Floor Plan', 'Customers', 'Mug Club',
  'Beer Ratings', 'Reservations', 'Tap Menu Board',
  'Financials', 'Marketing', 'Staff', 'Inventory',
  'Tap Management', 'Brewing', 'Recipe Lab', 'Keg Tracking',
  'Events', 'Distribution', 'Reports', 'Settings',
];

test('Polish audit — screenshot all pages', async ({ page }) => {
  await login(page);
  for (const p of pages) {
    await nav(page, p);
    const slug = p.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const errors = await page.evaluate(() => {
      const errs: string[] = [];
      // Check for visible error messages
      document.querySelectorAll('[class*="error"], [class*="Error"]').forEach(el => {
        if ((el as HTMLElement).offsetParent !== null) errs.push(el.textContent || '');
      });
      return errs;
    });
    if (errors.length > 0) console.log(`${p} visible errors:`, errors);
    await page.screenshot({ path: `${DIR}/${slug}.png`, fullPage: false });
    console.log(`${p}: captured`);
  }
  console.log('Polish audit complete');
});
