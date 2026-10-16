import type { MetadataRoute } from 'next';
import { siteConfig, sitemapRoutes, siteUrl } from '@/config/site';
import { getProductSlugs } from '@/lib/products';
import { getBlogSlugs } from '@/lib/blog';
import { getApplicationSlugs } from '@/lib/applications';

/**
 * sitemap.xml —— 由站点路由清单 + 产品 / 文章 / 应用场景详情页动态生成
 *
 * 静态路由来自 src/config/site.ts 的 sitemapRoutes（inSitemap 为 true 者）；
 * 详情页 slug 从各自的数据源读取（Demo 数据或后端公开 API）。
 *
 * 收录正确性（Phase 4.8）：
 *   · 后端公开接口**只返回 PUBLISHED**，因此 Draft / Archived / 已删除内容
 *     天然不会出现在 sitemap 中；
 *   · slug 请求带 tag（products / blog / applications），后台发布后由
 *     /api/revalidate 失效对应 tag，sitemap 随即产出新 URL。
 *
 * 若站点开关关闭收录（allowIndexing=false），则返回空列表——
 * 与 robots.txt 的 Disallow: / 保持一致，避免自相矛盾。
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = sitemapRoutes.map((route) => ({
    url: route.path === '/' ? siteUrl : `${siteUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // 与 robots 联动：整站禁止收录时不输出任何 URL
  if (!siteConfig.allowIndexing) {
    return [];
  }

  const [productSlugs, blogSlugs, applicationSlugs] = await Promise.all([
    getProductSlugs(),
    getBlogSlugs(),
    getApplicationSlugs(),
  ]);

  const productEntries: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${siteUrl}/products/${slug}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${siteUrl}/blog/${slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const applicationEntries: MetadataRoute.Sitemap = applicationSlugs.map((slug) => ({
    url: `${siteUrl}/applications/${slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticEntries, ...productEntries, ...blogEntries, ...applicationEntries];
}
