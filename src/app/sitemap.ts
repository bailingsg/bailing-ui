import type { MetadataRoute } from 'next';
import { sitemapRoutes, siteUrl } from '@/config/site';
import { getProductSlugs } from '@/lib/products';
import { getBlogSlugs } from '@/lib/blog';

/**
 * sitemap.xml —— 由站点路由清单 + 产品详情页 + 文章详情页动态生成
 *
 * 静态路由来自 src/config/site.ts 的 siteRoutes（inSitemap 为 true 者）；
 * 详情页从各自的数据源读取 slug（Demo 数据或后端 API / CMS），
 * 新增产品或文章无需改动本文件。
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = sitemapRoutes.map((route) => ({
    url: route.path === '/' ? siteUrl : `${siteUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const productSlugs = await getProductSlugs();
  const productEntries: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${siteUrl}/products/${slug}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const blogSlugs = await getBlogSlugs();
  const blogEntries: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${siteUrl}/blog/${slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticEntries, ...productEntries, ...blogEntries];
}
