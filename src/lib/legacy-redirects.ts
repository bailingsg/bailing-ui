/**
 * 旧站（WordPress）URL 兼容层
 *
 * 背景（2026-10-30，新旧站对比报告「产品分类页」「新闻列表」两项）：
 * 旧站的链接形态与新站完全不同，且旧站已被搜索引擎收录多年、客户邮件里也到处是旧链接。
 * 迁移后这些地址一律 404，等于把历史流量和已发出去的链接全部作废。
 *
 * 旧 → 新 对应关系：
 *   /product-category/<slug>/   →  /products?category=<slug>    （旧站 14 个产品分类）
 *   /category/<slug>/           →  同上（WP 的另一种分类链接形态）
 *   /product/<slug>/            →  /products/<slug>-<id>        （需按 slug 反查规范 URL）
 *   /<post-slug>/               →  /blog/<post-slug>            （旧站文章直接挂在根路径）
 *   /about-us/ /contact-us/ /news-2/ /video/  →  对应新页面
 *
 * 本模块只做**纯路径判断**，不查数据：需要反查的（产品 / 文章）把 slug 交给调用方，
 * 由页面用现成的 repository 查询后跳转 —— 查不到就照常 404，不会伪造页面。
 */

/** 无需查库即可确定的固定别名（键为去掉首尾斜杠后的小写路径） */
const STATIC_ALIASES: Record<string, string> = {
  'about-us': '/about',
  'about': '/about',
  'contact-us': '/contact',
  'contact': '/contact',
  'news-2': '/blog',
  'news': '/blog',
  'video': '/factory',
  'products': '/products',
};

/** 旧站里没有独立落地页、直接归到产品总表的分类 */
const FALLBACK_CATEGORY_SLUGS = new Set(['uncategorized', 'uncategorised']);

export interface LegacyLookup {
  /** 可直接跳转的站内目标（已确定） */
  target?: string;
  /** 旧产品 slug —— 需要按 slug 反查规范详情 URL */
  productSlug?: string;
  /** 旧文章 slug —— 需要按 slug 确认文章存在后跳 /blog/<slug> */
  blogSlug?: string;
}

/**
 * 解析未匹配路由是否为旧站链接。
 *
 * @param segments 去掉语言前缀后的路径片段（如 ['product-category','mdf']）
 * @returns 命中返回跳转意图；不是旧站链接返回 null（调用方照常 404）
 */
export function resolveLegacyPath(segments: readonly string[]): LegacyLookup | null {
  const parts = segments
    .map((segment) => {
      try {
        return decodeURIComponent(segment).trim().toLowerCase();
      } catch {
        // 非法百分号编码：原样使用，避免整站 500
        return segment.trim().toLowerCase();
      }
    })
    .filter(Boolean);

  if (parts.length === 0 || parts.length > 2) return null;

  /* ---------- 两段：旧分类 / 旧产品 ---------- */
  if (parts.length === 2) {
    const [prefix, slug] = parts;

    if (prefix === 'product-category' || prefix === 'category' || prefix === 'product_cat') {
      if (FALLBACK_CATEGORY_SLUGS.has(slug)) return { target: '/products' };
      return { target: `/products?category=${encodeURIComponent(slug)}` };
    }

    if (prefix === 'product') {
      return { productSlug: slug };
    }

    return null;
  }

  /* ---------- 一段：固定别名 / 旧文章 ---------- */
  const [single] = parts;
  const alias = STATIC_ALIASES[single];
  if (alias) return { target: alias };

  // 其余单段路径按「旧文章」处理：由调用方按 slug 确认是否存在
  return { blogSlug: single };
}
