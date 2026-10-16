import { siteConfig, siteUrl } from '@/config/site';

/**
 * WebSiteSchema —— Schema.org WebSite 结构化数据（JSON-LD，Phase 5.0）
 *
 * 仅输出在首页（任务书二十四节：首页 WebSite）。Organization 实体由根布局
 * 全局输出（稳定 @id），此处通过 @id 引用，不重复声明。
 */
export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: siteConfig.name,
    alternateName: siteConfig.nameZh,
    url: siteUrl,
    description: siteConfig.description,
    inLanguage: 'en',
    publisher: {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: siteConfig.name,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
      }}
    />
  );
}
