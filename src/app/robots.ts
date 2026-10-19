import type { MetadataRoute } from 'next';
import { siteConfig, siteUrl } from '@/config/site';
import { getSeoSettings } from '@/lib/seo/resolver';
import { isApiSource } from '@/lib/cms-api';

/**
 * robots.txt —— Phase 5.0 起规则由后端 Robots Generator 统一生成（任务书二十三节）
 *
 * 规则来源：
 *   1. 后端 `GET /public/seo/robots`（Admin 未开放 robots 编辑，规则由后端
 *      固定模板生成：Allow: /；Disallow: /admin、/api、/search；Sitemap 指向
 *      **Global SEO Settings 的 canonicalDomain**——绝不硬编码开发环境域名）；
 *   2. 后端不可用 / demo 模式 → 本地同规则兜底（siteUrl 兜底域名）。
 *
 * 与站点收录开关联动（siteConfig.allowIndexing，环境变量控制）：
 *   · 允许收录时输出上述规则；
 *   · 禁止收录时 `Disallow: /`，避免半成品被搜索引擎抓取。
 *
 * 说明：后台管理系统（bailing-admin）是独立应用（另一域名 / 端口），
 * 其 robots 由自身负责；此处屏蔽的 /admin 是未来若同域部署时的防护。
 */

export default async function robots(): Promise<MetadataRoute.Robots> {
  // Sitemap 域名：优先 Global SEO Settings 的 canonicalDomain，其次站点 URL
  let sitemapBase = siteUrl;
  if (isApiSource()) {
    try {
      const settings = await getSeoSettings();
      if (settings.canonicalDomain) {
        sitemapBase = settings.canonicalDomain.replace(/\/+$/, '');
      }
    } catch {
      // 忽略：使用 siteUrl 兜底
    }
  }

  const sitemapUrl = `${sitemapBase}/sitemap.xml`;

  // 整站禁止收录（开发环境或显式 NEXT_PUBLIC_ALLOW_INDEXING=false）
  if (!siteConfig.allowIndexing) {
    return {
      rules: { userAgent: '*', disallow: '/' },
      sitemap: sitemapUrl,
      host: sitemapBase,
    };
  }

  // 正常收录：仅屏蔽内部 / 非内容路径（绝不误封整个站点）
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/search', '/design-system', '/zh-CN/design-system'],
    },
    sitemap: sitemapUrl,
    host: sitemapBase,
  };
}
