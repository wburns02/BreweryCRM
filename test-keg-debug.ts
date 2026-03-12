import { chromium } from 'playwright';

const BASE_URL = 'https://brewery-frontend-production.up.railway.app';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  // Login
  await page.goto(BASE_URL, { timeout: 20000 });
  await page.waitForTimeout(2000);
  await page.locator('button:has-text("Explore Demo")').click();
  await page.waitForTimeout(3000);

  // Nav to Keg Tracking
  const items = page.locator('aside button, aside a');
  const count = await items.count();
  for (let i = 0; i < count; i++) {
    const text = (await items.nth(i).textContent())?.trim();
    if (text === 'Keg Tracking') { await items.nth(i).click(); break; }
  }
  await page.waitForTimeout(1500);

  // Click Add Keg
  await page.locator('button:has-text("Add Keg")').click();
  await page.waitForTimeout(1000);

  // Check dialog
  const dialog = page.locator('[role="dialog"]');
  console.log('Dialog visible:', await dialog.isVisible());

  // List all elements in dialog
  const allInputs = page.locator('[role="dialog"] input:visible');
  const allSelects = page.locator('[role="dialog"] select:visible');
  const allButtons = page.locator('[role="dialog"] button:visible');

  console.log('Inputs:', await allInputs.count());
  for (let i = 0; i < await allInputs.count(); i++) {
    const type = await allInputs.nth(i).getAttribute('type') || 'text';
    const placeholder = await allInputs.nth(i).getAttribute('placeholder') || '';
    const value = await allInputs.nth(i).inputValue();
    console.log(`  input[${i}]: type=${type} placeholder="${placeholder}" value="${value}"`);
  }

  console.log('Selects:', await allSelects.count());
  for (let i = 0; i < await allSelects.count(); i++) {
    const value = await allSelects.nth(i).inputValue();
    console.log(`  select[${i}]: value="${value}"`);
  }

  console.log('Buttons:', await allButtons.count());
  for (let i = 0; i < await allButtons.count(); i++) {
    const text = (await allButtons.nth(i).textContent())?.trim();
    console.log(`  button[${i}]: "${text}"`);
  }

  // Fill the keg number (first input)
  await allInputs.nth(0).fill('BH-QA-002');

  // Fill other text inputs (location, costs)
  for (let i = 1; i < await allInputs.count(); i++) {
    const type = await allInputs.nth(i).getAttribute('type') || 'text';
    const val = await allInputs.nth(i).inputValue();
    if (!val || val === '0') {
      if (type === 'number') await allInputs.nth(i).fill('100');
      else await allInputs.nth(i).fill('Test Location');
    }
  }

  // Take screenshot before submit
  await page.screenshot({ path: 'test-results/qa-verify/keg-before-submit.png' });

  // Listen for API calls
  page.on('request', req => {
    if (req.url().includes('/api/') && req.method() === 'POST') {
      console.log(`REQUEST: ${req.method()} ${req.url()}`);
      console.log(`BODY: ${req.postData()?.substring(0, 200)}`);
    }
  });
  page.on('response', resp => {
    if (resp.url().includes('/api/') && resp.request().method() === 'POST') {
      console.log(`RESPONSE: ${resp.status()} ${resp.url()}`);
    }
  });

  // Click submit
  const submitBtn = page.locator('[role="dialog"] button:has-text("Add Keg")');
  console.log('Submit visible:', await submitBtn.isVisible());

  if (await submitBtn.isVisible()) {
    await submitBtn.click();
    await page.waitForTimeout(3000);
    console.log('After submit');
  }

  await page.screenshot({ path: 'test-results/qa-verify/keg-after-submit.png' });

  await browser.close();
}

main().catch(console.error);
