/**
 * 阶段 3 产品页隔离回归（只读）
 * - 第 3 个产品详情页（melamine-mdf，含正文图）
 * - 排版指标：.product-prose 宽度、横向溢出、图片加载状态
 */
import { createRequire } from 'node:module';
const require = createRequire('C:/Users/Administrator/.workbuddy-ai/binaries/node/workspace/');
const { chromium } = require('playwright-core');

const BASE = process.env.VERIFY_BASE ?? 'http://localhost:3100';
const EXE = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const targets = [
  { path: 'cmvetz0oq00f7puykuwdghv6d', label: 'melamine-mdf' },
  { path: 'cmvetz0in00bipuykdm0mk0di', label: 'film-faced-plywood' },
];

const browser = await chromium.launch({ executablePath: EXE, headless: true });
const results = [];
for (const t of targets) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const imgEvents = [];
  page.on('response', (r) => {
    if (r.url().includes('/uploads/')) imgEvents.push({ url: r.url().slice(-70), status: r.status() });
  });
  const consoleErrors = [];
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text().slice(0, 120)));
  await page.goto(`${BASE}/products/${t.path}`, { waitUntil: 'networkidle' });
  const m = await page.evaluate(() => {
    const prose = document.querySelector('.product-prose');
    if (!prose) return { found: false };
    const imgs = [...prose.querySelectorAll('img')];
    return {
      found: true,
      proseWidth: prose.getBoundingClientRect().width,
      scrollW: prose.scrollWidth,
      clientW: prose.clientWidth,
      imgCount: imgs.length,
      brokenImgs: imgs.filter((i) => i.complete && i.naturalWidth === 0).length,
      pollution: {
        inlineStyle: prose.querySelectorAll('[style]').length,
        dsMdParagraph: prose.querySelectorAll('.ds-markdown-paragraph').length,
        boxedClass: prose.querySelectorAll('.prose-boxed-heading').length,
      },
      h2Sample: [...prose.querySelectorAll('h2,h3')].slice(0, 2).map((h) => ({
        text: h.textContent.trim().slice(0, 30),
        fontSize: getComputedStyle(h).fontSize,
      })),
    };
  });
  results.push({ label: t.label, ...m, imgEvents, consoleErrors });
  await page.close();
}
await browser.close();
console.log(JSON.stringify(results, null, 2));
