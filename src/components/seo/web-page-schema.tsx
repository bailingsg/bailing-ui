import { siteConfig, siteUrl } from '@/config/site';
import { absoluteUrl } from '@/lib/seo';
import { localeMeta, defaultLocale, type Locale } from '@/i18n/config';

/**
 * WebPageSchema —— 页面级结构化数据（JSON-LD）
 *
 * 用于 /factory、/quality 等企业信任页面。
 *
 * 设计说明：Organization 实体已由根布局全局输出（带稳定 `@id`），
 * 因此本组件**不再重复声明 Organization**，而是输出一个 `WebPage` 节点，
 * 通过 `isPartOf`（站点）与 `about`（组织）以 `@id` 建立关联 —— 这是
 * 正确的链接数据做法，也符合"本阶段不要 Product schema"的要求。
 */
export interface WebPageSchemaProps {
  /** 页面标题 */
  name: string;
  /** 页面描述 */
  description: string;
  /** 页面路径（已带语言前缀），如 `/factory` 或 `/zh-CN/factory` */
  path: string;
  /** 页面语言（默认 en），写入 inLanguage */
  locale?: Locale;
}

export function WebPageSchema({
  name,
  description,
  path,
  locale = defaultLocale,
}: WebPageSchemaProps) {
  const url = absoluteUrl(path);

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    name,
    description,
    url,
    inLanguage: localeMeta[locale].htmlLang,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      name: siteConfig.name,
      url: siteUrl,
    },
    about: {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: siteConfig.name,
    },
  };

  return (
    <script
      type="application/ld+json"
      // 数据来自本地配置（非用户输入），并对 < 做转义以防注入
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
      }}
    />
  );
}
