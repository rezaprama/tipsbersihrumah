import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { mkdir, writeFile } from 'node:fs/promises';
const base=process.env.AUDIT_URL||'http://127.0.0.1:4173';
const routes=process.env.AUDIT_ROUTES?process.env.AUDIT_ROUTES.split(','):['/','/en/','/tips/kerak/','/en/tips/kerak/'];
await mkdir('reports',{recursive:true});
const chrome=await chromeLauncher.launch({chromePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',chromeFlags:['--headless=new','--no-sandbox','--disable-dev-shm-usage']});
const results=[];
try{
  for(const route of routes)for(const device of ['mobile','desktop']){
    const id=(route==='/'?'id-home':route.replaceAll('/','-').replace(/^-|-$/g,''))+'-'+device;
    const flags={port:chrome.port,output:['html','json'],logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo']};
    const config=device==='desktop'?{extends:'lighthouse:default',settings:{formFactor:'desktop',screenEmulation:{mobile:false,width:1350,height:940,deviceScaleFactor:1,disabled:false},throttling:{rttMs:40,throughputKbps:10240,cpuSlowdownMultiplier:1}}}:undefined;
    const result=await lighthouse(base+route,flags,config);
    await writeFile(`reports/${id}.html`,result.report[0]);await writeFile(`reports/${id}.json`,result.report[1]);
    const row={route,device,url:result.lhr.finalDisplayedUrl,scores:Object.fromEntries(Object.entries(result.lhr.categories).map(([k,v])=>[k,Math.round(v.score*100)])),metrics:{FCP:result.lhr.audits['first-contentful-paint'].displayValue,LCP:result.lhr.audits['largest-contentful-paint'].displayValue,TBT:result.lhr.audits['total-blocking-time'].displayValue,CLS:result.lhr.audits['cumulative-layout-shift'].displayValue},failed:Object.values(result.lhr.audits).filter(a=>a.score!==null&&a.score<1&&a.details?.type!=='opportunity').map(a=>({id:a.id,title:a.title,score:a.score}))};
    results.push(row);console.log(JSON.stringify(row));
  }
}finally{await chrome.kill();}
await writeFile('reports/summary.json',JSON.stringify({testedAt:new Date().toISOString(),base,results},null,2));
await writeFile('reports/results.md',`# Lighthouse verification\n\nTested: ${new Date().toISOString()}  \nTarget: ${base}  \nTool: local Lighthouse / Chrome, default mobile simulation and desktop preset. Lab scores are a snapshot, not a guarantee of field performance or search ranking. No standard GEO score exists.\n\n| Page | Device | Performance | Accessibility | Best practices | SEO | LCP | CLS |\n| --- | --- | ---: | ---: | ---: | ---: | --- | --- |\n${results.map(r=>`| ${r.route} | ${r.device} | ${r.scores.performance} | ${r.scores.accessibility} | ${r.scores['best-practices']} | ${r.scores.seo} | ${r.metrics.LCP} | ${r.metrics.CLS} |`).join('\n')}\n\nRaw JSON and HTML reports are generated locally by \`npm run audit\`. They are ignored by Git.\n`);
