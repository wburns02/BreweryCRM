import { chromium } from 'playwright';

const BASE_URL = 'https://bearded-hop-frontend-production.up.railway.app';

async function testProduction() {
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
    console.log('--- Logging In ---');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('input[type="email"]', 'test@beardedhop.com');
    await page.fill('input[type="password"]', 'TestPass123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: '/tmp/brewery-01-after-login.png', fullPage: true });

    const bodyText = await page.textContent('body');
    const loggedIn = !bodyText?.includes('Sign In');
    console.log('Logged in:', loggedIn);
    if (!loggedIn) {
      console.log('LOGIN FAILED - body:', bodyText?.substring(0, 300));
      return;
    }

    // Dashboard
    console.log('\n--- Dashboard ---');
    await page.screenshot({ path: '/tmp/brewery-02-dashboard.png', fullPage: true });
    const dashText = await page.textContent('body') || '';
    console.log('Dashboard text preview:', dashText.substring(0, 300));

    // Navigate to each page via sidebar clicks
    const sidebarItems = await page.$$('nav a, nav button, [role="navigation"] a, aside a, aside button');
    console.log(`Found ${sidebarItems.length} sidebar items`);

    // Get all sidebar link text
    const sidebarTexts = await page.$$eval('nav a, nav button, aside a, aside button', els =>
      els.map(el => ({ text: el.textContent?.trim(), tag: el.tagName }))
    );
    console.log('Sidebar items:', JSON.stringify(sidebarTexts.filter(s => s.text), null, 2));

    // Try clicking through sidebar items
    const pagesToTest = [
      'Customers', 'Tap Management', 'Point of Sale', 'Floor Plan',
      'Events', 'Production', 'Financials', 'Inventory', 'Staff',
      'Recipe', 'Keg', 'Menu', 'Mug Club', 'Marketing', 'Distribution',
      'Reports', 'Settings', 'Reservations', 'Brewing', 'Taproom Analytics'
    ];

    for (const pageName of pagesToTest) {
      try {
        // Try to find and click the sidebar link
        const link = await page.$(`text=${pageName}`);
        if (link) {
          await link.click();
          await page.waitForTimeout(2000);
          await page.screenshot({ path: `/tmp/brewery-page-${pageName.toLowerCase().replace(/\s+/g, '-')}.png`, fullPage: true });
          const text = await page.textContent('body') || '';
          const hasError = text.includes('Error loading') || text.includes('Something went wrong');
          const isEmpty = text.length < 100;
          console.log(`${pageName}: loaded=${!isEmpty}, errors=${hasError}`);
        } else {
          console.log(`${pageName}: NOT FOUND in sidebar`);
        }
      } catch (e: any) {
        console.log(`${pageName}: CLICK_ERROR - ${e.message.substring(0, 100)}`);
      }
    }

    // Test mobile
    console.log('\n--- Mobile View ---');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/brewery-mobile.png', fullPage: true });

    // Report errors
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

testProduction();
