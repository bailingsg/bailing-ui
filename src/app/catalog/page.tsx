import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Download } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import {
  CATALOG_DOWNLOAD_PATH,
  CATALOG_PAGES,
  CATALOG_PDF_FILENAME,
} from '@/lib/catalog';
import { getI18n } from '@/i18n';
import { defaultLocale, isLocale, localeCookieName, type Locale } from '@/i18n/config';

/**
 * 产品图册浏览页（/catalog，新窗口打开的工具页）
 *
 * 职责边界（按需求）：**只展示图册图片 + 提供 PDF 下载**——
 * 不带站点导航、不做产品跳转、没有询盘入口。
 * 语言不走 URL 前缀（该路径已在 middleware 豁免），按用户此前选择的
 * NEXT_LOCALE Cookie 渲染中/英文标签；Cookie 缺失时回退默认英文。
 */

/** 从 Cookie 解析界面语言（非法值回退英文，与中间件口径一致） */
async function resolveLocale(): Promise<Locale> {
  const store = await cookies();
  const raw = store.get(localeCookieName)?.value;
  return isLocale(raw) ? raw : defaultLocale;
}

export async function generateMetadata(): Promise<Metadata> {
  const { m } = getI18n(await resolveLocale());

  return {
    title: m.catalog.title,
    description: m.catalog.metaDescription,
    // 工具页不参与收录，也不传递权重
    robots: { index: false, follow: false },
  };
}

export default async function CatalogViewerPage() {
  const { t, m } = getI18n(await resolveLocale());
  const total = CATALOG_PAGES.length;

  return (
    <div className="flex min-h-screen flex-col">
      {/* 顶栏：标题 + 下载（滚动时吸顶，下载入口始终可达） */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <Container className="flex h-14 items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-heading-sm font-semibold">{m.catalog.title}</h1>
            <span className="hidden text-small text-text-muted sm:inline">
              {t('catalog.pageCount', { count: total })}
            </span>
          </div>
          <Button asChild>
            {/* 同源代理路由：download 属性生效，服务端再以 attachment 头兜底 */}
            <a href={CATALOG_DOWNLOAD_PATH} download={CATALOG_PDF_FILENAME}>
              <Download aria-hidden="true" />
              {m.catalog.download}
            </a>
          </Button>
        </Container>
      </header>

      {/* 图册图片：逐页纵排，懒加载（首屏页 eager） */}
      <Container className="py-8">
        <p className="text-small text-text-muted">{m.catalog.hint}</p>
        <div className="mt-6 flex flex-col gap-8">
          {CATALOG_PAGES.map((page, index) => (
            <figure
              key={page.src}
              className="overflow-hidden rounded-lg border border-border bg-surface-elevated shadow-xs"
            >
              {/*
                普通 <img> 而非 next/image：图册页是整幅文档扫描，
                没有多尺寸裁剪需求；且 CDN 已在 remotePatterns 内、
                next/image 只接受白名单宽度，原样展示最稳。
              */}
              <img
                src={page.src}
                alt={t('catalog.altPage', { page: index + 1 })}
                width={page.width}
                height={page.height}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                className="block h-auto w-full"
              />
              <figcaption className="border-t border-border px-4 py-2 text-center text-small text-text-muted">
                {t('catalog.pageOf', { page: index + 1, total })}
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </div>
  );
}
