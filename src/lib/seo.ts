import type { Metadata } from 'next';
import { siteConfig, siteUrl } from '@/config/site';

/**
 * 统一 SEO 工具
 *
 * 各页面通过 `generateMetadata()` 调用 `buildMetadata()` 生成一致的
 * title / description / keywords / canonical / openGraph / twitter，
 * 避免在每个页面重复书写 metadata。
 */

export interface PageSeoInput {
  /** 页面标题（默认套用根布局的 `%s | Bailing Wooden` 模板） */
  title: string;
  /**
   * 标题是否已是完整标题（不再套用根布局的模板）。
   *
   * 用于标题中已包含品牌名的页面（如 `About Bailing Wooden | Wood Manufacturer`），
   * 否则会被模板拼成 `… | Bailing Wooden | Bailing Wooden`。
   */
  absoluteTitle?: boolean;
  /** 页面描述（英文，面向海外采购商） */
  description: string;
  /** 路由路径，如 `/products`（用于 canonical 与 openGraph.url） */
  path: string;
  /** 页面关键词（缺省使用站点级关键词） */
  keywords?: string[];
  /** 是否允许搜索引擎索引（默认 true；预览页应设为 false） */
  index?: boolean;
  /** 分享图（缺省使用品牌 logo；可为站内路径或绝对 URL） */
  ogImage?: string;
  /** 分享图替代文本 */
  ogImageAlt?: string;
  /** Open Graph 类型 */
  ogType?: 'website' | 'article';
}

/** 将站内路径转换为绝对 URL（已是绝对 URL 时原样返回） */
export function absoluteUrl(path: string): string {
  if (!path) return siteUrl;
  if (/^https?:\/\//i.test(path)) return path;
  if (path === '/') return siteUrl;
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

/** 生成页面级 Metadata（统一 title/description/keywords/OG/Twitter/canonical） */
export function buildMetadata({
  title,
  absoluteTitle = false,
  description,
  path,
  keywords,
  index = true,
  ogImage = siteConfig.ogImage,
  ogImageAlt,
  ogType = 'website',
}: PageSeoInput): Metadata {
  const url = absoluteUrl(path);
  const image = absoluteUrl(ogImage);
  // 站点级开关优先：框架阶段（allowIndexing=false）一律不收录
  const indexable = index && siteConfig.allowIndexing;
  // 默认品牌图尺寸已知；产品等自定义分享图尺寸未知，省略以免信息错误
  const isBrandImage = ogImage === siteConfig.ogImage;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords: keywords ?? [...siteConfig.keywords],
    alternates: { canonical: url },
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      type: ogType,
      url,
      siteName: siteConfig.name,
      title,
      description,
      locale: siteConfig.locale,
      images: [
        {
          url: image,
          alt: ogImageAlt ?? `${siteConfig.name} logo`,
          ...(isBrandImage ? { width: 300, height: 300 } : {}),
        },
      ],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [image],
    },
  };
}
