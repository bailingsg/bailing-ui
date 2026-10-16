/**
 * @deprecated Phase 3.3 起站点配置统一收敛到 `@/config/site`。
 * 本文件保留为兼容出口（既有组件仍可从 '@/lib/site-config' 引入），
 * 请勿在此新增内容；新代码请直接从 '@/config/site' 导入。
 */
export {
  siteConfig,
  siteUrl,
  mainNav,
  primaryCta,
  footerColumns,
  contactInfo,
  certificates,
  socialLinks,
  siteRoutes,
  sitemapRoutes,
  type NavItem,
  type FooterColumn,
  type SiteRoute,
} from '@/config/site';
