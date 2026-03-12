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

for (const [label, id] of PAGES) {
  test(`PAGE: ${label}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text().substring(0, 150));
    });
    await login(page);
    await page.locator(`text="${label}"`).first().click({ timeout: 8000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${DIR}/${id}.png` });
    const body = await page.locator('body').textContent() || '';
    const nan = body.includes('NaN');
    const short = body.trim().length < 200;
    console.log(`${label}: len=${body.trim().length} NaN=${nan} errors=${errors.length}`);
    if (nan) console.log(`  NaN detected!`);
    if (short) console.log(`  Short content: "${body.trim().substring(0,100)}"`);
    errors.slice(0,3).forEach(e => console.log(`  ERR: ${e.substring(0,100)}`));
  });
}
