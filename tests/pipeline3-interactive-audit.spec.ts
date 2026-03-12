import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5184';
const DIR = './test-results/audit-p3-interactive';
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

test('DEEP: Dashboard KPIs and charts present', async ({ page }) => {
  await login(page);
  await page.locator('text="Dashboard"').first().click({ timeout: 8000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${DIR}/dashboard.png` });
  const body = await page.locator('body').textContent() || '';
  console.log('Dashboard content preview:', body.substring(0,400));
  // Check for KPI cards
  const hasRevenue = body.includes('Revenue') || body.includes('revenue') || body.includes('$');
  console.log(`Revenue data: ${hasRevenue}`);
  const hasCharts = await page.locator('svg').count();
  console.log(`SVG charts: ${hasCharts}`);
});

test('DEEP: POS — add item to tab, close tab flow', async ({ page }) => {
  await login(page);
  await page.locator('text="POS"').first().click({ timeout: 8000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${DIR}/pos-initial.png` });
  const body = await page.locator('body').textContent() || '';
  console.log('POS beers visible:', body.includes('Hill Country') || body.includes('Haze') || body.includes('Blonde'));
  
  // Try clicking a beer
  const beerCard = page.locator('.grid button').first();
  if (await beerCard.count() > 0) {
    await beerCard.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${DIR}/pos-beer-clicked.png` });
    const modal = page.locator('[role="dialog"]');
    if (await modal.isVisible()) {
      console.log('Pour size modal: opened ✅');
      // Click first pour size
      await modal.locator('button').first().click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${DIR}/pos-item-added.png` });
      console.log('Item added to tab ✅');
      // Check if charge/close button is visible
      const chargeBtn = page.locator('button').filter({ hasText: /Charge|Close Tab|Send to Tab/ }).first();
      console.log(`Charge/Close button: ${await chargeBtn.count() > 0 ? 'visible ✅' : 'missing ❌'}`);
    } else {
      console.log('Pour size modal: NOT opened ❌');
    }
  }
});

