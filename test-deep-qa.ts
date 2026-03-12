import { chromium, Page } from 'playwright';

const BASE_URL = 'https://brewery-frontend-production.up.railway.app';

interface Issue {
  page: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  description: string;
  details: string;
}

const issues: Issue[] = [];

const PAGES = [
  'Dashboard', 'POS', 'Floor Plan', 'Customers', 'Mug Club', 'Reservations',
  'Tap Management', 'Brewing', 'Production', 'Recipe Lab', 'Keg Tracking',
  'Food & Menu', 'Inventory', 'Taproom Analytics', 'Events', 'Marketing',
  'Financials', 'Staff', 'Distribution', 'Reports', 'Settings'
];

// Selectors for our custom Modal and SlidePanel (no role="dialog")
const MODAL_CONTENT = '.fixed.inset-0 .relative.bg-brewery-900';
const MODAL_BACKDROP = '.fixed.inset-0 .absolute.inset-0';
const SLIDE_PANEL = '.fixed.top-0.right-0.h-full';

async function dismissOverlays(page: Page) {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  // If still blocked, force-click cancel
  const cancel = page.locator('button:has-text("Cancel"):visible').first();
  if (await cancel.isVisible().catch(() => false)) {
    await cancel.click({ force: true });
    await page.waitForTimeout(300);
  }
}

async function clickSidebar(page: Page, name: string): Promise<boolean> {
  await dismissOverlays(page);
  const items = page.locator('aside button, aside a');
  const count = await items.count();
  for (let i = 0; i < count; i++) {
    const text = (await items.nth(i).textContent())?.trim();
    if (text === name) {
      try {
        await items.nth(i).click({ timeout: 3000 });
      } catch {
        await items.nth(i).click({ force: true });
      }
      await page.waitForTimeout(1500);
      return true;
    }
  }
  return false;
}

async function isModalOpen(page: Page): Promise<'modal' | 'slide' | false> {
  const modal = page.locator(MODAL_CONTENT);
  if (await modal.isVisible().catch(() => false)) return 'modal';
  const slide = page.locator(SLIDE_PANEL);
  if (await slide.isVisible().catch(() => false)) return 'slide';
  return false;
}

async function fillFormInContainer(page: Page, containerSelector: string) {
  const inputs = page.locator(`${containerSelector} input:visible`);
  const count = await inputs.count();

  for (let i = 0; i < count; i++) {
    try {
      const inp = inputs.nth(i);
      const type = await inp.getAttribute('type') || 'text';
      const placeholder = (await inp.getAttribute('placeholder') || '').toLowerCase();
      const val = await inp.inputValue();

      if (['checkbox', 'radio', 'hidden', 'file', 'submit', 'button'].includes(type)) continue;
      if (val && val.length > 0) continue; // Already has value

      if (type === 'number') await inp.fill('10');
      else if (type === 'date') await inp.fill('2026-03-15');
      else if (type === 'time') await inp.fill('14:00');
      else if (type === 'datetime-local') await inp.fill('2026-03-15T14:00');
      else if (type === 'email') await inp.fill('qatest@beardedhop.com');
      else if (type === 'tel') await inp.fill('555-0100');
      else if (placeholder.includes('name') || placeholder.includes('first')) await inp.fill('QA Test');
      else if (placeholder.includes('last')) await inp.fill('Entry');
      else if (placeholder.includes('email')) await inp.fill('qatest@beardedhop.com');
      else if (placeholder.includes('phone')) await inp.fill('555-0100');
      else if (placeholder.includes('price') || placeholder.includes('cost') || placeholder.includes('amount') || placeholder.includes('$')) await inp.fill('9.99');
      else if (placeholder.includes('address') || placeholder.includes('street')) await inp.fill('123 Test St');
      else if (placeholder.includes('city')) await inp.fill('Bulverde');
      else if (placeholder.includes('zip')) await inp.fill('78163');
      else if (placeholder.includes('search')) continue;
      else await inp.fill('QA Test');
    } catch {}
  }

  // Textareas
  const tas = page.locator(`${containerSelector} textarea:visible`);
  for (let i = 0; i < await tas.count(); i++) {
    try {
      const val = await tas.nth(i).inputValue();
      if (!val) await tas.nth(i).fill('QA test notes');
    } catch {}
  }

  // Selects
  const sels = page.locator(`${containerSelector} select:visible`);
  for (let i = 0; i < await sels.count(); i++) {
    try {
      const opts = sels.nth(i).locator('option');
      if (await opts.count() > 1) await sels.nth(i).selectOption({ index: 1 });
    } catch {}
  }
}

