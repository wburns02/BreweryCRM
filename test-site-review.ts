import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://bearded-hop-frontend-production.up.railway.app';
const SCREENSHOT_DIR = '/home/will/BreweryCRM/test-results/site-review';

async function main() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    storageState: undefined,
  });

  // Set demo mode
  const page = await context.newPage();

  // First, visit login page
  console.log('=== Testing Login Page ===');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-login.png'), fullPage: true });
  console.log(`Login page title: ${await page.title()}`);
  console.log(`Login page URL: ${page.url()}`);

  // Check what's visible on login page
  const loginContent = await page.textContent('body');
  console.log(`Login page has content: ${loginContent?.substring(0, 200)}`);

  // Try demo mode - set localStorage and navigate
  await page.evaluate(() => {
    localStorage.setItem('bh_demo', '1');
  });
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-dashboard.png'), fullPage: true });
  console.log(`\n=== Dashboard ===`);
  console.log(`URL: ${page.url()}`);

  // Test each major page
  const pages = [
    { name: 'customers', path: '/customers' },
    { name: 'mug-club', path: '/mug-club' },
    { name: 'taps', path: '/taps' },
    { name: 'brewing', path: '/brewing' },
    { name: 'recipes', path: '/recipes' },
    { name: 'kegs', path: '/kegs' },
    { name: 'financials', path: '/financials' },
    { name: 'events', path: '/events' },
    { name: 'reservations', path: '/reservations' },
    { name: 'menu', path: '/menu' },
    { name: 'inventory', path: '/inventory' },
    { name: 'taproom-analytics', path: '/taproom-analytics' },
    { name: 'staff', path: '/staff' },
    { name: 'distribution', path: '/distribution' },
    { name: 'marketing', path: '/marketing' },
    { name: 'reports', path: '/reports' },
    { name: 'settings', path: '/settings' },
    { name: 'pos', path: '/pos' },
    { name: 'floor-plan', path: '/floor-plan' },
    { name: 'production', path: '/production' },
  ];

  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    console.log(`\n=== Testing ${p.name} ===`);
    try {
      await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1000);

      const url = page.url();
      console.log(`URL: ${url}`);

      // Check for error messages or empty states
      const errorElements = await page.$$('[class*="error"], [class*="Error"]');
      if (errorElements.length > 0) {
        console.log(`  WARNING: Found ${errorElements.length} error elements`);
      }

      // Check for loading spinners still present
      const loadingElements = await page.$$('[class*="animate-spin"], [class*="loading"]');
      if (loadingElements.length > 0) {
        console.log(`  NOTE: Found ${loadingElements.length} loading indicators`);
      }

      // Check if redirected (e.g., auth redirect)
      if (!url.includes(p.path)) {
        console.log(`  REDIRECTED to: ${url}`);
      }

      // Check for console errors
      const screenshot = path.join(SCREENSHOT_DIR, `${String(i + 3).padStart(2, '0')}-${p.name}.png`);
      await page.screenshot({ path: screenshot, fullPage: true });

      // Check visible text content
      const bodyText = await page.textContent('body');
      const firstChars = bodyText?.substring(0, 300).replace(/\s+/g, ' ').trim();
      console.log(`  Content preview: ${firstChars?.substring(0, 150)}`);

    } catch (e: any) {
      console.log(`  ERROR: ${e.message}`);
    }
  }

  // Check for console errors across pages
  console.log('\n=== Checking for JavaScript errors ===');
  const errors: string[] = [];
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });

  // Revisit dashboard to catch errors
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);

  if (errors.length > 0) {
    console.log('JavaScript errors found:');
    errors.forEach(e => console.log(`  - ${e}`));
  } else {
    console.log('No JavaScript errors detected on revisit');
  }

  // Test navigation sidebar
  console.log('\n=== Testing Sidebar Navigation ===');
  const sidebarLinks = await page.$$('nav a, aside a, [role="navigation"] a');
  console.log(`Found ${sidebarLinks.length} navigation links`);

  // Test Command Palette
  console.log('\n=== Testing Command Palette (Cmd+K) ===');
  await page.keyboard.press('Control+k');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'cmd-palette.png'), fullPage: true });

  await browser.close();
  console.log('\n=== Site Review Complete ===');
  console.log(`Screenshots saved to: ${SCREENSHOT_DIR}`);
}

main().catch(console.error);
