import { chromium, Page } from 'playwright';

const BASE = 'https://brewery-frontend-production.up.railway.app';

interface Issue {
  page: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  details: string;
}

const issues: Issue[] = [];
function logIssue(pg: string, severity: Issue['severity'], description: string, details: string) {
  issues.push({ page: pg, severity, description, details });
  console.log(`  ** [${severity.toUpperCase()}] ${description} — ${details}`);
}

async function login(page: Page) {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
  const demoBtn = page.getByText('Explore Demo');
  if (await demoBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await demoBtn.click();
    await page.waitForTimeout(3000);
  }
}

async function ensureSidebarVisible(page: Page): Promise<boolean> {
  // Check if sidebar/nav is visible
  const nav = page.locator('nav').first();
  const navVisible = await nav.isVisible({ timeout: 1000 }).catch(() => false);
  if (navVisible) return true;

  // POS might hide sidebar — look for a back/exit button or navigate home
  const backBtn = page.locator('button').filter({ hasText: /Back|Exit|Close|←|Menu/ }).first();
  if (await backBtn.isVisible({ timeout: 500 }).catch(() => false)) {
    await backBtn.click();
    await page.waitForTimeout(1000);
    return await nav.isVisible({ timeout: 1000 }).catch(() => false);
  }

  // Reload to get back to dashboard
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  return await nav.isVisible({ timeout: 2000 }).catch(() => false);
}

