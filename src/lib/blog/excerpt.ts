/**
 * 文章摘要（excerpt）展示层规范化。
 *
 * 背景（见 docs/article-style-diff-report.md D-01）：
 *   Phase 5.4 迁移把 WordPress 的**自动摘要**（`post.excerpt.rendered`）原样入库。
 *   WP 对无手动摘要的文章会取正文前 ~55 词并追加截断标记 `[&hellip;]`——
 *   ① 句子在词中被截断，是"半截残句"；② `&hellip;` 是 HTML 实体字符串，
 *   被 JSX 当纯文本渲染后会**原样显示**字面量 `[&hellip;]`。
 *
 * 规则（对应整改要求）：
 *   1. 先做「实体解码 + 去标签 + 压缩空白」，再判断语义——不在原始串上做正则猜；
 *   2. 命中截断标记（解码后的 `[…]` / `[...]`）或摘要为空 → 视为自动生成的残句，
 *      **用正文首段重新生成**完整摘要（详情页传入 contentHtml；列表页无正文时
 *      退化为"去标记"并保留可读文本，同时数据库清洗脚本会从根上修复存量数据）；
 *   3. 人工编写的正常摘要只做实体解码与长度兜底，不改写语义、不添加原文没有的内容；
 *   4. 长度兜底 ≤ 300 字符：优先在句号/问号/叹号边界截断，否则在词边界截断，
 *     **不追加省略号**（截断是排版取舍，不是新增内容）。
 *
 * 纯函数、零依赖；unit 校验通过 node 直跑（见 excerpt.verify.mjs）。
 */

/** 常见命名实体 → 字符（够用即止，其余交给数字实体分支） */
const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  laquo: '«',
  raquo: '»',
  copy: '©',
  reg: '®',
  trade: '™',
  middot: '·',
  bull: '•',
  deg: '°',
  plusmn: '±',
  times: '×',
  divide: '÷',
  sect: '§',
  para: '¶',
  euro: '€',
  pound: '£',
  yen: '¥',
  cent: '¢',
  shy: '',
  ensp: ' ',
  emsp: ' ',
  thinsp: ' ',
};

/** 解码数字实体与常见命名实体；未知实体原样保留（不误伤） */
export function decodeHtmlEntities(input: string): string {
  return input.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z][a-zA-Z0-9]*);/g, (whole, body: string) => {
    if (body[0] === '#') {
      const hex = body[1] === 'x' || body[1] === 'X';
      const code = hex ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return whole;
      try {
        return String.fromCodePoint(code);
      } catch {
        return whole;
      }
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? whole;
  });
}

/** 去标签 / 注释 → 纯文本（标签边界空格并入后续标点，避免 "plywood ."） */
export function htmlToText(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+([.,;:!?%])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 取正文第一个段落的文本（无 <p> 时退化为整篇文本） */
export function firstParagraphText(html: string): string {
  const p = /<p\b[^>]*>([\s\S]*?)<\/p>/i.exec(html);
  return htmlToText(p ? p[1] : html);
}

/** 长度兜底：优先句子边界，其次词边界；不追加省略号 */
export function truncateAtBoundary(text: string, max = 300): string {
  if (text.length <= max) return text;
  const head = text.slice(0, max);
  const sentenceEnd = Math.max(
    head.lastIndexOf('. '),
    head.lastIndexOf('! '),
    head.lastIndexOf('? '),
    head.lastIndexOf('。'),
    head.lastIndexOf('！'),
    head.lastIndexOf('？'),
  );
  if (sentenceEnd >= Math.floor(max * 0.5)) {
    return head.slice(0, sentenceEnd + 1).trim();
  }
  const wordEnd = head.lastIndexOf(' ');
  return (wordEnd >= Math.floor(max * 0.6) ? head.slice(0, wordEnd) : head).trim();
}

/** WP 自动摘要的截断标记（实体解码后的形态）：`[…]` / `[...]` / 行尾裸 `…` */
const TRUNCATION_MARKER = /\[(?:…|\.\.\.)\]$|…$/;

/**
 * 规范化摘要。fallbackHtml 为正文 HTML（详情页传入；列表页不传）。
 * 返回可直接渲染的纯文本。
 */
export function cleanExcerpt(raw: string | null | undefined, fallbackHtml?: string | null): string {
  const normalized = raw ? truncateAtBoundary(htmlToText(decodeHtmlEntities(raw))) : '';
  const isAutoTruncated = normalized.length === 0 || TRUNCATION_MARKER.test(normalized);

  if (isAutoTruncated && fallbackHtml) {
    // 自动摘要不可信 → 用正文首段重新生成（内容真实存在，非编造）
    const fromContent = truncateAtBoundary(firstParagraphText(decodeHtmlEntities(fallbackHtml)));
    if (fromContent.length > 0) return fromContent;
  }

  if (isAutoTruncated) {
    // 无正文可回退（列表页）：至少去掉截断标记，不留实体字面量
    return normalized.replace(TRUNCATION_MARKER, '').trim().replace(/[\s,;:–-]+$/, '');
  }

  return normalized;
}
