'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Container } from '@/components/layout/container';
import { MobileMenu } from '@/components/layout/mobile-menu';
import { Logo } from '@/components/common/logo';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { primaryCta } from '@/config/site';
import { LocaleLink } from '@/i18n/link';
import { useLocalePathname } from '@/i18n/client';
import { getI18n, localizeNavLabel } from '@/i18n';
import type { Locale } from '@/i18n/config';
import type { PublicNavItem } from '@/lib/site';

/**
 * Navbar —— 站点主导航
 *
 * 结构：Logo · 主导航（CMS 驱动，Phase 4.7）· 语言选择器 · Request Quote CTA
 * 响应式：< 768px 汉堡菜单（语言切换在菜单内）；>= 768px 完整导航 + 语言选择器；
 *         >= 1024px 追加 CTA 按钮
 * 交互：粘性定位 + 轻微背景模糊，无复杂动画。
 *
 * 导航项由服务端（layout）从 CMS 公开 API 获取后经 props 传入——
 * 客户端不自行 fetch，保证 SSR 内容与 SEO 可见性。
 * 标签为 UI 文案：已知站内路由按当前语言翻译，未知路由沿用 CMS 原始标签。
 */
export function Navbar({ items, locale }: { items: PublicNavItem[]; locale: Locale }) {
  const pathname = useLocalePathname();
  const { t } = getI18n(locale);
  const [open, setOpen] = React.useState(false);
  const menuId = 'site-mobile-menu';

  // 路由变化时收起移动菜单
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-[var(--z-header)] w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <Container>
        <div className="flex h-16 items-center justify-between gap-3">
          <Logo locale={locale} withTagline={false} />

          {/* 桌面导航 */}
          <nav aria-label={t('nav.mainNav')} className="hidden md:block">
            <ul className="flex items-center gap-x-3.5 lg:gap-x-6">
              {items.map((item) => {
                const active =
                  item.url === '/' ? pathname === '/' : pathname.startsWith(item.url);
                return (
                  <li key={item.id}>
                    <LocaleLink
                      locale={locale}
                      href={item.url}
                      target={item.openInNewTab ? '_blank' : undefined}
                      rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'relative rounded-sm px-1 py-2 text-small transition-colors duration-[var(--duration-fast)]',
                        'after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-primary after:opacity-0 after:transition-opacity',
                        active
                          ? 'font-medium text-foreground after:opacity-100'
                          : 'text-text-secondary hover:text-foreground hover:after:opacity-60',
                      )}
                    >
                      {localizeNavLabel(item.url, t, item.label)}
                    </LocaleLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1 lg:gap-3">
            {/* 语言选择器（桌面 / 平板） */}
            <LanguageSwitcher locale={locale} className="hidden md:block" />

            {/* 桌面 CTA */}
            <div className="hidden lg:block">
              <Button asChild size="sm">
                <LocaleLink locale={locale} href={primaryCta.href}>
                  {t('nav.requestQuote')}
                </LocaleLink>
              </Button>
            </div>

            {/* 移动端汉堡按钮 */}
            <button
              type="button"
              aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
              aria-expanded={open}
              aria-controls={menuId}
              onClick={() => setOpen((value) => !value)}
              className={cn(
                'inline-flex size-10 items-center justify-center rounded-md text-foreground md:hidden',
                'transition-colors duration-[var(--duration-fast)] hover:bg-accent',
                'focus-visible:ring-2 focus-visible:ring-ring/60',
              )}
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5">
                {open ? (
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </Container>

      <MobileMenu
        id={menuId}
        open={open}
        onClose={() => setOpen(false)}
        activePath={pathname}
        items={items}
        locale={locale}
      />
    </header>
  );
}
