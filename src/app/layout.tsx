import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://bailingwooden.com'),
  title: {
    default: 'Bailing Wooden - 百灵木业 B2B 独立站',
    template: '%s | Bailing Wooden',
  },
  description:
    'Bailing Wooden B2B website - wooden products for overseas buyers. Phase 1: project foundation.',
  robots: { index: false, follow: false }, // Phase 1 占位页，暂不开放收录
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="flex min-h-screen flex-col bg-background text-foreground antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
