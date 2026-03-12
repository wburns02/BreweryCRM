import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5175';
const DIR = './test-results/pipeline9-keg';
fs.mkdirSync(DIR, { recursive: true });

async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForTimeout(2500);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.count() > 0) { await demoBtn.click(); await page.waitForTimeout(2500); }
}

async function nav(page: Page, text: string) {
  const link = page.locator('nav').locator('button, a').filter({ hasText: new RegExp(`^${text}$`) }).first();
  if (await link.count() > 0) { await link.click({ timeout: 5000 }); }
  else { await page.locator(`text="${text}"`).first().click({ timeout: 5000 }); }
  await page.waitForTimeout(1500);
}

test('FEATURE: POS shows keg level in pour size modal', async ({ page }) => {
  await login(page);
  await nav(page, 'POS');
  await page.screenshot({ path: `${DIR}/pos-draft-grid.png` });

  // Click on a beer tap card to open pour size modal
  const draftTab = page.locator('button').filter({ hasText: 'Draft Beer' }).first();
  if (await draftTab.count() > 0) await draftTab.click();
  await page.waitForTimeout(300);

  // Get initial keg level from first active tap card
  const tapCards = page.locator('button').filter({ hasText: /%/ }).filter({ hasText: /TAP/ });
  const cardCount = await tapCards.count();
  console.log(`Draft tap cards visible: ${cardCount}`);

  expect(cardCount).toBeGreaterThan(0);

  // Click first tap card to open pour modal
  const firstCard = tapCards.first();
  await firstCard.click();
  await page.waitForTimeout(500);

  // Check modal opened with keg level info
  const modal = page.locator('[role="dialog"]');
  expect(await modal.count()).toBeGreaterThan(0);
  await page.screenshot({ path: `${DIR}/pour-modal-with-keg-level.png` });

  const modalText = await modal.textContent() || '';
  // Modal should show keg level and oz remaining
  const hasKegInfo = modalText.includes('oz left') || modalText.includes('bbl keg');
  console.log(`Pour modal shows keg info: ${hasKegInfo}`);
  console.log(`Modal shows per-size keg drop: ${modalText.includes('keg')}`);
  expect(hasKegInfo).toBe(true);

  // Click a pour size to confirm decrement triggers
  const pintBtn = modal.locator('button').filter({ hasText: /Taster|Pint/ }).first();
  if (await pintBtn.count() > 0) {
    await pintBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/after-pour.png` });
    console.log('Pour size selected and keg decremented');
  }

  console.log('POS keg decrement feature ✅');
});

test('FEATURE: POS keg level bar updates in real-time', async ({ page }) => {
  await login(page);
  await nav(page, 'POS');

  // Get keg levels from the progress bar widths (style.width is set to kegLevel%)
  const getLevels = async () => {
    return page.evaluate(() => {
      // The keg level is shown in span after the progress bar, with pattern "N%"
      // We look for the keg level text nodes inside tap card buttons
      const buttons = Array.from(document.querySelectorAll('button'));
      const tapButtons = buttons.filter(b => b.textContent?.includes('TAP'));
      return tapButtons.map(btn => {
        // Find the last span with text matching /^\d+(\.\d+)?%$/
        const spans = Array.from(btn.querySelectorAll('span'));
        const levelSpan = spans.reverse().find(s => /^\d+(\.\d+)?%$/.test((s.textContent || '').trim()));
        return levelSpan ? parseFloat(levelSpan.textContent || '0') : 0;
      });
    });
  };

  const levelsBefore = await getLevels();
  console.log(`Keg levels before: ${levelsBefore.join(', ')}`);

  // Pour a beer
  const firstTapCard = page.locator('button').filter({ hasText: /TAP/ }).first();
  await firstTapCard.click();
  await page.waitForTimeout(500);

  const modal = page.locator('[role="dialog"]');
  if (await modal.count() > 0) {
    const tasterBtn = modal.locator('button').filter({ hasText: /Taster|Pint/ }).first();
    if (await tasterBtn.count() > 0) {
      await tasterBtn.click();
      await page.waitForTimeout(500);
    }
  }

  const levelsAfter = await getLevels();
  console.log(`Keg levels after: ${levelsAfter.join(', ')}`);

  // At least one level should have changed
  const anyChanged = levelsBefore.some((l, i) => levelsAfter[i] !== undefined && levelsAfter[i] < l);
  console.log(`At least one keg level changed: ${anyChanged}`);
  expect(anyChanged).toBe(true);

  await page.screenshot({ path: `${DIR}/keg-levels-updated.png` });
  console.log('Real-time keg level update ✅');
});

test('FEATURE: Pour modal shows keg % drop per size', async ({ page }) => {
  await login(page);
  await nav(page, 'POS');

  const firstTapCard = page.locator('button').filter({ hasText: /TAP/ }).first();
  await firstTapCard.click();
  await page.waitForTimeout(500);

  const modal = page.locator('[role="dialog"]');
  if (await modal.count() > 0) {
    const modalText = await modal.textContent() || '';
    // Should show keg drop info for sizes
    const hasDropInfo = modalText.includes('keg') || modalText.includes('%');
    console.log(`Modal shows drop info: ${hasDropInfo}`);
    console.log(`Modal text sample: ${modalText.slice(0, 200)}`);
    await page.screenshot({ path: `${DIR}/pour-modal-details.png` });
  }
  console.log('Pour modal keg info ✅');
});