async function submitForm(page: Page, containerSelector: string, pageName: string, triggerBtn: string): Promise<void> {
  const saveBtn = page.locator(`${containerSelector} button:has-text("Save"), ${containerSelector} button:has-text("Create"), ${containerSelector} button:has-text("Submit"), ${containerSelector} button:has-text("Add Guest"), ${containerSelector} button:has-text("Add Member"), ${containerSelector} button:has-text("Add Keg"), ${containerSelector} button:has-text("Add Item"), ${containerSelector} button:has-text("Schedule")`).first();

  if (!(await saveBtn.isVisible().catch(() => false))) {
    // Try broader match
    const anyBtn = page.locator(`${containerSelector} button.bg-amber, ${containerSelector} button[class*="amber"], ${containerSelector} button[class*="primary"]`).first();
    if (!(await anyBtn.isVisible().catch(() => false))) {
      console.log(`     No submit button found`);
      return;
    }
  }

  const btnText = (await saveBtn.textContent())?.trim();
  console.log(`     Submitting: "${btnText}"`);

  const respP = page.waitForResponse(
    r => r.url().includes('/api/') && ['POST', 'PUT', 'PATCH'].includes(r.request().method()),
    { timeout: 5000 }
  ).catch(() => null);

  await saveBtn.click();
  await page.waitForTimeout(2000);

  const resp = await respP;
  if (resp) {
    const status = resp.status();
    const method = resp.request().method();
    const ep = resp.url().split('/api/v1/')[1] || resp.url();
    console.log(`     API: ${method} ${ep.substring(0, 50)} -> ${status}`);
    if (status >= 400) {
      let body = '';
      try { body = await resp.text(); } catch {}
      console.log(`     FAIL BODY: ${body.substring(0, 200)}`);
      issues.push({
        page: pageName,
        severity: status >= 500 ? 'critical' : 'high',
        type: 'form-submit-fail',
        description: `"${triggerBtn}" form submit fails (${status})`,
        details: `${method} /api/v1/${ep.substring(0, 50)} -> ${status}: ${body.substring(0, 150)}`
      });
    } else {
      console.log(`     SUCCESS`);
    }
  } else {
    console.log(`     No API response (client-side only or validation blocked)`);
    // Check if modal is still open (submission might have been blocked by validation)
    const stillOpen = await isModalOpen(page);
    if (stillOpen) {
      console.log(`     Modal still open - form may have validation errors`);
      // Screenshot
      await page.screenshot({ path: `test-results/qa-audit/${pageName.replace(/[^a-zA-Z]/g, '_')}_form_blocked.png` });
    }
  }
}

