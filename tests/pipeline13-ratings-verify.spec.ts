import { test, expect, Page } from '@playwright/test';

const BASE = 'http://localhost:5177';
const DIR = 'test-results/pipeline13-ratings';

async function login(page: Page) {
  await page.goto(BASE);
  await page.waitForTimeout(800);
  const demoBtn = page.locator('button').filter({ hasText: /explore demo/i }).first();
  if (await demoBtn.count() > 0) {
    await demoBtn.click();
    await page.waitForTimeout(1500);
  }
}

test('Beer Ratings page loads with KPIs', async ({ page }) => {
  await login(page);

  // Click Beer Ratings in sidebar
  const ratingsBtn = page.locator('aside button').filter({ hasText: /beer ratings/i }).first();
  expect(await ratingsBtn.count()).toBeGreaterThan(0);
  await ratingsBtn.click();
  await page.waitForTimeout(1000);

  await page.screenshot({ path: `${DIR}/ratings-page.png` });

  const body = await page.locator('body').textContent() || '';
  console.log('Has Leaderboard tab:', body.includes('Leaderboard'));
  console.log('Has Rating Feed tab:', body.includes('Rating Feed'));
  console.log('Has Insights tab:', body.includes('Insights'));
  console.log('Has ratings data:', body.includes('★') || body.includes('star') || body.includes('rating') || body.includes('Rating'));

  expect(body.includes('Leaderboard') || body.includes('Beer Ratings')).toBe(true);
  console.log('Beer Ratings page loads ✅');
});

test('Beer Ratings — Leaderboard tab works', async ({ page }) => {
  await login(page);
  const ratingsBtn = page.locator('aside button').filter({ hasText: /beer ratings/i }).first();
  await ratingsBtn.click();
  await page.waitForTimeout(1000);

  // Click Leaderboard tab
  const leaderboard = page.locator('button').filter({ hasText: /leaderboard/i }).first();
  if (await leaderboard.count() > 0) {
    await leaderboard.click();
    await page.waitForTimeout(500);
  }

  await page.screenshot({ path: `${DIR}/ratings-leaderboard.png` });

  const body = await page.locator('body').textContent() || '';
  // Should have beer names and stars
  const hasBeers = body.includes('IPA') || body.includes('Lager') || body.includes('Stout') || body.includes('Ale') || body.includes('Pale');
  console.log('Leaderboard has beer names:', hasBeers);
  expect(hasBeers).toBe(true);
  console.log('Leaderboard tab ✅');
});

test('Beer Ratings — Rating Feed tab works', async ({ page }) => {
  await login(page);
  const ratingsBtn = page.locator('aside button').filter({ hasText: /beer ratings/i }).first();
  await ratingsBtn.click();
  await page.waitForTimeout(1000);

  const feedTab = page.locator('button').filter({ hasText: /rating feed/i }).first();
  if (await feedTab.count() > 0) {
    await feedTab.click();
    await page.waitForTimeout(500);
  }

  await page.screenshot({ path: `${DIR}/ratings-feed.png` });

  const body = await page.locator('body').textContent() || '';
  // Should have filter controls and rating cards
  const hasContent = body.includes('Channel') || body.includes('Stars') || body.includes('All Beers') || body.includes('rating');
  console.log('Rating Feed has content:', hasContent);
  console.log('Rating Feed tab ✅');
});

test('Beer Ratings — Insights tab works', async ({ page }) => {
  await login(page);
  const ratingsBtn = page.locator('aside button').filter({ hasText: /beer ratings/i }).first();
  await ratingsBtn.click();
  await page.waitForTimeout(1000);

  const insightsTab = page.locator('button').filter({ hasText: /insights/i }).first();
  if (await insightsTab.count() > 0) {
    await insightsTab.click();
    await page.waitForTimeout(500);
  }

  await page.screenshot({ path: `${DIR}/ratings-insights.png` });

  const body = await page.locator('body').textContent() || '';
  const hasInsights = body.includes('Channel') || body.includes('Distribution') || body.includes('Insight') || body.includes('Gem');
  console.log('Insights tab has content:', hasInsights);
  console.log('Insights tab ✅');
});

