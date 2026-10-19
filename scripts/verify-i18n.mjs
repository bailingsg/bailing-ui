#!/usr/bin/env node
/* eslint-disable no-console -- 这是命令行验证脚本，控制台输出就是它的产品 */
/**
 * 前台多语言（i18n）回归验证脚本
 *
 * 为什么是脚本而不是单测：bailing-ui 目前没有测试框架（无 jest / vitest /
 * playwright 依赖），引入框架会改变项目依赖结构。本脚本用 Node 内置能力
 * 对**运行中的生产构建**发真实 HTTP 请求，验证的是「用户真正拿到的东西」，
 * 而不是函数级 mock。
 *
 * 用法：
 *   1) npm run build && npm run start   （默认 3000 端口）
 *   2) node scripts/verify-i18n.mjs [baseUrl]
 *
 * 覆盖：
 *   · 默认英文无前缀 / 中文带前缀，HTTP 200 与 <html lang> 正确
 *   · /en/*、/zh、/fr/* 等非规范 URL 的 301 归一
 *   · canonical 指向自身语言，hreflang 输出 en / zh-CN / x-default
 *   · 未知路径返回真实 404 且使用本地化 404 版式
 *   · NEXT_LOCALE Cookie 偏好 → 307 回到中文（爬虫无 Cookie 不受影响）
 *   · sitemap.xml 同时包含两种语言的规范 URL 与 hreflang alternates
 *   · robots.txt 屏蔽内部路径（含中文 design-system）
 *   · RFQ 表单字段名在两种语言下完全一致（API 契约不被语言切换破坏）
 *   · 页面文案确实随语言变化（同一路径的中英文可见文案不同）
 */

const BASE = (process.argv[2] ?? 'http://127.0.0.1:3000').replace(/\/+$/, '');
const SITE = 'https://bailingwooden.com';

let passed = 0;
let failed = 0;
const failures = [];

