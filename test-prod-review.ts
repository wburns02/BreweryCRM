import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE = 'https://bearded-hop-frontend-production.up.railway.app';
const SCREENSHOTS_DIR = '/home/will/BreweryCRM/test-results/prod-review';

async function run() {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Capture console errors
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // Capture network failures
  const networkErrors: string[] = [];
  page.on('requestfailed', request => {
    networkErrors.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
  });

  // 1. Visit login page
  console.log('1. Loading site...');
  await page.goto(BASE, { timeout: 30000 });
  await page.waitForTimeout(2000);

  // 2. Try login
  console.log('2. Attempting login...');
  await page.fill('input[type="email"]', 'admin@beardedhop.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-after-login-attempt.png'), fullPage: true });

  // Check for error message
  const errorText = await page.$eval('.text-red-400', el => el.textContent).catch(() => null);
  console.log('   Login error message:', errorText || 'none visible');

  // Check if we got past login
  const hasNav = await page.$('nav');
  console.log('   Has navigation:', !!hasNav);

  // Log network/console issues
  if (networkErrors.length > 0) {
    console.log('\n=== Network Errors ===');
    networkErrors.forEach(e => console.log('  ', e));
  }
  if (consoleErrors.length > 0) {
    console.log('\n=== Console Errors ===');
    consoleErrors.forEach(e => console.log('  ', e));
  }

  // Try with different password
  console.log('\n3. Trying password "password"...');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-second-attempt.png'), fullPage: true });

  const errorText2 = await page.$eval('.text-red-400', el => el.textContent).catch(() => null);
  console.log('   Login error:', errorText2 || 'none visible');
  const hasNav2 = await page.$('nav');
  console.log('   Has navigation:', !!hasNav2);

  // Try with just "test" credentials
  console.log('\n4. Trying test@test.com / test...');
  await page.fill('input[type="email"]', 'test@test.com');
  await page.fill('input[type="password"]', 'test');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);

  const hasNav3 = await page.$('nav');
  console.log('   Has navigation:', !!hasNav3);

  await browser.close();
  console.log('\nDone!');
}

run().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
