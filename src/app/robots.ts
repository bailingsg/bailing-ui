import type { MetadataRoute } from 'next';
import { siteConfig, siteUrl } from '@/config/site';

/**
 * robots.txt —— 与站点收录开关联动
 *
 * 框架建设阶段（allowIndexing=false）禁止抓取，避免空站被收录；
 * 上线前在 src/config/site.ts 将 allowIndexing 改为 true 即可全站开放，
 * 并始终输出 sitemap 地址。
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: siteConfig.allowIndexing
      ? { userAgent: '*', allow: '/' }
      : { userAgent: '*', disallow: '/' },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
