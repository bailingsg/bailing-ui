import type { MetadataRoute } from 'next';
import { siteConfig, sitemapRoutes, siteUrl } from '@/config/site';
import { apiGet, isApiSource } from '@/lib/cms-api';
import { CmsRevalidate, CmsTags } from '@/lib/cms-tags';
import { getProductSlugs } from '@/lib/products';
import { getBlogSlugs } from '@/lib/blog';
import { getApplicationSlugs } from '@/lib/applications';

/**
 * sitemap.xml —— Phase 5.0 起由后端 Sitemap Generator 统一生成（任务书二十一~二十二节）
 *
 * 数据源优先级：
 *   1. 后端 `GET /public/seo/sitemap`（按数据库实际内容生成，自动排除
 *      草稿 / 未发布 / 显式 noindex / 后台路径，见后端 SeoSitemapService）；
 *   2. 后端不可用或 demo 模式 → 本地兜底计算（静态路由 + 产品 / 博客 / 应用 slug）。
 *
 * 缓存：挂 `seo` + 全部内容标签（products / categories / blog / blog-categories /
 * applications）。后台发布 / 停用 / 修改内容或 SEO 后由 RevalidationService
 * 通知 /api/revalidate 失效对应 tag，sitemap 立即反映最新数据——不依赖人工修改。
 *
 * 注意：仅挂 `seo` tag 不够——`revalidatePath('/sitemap.xml')` 只失效路由缓存，
 * 底层 fetch 的 SEO tag（STABLE 3600s）仍会命中旧响应，导致新发布内容
 * 迟迟不进 sitemap（Phase 5.0 联调实测问题）。内容变更必须一并失效。
 *
 * 与 robots 联动：站点关闭收录（allowIndexing=false）时返回空列表，
 * 与 robots.txt 的 `Disallow: /` 保持一致，避免自相矛盾。
 */
interface BackendSitemapEntry {
  path: string;
  lastModified: string;
  changeFrequency: string;
  priority: number;
}

const CHANGE_FREQUENCIES = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'] as const;

function toChangeFrequency(value: string): MetadataRoute.Sitemap[number]['changeFrequency'] {
  return (CHANGE_FREQUENCIES as readonly string[]).includes(value)
    ? (value as MetadataRoute.Sitemap[number]['changeFrequency'])
    : 'monthly';
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 与 robots 联动：整站禁止收录时不输出任何 URL
  if (!siteConfig.allowIndexing) {
    return [];
  }

  // 1. 后端统一生成（权威来源）
  if (isApiSource()) {
    try {
      const { entries } = await apiGet<{ entries: BackendSitemapEntry[] }>('/public/seo/sitemap', {
        tags: [
          CmsTags.seo,
          CmsTags.products,
          CmsTags.categories,
          CmsTags.blog,
          CmsTags.blogCategories,
          CmsTags.applications,
        ],
        revalidate: CmsRevalidate.STABLE,
      });
      if (Array.isArray(entries) && entries.length > 0) {
        return entries.map((entry) => ({
          url: entry.path === '/' ? siteUrl : `${siteUrl}${entry.path}`,
          lastModified: new Date(entry.lastModified),
          changeFrequency: toChangeFrequency(entry.changeFrequency),
          priority: entry.priority,
        }));
      }
    } catch {
      // 后端不可用：落到本地兜底（离线构建不失败）
    }
  }

  // 2. 本地兜底计算（与旧版行为一致）
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = sitemapRoutes.map((route) => ({
    url: route.path === '/' ? siteUrl : `${siteUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

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