function check(name, condition, detail = '') {
  if (condition) {
    passed += 1;
    console.log(`  \u2713 ${name}`);
  } else {
    failed += 1;
    failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
    console.log(`  \u2717 ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

async function fetchText(path, init) {
  const res = await fetch(`${BASE}${path}`, { redirect: 'manual', ...init });
  const body = await res.text();
  return { status: res.status, location: res.headers.get('location') ?? '', body, headers: res.headers };
}

function htmlLang(body) {
  return body.match(/<html[^>]*\blang="([^"]*)"/)?.[1] ?? '';
}

function canonical(body) {
  return body.match(/<link rel="canonical" href="([^"]*)"/)?.[1] ?? '';
}

function hreflangs(body) {
  const out = {};
  const re = /<link rel="alternate" hrefLang="([^"]*)" href="([^"]*)"/g;
  let match;
  while ((match = re.exec(body))) out[match[1]] = match[2];
  return out;
}

/** 提取表单里所有 name="..."（用于比对提交契约） */
function fieldNames(body) {
  const names = new Set();
  const re = /<(?:input|textarea|select)[^>]*\bname="([^"]*)"/g;
  let match;
  while ((match = re.exec(body))) names.add(match[1]);
  return [...names].sort();
}

const PAGES = [
  { path: '/', zh: '/zh-CN' },
  { path: '/products', zh: '/zh-CN/products' },
  { path: '/blog', zh: '/zh-CN/blog' },
  { path: '/applications', zh: '/zh-CN/applications' },
  { path: '/factory', zh: '/zh-CN/factory' },
  { path: '/quality', zh: '/zh-CN/quality' },
  { path: '/about', zh: '/zh-CN/about' },
  { path: '/contact', zh: '/zh-CN/contact' },
];

async function main() {
  console.log(`\n== 1. 页面可访问性与 <html lang>（${BASE}）==`);
  for (const page of PAGES) {
    const en = await fetchText(page.path);
    check(`${page.path} → 200`, en.status === 200, `status=${en.status}`);
    check(`${page.path} → lang="en"`, htmlLang(en.body) === 'en', `lang="${htmlLang(en.body)}"`);

    const zh = await fetchText(page.zh);
    check(`${page.zh} → 200`, zh.status === 200, `status=${zh.status}`);
    check(`${page.zh} → lang="zh-CN"`, htmlLang(zh.body) === 'zh-CN', `lang="${htmlLang(zh.body)}"`);

    check(
      `${page.path} 与 ${page.zh} 文案确实不同`,
      en.body !== zh.body,
      '两个语言返回了完全相同的 HTML',
    );
  }

  console.log('\n== 2. 非规范 URL 归一（301）==');
  const enPrefixed = await fetchText('/en/products');
  check('/en/products → 301', enPrefixed.status === 301, `status=${enPrefixed.status}`);
  check(
    '/en/products → /products',
    enPrefixed.location.endsWith('/products'),
    enPrefixed.location,
  );

  const zhAlias = await fetchText('/zh/products');
  check('/zh/products → 301', zhAlias.status === 301, `status=${zhAlias.status}`);
  check(
    '/zh/products → /zh-CN/products',
    zhAlias.location.endsWith('/zh-CN/products'),
    zhAlias.location,
  );

  const unsupported = await fetchText('/fr/products');
  check('/fr/products → 301', unsupported.status === 301, `status=${unsupported.status}`);
  check(
    '/fr/products → /products（回默认语言，不产出伪语言 URL）',
    unsupported.location.endsWith('/products'),
    unsupported.location,
  );

  const rootAlias = await fetchText('/zh');
  check('/zh → 301', rootAlias.status === 301, `status=${rootAlias.status}`);
  check('/zh → /zh-CN', rootAlias.location.endsWith('/zh-CN'), rootAlias.location);

  console.log('\n== 3. canonical 与 hreflang ==');
  for (const page of PAGES) {
    const en = await fetchText(page.path);
    const zh = await fetchText(page.zh);

    check(
      `${page.path} canonical 指向自身`,
      canonical(en.body) === `${SITE}${page.path === '/' ? '' : page.path}`,
      canonical(en.body),
    );
    check(
      `${page.zh} canonical 指向自身（不与英文共用）`,
      canonical(zh.body) === `${SITE}${page.zh}`,
      canonical(zh.body),
    );

    const enAlt = hreflangs(en.body);
    const zhAlt = hreflangs(zh.body);
    const expectedEn = `${SITE}${page.path === '/' ? '' : page.path}`;
    const expectedZh = `${SITE}${page.zh}`;

    check(
      `${page.path} hreflang 三向齐全`,
      enAlt.en === expectedEn &&
        enAlt['zh-CN'] === expectedZh &&
        enAlt['x-default'] === expectedEn,
      JSON.stringify(enAlt),
    );
    check(
      `${page.zh} hreflang 与英文页一致`,
      JSON.stringify(enAlt) === JSON.stringify(zhAlt),
      `${JSON.stringify(zhAlt)}`,
    );
  }

  console.log('\n== 4. 404 与语言 ==');
  for (const [path, marker] of [
    ['/no-such-page', 'Page not found'],
    ['/zh-CN/no-such-page', '页面不存在'],
    ['/products/no-such-product', 'Page not found'],
    ['/zh-CN/products/no-such-product', '页面不存在'],
  ]) {
    const res = await fetchText(path);
    check(`${path} → 404`, res.status === 404, `status=${res.status}`);
    check(`${path} 使用本地化 404 文案`, res.body.includes(marker), `未找到「${marker}」`);
  }

  console.log('\n== 5. 语言偏好持久化（Cookie）==');
  const cookieRes = await fetchText('/', { headers: { cookie: 'NEXT_LOCALE=zh-CN' } });
  check('带 NEXT_LOCALE=zh-CN 访问 / → 307', cookieRes.status === 307, `status=${cookieRes.status}`);
  check(
    '带 NEXT_LOCALE=zh-CN 访问 / → /zh-CN',
    cookieRes.location.endsWith('/zh-CN'),
    cookieRes.location,
  );

  const cookieDeep = await fetchText('/products', { headers: { cookie: 'NEXT_LOCALE=zh-CN' } });
  check(
    '带 NEXT_LOCALE=zh-CN 访问 /products → /zh-CN/products',
    cookieDeep.status === 307 && cookieDeep.location.endsWith('/zh-CN/products'),
    `${cookieDeep.status} ${cookieDeep.location}`,
  );

  const crawler = await fetchText('/');
  check('无 Cookie（爬虫视角）访问 / → 200 英文', crawler.status === 200, `status=${crawler.status}`);

  const invalidCookie = await fetchText('/', { headers: { cookie: 'NEXT_LOCALE=xx-YY' } });
  check('非法 Cookie 被忽略（不跳转）', invalidCookie.status === 200, `status=${invalidCookie.status}`);

  console.log('\n== 6. sitemap.xml ==');
  const sitemap = await fetchText('/sitemap.xml');
  check('/sitemap.xml → 200', sitemap.status === 200, `status=${sitemap.status}`);
  check('包含英文首页', sitemap.body.includes(`<loc>${SITE}</loc>`));
  check('包含中文首页', sitemap.body.includes(`<loc>${SITE}/zh-CN</loc>`));
  check('包含中文产品列表', sitemap.body.includes(`<loc>${SITE}/zh-CN/products</loc>`));
  check('包含 hreflang alternates', sitemap.body.includes('hreflang="x-default"'));
  check(
    '不包含非规范 /en 前缀 URL',
    !sitemap.body.includes(`<loc>${SITE}/en`),
    'sitemap 里出现了会被 301 的 /en/* URL',
  );

  console.log('\n== 7. robots.txt ==');
  const robots = await fetchText('/robots.txt');
  check('/robots.txt → 200', robots.status === 200, `status=${robots.status}`);
  check('屏蔽 /design-system', robots.body.includes('/design-system'));
  check('屏蔽 /zh-CN/design-system', robots.body.includes('/zh-CN/design-system'));
  check('输出 sitemap 地址', robots.body.includes('sitemap.xml'));

  console.log('\n== 8. RFQ 表单契约（语言切换不得改变提交字段）==');
  const contactEn = await fetchText('/contact');
  const contactZh = await fetchText('/zh-CN/contact');
  const fieldsEn = fieldNames(contactEn.body);
  const fieldsZh = fieldNames(contactZh.body);
  check('英文联系页存在 RFQ 字段', fieldsEn.length > 0, `字段数=${fieldsEn.length}`);
  check(
    '中英文 RFQ 字段名完全一致',
    JSON.stringify(fieldsEn) === JSON.stringify(fieldsZh),
    `en=[${fieldsEn}] zh=[${fieldsZh}]`,
  );
  for (const required of ['name', 'company', 'email', 'country', 'message']) {
    check(`RFQ 必填字段 "${required}" 存在`, fieldsEn.includes(required));
  }
  check(
    '中文页显示中文表单标签',
    contactZh.body.includes('姓名') || contactZh.body.includes('公司'),
    '未找到中文标签',
  );

  console.log('\n== 9. 导航链接的语言一致性 ==');
  const navZh = await fetchText('/zh-CN');
  const zhLinks = navZh.body.match(/href="\/zh-CN\/[a-z-]*"/g) ?? [];
  check('中文页站内链接带 /zh-CN 前缀', zhLinks.length >= 5, `匹配到 ${zhLinks.length} 条`);
  check(
    '中文页不含无前缀的栏目链接',
    !navZh.body.includes('href="/products"') && !navZh.body.includes('href="/factory"'),
    '中文页出现了无前缀链接（点击后会掉回英文）',
  );

  const navEn = await fetchText('/');
  check(
    '英文页不含 /zh-CN 站内链接',
    !/href="\/zh-CN\//.test(navEn.body),
    '英文页出现了中文前缀链接',
  );

  console.log('\n== 10. 语言切换器存在性 ==');
  check('英文页有语言选择器（Language）', navEn.body.includes('English'));
  check('中文页有语言选择器（简体中文）', navZh.body.includes('简体中文'));

  // ---------------------------------------------------------------------
  // 11. 中文页不得残留英文 UI 文案
  //     背景：CMS 的页面营销文案只有英文一套，若中文页直接套用 CMS，
  //     会出现「导航是中文、正文全是英文」。这里逐条守住回归。
  // ---------------------------------------------------------------------
  console.log('\n== 11. 中文页不残留英文 UI 文案 ==');
  const ENGLISH_UI = [
    'Request Quote',
    'View Products',
    'View All',
    'View Details',
    'Capabilities',
    'What we do',
    'Product categories',
    'Where our products are used',
    'Frequently asked questions',
    'Ready to source wooden products',
    'Contact Us',
    'Page not found',
    'Read article',
    'Send an enquiry',
    'Our Story',
  ];

  for (const page of PAGES) {
    const zh = await fetchText(page.zh);
    const leftovers = ENGLISH_UI.filter((text) => zh.body.includes(text));
    check(
      `${page.zh} 无英文 UI 残留`,
      leftovers.length === 0,
      leftovers.length > 0 ? `残留：${leftovers.join(' / ')}` : '',
    );
  }

  // 反向校验：英文页仍应保留这些英文文案（证明没有把英文也一起改坏）
  const enHome = await fetchText('/');
  check(
    '英文首页仍保留英文营销文案',
    enHome.body.includes('Request Quote') && enHome.body.includes('Capabilities'),
  );
  const enContact = await fetchText('/contact');
  check(
    '英文联系页仍保留英文表单文案',
    enContact.body.includes('Send an enquiry') || enContact.body.includes('Request for Quotation'),
  );

  console.log(`\n--------------------------------------------`);
  console.log(`通过 ${passed} 项，失败 ${failed} 项`);
  if (failed > 0) {
    console.log('\n失败明细：');
    for (const item of failures) console.log(`  · ${item}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('验证脚本异常终止：', error);
  process.exitCode = 1;
});
