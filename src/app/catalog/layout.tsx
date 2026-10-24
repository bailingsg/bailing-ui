import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/app/globals.css';
import { brandPalette } from '@/tokens';

/**
 * 图册浏览页根布局（/catalog，独立于 [locale] 站点布局）
 *
 * 存在原因：图册页是「新窗口打开的工具页」，只展示图册图片 + 下载，
 * 不应带站点导航 / 页脚等chrome；而站点根布局（含 Navbar/Footer）
 * 位于 `app/[locale]/layout.tsx`，子路由无法摘除父级 chrome，
 * 因此这里为 /catalog 单开一套最小根布局（自带 <html>/<body>）。
 *
 * 该路径已在 middleware 中豁免语言前缀重写（见 src/middleware.ts），
 * 中英文标签由页面自身按 NEXT_LOCALE Cookie 选择。
 */

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  // 工具页不参与搜索收录（无独立 SEO 价值，且避免与 /products 竞争）
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: brandPalette.woodBrown,
  width: 'device-width',
  initialScale: 1,
};

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={inter.variable}>
      <body className="min-h-screen bg-surface text-foreground antialiased">{children}</body>
    </html>
  );
}
