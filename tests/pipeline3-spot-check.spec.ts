import { test, Page } from '@playwright/test';
async function login(page: Page) {
  await page.goto('http://localhost:5184');
  await page.waitForTimeout(2000);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) { await demoBtn.click(); await page.waitForTimeout(2500); }
}
test('Customer detail panel check', async ({ page }) => {
  await login(page);
  await page.locator('text="Customers"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/tmp/customers-start.png' });
  const body = await page.locator('body').textContent() || '';
  console.log('Page len:', body.length);
  // Get all rows
  const rows = page.locator('tbody tr');
  const rowCount = await rows.count();
  console.log('Table rows:', rowCount);
  if (rowCount > 0) {
    await rows.first().click({ timeout: 3000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/customers-clicked.png' });
    const body2 = await page.locator('body').textContent() || '';
    const panelOpen = body2.length > body.length + 100;
    console.log('Panel opened?', panelOpen, 'body grew by', body2.length - body.length);
    // Check for SlidePanel
    const panel = page.locator('[role="dialog"]').first();
    console.log('Role=dialog visible?', await panel.isVisible());
  }
});
test('Mug Club check', async ({ page }) => {
  await login(page);
  await page.locator('text="Mug Club"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  const body = await page.locator('body').textContent() || '';
  console.log('Body len:', body.length);
  console.log('Has members:', body.includes('Jake') || body.includes('Sarah') || body.includes('member'));
  // Check for renewal alerts
  console.log('Has expiring:', body.includes('Expir') || body.includes('Renew'));
  // Check click member
  const memberRow = page.locator('tbody tr').first();
  if (await memberRow.count() > 0) {
    await memberRow.click({ timeout: 3000 });
    await page.waitForTimeout(800);
    const body2 = await page.locator('body').textContent() || '';
    console.log('Member detail opened?', body2.length > body.length + 50);
  }
});
test('Reports page full check', async ({ page }) => {
  await login(page);
  await page.locator('text="Reports"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  const body = await page.locator('body').textContent() || '';
  console.log('Reports body len:', body.length);
  console.log('Has date filter:', body.includes('Last 7') || body.includes('30 days') || body.includes('filter'));
  // List all buttons
  const btns = page.locator('button');
  const btnCount = await btns.count();
  const btnTexts: string[] = [];
  for (let i = 0; i < Math.min(btnCount, 20); i++) {
    btnTexts.push((await btns.nth(i).textContent() || '').trim().substring(0, 30));
  }
  console.log('Buttons:', btnTexts.filter(t => t.length > 0).join(' | '));
});