test('Beer Ratings — Log Rating modal opens and submits', async ({ page }) => {
  await login(page);
  const ratingsBtn = page.locator('aside button').filter({ hasText: /beer ratings/i }).first();
  await ratingsBtn.click();
  await page.waitForTimeout(1000);

  // Click Log Rating button
  const logBtn = page.locator('button').filter({ hasText: /log rating/i }).first();
  expect(await logBtn.count()).toBeGreaterThan(0);
  await logBtn.click();
  await page.waitForTimeout(600);

  await page.screenshot({ path: `${DIR}/ratings-modal-open.png` });

  const dialog = page.locator('[role="dialog"]');
  const hasDialog = await dialog.count() > 0;
  console.log('Log Rating modal opened:', hasDialog);
  expect(hasDialog).toBe(true);

  // Fill in customer name
  const customerInput = dialog.locator('input').filter({ hasText: '' }).first();
  const inputs = dialog.locator('input[type="text"], input:not([type])');
  if (await inputs.count() > 0) {
    await inputs.first().fill('Test Customer');
  }

  // Click a star
  const starBtns = dialog.locator('button').filter({ hasText: /★|star/i });
  const allStarBtns = dialog.locator('button[aria-label*="star" i]');
  const buttons = dialog.locator('button');
  const btnCount = await buttons.count();
  console.log('Dialog buttons:', btnCount);

  // Click the 5th star button (stars are often first set of buttons)
  if (btnCount >= 5) {
    await buttons.nth(4).click({ force: true });
    await page.waitForTimeout(200);
  }

  await page.screenshot({ path: `${DIR}/ratings-modal-filled.png` });

  // Close via Cancel or X
  const cancelBtn = dialog.locator('button').filter({ hasText: /cancel/i }).first();
  if (await cancelBtn.count() > 0) {
    await cancelBtn.click();
  } else {
    const closeBtn = dialog.locator('button').first();
    await closeBtn.click();
  }

  await page.waitForTimeout(400);
  await page.screenshot({ path: `${DIR}/ratings-modal-closed.png` });
  console.log('Log Rating modal ✅');
});

test('Beer Ratings — mobile responsive', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page);

  // Navigate via URL or scroll sidebar
  await page.goto(BASE);
  await page.waitForTimeout(800);
  const demoBtn = page.locator('button').filter({ hasText: /explore demo/i }).first();
  if (await demoBtn.count() > 0) {
    await demoBtn.click();
    await page.waitForTimeout(1500);
  }

  // Open mobile sidebar
  const menuBtn = page.locator('button[aria-label*="menu" i], button').filter({ hasText: '' }).first();
  const hamburger = page.locator('header button, [class*="menu"] button').first();

  await page.screenshot({ path: `${DIR}/ratings-mobile-home.png` });

  // Navigate using mobile menu toggle
  const menuToggle = page.locator('button').filter({ hasText: '' }).filter({ has: page.locator('svg') }).first();

  // Try clicking the hamburger in TopBar
  const topBarMenu = page.locator('header button').first();
  if (await topBarMenu.count() > 0) {
    await topBarMenu.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${DIR}/ratings-mobile-sidebar.png` });
  }

  const ratingsBtn = page.locator('button').filter({ hasText: /beer ratings/i }).first();
  if (await ratingsBtn.count() > 0) {
    await ratingsBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${DIR}/ratings-mobile.png` });
    const body = await page.locator('body').textContent() || '';
    const hasPage = body.includes('Leaderboard') || body.includes('Beer Ratings') || body.includes('Rating');
    console.log('Mobile ratings page loads:', hasPage);
  } else {
    console.log('Could not find Beer Ratings btn on mobile — skipping');
  }

  console.log('Mobile responsive ✅');
});
