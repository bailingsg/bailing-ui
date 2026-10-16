import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { OrganizationSchema } from '@/components/seo/organization-schema';
import { siteConfig, siteUrl } from '@/config/site';
import { getNavItems } from '@/lib/site';
import { getSeoSettings } from '@/lib/seo/resolver';
import { brandPalette } from '@/tokens';

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
 * 根布局 metadata（Phase 5.0：站点标题模板 / 验证 meta 来自 Global SEO Settings）。
 *
 * 页面级 metadata 一律经 @/lib/seo/resolver 的统一 resolver 生成，
 * 此处只负责站点级底座：默认标题模板、默认描述、Google 验证 meta。
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSeoSettings();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${settings.siteName || siteConfig.name} — ${siteConfig.tagline}`,
      template: settings.pageTitleTemplate || `%s | ${siteConfig.name}`,
    },
    description: settings.siteDescription || siteConfig.description,
    keywords: [...siteConfig.keywords],
    applicationName: settings.siteName || siteConfig.name,
    authors: [{ name: settings.siteName || siteConfig.name }],
    creator: settings.siteName || siteConfig.name,
    publisher: settings.siteName || siteConfig.name,
    formatDetection: { telephone: false, address: false, email: false },
    // Google Search Console 验证（任务书三十八节：未配置不输出空标签）
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

export default async function RootLayout({ children }: { children: ReactNode }) {
  // 导航由 CMS 驱动（Phase 4.7）：服务端并行取页眉 / 页脚导航。
  // demo 模式下 repository 回退 config/site 既有结构；api 模式后端不可用会抛错（不回退）。
  const [headerNav, footerNav, seoSettings] = await Promise.all([
    getNavItems('HEADER'),
    getNavItems('FOOTER'),
    getSeoSettings(),
  ]);

  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col bg-background text-foreground antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[var(--z-modal)] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-small focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <Navbar items={headerNav} />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer items={footerNav} />
        {/* 全站 Organization 结构化数据（仅输出已确认信息） */}
        <OrganizationSchema settings={seoSettings} />
      </body>
    </html>
  );
}
