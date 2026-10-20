import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base=process.env.TEST_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
await mkdir('test-results',{recursive:true});
const results=[];
try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  await page.goto(base);await page.locator('html.js').waitFor();
  assert.equal(await page.locator('.tip-preview:visible').count(),6);
  await page.locator('#search').fill('kaca');
  assert.ok(await page.locator('.tip-preview:visible').count()>0);
  await page.locator('#search').fill('qzxnonexistent');
  assert.ok(await page.locator('#empty').isVisible());
  await page.locator('[data-clear]').first().click();
  await page.locator('[data-category="bath"]').click();
  assert.equal(await page.locator('.tip-preview:visible').first().getAttribute('data-room'),'bath');
  await page.locator('[data-clear]').first().click();
  await page.locator('[data-save="pel"]').click();
  await page.reload();
  assert.equal(await page.locator('[data-save="pel"]').getAttribute('aria-pressed'),'true');
  await page.locator('#saved-filter').click();
  assert.equal(await page.locator('.tip-preview:visible').count(),1);
  await page.locator('[data-clear]').first().click();
  await page.locator('#more').click();
  assert.equal(await page.locator('.tip-preview:visible').count(),12);
  await page.locator('[data-check="daily-0"]').check();
  await page.reload();assert.ok(await page.locator('[data-check="daily-0"]').isChecked());
  await page.locator('[data-routine="weekly"]').click();
  await page.locator('[data-check="weekly-1"]').check();
  await page.locator('#reset-routine').click();assert.ok(!await page.locator('[data-check="weekly-1"]').isChecked());
  await page.locator('.languages a[lang="en"]').click();
  assert.equal(await page.locator('html').getAttribute('lang'),'en');
  assert.ok(await page.locator('[data-check="daily-0"]').isChecked());
  await page.goto(base+'/en/tips/pel/');
  assert.equal(await page.locator('[data-save="pel"]').getAttribute('aria-pressed'),'true');
  await page.locator('.languages a[lang="id"]').click();
  assert.ok(page.url().endsWith('/tips/pel/'));
  await page.locator('#theme').click();await page.reload();
  assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  results.push('Search, empty state, category filter, saved/reload/language, pagination, checklist persistence/reset, article language switch, theme persistence: passed.');
  for(const width of [360,390,768,1024,1440]){
    await page.setViewportSize({width,height:width<768?844:1000});
    await page.goto(base);
    await page.evaluate(()=>document.fonts.ready);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`horizontal overflow at ${width}`);
    const title=await page.locator('.hero h1').boundingBox();
    const lineHeight=await page.locator('.hero h1').evaluate(el=>parseFloat(getComputedStyle(el).lineHeight));
    if(width>=1024)assert.ok(title.height<=lineHeight*2+2,`headline > 2 lines at ${width}`);
    const cta=await page.locator('.hero .button').boundingBox();assert.ok(cta.y+cta.height<(width<768?844:1000),`hero CTA below viewport at ${width}`);
    if(width===390||width===1440)for(const theme of ['light','dark']){
      await page.evaluate(theme=>{document.documentElement.dataset.theme=theme;},theme);
      const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
      assert.equal(axe.violations.length,0,JSON.stringify(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))));
      await page.screenshot({path:`test-results/home-${width}-${theme}.png`,fullPage:true});
    }
  }
  results.push('360/390/768/1024/1440px overflow and hero checks; 390/1440px light/dark WCAG A/AA automated checks: passed.');
  await page.setViewportSize({width:390,height:844});
  for(const route of ['/en/','/tips/kerak/','/en/tips/botol/','/aman/','/en/sumber/']){
    await page.goto(base+route);const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();assert.equal(axe.violations.length,0,`${route}: ${axe.violations.map(v=>v.id).join(',')}`);
  }
  const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const plain=await noJS.newPage();await plain.goto(base);
  assert.equal(await plain.locator('.tip-preview:visible').count(),38);
  await plain.locator('details').first().locator('summary').click();assert.ok(await plain.locator('details').first().getAttribute('open')!==null);
  await noJS.close();
  results.push('English, guide, safety and source-page accessibility; no-JavaScript guides and FAQ: passed.');
  const blocked=await browser.newContext();
  await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError');}});});
  const fallback=await blocked.newPage();await fallback.goto(base);
  await fallback.locator('html.js').waitFor();await fallback.locator('[data-check="daily-0"]').check();
  assert.ok((await fallback.locator('#storage-note').textContent()).includes('tidak tersedia'));
  await blocked.close();
  results.push('Blocked localStorage degrades to tab-local state: passed.');
  assert.deepEqual(errors,[]);results.push('Uncaught browser errors: none.');
  await writeFile('test-results/browser-results.json',JSON.stringify(results,null,2));
  console.log(results.join('\n'));
}finally{await browser.close();}
