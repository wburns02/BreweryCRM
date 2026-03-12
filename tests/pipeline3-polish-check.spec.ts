import { test, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5184';
const DIR = './test-results/polish-p3';
fs.mkdirSync(DIR, { recursive: true });

async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(2000);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) { await demoBtn.click(); await page.waitForTimeout(2500); }
}

test('POLISH: Cost Analysis visual inspection', async ({ page }) => {
  await login(page);
  await page.locator('text="Brewing"').first().click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.locator('button:has-text("Cost Analysis")').click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${DIR}/cost-desktop.png`, fullPage: false });
  
  // Scroll down to see per-batch cards
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/cost-cards.png` });
  
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/cost-cards2.png` });
  
  // Check for any overflow issues
  const body = await page.locator('body').textContent() || '';
  console.log('Body length:', body.length);
  console.log('Has NaN:', body.includes('NaN'));
  console.log('Has overflow text:', body.includes('overflow'));
});

test('POLISH: All key pages look correct', async ({ page }) => {
  await login(page);
  for (const [label, id] of [['Brewing', 'brewing'], ['Mug Club', 'mug-club'], ['Distribution', 'distribution'], ['Reports', 'reports']]) {
    await page.locator(`text="${label}"`).first().click({ timeout: 8000 });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${DIR}/${id}.png` });
    const body = await page.locator('body').textContent() || '';
    console.log(`${label}: len=${body.length} NaN=${body.includes('NaN')}`);
  }
});