async function testPage(page: Page, name: string) {
  const jsErrors: string[] = [];
  const errHandler = (err: Error) => jsErrors.push(err.message.substring(0, 200));
  page.on('pageerror', errHandler);

  console.log(`\n=== ${name} ===`);

  if (!(await clickSidebar(page, name))) {
    console.log(`  SKIP: not found`);
    page.off('pageerror', errHandler);
    return;
  }

  await page.screenshot({ path: `test-results/qa-audit/${name.replace(/[^a-zA-Z]/g, '_')}.png` });

  // Check for page-level errors
  const bodyText = await page.textContent('main') || '';
  if (bodyText.includes('Cannot read properties') || bodyText.includes('TypeError')) {
    issues.push({ page: name, severity: 'critical', type: 'crash', description: 'Page shows JS error', details: bodyText.substring(0, 200) });
    page.off('pageerror', errHandler);
    return;
  }

  // Identify action buttons (not sidebar, not search)
  const mainBtns = page.locator('main button:visible');
  const mainBtnCount = await mainBtns.count();
  const actionBtnTexts: string[] = [];
  for (let i = 0; i < mainBtnCount; i++) {
    const t = (await mainBtns.nth(i).textContent())?.trim();
    if (!t || t.length > 50) continue;
    if (/^(Add|New|Create|Schedule Brew|Open Tab|Record|Start Brew|Import|Export)/i.test(t)) {
      actionBtnTexts.push(t);
    }
  }
  console.log(`  Actions: ${actionBtnTexts.join(', ') || '(none)'}`);

  // Identify tab-like buttons
  const tabBtns: string[] = [];
  for (let i = 0; i < mainBtnCount; i++) {
    const t = (await mainBtns.nth(i).textContent())?.trim();
    if (!t || t.length > 30) continue;
    // Tab-like: short text, not an action button, not Search
    if (/^(Overview|Batches|Tanks|Recipes|Grid|List|Live|Pour|Guest|Trend|Team|Schedule|Compliance|General|Integrations|Notifications|Fleet|Deployed|Returns|Analytics|P&L|Beer Economics|Labor|Events Calendar|Performers)/i.test(t)) {
      tabBtns.push(t);
    }
  }
  if (tabBtns.length > 0) console.log(`  Tab-like: ${tabBtns.join(', ')}`);

  // Click tab-like buttons
  for (const tabText of tabBtns) {
    try {
      const errsBefore = jsErrors.length;
      const tab = page.locator(`main button:has-text("${tabText}")`).first();
      await tab.click({ timeout: 2000 });
      await page.waitForTimeout(600);
      if (jsErrors.length > errsBefore) {
        issues.push({ page: name, severity: 'high', type: 'tab-error', description: `Tab "${tabText}" causes JS error`, details: jsErrors[jsErrors.length - 1] });
        console.log(`    Tab "${tabText}" -> ERROR: ${jsErrors[jsErrors.length - 1].substring(0, 80)}`);
      } else {
        console.log(`    Tab "${tabText}" -> ok`);
      }
    } catch {}
  }

  // Click action buttons and test forms
  for (const btnText of actionBtnTexts) {
    console.log(`  >> "${btnText}"`);
    const errsBefore = jsErrors.length;

    try {
      const btn = page.locator(`main button:has-text("${btnText}")`).first();
      await btn.click({ timeout: 3000 });
      await page.waitForTimeout(1000);

      const modalType = await isModalOpen(page);
      if (modalType === 'modal') {
        console.log(`     Modal opened`);
        const inputCount = await page.locator(`${MODAL_CONTENT} input:visible`).count();
        const selectCount = await page.locator(`${MODAL_CONTENT} select:visible`).count();
        const textareaCount = await page.locator(`${MODAL_CONTENT} textarea:visible`).count();
        console.log(`     Fields: ${inputCount} inputs, ${selectCount} selects, ${textareaCount} textareas`);

        await fillFormInContainer(page, MODAL_CONTENT);
        await submitForm(page, MODAL_CONTENT, name, btnText);
        await dismissOverlays(page);
      } else if (modalType === 'slide') {
        console.log(`     SlidePanel opened`);
        const inputCount = await page.locator(`${SLIDE_PANEL} input:visible`).count();
        console.log(`     Fields: ${inputCount} inputs`);

        await fillFormInContainer(page, SLIDE_PANEL);
        await submitForm(page, SLIDE_PANEL, name, btnText);
        await dismissOverlays(page);
      } else {
        console.log(`     Nothing opened`);
        issues.push({ page: name, severity: 'medium', type: 'no-action', description: `"${btnText}" does nothing`, details: `Clicked but no modal/panel appeared` });
      }

      if (jsErrors.length > errsBefore) {
        issues.push({ page: name, severity: 'high', type: 'js-error', description: `"${btnText}" causes JS error`, details: jsErrors[jsErrors.length - 1] });
        console.log(`     JS ERROR: ${jsErrors[jsErrors.length - 1].substring(0, 100)}`);
      }
    } catch (e) {
      console.log(`     Error: ${(e as Error).message.substring(0, 100)}`);
      await dismissOverlays(page);
    }
  }

  // Special: test Settings Save
  if (name === 'Settings') {
    try {
      const saveBtn = page.locator('button:has-text("Save Changes")').first();
      if (await saveBtn.isVisible()) {
        console.log(`  >> "Save Changes"`);
        const respP = page.waitForResponse(
          r => r.url().includes('/api/') && ['POST', 'PUT', 'PATCH'].includes(r.request().method()),
          { timeout: 5000 }
        ).catch(() => null);
        await saveBtn.click();
        await page.waitForTimeout(2000);
        const resp = await respP;
        if (resp) {
          console.log(`     API: ${resp.status()}`);
          if (resp.status() >= 400) {
            let body = ''; try { body = await resp.text(); } catch {}
            console.log(`     FAIL: ${body.substring(0, 150)}`);
          }
        } else {
          console.log(`     No API call`);
        }
      }
    } catch {}
  }

  // Special: test POS interactions
  if (name === 'POS') {
    try {
      // Click a tap to add item
      const tap1 = page.locator('button:has-text("TAP 1")').first();
      if (await tap1.isVisible()) {
        console.log(`  >> Clicking TAP 1 to add to order`);
        await tap1.click();
        await page.waitForTimeout(1000);
        // Check if order updated
        const closeTab = page.locator('button:has-text("Close Tab")');
        const closeText = await closeTab.textContent();
        console.log(`     Close tab button: "${closeText?.trim()}"`);
      }
    } catch {}
  }

  if (jsErrors.length > 0) {
    console.log(`  Page JS Errors: ${jsErrors.length}`);
    [...new Set(jsErrors)].forEach(e => console.log(`    ${e.substring(0, 120)}`));
  }

  page.off('pageerror', errHandler);
}

async function main() {
  const { execSync } = await import('child_process');
  execSync('mkdir -p test-results/qa-audit');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  // Login
  await page.goto(BASE_URL, { timeout: 20000 });
  await page.waitForTimeout(2000);
  const demoBtn = page.locator('button:has-text("Explore Demo")');
  if (await demoBtn.isVisible().catch(() => false)) {
    await demoBtn.click();
    await page.waitForTimeout(3000);
  }
  console.log('Logged in\n');

  for (const name of PAGES) {
    await testPage(page, name);
  }

  // SUMMARY
  console.log('\n\n' + '='.repeat(60));
  console.log('  QA AUDIT SUMMARY');
  console.log('='.repeat(60));

  const sev = { critical: 0, high: 1, medium: 2, low: 3 };
  issues.sort((a, b) => sev[a.severity] - sev[b.severity]);

  console.log(`\nTotal issues: ${issues.length}\n`);
  for (const i of issues) {
    console.log(`[${i.severity.toUpperCase()}] ${i.page} — ${i.description}`);
    if (i.details) console.log(`  ${i.details}`);
  }

  await browser.close();
}

main().catch(console.error);
