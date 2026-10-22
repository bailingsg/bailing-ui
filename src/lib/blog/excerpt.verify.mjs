/* eslint-disable no-console */
// excerpt.ts 逻辑验证（node --experimental-strip-types 直跑真实源码）
import { cleanExcerpt, decodeHtmlEntities, firstParagraphText } from './excerpt.ts';

const contentHtml =
  '<p>Woodworking is one of the most rewarding hobbies you can start. Whether you are building a simple shelf, crafting furniture, or exploring DIY projects, having the right tools makes all the difference. However, beginners often fall into the same trap: buying the cheapest alternatives to save money. At first glance, a budget-friendly tool that looks similar to a premium model seems like a smart choice. But in many cases, these budget alternatives end up costing more.</p><h2>Trap #1</h2><p>Body two.</p>';

const cases = [
  // 1. WP 自动摘要（DB 原样，含实体 + 截断标记）→ 应回退正文首段且无标记
  {
    name: 'auto-truncated excerpt with entity',
    raw: 'Woodworking is one of the most rewarding hobbies you can start. Whether you&#8217;re building a simple shelf, crafting furniture, or exploring DIY projects, having the right tools makes all the difference. However, beginners often fall into the same trap: buying the cheapest alternatives to save money. At first glance, a budget-friendly tool that looks similar [&hellip;]',
    html: contentHtml,
    expect: (r) => !r.includes('[&hellip;') && !r.includes('hellip') && r.includes('cheapest alternatives to save money.') && !r.endsWith('…'),
  },
  // 2. 人工正常摘要（含实体）→ 解码但语义保留
  {
    name: 'human excerpt keeps meaning, decodes entities',
    raw: 'A guide to &amp; understanding plywood &mdash; WBP ratings &amp; more.',
    html: contentHtml,
    expect: (r) => r === 'A guide to & understanding plywood — WBP ratings & more.',
  },
  // 3. 空摘要 + 有正文 → 用首段生成
  {
    name: 'empty excerpt falls back to first paragraph',
    raw: '',
    html: contentHtml,
    expect: (r) => r.startsWith('Woodworking is one of the most rewarding'),
  },
  // 4. 截断摘要但无正文（列表场景）→ 去标记、不留字面量
  {
    name: 'truncated without html strips marker',
    raw: 'Some truncated intro text [&hellip;]',
    html: null,
    expect: (r) => r === 'Some truncated intro text',
  },
  // 5. null 输入
  {
    name: 'null excerpt without html -> empty',
    raw: null,
    html: null,
    expect: (r) => r === '',
  },
  // 6. 超长人工摘要 → 300 字符内边界截断，不加省略号
  {
    name: 'long human excerpt truncated at boundary',
    raw: 'A'.repeat(400),
    html: null,
    expect: (r) => r.length <= 300 && !r.endsWith('…'),
  },
  // 7. 尾部裸 …（另一种截断形态）无正文
  {
    name: 'bare ellipsis stripped',
    raw: 'Text before cut…',
    html: null,
    expect: (r) => r === 'Text before cut',
  },
  // 8. 含标签的残句摘要 → 去标签 + 回退
  {
    name: 'html excerpt with tags',
    raw: '<p>Short intro about <strong>plywood</strong>.</p>',
    html: null,
    expect: (r) => r === 'Short intro about plywood.',
  },
];

let pass = 0;
for (const c of cases) {
  const out = cleanExcerpt(c.raw, c.html);
  const ok = c.expect(out);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${c.name}`);
  if (!ok) console.log('  output:', JSON.stringify(out));
  else pass += 1;
}
console.log(`\n${pass}/${cases.length} passed`);
console.log('entity decode check:', decodeHtmlEntities('&#8217;&hellip;&#x41;') === '’…A' ? 'PASS' : 'FAIL');
console.log('firstParagraph check:', firstParagraphText('<div>skip</div><p>Real first.</p>') === 'Real first.' ? 'PASS' : 'FAIL', JSON.stringify(firstParagraphText('<div>skip</div><p>Real first.</p>')));
if (pass !== cases.length) process.exit(1);