async function navigateTo(page: Page, navText: string): Promise<boolean> {
  try {
    if (!await ensureSidebarVisible(page)) {
      console.log(`    WARNING: Sidebar not visible, reloading...`);
      await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);
    }

    // Click the nav button - use span text for exact match
    const navBtn = page.locator('nav button span').filter({ hasText: new RegExp(`^${navText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }).first();
    if (await navBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await navBtn.click();
      await page.waitForTimeout(2000);
      return true;
    }

    // Fallback: try button with hasText
    const navBtn2 = page.locator('nav button').filter({ hasText: navText }).first();
    if (await navBtn2.isVisible({ timeout: 2000 }).catch(() => false)) {
      await navBtn2.click();
      await page.waitForTimeout(2000);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function closeAnyModal(page: Page) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const dialog = page.locator('[role="dialog"]').first();
    if (await dialog.isVisible({ timeout: 300 }).catch(() => false)) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } else break;
  }
}

async function testModalForm(page: Page, pageName: string, triggerBtnText: string): Promise<void> {
  try {
    const modal = page.locator('[role="dialog"]').first();
    if (!await modal.isVisible({ timeout: 1000 }).catch(() => false)) return;

    const inputs = modal.locator('input:visible, textarea:visible');
    const selects = modal.locator('select:visible');
    const inputCount = await inputs.count();
    const selectCount = await selects.count();
    console.log(`      Form: ${inputCount} inputs, ${selectCount} selects`);

    for (let j = 0; j < inputCount; j++) {
      try {
        const input = inputs.nth(j);
        const inputType = (await input.getAttribute('type').catch(() => 'text')) || 'text';
        const placeholder = (await input.getAttribute('placeholder').catch(() => '')) || '';
        const name = (await input.getAttribute('name').catch(() => '')) || '';
        const currentVal = await input.inputValue().catch(() => '');
        const label = (name + ' ' + placeholder).toLowerCase();
        if (['checkbox', 'radio', 'hidden', 'file'].includes(inputType)) continue;
        if (currentVal && currentVal.length > 0) continue;
        if (inputType === 'number') await input.fill('10').catch(() => {});
        else if (inputType === 'date') await input.fill('2026-03-06').catch(() => {});
        else if (inputType === 'datetime-local') await input.fill('2026-03-06T14:00').catch(() => {});
        else if (inputType === 'email') await input.fill('test@beardedhop.com').catch(() => {});
        else if (inputType === 'tel') await input.fill('555-123-4567').catch(() => {});
        else if (inputType === 'time') await input.fill('14:00').catch(() => {});
        else if (inputType === 'url') await input.fill('https://beardedhop.com').catch(() => {});
        else if (label.includes('name')) await input.fill('QA Test Name').catch(() => {});
        else if (label.includes('email')) await input.fill('qa@beardedhop.com').catch(() => {});
        else if (label.includes('phone')) await input.fill('555-123-4567').catch(() => {});
        else if (label.includes('price') || label.includes('cost') || label.includes('amount')) await input.fill('9.99').catch(() => {});
        else await input.fill('QA Test').catch(() => {});
      } catch {}
    }
    for (let j = 0; j < selectCount; j++) {
      try {
        const select = selects.nth(j);
        const optCount = await select.locator('option').count();
        if (optCount > 1) await select.selectOption({ index: 1 }).catch(() => {});
      } catch {}
    }

    const saveTexts = ['Save', 'Create', 'Submit', 'Add', 'Confirm', 'Update'];
    for (const saveText of saveTexts) {
      const saveBtn = modal.locator('button').filter({ hasText: saveText }).first();
      if (await saveBtn.isVisible({ timeout: 300 }).catch(() => false)) {
        const isDisabled = await saveBtn.isDisabled().catch(() => true);
        if (isDisabled) {
          logIssue(pageName, 'medium', `Save button "${saveText}" disabled`, `Trigger: "${triggerBtnText}"`);
          break;
        }
        console.log(`      Saving: "${saveText}"`);
        const responsePromise = page.waitForResponse(
          resp => resp.url().includes('/api/') && ['POST', 'PUT', 'PATCH'].includes(resp.request().method()),
          { timeout: 5000 }
        ).catch(() => null);
        await saveBtn.click();
        await page.waitForTimeout(2000);
        const response = await responsePromise;
        if (response) {
          const status = response.status();
          const url = response.url().split('/api/')[1] || response.url();
          const method = response.request().method();
          console.log(`      API: ${method} ${status} /api/${url}`);
          if (status >= 400) {
            let body = '';
            try { body = await response.text(); } catch {}
            logIssue(pageName, 'critical', `Form save failed (HTTP ${status})`, `${method} /api/${url} — ${body.substring(0, 200)}`);
          } else {
            console.log(`      ✓ Saved successfully`);
          }
        } else {
          const stillOpen = await modal.isVisible({ timeout: 500 }).catch(() => false);
          if (stillOpen) {
            const errorText = await modal.locator('.text-red-500, .text-red-400, .text-red-600').first().textContent().catch(() => '');
            if (errorText) console.log(`      Validation: ${errorText.trim().substring(0, 100)}`);
            else logIssue(pageName, 'high', `No API call on form submit`, `Trigger: "${triggerBtnText}", modal still open`);
          } else {
            console.log(`      Modal closed (appears successful)`);
          }
        }
        break;
      }
    }
  } catch (e: any) {
    console.log(`      Modal error: ${e.message?.substring(0, 100)}`);
  }
  await closeAnyModal(page);
}

async function deepTestPage(page: Page, pageName: string): Promise<void> {
  // Get all non-nav buttons
  const allButtons = await page.evaluate(() => {
    const sidebar = document.querySelector('nav');
    const results: string[] = [];
    document.querySelectorAll('button').forEach(btn => {
      if (sidebar?.contains(btn)) return;
      if (btn.offsetParent === null) return;
      const text = btn.textContent?.trim() || '';
      if (text.length > 0 && text.length < 60) results.push(text.substring(0, 50));
    });
    return results;
  });
  console.log(`  Buttons (${allButtons.length}): ${allButtons.slice(0, 10).map(b => `"${b}"`).join(', ')}${allButtons.length > 10 ? '...' : ''}`);

  // Test dropdowns
  const selectCount = await page.locator('select:visible').count();
  if (selectCount > 0) {
    console.log(`  Dropdowns: ${selectCount}`);
    for (let i = 0; i < Math.min(selectCount, 4); i++) {
      try {
        const select = page.locator('select:visible').nth(i);
        const opts = await select.locator('option').allTextContents();
        console.log(`    Select: [${opts.slice(0, 4).join(', ')}${opts.length > 4 ? '...' : ''}]`);
        if (opts.length > 1) {
          await select.selectOption({ index: 1 }).catch(() => {});
          await page.waitForTimeout(500);
        }
      } catch {}
    }
  }

  // Click tab-like buttons
  const tabPatterns = ['Overview', 'Details', 'Analytics', 'History', 'Calendar', 'Pipeline',
    'Grid', 'List', 'Chart', 'Tanks', 'Active', 'All', 'Pending', 'Completed',
    'Open', 'Closed', 'Daily', 'Weekly', 'Monthly', 'Summary', 'Breakdown',
    'Upcoming', 'Past', 'Draft', 'Sent', 'Scheduled', 'Compliance'];
  for (const kw of tabPatterns) {
    try {
      const btns = page.locator('button:visible').filter({ hasText: kw });
      const count = await btns.count();
      for (let i = 0; i < Math.min(count, 1); i++) {
        const btn = btns.nth(i);
        const isNav = await btn.evaluate(el => el.closest('nav') !== null);
        if (isNav) continue;
        const text = (await btn.textContent())?.trim() || '';
        if (text.length > 40) continue;
        await btn.click();
        await page.waitForTimeout(600);
        console.log(`    Tab: "${text}"`);
      }
    } catch {}
  }

  // Click action buttons (Add, New, Create) that open forms
  const actionPatterns = ['Add', 'New', 'Create', 'Record', 'Schedule', 'Assign'];
  for (const kw of actionPatterns) {
    try {
      const btns = page.locator('button:visible').filter({ hasText: kw });
      const count = await btns.count();
      for (let i = 0; i < Math.min(count, 3); i++) {
        const btn = btns.nth(i);
        const isNav = await btn.evaluate(el => el.closest('nav') !== null || el.closest('[role="dialog"]') !== null);
        if (isNav) continue;
        const text = (await btn.textContent())?.trim() || '';
        if (text.toLowerCase().includes('delete') || text.toLowerCase().includes('remove')) continue;
        if (text.length > 50) continue;
        const isDisabled = await btn.isDisabled().catch(() => true);
        if (isDisabled) continue;

        console.log(`    Action: "${text}"`);
        await btn.click();
        await page.waitForTimeout(1500);

        const modalVisible = await page.locator('[role="dialog"]').first().isVisible({ timeout: 800 }).catch(() => false);
        if (modalVisible) {
          console.log(`      Modal opened`);
          await testModalForm(page, pageName, text);
        } else {
          console.log(`      No modal`);
        }
      }
    } catch {}
  }

  // Test Edit buttons (click first one to verify edit works)
  try {
    const editBtns = page.locator('button:visible').filter({ hasText: 'Edit' });
    const editCount = await editBtns.count();
    if (editCount > 0) {
      const btn = editBtns.first();
      const isNav = await btn.evaluate(el => el.closest('nav') !== null);
      if (!isNav) {
        const text = (await btn.textContent())?.trim() || '';
        console.log(`    Edit: "${text}"`);
        await btn.click();
        await page.waitForTimeout(1500);
        const modalVisible = await page.locator('[role="dialog"]').first().isVisible({ timeout: 800 }).catch(() => false);
        if (modalVisible) {
          console.log(`      Edit modal opened`);
          await closeAnyModal(page);
        }
      }
    }
  } catch {}

  // Test page-level Save buttons
  try {
    const saveBtns = page.locator('button:visible').filter({ hasText: 'Save' });
    const count = await saveBtns.count();
    for (let i = 0; i < count; i++) {
      const btn = saveBtns.nth(i);
      const isNav = await btn.evaluate(el => el.closest('nav') !== null || el.closest('[role="dialog"]') !== null);
      if (isNav) continue;
      const text = (await btn.textContent())?.trim() || '';
      console.log(`    Page Save: "${text}"`);

      // Click it and check for API call
      const responsePromise = page.waitForResponse(
        resp => resp.url().includes('/api/') && ['POST', 'PUT', 'PATCH'].includes(resp.request().method()),
        { timeout: 5000 }
      ).catch(() => null);

      await btn.click();
      await page.waitForTimeout(2000);

      const response = await responsePromise;
      if (response) {
        const status = response.status();
        console.log(`      API: ${response.request().method()} ${status}`);
        if (status >= 400) {
          let body = '';
          try { body = await response.text(); } catch {}
          logIssue(pageName, 'critical', `Page save failed (HTTP ${status})`, body.substring(0, 200));
        }
      } else {
        // Check for toast or success indicator
        const toast = page.locator('[class*="toast"], [class*="Toast"], [class*="notification"]').first();
        const hasToast = await toast.isVisible({ timeout: 500 }).catch(() => false);
        if (!hasToast) {
          logIssue(pageName, 'medium', `Save button no API call and no feedback`, `Button: "${text}"`);
        }
      }
    }
  } catch {}
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  const consoleErrors: {page: string, error: string}[] = [];
  let currentPageName = 'Login';
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('favicon') && !text.includes('net::ERR') && !text.includes('the server responded with a status of') && !text.includes('404')) {
        consoleErrors.push({ page: currentPageName, error: text.substring(0, 300) });
      }
    }
  });

  const failedRequests: {page: string, detail: string}[] = [];
  page.on('response', resp => {
    if (resp.status() >= 400 && resp.url().includes('/api/')) {
      failedRequests.push({ page: currentPageName, detail: `${resp.status()} ${resp.request().method()} ${resp.url().split('/api/')[1] || resp.url()}` });
    }
  });

  console.log('=== LOGGING IN ===');
  await login(page);
  await page.screenshot({ path: '/home/will/BreweryCRM/test-results/audit-login.png' });

  // Actual sidebar nav labels (from analysis)
  const navPages = [
    'Dashboard', 'POS', 'Floor Plan', 'Customers', 'Mug Club', 'Reservations',
    'Tap Management', 'Brewing', 'Production', 'Recipe Lab', 'Keg Tracking',
    'Food & Menu', 'Inventory', 'Taproom Analytics', 'Events', 'Marketing',
    'Financials', 'Staff', 'Distribution', 'Reports', 'Settings',
  ];

  console.log('\n=== DEEP SCANNING ALL 21 PAGES ===\n');

  for (const pageName of navPages) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`  ${pageName.toUpperCase()}`);
    console.log('='.repeat(50));
    currentPageName = pageName;

    const navigated = await navigateTo(page, pageName);
    if (!navigated) {
      logIssue(pageName, 'critical', 'Navigation failed', 'Sidebar button not found');
      continue;
    }

    await page.waitForTimeout(1500);
    const safeName = pageName.toLowerCase().replace(/[&\s]+/g, '-');
    await page.screenshot({ path: `/home/will/BreweryCRM/test-results/audit-${safeName}.png` });

    await deepTestPage(page, pageName);
    await page.screenshot({ path: `/home/will/BreweryCRM/test-results/audit-${safeName}-after.png` });
  }

  // ===== FINAL SUMMARY =====
  console.log('\n\n' + '='.repeat(60));
  console.log('              DEEP QA AUDIT - FINAL RESULTS');
  console.log('='.repeat(60) + '\n');

  const critical = issues.filter(i => i.severity === 'critical');
  const high = issues.filter(i => i.severity === 'high');
  const medium = issues.filter(i => i.severity === 'medium');

  console.log(`TOTAL ISSUES: ${issues.length}`);
  console.log(`  CRITICAL: ${critical.length}`);
  console.log(`  HIGH:     ${high.length}`);
  console.log(`  MEDIUM:   ${medium.length}`);

  if (critical.length > 0) {
    console.log('\n--- CRITICAL ---');
    critical.forEach((i, idx) => console.log(`  ${idx+1}. [${i.page}] ${i.description}\n     ${i.details}`));
  }
  if (high.length > 0) {
    console.log('\n--- HIGH ---');
    high.forEach((i, idx) => console.log(`  ${idx+1}. [${i.page}] ${i.description}\n     ${i.details}`));
  }
  if (medium.length > 0) {
    console.log('\n--- MEDIUM ---');
    medium.forEach((i, idx) => console.log(`  ${idx+1}. [${i.page}] ${i.description}\n     ${i.details}`));
  }

  console.log('\n--- CONSOLE ERRORS ---');
  const errorsByPage = new Map<string, string[]>();
  consoleErrors.forEach(e => {
    const list = errorsByPage.get(e.page) || [];
    list.push(e.error);
    errorsByPage.set(e.page, list);
  });
  errorsByPage.forEach((errors, pg) => {
    console.log(`  ${pg}: ${errors.length} error(s)`);
    errors.slice(0, 3).forEach(e => console.log(`    ${e.substring(0, 150)}`));
  });

  console.log('\n--- FAILED API REQUESTS ---');
  failedRequests.forEach(r => console.log(`  [${r.page}] ${r.detail}`));

  await browser.close();
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
