import { absoluteUrl } from '@/lib/seo';

/**
 * BreadcrumbSchema —— Schema.org BreadcrumbList 结构化数据（JSON-LD，Phase 4.8）
 *
 * 用于产品 / 博客 / 应用场景等详情页，让搜索结果展示层级路径而非裸 URL。
 *
 * 约定：
 *   · 传入的 items 必须与页面上可见的面包屑**完全一致**（名称与路径）；
 *   · 只输出站内相对路径（由 absoluteUrl 转为绝对 URL），不接受外部输入；
 *   · 不编造层级：最后一项为当前页，前面各项必须真实存在对应路由。
 */
export interface BreadcrumbItem {
  /** 面包屑显示名（英文，与页面一致） */
  name: string;
  /** 站内路径，如 `/products` 或 `/products/xxx` */
  path: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };

  return (
    <script
      type="application/ld+json"
      // 数据来自本地配置与 CMS 内容（非用户输入），并对 < 做转义以防注入
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
      }}
    />
  );
}
