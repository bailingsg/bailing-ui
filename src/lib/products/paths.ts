/**
 * 产品详情 URL 构造（slug-id 拼接）
 *
 * 详情路由 /products/[slugId] 的 URL 由 `slug` + `id` 拼接而成：
 *   /products/<slug>-<id>
 *
 * 设计考量：
 *   · slug 提供可读性与 SEO（人类/搜索引擎可识别产品名）；
 *   · id（CUID）保证唯一且稳定 —— slug 可能重复或被改写，id 不会。
 *
 * 解析：`extractProductId(slugId)` 取**最后一个** `-` 之后的片段作为 id
 * （CUID 本身不含连字符，而 slug 可含连字符，故以末段为准）。
 * 若片段中无连字符（纯 id 旧链接 /products/<id>），原样返回 ——
 * 旧 id-only 链接向后兼容，不会 404。
 */

export interface ProductPathInput {
  slug: string;
  id: string;
}

/**
 * 构造路由片段（**不含** `/products/` 前缀）。
 *
 * 用于三处必须一致的场景：
 *   · `generateStaticParams()` 返回的 `[slugId]` 参数；
 *   · 详情页把当前 `slugId` 与规范片段做比较（决定是否 301）；
 *   · 拼装完整路径（`productDetailPath` 内部复用）。
 *
 * 曾经把「完整路径」当片段用，导致 `slugId !== canonical` 永远成立、
 * 详情页 307 重定向到自身（无限循环，页面打不开）。
 */
export function productDetailSegment(product: ProductPathInput): string {
  return `${product.slug}-${product.id}`;
}

/** 构造产品详情前台路径（语言无关，不带语言前缀） */
export function productDetailPath(product: ProductPathInput): string {
  return `/products/${productDetailSegment(product)}`;
}

/** 从 slug-id 路径片段中提取产品 id（兼容纯 id 旧链接） */
export function extractProductId(slugId: string): string {
  const idx = slugId.lastIndexOf('-');
  return idx === -1 ? slugId : slugId.slice(idx + 1);
}
