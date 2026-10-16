import type { MetadataRoute } from 'next';
import { siteConfig, siteUrl } from '@/config/site';

/**
 * robots.txt —— 与站点收录开关联动（Phase 4.8 调整）
 *
 * 规则：
 *   · 允许收录时（生产默认）：`Allow: /`，仅屏蔽**内部 / 非内容**路径，
 *     绝不因为保护内部页面而误封整个站点。
 *   · 禁止收录时（开发环境，或显式 NEXT_PUBLIC_ALLOW_INDEXING=false）：
 *     `Disallow: /`，避免半成品被搜索引擎抓取。
 *
 * 说明：后台管理系统（bailing-admin）是**独立应用**（另一个域名 / 端口），
 * 它的 robots 由其自身负责；此处不会也不需要屏蔽 /login、/dashboard 等
 * 后台路径——这些路径在本站根本不存在。
 *
 * 始终输出 sitemap 地址（无论是否允许收录）。
 */

/** 本站内部 / 非内容路径（不应进入搜索结果） */
const DISALLOW_PATHS = [
  '/api/', // 内部接口（含 /api/revalidate）
  '/design-system', // 设计系统示例页，仅内部参考
];

export default function robots(): MetadataRoute.Robots {
  if (!siteConfig.allowIndexing) {
    return {
      rules: { userAgent: '*', disallow: '/' },
      sitemap: `${siteUrl}/sitemap.xml`,
      host: siteUrl,
    };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: DISALLOW_PATHS,
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
