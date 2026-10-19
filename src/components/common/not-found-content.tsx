/**
 * NotFoundContent —— 404 页面正文（**服务端组件**）
 *
 * 为什么是服务端组件：404 边界不接收 `params`，若把正文写成客户端组件，
 * Next.js 只会输出空壳 HTML，正文要等 JS 加载后才出现（对无 JS 访客、
 * 部分爬虫和首屏体验都不利）。
 *
 * 现在的做法：middleware 把本次生效的语言写进 `x-bailing-locale` 请求头，
 * `not-found.tsx` 读取后把 `locale` 传进来，于是 404 正文在**服务端**
 * 就以正确语言输出 —— 无 hydration 依赖，也不会闪烁。
 */

import { getI18n, localizeNavLabel } from '@/i18n';
import { LocaleLink } from '@/i18n/link';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { mainNav } from '@/config/site';
import type { Locale } from '@/i18n/config';

export function NotFoundContent({ locale }: { locale: Locale }) {
  const { t, m } = getI18n(locale);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <span className="text-display font-semibold text-primary">404</span>
      <h1 className="text-heading-lg">{m.notFound.title}</h1>
      <p className="max-w-md text-body text-text-secondary">{m.notFound.description}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <LocaleLink locale={locale} href="/">
            {t('common.backToHome')}
          </LocaleLink>
        </Button>
        <Button asChild variant="outline">
          <LocaleLink locale={locale} href="/contact">
            {t('common.contactUs')}
          </LocaleLink>
        </Button>
      </div>
      <nav
        aria-label={m.notFound.sectionsAria}
        className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2"
      >
        {mainNav.map((item) => (
          <LocaleLink
            key={item.href}
            locale={locale}
            href={item.href}
            className="text-small text-text-muted transition-colors duration-[var(--duration-fast)] hover:text-foreground"
          >
            {localizeNavLabel(item.href, t, item.label)}
          </LocaleLink>
        ))}
      </nav>
    </Container>
  );
}
