import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { Inter } from 'next/font/google';
import '@/app/globals.css';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { OrganizationSchema } from '@/components/seo/organization-schema';
import { siteConfig, siteUrl } from '@/config/site';
import { getNavItems } from '@/lib/site';
import { getSeoSettings } from '@/lib/seo/resolver';
import { brandPalette } from '@/tokens';
import { defaultLocale, isLocale, localeMeta, locales } from '@/i18n/config';
import { getI18n } from '@/i18n';
import { localizedPath } from '@/i18n/paths';

/**
 * 字体：Inter（拉丁字符，自托管于构建产物）
 * 中文回退由设计令牌 --font-sans 的字体栈处理（Noto Sans SC / 苹方 / 微软雅黑）。
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

/**
 * 根布局（[locale] 段）
 *
 * 语言来自路由参数 —— 英文（默认）无前缀，中文 `/zh-CN` 前缀。
 * 每种语言各自静态生成，`<html lang>` 与页面文案在服务端就已确定，
 * 不存在「先渲染英文再被 JS 改成中文」的闪烁或 hydration 冲突。
 */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/** 站点级 metadata 底座（页面级 metadata 一律经 @/lib/seo/resolver 生成） */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const settings = await getSeoSettings();

  const siteName = locale === defaultLocale ? settings.siteName || siteConfig.name : siteConfig.name;
  const tagline = locale === defaultLocale ? siteConfig.tagline : siteConfig.taglineZh;
  const description =
    locale === defaultLocale
      ? settings.siteDescription || siteConfig.description
      : siteConfig.descriptionZh;
  const pageUrl = locale === defaultLocale ? siteUrl : `${siteUrl}/${locale}`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${siteName} — ${tagline}`,
      template: settings.pageTitleTemplate || `%s | ${siteConfig.name}`,
    },
    description,
    keywords: [...siteConfig.keywords],
    applicationName: siteName,
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    formatDetection: { telephone: false, address: false, email: false },
    // 语言互链：默认语言 + 中文（x-default 指向英文）
    alternates: {
      canonical: pageUrl,
      languages: {
        en: siteUrl,
        'zh-CN': `${siteUrl}/zh-CN`,
        'x-default': siteUrl,
      },
    },
    openGraph: {
      type: 'website',
      url: pageUrl,
      siteName,
      title: `${siteName} — ${tagline}`,
      description,
      locale: localeMeta[locale].ogLocale,
      images: [{ url: `${siteUrl}${siteConfig.ogImage}`, alt: `${siteName} logo` }],
    },
    // Google Search Console 验证（未配置不输出空标签）
    ...(settings.googleSiteVerification
      ? { verification: { google: settings.googleSiteVerification } }
      : {}),
    // 站点图标：复用品牌 logo，避免浏览器默认请求 /favicon.ico 产生 404
    icons: {
      icon: [{ url: siteConfig.ogImage, type: 'image/webp' }],
      apple: [{ url: siteConfig.ogImage, type: 'image/webp' }],
    },
    // 站点级开关：框架阶段（allowIndexing=false）全站不收录
    robots: siteConfig.allowIndexing
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

export const viewport: Viewport = {
  themeColor: brandPalette.woodBrown,
  width: 'device-width',
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();

  const locale = rawLocale;
  const { t } = getI18n(locale);

  // 导航由 CMS 驱动（Phase 4.7）：服务端并行取页眉 / 页脚导航。
  // demo 模式下 repository 回退 config/site 既有结构；api 模式后端不可用会抛错（不回退）。
  const [headerNav, footerNav, seoSettings] = await Promise.all([
    getNavItems('HEADER'),
    getNavItems('FOOTER'),
    getSeoSettings(),
  ]);

  return (
    <html lang={localeMeta[locale].htmlLang} className={inter.variable}>
      <body className="flex min-h-screen flex-col bg-background text-foreground antialiased">
        <a
          href={localizedPath('/#main-content', locale)}
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[var(--z-modal)] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-small focus:text-primary-foreground"
        >
          {t('nav.skipToContent')}
        </a>
        <Navbar items={headerNav} locale={locale} />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer items={footerNav} locale={locale} />
        {/* 全站 Organization 结构化数据（仅输出已确认信息） */}
        <OrganizationSchema settings={seoSettings} locale={locale} />
      </body>
    </html>
  );
}
