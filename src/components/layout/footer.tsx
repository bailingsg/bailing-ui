import { cn } from '@/lib/utils';
import { Container } from '@/components/layout/container';
import { Logo } from '@/components/common/logo';
import { contactInfo, siteConfig } from '@/config/site';
import { LocaleLink } from '@/i18n/link';
import { getI18n, localizeNavLabel } from '@/i18n';
import type { Locale } from '@/i18n/config';
import type { PublicNavItem } from '@/lib/site';

/**
 * Footer —— 站点页脚
 *
 * 结构：品牌栏 + 站点导航栏（CMS 驱动，Phase 4.7）+ 地址栏。
 *
 * 导航链接来自后端公开 API（/public/navigation?location=FOOTER），
 * 由服务端获取后经 props 传入；链接在 CMS 写入时已做安全校验
 * （仅站内相对路径 / https / mailto / tel），新窗口项自动补 rel。
 *
 * 第三栏只保留地址：邮箱 / 电话 / 资质证书 / 社交媒体已按要求移除；
 * 「联系我们」入口不再重复——站点导航列本就带一项，再放一个属于冗余。
 * 需要联系方式的访客统一走联系我们页（含地图与员工直联方式）。
 */

export function Footer({ items, locale }: { items: PublicNavItem[]; locale: Locale }) {
  const year = new Date().getFullYear();
  const { t, isDefaultLocale } = getI18n(locale);

  const description = isDefaultLocale ? siteConfig.description : siteConfig.descriptionZh;
  const tagline = isDefaultLocale ? siteConfig.tagline : siteConfig.taglineZh;
  const placeholder = isDefaultLocale ? siteConfig.placeholderText : siteConfig.placeholderTextZh;
  const address = isDefaultLocale ? contactInfo.addressEn : contactInfo.address;

  return (
    <footer className="bg-surface-inverse text-surface-inverse-foreground">
      <Container>
        <div className="grid grid-cols-1 gap-10 py-section-sm sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* 品牌栏 */}
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-4">
            <Logo locale={locale} tone="inverse" withTagline />
            <p className="max-w-sm text-small text-neutral-400">{description}</p>
            <p className="text-caption text-neutral-500">
              {isDefaultLocale
                ? `${siteConfig.tagline} · ${siteConfig.taglineZh}`
                : siteConfig.taglineZh}
            </p>
          </div>

          {/* 站点导航栏（CMS 驱动，双列排布保持信息密度） */}
          <nav
            aria-label={t('nav.footerNav')}
            className="flex flex-col gap-3 sm:col-span-2 lg:col-span-4"
          >
            <h2 className="text-small font-semibold text-surface-inverse-foreground">
              {isDefaultLocale ? t('nav.sitemap') : t('nav.sitemapZh')}
              {isDefaultLocale ? (
                <span className="ml-1.5 text-caption font-normal text-neutral-500">
                  {t('nav.sitemapZh')}
                </span>
              ) : null}
            </h2>
            {items.length > 0 ? (
              <ul className="columns-1 gap-6 sm:columns-2">
                {items.map((item) => (
                  <li key={item.id} className="break-inside-avoid">
                    <LocaleLink
                      locale={locale}
                      href={item.url}
                      target={item.openInNewTab ? '_blank' : undefined}
                      rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                      className="text-small text-neutral-400 transition-colors duration-[var(--duration-fast)] hover:text-surface-inverse-foreground"
                    >
                      {localizeNavLabel(item.url, t, item.label)}
                    </LocaleLink>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-small text-neutral-500">{placeholder}</span>
            )}
          </nav>

          {/* 地址栏：只保留地址。「联系我们」入口已在站点导航列中存在，
              此处不再重复；标题直接用「地址」，与其余两栏标题保持同一基线对齐。 */}
          <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-4">
            <h2 className="text-small font-semibold text-surface-inverse-foreground">
              {t('nav.address')}
            </h2>
            <p
              className={cn(
                'text-small',
                address ? 'text-surface-inverse-foreground' : 'text-neutral-500',
              )}
            >
              {address || placeholder}
            </p>
          </div>
        </div>

        {/* 版权栏 */}
        <div className="flex flex-col gap-2 border-t border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-caption text-neutral-500">
            {t('nav.copyright', { year, name: siteConfig.name, nameZh: siteConfig.nameZh })}
          </p>
          <p className="text-caption text-neutral-500">{t('nav.exportLine', { tagline })}</p>
        </div>
      </Container>
    </footer>
  );
}
