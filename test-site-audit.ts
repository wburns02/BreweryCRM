import { chromium } from 'playwright';
import * as fs from 'fs';

const BASE = 'https://bearded-hop-frontend-production.up.railway.app';
const DIR = '/home/will/BreweryCRM/test-results/site-audit';

async function main() {
  fs.mkdirSync(DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Collect all console errors
  const allErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') allErrors.push(msg.text());
  });
  page.on('pageerror', err => allErrors.push(`PAGE_ERROR: ${err.message}`));

  // Go to root
  console.log('Loading site...');
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({ path: `${DIR}/01-initial.png`, fullPage: true });
  console.log(`Initial URL: ${page.url()}`);

  // Check for demo button
  const allButtons = await page.$$eval('button', btns => btns.map(b => b.textContent?.trim()));
  console.log('Buttons on page:', allButtons);

  // Try "Explore Demo" button first
  let demoBtn = await page.$('button:has-text("Explore Demo")');
  if (demoBtn) {
    console.log('Found "Explore Demo" button, clicking...');
    await demoBtn.click();
    await page.waitForTimeout(3000);
  } else {
    // Try login with known credentials
    console.log('No demo button found. Trying login with admin credentials...');
    await page.fill('input[type="email"]', 'admin@beardedhop.com');
    await page.fill('input[type="password"]', 'BrewDay2026!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
  }

  await page.screenshot({ path: `${DIR}/02-after-auth.png`, fullPage: true });
  console.log(`After auth URL: ${page.url()}`);

  // Check if we're past login
  const bodyText = await page.textContent('body') || '';
  const isLoggedIn = bodyText.includes('Dashboard') || bodyText.includes('Bearded Hop') && !bodyText.includes('Sign In');
  console.log(`Logged in: ${isLoggedIn}`);

  if (!isLoggedIn) {
    console.log('Body text snippet:', bodyText.substring(0, 500));
    await browser.close();
    return;
  }

  // Now navigate via sidebar to each page
  const sidebarLinks = [
    'Dashboard', 'Customers', 'Mug Club', 'Taps', 'Brewing', 'Production',
    'Recipes', 'Kegs', 'Inventory', 'Menu', 'POS', 'Floor Plan',
    'Analytics', 'Events', 'Reservations', 'Distribution', 'Marketing',
    'Financials', 'Staff', 'Reports', 'Settings'
  ];

  let idx = 3;
  for (const linkText of sidebarLinks) {
    try {
      // Find sidebar link
      const link = await page.$(`nav a:has-text("${linkText}"), aside a:has-text("${linkText}"), nav button:has-text("${linkText}"), aside button:has-text("${linkText}"), [class*="sidebar"] *:has-text("${linkText}"), [class*="Sidebar"] *:has-text("${linkText}")`);

      if (!link) {
        // Try broader search
        const anyLink = await page.$(`text="${linkText}"`);
        if (anyLink) {
          await anyLink.click();
        } else {
          console.log(`\n--- ${linkText}: NOT FOUND in sidebar ---`);
          continue;
        }
      } else {
        await link.click();
      }

      await page.waitForTimeout(1500);

      const pageText = await page.textContent('main') || await page.textContent('body') || '';
      const hasCrash = pageText.includes('Something went wrong') || pageText.includes('Cannot read properties');
      const hasContent = pageText.trim().length > 50;

      console.log(`\n--- ${linkText} ---`);
      console.log(`  Has content: ${hasContent} (${pageText.trim().length} chars)`);
      console.log(`  Crash: ${hasCrash}`);

      if (hasCrash) {
        console.log(`  CRASH TEXT: ${pageText.substring(0, 300)}`);
      }

      // Count key elements
      const tableCount = await page.$$eval('table, [class*="table"], [class*="Table"]', els => els.length);
      const cardCount = await page.$$eval('[class*="card"], [class*="Card"], [class*="stat"]', els => els.length);
      const chartCount = await page.$$eval('[class*="chart"], [class*="Chart"], canvas, svg.recharts', els => els.length);
      console.log(`  Tables: ${tableCount}, Cards: ${cardCount}, Charts: ${chartCount}`);

      await page.screenshot({ path: `${DIR}/${String(idx).padStart(2, '0')}-${linkText.toLowerCase().replace(/\s+/g, '-')}.png`, fullPage: true });

      // Test Add/Create button if present
      const addBtn = await page.$('main button:has-text("Add"), main button:has-text("New"), main button:has-text("Create")');
      if (addBtn) {
        const btnText = await addBtn.textContent();
        console.log(`  Testing button: "${btnText}"`);
        await addBtn.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `${DIR}/${String(idx).padStart(2, '0')}-${linkText.toLowerCase().replace(/\s+/g, '-')}-modal.png`, fullPage: true });

        // Check modal rendered
        const modal = await page.$('[class*="modal"], [class*="Modal"], [role="dialog"], [class*="slide"], [class*="Slide"]');
        console.log(`  Modal opened: ${modal !== null}`);

        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }

      idx++;
    } catch (e) {
      console.log(`\n--- ${linkText}: ERROR: ${(e as Error).message} ---`);
      await page.screenshot({ path: `${DIR}/${String(idx).padStart(2, '0')}-${linkText.toLowerCase().replace(/\s+/g, '-')}-error.png`, fullPage: true });
      idx++;
    }
  }

  // Summary of console errors
  if (allErrors.length > 0) {
    console.log('\n\n=== CONSOLE ERRORS ===');
    const unique = [...new Set(allErrors)];
    unique.forEach(e => console.log(`  - ${e.substring(0, 200)}`));
  }

  await browser.close();
  console.log('\nDone! Screenshots in', DIR);
}

main().catch(console.error);