test('DEEP: Customers — detail slide panel', async ({ page }) => {
  await login(page);
  await page.locator('text="Customers"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/customers.png` });
  
  // Click first customer
  const firstRow = page.locator('tr, [data-row]').nth(1);
  if (await firstRow.count() > 0) {
    await firstRow.click({ timeout: 3000 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${DIR}/customers-detail.png` });
    const panel = page.locator('[role="dialog"], aside, .slide-panel').first();
    console.log(`Customer detail panel: ${await panel.isVisible() ? 'opened ✅' : 'not opened ⚠️'}`);
  }
  const body = await page.locator('body').textContent() || '';
  const hasCustomers = body.includes('Total Customers') || body.includes('customer') || body.includes('@');
  console.log(`Has customer data: ${hasCustomers}`);
});

test('DEEP: Brewing — batch workflow buttons', async ({ page }) => {
  await login(page);
  await page.locator('text="Brewing"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/brewing.png` });
  const body = await page.locator('body').textContent() || '';
  
  // Check batches exist
  console.log('Has batch data:', body.includes('BH-') || body.includes('batch') || body.includes('Batch'));
  console.log('Has status buttons:', body.includes('Advance') || body.includes('advance') || body.includes('In Progress'));
  
  // Check "Add Gravity Reading" button
  const gravityBtn = page.locator('button').filter({ hasText: /Gravity|gravity/ }).first();
  console.log(`Gravity reading button: ${await gravityBtn.count() > 0 ? 'present ✅' : 'missing'}`);
  
  // Try advance status on first batch
  const advanceBtn = page.locator('button').filter({ hasText: /Advance|Next Step|Move/ }).first();
  if (await advanceBtn.count() > 0) {
    await advanceBtn.click({ timeout: 3000 });
    await page.waitForTimeout(600);
    console.log('Advance status clicked ✅');
  }
});

test('DEEP: Recipe Lab — CRUD flow', async ({ page }) => {
  await login(page);
  await page.locator('text="Recipe Lab"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/recipes.png` });
  const body = await page.locator('body').textContent() || '';
  console.log('Has recipes:', body.includes('Recipe') || body.includes('Hops') || body.includes('IBU'));
  
  // Click a recipe
  const recipeCard = page.locator('[role="button"], button, .cursor-pointer').filter({ hasText: /IPA|Lager|Stout|Blonde|Ale/ }).first();
  if (await recipeCard.count() > 0) {
    await recipeCard.click({ timeout: 3000 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${DIR}/recipes-detail.png` });
    const detailBody = await page.locator('body').textContent() || '';
    console.log('Recipe detail shows:', detailBody.includes('Fermentables') || detailBody.includes('Hops') || detailBody.includes('ABV'));
  }
});

test('DEEP: Keg Tracking — CRUD', async ({ page }) => {
  await login(page);
  await page.locator('text="Keg Tracking"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/kegs.png` });
  const body = await page.locator('body').textContent() || '';
  console.log('Has kegs:', body.includes('KEG-') || body.includes('keg') || body.includes('Keg'));
  
  const addBtn = page.locator('button').filter({ hasText: /Add Keg|New Keg/ }).first();
  if (await addBtn.count() > 0) {
    await addBtn.click({ timeout: 3000 });
    await page.waitForTimeout(500);
    const dialog = page.locator('[role="dialog"]');
    console.log(`Add Keg modal: ${await dialog.isVisible() ? 'opened ✅' : 'not opened ❌'}`);
    if (await dialog.isVisible()) await page.keyboard.press('Escape');
  } else {
    console.log('Add Keg button: missing ❌');
  }
});

test('DEEP: Distribution — account detail', async ({ page }) => {
  await login(page);
  await page.locator('text="Distribution"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/distribution.png` });
  const body = await page.locator('body').textContent() || '';
  console.log('Has accounts:', body.includes('Account') || body.includes('Wholesale') || body.includes('Distributor'));
  
  // Try clicking an account
  const accountRow = page.locator('tr, .cursor-pointer').nth(1);
  if (await accountRow.count() > 0) {
    await accountRow.click({ timeout: 3000 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${DIR}/distribution-detail.png` });
  }
  
  // Check for order management
  const orderBtn = page.locator('button').filter({ hasText: /New Order|Add Order|Place Order/ }).first();
  console.log(`Order button: ${await orderBtn.count() > 0 ? 'present ✅' : 'missing - no order mgmt ❌'}`);
});

test('DEEP: Mug Club — member management', async ({ page }) => {
  await login(page);
  await page.locator('text="Mug Club"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/mug-club.png` });
  const body = await page.locator('body').textContent() || '';
  console.log('Has members:', body.includes('Member') || body.includes('member') || body.includes('Mug'));
  
  // Check for key actions
  const addBtn = page.locator('button').filter({ hasText: /Add Member|New Member|Enroll/ }).first();
  console.log(`Add Member button: ${await addBtn.count() > 0 ? 'present ✅' : 'missing ❌'}`);
  
  // Check for renewal tracking
  console.log('Has renewal info:', body.includes('Renew') || body.includes('Expire') || body.includes('Anniversary'));
  console.log('Has benefits:', body.includes('benefit') || body.includes('Benefit') || body.includes('discount'));
});

test('DEEP: Settings — check all tabs', async ({ page }) => {
  await login(page);
  await page.locator('text="Settings"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/settings.png` });
  const body = await page.locator('body').textContent() || '';
  console.log('Settings tabs:', body.includes('General') || body.includes('Business') || body.includes('Compliance'));
  
  // Check tabs
  for (const tabName of ['Compliance', 'Notifications', 'Integrations', 'Billing', 'Business']) {
    const tab = page.locator('button, [role="tab"]').filter({ hasText: tabName }).first();
    if (await tab.count() > 0) {
      await tab.click({ timeout: 2000 });
      await page.waitForTimeout(400);
      console.log(`Settings ${tabName} tab: clicked ✅`);
    }
  }
  await page.screenshot({ path: `${DIR}/settings-tabs.png` });
});

test('DEEP: TTB Reports — compliance completeness', async ({ page }) => {
  await login(page);
  await page.locator('text="TTB Reports"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/ttb.png` });
  const body = await page.locator('body').textContent() || '';
  console.log('TTB content:', body.includes('TTB') || body.includes('Federal') || body.includes('Barrels'));
  console.log('Has operations data:', body.includes('Brewed') || body.includes('Packaged') || body.includes('Sold'));
  console.log('Has tax calculator:', body.includes('Tax') || body.includes('calculator') || body.includes('Calculator'));
  console.log('Has filing status:', body.includes('Filed') || body.includes('Pending') || body.includes('Due'));
  
  // Check for download
  const downloadBtn = page.locator('button').filter({ hasText: /Download|Export|Print/ }).first();
  console.log(`Download report button: ${await downloadBtn.count() > 0 ? 'present ✅' : 'missing ❌'}`);
});

test('DEEP: Financials — all tabs and charts', async ({ page }) => {
  await login(page);
  await page.locator('text="Financials"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/financials.png` });
  
  for (const tab of ["P&L Statement", "Labor & Overhead", "Beer Economics"]) {
    const btn = page.locator('button').filter({ hasText: tab }).first();
    if (await btn.count() > 0) {
      await btn.click({ timeout: 3000 });
      await page.waitForTimeout(800);
      const body = await page.locator('body').textContent() || '';
      const hasNaN = body.includes('NaN');
      const svgCount = await page.locator('svg').count();
      console.log(`Financials ${tab}: NaN=${hasNaN} SVGs=${svgCount}`);
    }
  }
  await page.screenshot({ path: `${DIR}/financials-beer.png` });
  
  // Check for budget comparison (competitor feature)
  const body = await page.locator('body').textContent() || '';
  console.log('Has budget targets:', body.includes('Budget') || body.includes('Target') || body.includes('Forecast'));
  console.log('Has cash flow:', body.includes('Cash Flow') || body.includes('cash flow'));
});
