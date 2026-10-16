import { certificates, contactInfo, siteConfig, siteUrl, socialLinks } from '@/config/site';

/**
 * OrganizationSchema —— Schema.org Organization 结构化数据（JSON-LD）
 *
 * 仅输出已确认的信息；联系方式、地址、资质等未确认字段**不写入**，
 * 避免向搜索引擎提交虚假企业信息（后续阶段由业务方确认后补充）。
 */
export function OrganizationSchema() {
  const organization: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    // 稳定 @id：供页面级 WebPage / about 引用，避免重复声明实体
    '@id': `${siteUrl}/#organization`,
    name: siteConfig.name,
    alternateName: siteConfig.nameZh,
    url: siteUrl,
    logo: `${siteUrl}${siteConfig.ogImage}`,
    description: siteConfig.description,
  };

  // 联系方式仅在配置后输出（当前为空，不生成）
  if (contactInfo.email || contactInfo.phone) {
    organization.contactPoint = {
      '@type': 'ContactPoint',
      contactType: 'sales',
      ...(contactInfo.email ? { email: contactInfo.email } : {}),
      ...(contactInfo.phone ? { telephone: contactInfo.phone } : {}),
      availableLanguage: ['en', 'zh'],
    };
  }

  if (contactInfo.address) {
    organization.address = {
      '@type': 'PostalAddress',
      streetAddress: contactInfo.address,
    };
  }

  if (socialLinks.length > 0) {
    organization.sameAs = socialLinks.map((link) => link.href);
  }

  if (certificates.length > 0) {
    organization.hasCredential = certificates;
  }

  return (
    <script
      type="application/ld+json"
      // 数据来自本地配置（非用户输入），并对 < 做转义以防注入
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(organization).replace(/</g, '\\u003c'),
      }}
    />
  );
}
