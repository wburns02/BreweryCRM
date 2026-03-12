import { test, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:5185';

async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(3000);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) { await demoBtn.click(); await page.waitForTimeout(3000); }
}

test('DEBUG: Marketing page content', async ({ page }) => {
  await login(page);

  // Navigate to Marketing
  const marketingLinks = page.locator('text="Marketing"');
  const count = await marketingLinks.count();
  console.log(`Marketing links found: ${count}`);

  for (let i = 0; i < count; i++) {
    const el = marketingLinks.nth(i);
    const tag = await el.evaluate(e => e.tagName);
    const text = await el.textContent();
    console.log(`  [${i}] <${tag}> "${text}"`);
  }

  // Click each and see which one navigates
  if (count > 0) {
    await marketingLinks.nth(count > 1 ? 1 : 0).click();
    await page.waitForTimeout(2000);
  }

  const body = await page.locator('body').textContent() || '';
  console.log('Body contains "Campaign":', body.includes('Campaign'));
  console.log('Body contains "New Campaign":', body.includes('New Campaign'));
  console.log('Body contains "Send":', body.includes('Send'));

  // List all buttons
  const buttons = page.locator('button');
  const btnCount = await buttons.count();
  console.log(`Total buttons: ${btnCount}`);
  for (let i = 0; i < Math.min(btnCount, 20); i++) {
    const text = await buttons.nth(i).textContent();
    console.log(`  btn[${i}]: "${text?.trim()}"`);
  }

  await page.screenshot({ path: './test-results/pipeline4-bugs/debug-marketing.png' });
});
