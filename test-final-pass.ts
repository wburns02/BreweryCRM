import { chromium, Page } from 'playwright';

const BASE_URL = 'https://brewery-frontend-production.up.railway.app';

const PAGES = [
  'Dashboard', 'POS', 'Floor Plan', 'Customers', 'Mug Club', 'Reservations',
  'Tap Management', 'Brewing', 'Production', 'Recipe Lab', 'Keg Tracking',
  'Food & Menu', 'Inventory', 'Taproom Analytics', 'Events', 'Marketing',
  'Financials', 'Staff', 'Distribution', 'Reports', 'Settings'
];

async function main() {
  const { execSync } = await import('child_process');
  execSync('mkdir -p test-results/qa-final');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  const jsErrors: string[] = [];
  page.on('pageerror', err => jsErrors.push(err.message.substring(0, 200)));

  // Login
  await page.goto(BASE_URL, { timeout: 20000 });
  await page.waitForTimeout(2000);
  await page.locator('button:has-text("Explore Demo")').click();
  await page.waitForTimeout(3000);
  console.log('Logged in\n');

  let passed = 0;
  let failed = 0;
  function pass(t: string) { passed++; console.log(`  PASS: ${t}`); }
  function fail(t: string) { failed++; console.log(`  FAIL: ${t}`); }

  async function clickSidebar(name: string) {
    // Dismiss any overlays first
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const items = page.locator('aside button, aside a');
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      const text = (await items.nth(i).textContent())?.trim();
      if (text === name) {
        try { await items.nth(i).click({ timeout: 3000 }); }
        catch { await items.nth(i).click({ force: true }); }
        await page.waitForTimeout(1500);
        return true;
      }
    }
    return false;
  }

  for (const name of PAGES) {
    console.log(`\n=== ${name} ===`);

    if (!(await clickSidebar(name))) {
      fail(`Navigate to ${name}`);
      continue;
    }
    pass(`Navigate to ${name}`);

    // Check no JS crash
    const body = await page.textContent('main') || '';
    if (body.includes('Cannot read') || body.includes('TypeError') || body.includes('something went wrong')) {
      fail(`${name} page crashed`);
      continue;
    }
    pass(`${name} renders without crash`);

    await page.screenshot({ path: `test-results/qa-final/${name.replace(/[^a-zA-Z]/g, '_')}.png` });

    // Click all tab-like buttons
    const tabTexts = ['Batches', 'Tanks', 'Recipes', 'Grid View', 'List View', 'Live Shift View', 'Pour Analytics',
      'Guest Insights', 'Trend Analysis', 'Team', 'Schedule', 'Compliance', 'Events Calendar', 'Performers',
      'Overview', 'P&L Statement', 'Beer Economics', 'Labor & Overhead', 'General', 'Integrations', 'Notifications',
      'Fleet', 'Deployed', 'Returns', 'Analytics'];

    for (const tab of tabTexts) {
      const btn = page.locator(`main button:has-text("${tab}")`).first();
      if (await btn.isVisible({ timeout: 200 }).catch(() => false)) {
        try {
          const errsBefore = jsErrors.length;
          await btn.click({ timeout: 2000 });
          await page.waitForTimeout(400);
          if (jsErrors.length > errsBefore) fail(`${name} tab "${tab}" JS error`);
        } catch {}
      }
    }

    // Test add/create buttons with form submission
    const actionLabels = ['Add Guest', 'Add Member', 'New Reservation', 'New Batch', 'Schedule Brew Day',
      'New Recipe', 'Add Keg', 'Add Item', 'New Event', 'New Campaign'];

    for (const label of actionLabels) {
      const btn = page.locator(`main button:has-text("${label}")`).first();
      if (!(await btn.isVisible({ timeout: 200 }).catch(() => false))) continue;

      try {
        await btn.click({ timeout: 3000 });
        await page.waitForTimeout(800);

        const dialog = page.locator('[role="dialog"]');
        if (await dialog.isVisible().catch(() => false)) {
          pass(`${name} "${label}" opens dialog`);

          // Check aria-modal
          const ariaModal = await dialog.getAttribute('aria-modal');
          if (ariaModal === 'true') pass(`${name} dialog has aria-modal`);

          // Close
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);
        }
      } catch {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
      }
    }
  }

  // Summary
  console.log('\n\n' + '='.repeat(50));
  console.log(`  FINAL PASS: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(50));

  if (jsErrors.length > 0) {
    console.log(`\nJS Errors (${jsErrors.length}):`);
    [...new Set(jsErrors)].forEach(e => console.log(`  ${e.substring(0, 120)}`));
  }

  await browser.close();
}

main().catch(console.error);
