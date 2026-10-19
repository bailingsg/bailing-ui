import { siteConfig, siteUrl } from '@/config/site';
import type { SeoSettings } from '@/lib/seo/resolver';
import { defaultLocale, type Locale } from '@/i18n/config';

/**
 * OrganizationSchema —— Schema.org Organization 结构化数据（JSON-LD）
 *
 * Phase 5.0：公司信息改由 **Global SEO Settings**（后台 SEO → Global Settings）
 * 驱动；未配置的字段一律不输出——严禁虚构地址 / 电话 / 资质（任务书二十四节、
 * 四十六节「Fake organization data」红线）。
 *
 * 稳定 `@id`（#organization）供页面级 WebPage / FAQPage 等引用，避免重复声明实体。
 */
export interface OrganizationSchemaProps {
  /** Global SEO Settings（未传时退化为 config/site 内置默认） */
  settings?: SeoSettings | null;
  /** 当前语言：决定 description 用中文还是英文（公司名 / 地址等事实字段不受影响） */
  locale?: Locale;
}

export function OrganizationSchema({
  settings,
  locale = defaultLocale,
}: OrganizationSchemaProps) {
  const companyName = settings?.companyName || siteConfig.name;
  const website = settings?.companyWebsite || siteUrl;
  const logo = settings?.companyLogo
    ? settings.companyLogo.startsWith('http')
      ? settings.companyLogo
      : `${siteUrl}${settings.companyLogo}`
    : `${siteUrl}${siteConfig.ogImage}`;

  const organization: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    // 稳定 @id：供页面级 WebPage / about 引用，避免重复声明实体
    '@id': `${siteUrl}/#organization`,
    name: companyName,
    alternateName: siteConfig.nameZh,
    url: website,
    logo,
    description:
      locale === defaultLocale
        ? settings?.siteDescription || siteConfig.description
        : siteConfig.descriptionZh,
  };

  // 联系方式仅在配置后输出（未确认不生成，杜绝虚假信息）
  if (settings?.companyEmail || settings?.companyPhone) {
    organization.contactPoint = {
      '@type': 'ContactPoint',
      contactType: 'sales',
      ...(settings.companyEmail ? { email: settings.companyEmail } : {}),
      ...(settings.companyPhone ? { telephone: settings.companyPhone } : {}),
      availableLanguage: ['en', 'zh'],
    };
  }

  if (settings?.companyAddress || settings?.companyCountry) {
    organization.address = {
      '@type': 'PostalAddress',
      ...(settings.companyAddress ? { streetAddress: settings.companyAddress } : {}),
      ...(settings.companyCountry ? { addressCountry: settings.companyCountry } : {}),
    };
  }

  // Social 链接（Global SEO Settings；未配置不输出）
  const sameAs = [settings?.linkedin, settings?.facebook, settings?.instagram, settings?.youtube].filter(
    (url): url is string => Boolean(url),
  );
  if (sameAs.length > 0) {
    organization.sameAs = sameAs;
  }

  return (
    <script
      type="application/ld+json"
      // 数据来自 CMS 确认过的配置（非用户自由输入），并对 < 做转义以防注入
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(organization).replace(/</g, '\\u003c'),
      }}
    />
  );
}
