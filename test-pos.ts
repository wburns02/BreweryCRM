import { chromium } from 'playwright';

const BASE_URL = 'https://bearded-hop-frontend-production.up.railway.app';

async function testPOS() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(`PAGE_ERROR: ${err.message}`));

  try {
    // Login
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('input[type="email"]', 'test@beardedhop.com');
    await page.fill('input[type="password"]', 'TestPass123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);

    // Go to POS
    await page.click('text=POS');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/brewery-pos-full.png', fullPage: true });

    // Check the search bar functionality
    const searchInput = await page.$('input[placeholder*="Search"]');
    if (searchInput) {
      console.log('Global search found');
      await searchInput.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: '/tmp/brewery-search-open.png' });
      await searchInput.fill('Hill Country');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '/tmp/brewery-search-results.png' });
      // Press escape
      await page.keyboard.press('Escape');
    } else {
      console.log('No global search input found');
    }

    // Check notification bell
    const notifBell = await page.$('[class*="notification"], button:has(svg)');
    console.log('Notification element:', !!notifBell);

    // Check Mug Club page
    await page.click('text=Mug Club');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/brewery-mug-club.png', fullPage: true });

    // Check Reservations
    await page.click('text=Reservations');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/brewery-reservations.png', fullPage: true });

    // Check Recipe Lab
    await page.click('text=Recipe Lab');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/brewery-recipe-lab.png', fullPage: true });

    // Check Keg Tracking
    await page.click('text=Keg Tracking');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/brewery-keg-tracking.png', fullPage: true });

    // Check Marketing
    await page.click('text=Marketing');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/brewery-marketing.png', fullPage: true });

    // Check Food & Menu
    await page.click('text=Food & Menu');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/brewery-food-menu.png', fullPage: true });

    console.log('\n--- Console Errors ---');
    errors.forEach(e => console.log('ERROR:', e.substring(0, 200)));
    console.log(`Total errors: ${errors.length}`);

  } catch (e: any) {
    console.error('Test failed:', e.message);
    await page.screenshot({ path: '/tmp/brewery-error.png' });
  } finally {
    await browser.close();
  }
}

testPOS();
