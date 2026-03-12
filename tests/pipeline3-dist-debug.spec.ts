import { test, Page } from '@playwright/test';
async function login(page: Page) {
  await page.goto('http://localhost:5184');
  await page.waitForTimeout(2000);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) { await demoBtn.click(); await page.waitForTimeout(2500); }
}
test('Distribution panel debug', async ({ page }) => {
  await login(page);
  await page.locator('text="Distribution"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  
  // Find the grid cards - check what their container is
  const cards = page.locator('.grid.grid-cols-1.lg\\:grid-cols-2 > div');
  const count = await cards.count();
  console.log('Account cards:', count);
  
  if (count > 0) {
    const firstCard = cards.first();
    const cardText = await firstCard.textContent() || '';
    console.log('First card text preview:', cardText.substring(0, 100));
    
    await firstCard.click({ timeout: 3000 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: '/tmp/dist-panel.png' });
    
    const dialogs = page.locator('[role="dialog"]');
    const dialogCount = await dialogs.count();
    console.log('Dialog count:', dialogCount);
    for (let i = 0; i < dialogCount; i++) {
      const d = dialogs.nth(i);
      console.log(`Dialog ${i} visible:`, await d.isVisible());
      console.log(`Dialog ${i} text:`, (await d.textContent() || '').substring(0, 150));
    }
  }
});
