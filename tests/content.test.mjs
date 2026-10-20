import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { tips, categories, sources, faqs, routines, site } from '../src/content.mjs';
const root=path.resolve(import.meta.dirname,'..');

test('bilingual content has unique short slugs, source provenance and complete steps',()=>{
  assert.equal(new Set(tips.map(t=>t.slug)).size,tips.length);
  for(const t of tips){
    assert.match(t.slug,/^[a-z]{2,9}$/); assert.ok(categories[t.category]);
    assert.ok(t.steps.length>=2);
    for(const lang of ['id','en'])for(const v of [t.title,t.summary,t.material,t.kit,t.avoid,...t.steps])assert.ok(v[lang]?.trim());
    for(const key of t.refs)assert.ok(sources[key]);
    if(t.origin){assert.ok(t.origin[0]>=1&&t.origin[0]<=11);assert.ok(t.origin[1]);}
  }
  for(const f of faqs)for(const lang of ['id','en']){assert.ok(f.q[lang]);assert.ok(f.a[lang]);}
});
test('generated pages have reciprocal language links, structured data and resolvable local links',async()=>{
  const all=[];
  async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())await walk(p);else if(e.name.endsWith('.html'))all.push(p);}}
  await walk(path.join(root,'dist'));
  assert.equal(all.length,(tips.length+3)*2+1);
  for(const file of all){
    const html=await readFile(file,'utf8');
    assert.equal((html.match(/<h1[ >]/g)||[]).length,1,file);
    assert.ok(!/[—–]/u.test(html),`dash in ${file}`);
    assert.match(html,/<html lang="(?:id|en)">/);
    assert.match(html,/name="description" content="[^\"]+"/);
    assert.match(html,/rel="canonical" href="https:\/\/tipsbersihrumah\.rezaprama\.com\//);
    assert.match(html,/hreflang="id"/);assert.match(html,/hreflang="en"/);
    for(const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))assert.ok(JSON.parse(match[1])['@type']);
    for(const match of html.matchAll(/(?:href|src)="(\/(?!\/)[^\"]*)"/g)){
      const url=new URL(match[1],site);let local=path.join(root,'dist',decodeURIComponent(url.pathname));
      if(url.pathname.endsWith('/'))local=path.join(local,'index.html');
      assert.ok((await stat(local)).isFile(),`${file}: ${match[1]}`);
    }
  }
});
test('sitemap and Markdown include every guide in both languages',async()=>{
  const sitemap=await readFile(path.join(root,'dist/sitemap.xml'),'utf8');
  assert.equal((sitemap.match(/<url>/g)||[]).length,(tips.length+3)*2);
  for(const lang of ['id','en']){
    const md=await readFile(path.join(root,`docs/${lang}.md`),'utf8');
    for(const t of tips)assert.ok(md.includes(t.title[lang]));
    for(const list of Object.values(routines))for(const item of list)assert.ok(md.includes(item[lang]));
  }
});
