/**
 * 阶段 5 收尾验证（只读）
 * 1. RFQ 冒烟：/contact 页渲染 + 表单元素存在（不提交）
 * 2. SEO 元数据核对：文章页 title/description/canonical/og + 无 &hellip; 残留
 * 3. 修复后固定样本截图（供报告 before/after 对比）
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
const require = createRequire('C:/Users/Administrator/.workbuddy-ai/binaries/node/workspace/');
const { chromium } = require('playwright-core');

const BASE = process.env.VERIFY_BASE ?? 'http://localhost:3100';
const EXE = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = 'D:/com.bailingwooden/bailing-ui/docs/audit-article-style-evidence';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: EXE, headless: true });
const report = {};

// ---------- 1. RFQ 冒烟 ----------
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e).slice(0, 120)));
  await page.goto(`${BASE}/contact`, { waitUntil: 'networkidle' });
  const info = await page.evaluate(() => ({
    hasForm: !!document.querySelector('form'),
    inputs: document.querySelectorAll('form input, form textarea, form select').length,
    headings: [...document.querySelectorAll('h1, h2')].slice(0, 3).map((h) => h.textContent.trim().slice(0, 40)),
    htmlLen: document.body.innerHTML.length,
  }));
  await page.screenshot({ path: `${OUT}/rfq-contact-after-1440.png` });
  report.rfq = { url: '/contact', ...info, pageErrors: errs };
  await page.close();
}

// ---------- 2. SEO 元数据（含受控盒式标题文章） ----------
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}/blog/how-to-choose-the-best-plywood-for-marine-and-humid-environments`, { waitUntil: 'networkidle' });
  const meta = await page.evaluate(() => {
    const g = (sel) => document.querySelector(sel)?.content ?? null;
    const bodyText = document.body.innerText;
    return {
      title: document.title,
      description: g('meta[name="description"]'),
      ogTitle: g('meta[property="og:title"]'),
      ogImage: g('meta[property="og:image"]'),
      canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
      h1Count: document.querySelectorAll('h1').length,
      hellipVisible: bodyText.includes('…') && !bodyText.includes('…') ? bodyText.includes('&hellip;') : /\[…\]$/.test(bodyText),
      // hero 导语：取 h1 后第一段
      heroExcerpt: (() => {
        const h1 = document.querySelector('h1');
        const p = h1?.parentElement?.querySelector('p') ?? h1?.nextElementSibling;
        return p?.textContent?.trim().slice(0, 80) ?? null;
      })(),
    };
  });
  report.seo = meta;
  await page.close();
}

// ---------- 3. 修复后截图（桌面 + 移动） ----------
const shotTargets = [
  { path: '/blog/how-to-choose-the-best-plywood-for-marine-and-humid-environments', name: 'marine-after' },
  { path: '/blog/mdf-vs-plywood-vs-particle-board-bailing-guide', name: 'mdf-vs-after' },
  { path: '/blog/beginner-woodworking-tools-dont-fall-for-these-3-budget-trap-mistakes', name: 'beginner-after' },
];
for (const t of shotTargets) {
  for (const vp of [{ width: 1440, height: 900, tag: '1440' }, { width: 390, height: 844, tag: '390' }]) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto(`${BASE}${t.path}`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${OUT}/${t.name}-${vp.tag}.png`, fullPage: false });
    await page.close();
  }
}

await browser.close();
console.log(JSON.stringify(report, null, 2));
