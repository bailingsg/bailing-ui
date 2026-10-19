'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import {
  localeCookieMaxAge,
  localeCookieName,
  localeMeta,
  locales,
  type Locale,
} from '@/i18n/config';
import { useLocalePathname } from '@/i18n/client';
import { switchLocalePath } from '@/i18n/paths';
import { getMessages } from '@/i18n/messages';
import { createTranslator } from '@/i18n/translate';

/**
 * LanguageSwitcher —— 语言选择器（Phase i18n）
 *
 * 桌面端：导航栏右侧的地球图标 + 当前语言名，点击展开菜单。
 * 移动端：由 MobileMenu 内嵌 LanguageSwitcherInline（分段按钮，触控更稳）。
 *
 * 行为：
 *   · 切换语言时停留在**当前页面**（路径 / 查询串 / 锚点全部保留）；
 *   · 同步写入 NEXT_LOCALE Cookie，刷新、站内跳转、下次访问都保持选择；
 *   · 切换期间显示 pending 状态并提供 aria-live 播报，不整页闪烁；
 *   · 键盘可用：Enter/Space 展开、方向键移动、Esc 关闭并归还焦点、Tab 关闭。
 */

function useLanguageSwitch(locale: Locale) {
  const router = useRouter();
  const pathname = useLocalePathname();
  const [isPending, startTransition] = React.useTransition();

  const switchTo = React.useCallback(
    (next: Locale) => {
      if (next === locale) return;

      // 先落 Cookie：middleware 依赖它决定无前缀地址的去向
      if (typeof document !== 'undefined') {
        document.cookie = `${localeCookieName}=${encodeURIComponent(next)}; path=/; max-age=${localeCookieMaxAge}; samesite=lax`;
      }

      const search = typeof window !== 'undefined' ? window.location.search : '';
      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      const target = switchLocalePath(pathname, search, hash, next);

      startTransition(() => {
        router.push(target);
      });
    },
    [locale, pathname, router],
  );

  return { switchTo, isPending };
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4">
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3.9 9.5h16.2M3.9 14.5h16.2M12 3.75c2.2 2.4 3.3 5.2 3.3 8.25S14.2 18 12 20.25C9.8 18 8.7 15.2 8.7 12S9.8 6.15 12 3.75z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4 text-primary">
      <path
        d="M5 12.5l4.5 4.5L19 7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface LanguageSwitcherProps {
  /** 当前语言（由服务端布局透传，避免首帧与客户端不一致） */
  locale: Locale;
  className?: string;
}

export function LanguageSwitcher({ locale, className }: LanguageSwitcherProps) {
  const { switchTo, isPending } = useLanguageSwitch(locale);
  const t = createTranslator(getMessages(locale));

  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const menuId = React.useId();

  const current = localeMeta[locale];

  const close = React.useCallback((restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  }, []);

  // 点击外部 / Esc 关闭
  React.useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        close(true);
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close]);

  // 展开后把焦点放到当前语言项
  React.useEffect(() => {
    if (!open) return;
    const index = Math.max(
      0,
      locales.findIndex((item) => item === locale),
    );
    itemRefs.current[index]?.focus();
  }, [open, locale]);

  function focusItem(index: number) {
    const count = locales.length;
    const next = ((index % count) + count) % count;
    itemRefs.current[next]?.focus();
  }

  function onButtonKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
    }
  }

  function onMenuKeyDown(event: React.KeyboardEvent<HTMLUListElement>) {
    const activeIndex = itemRefs.current.findIndex((item) => item === document.activeElement);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusItem(activeIndex + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusItem(activeIndex - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusItem(0);
        break;
      case 'End':
        event.preventDefault();
        focusItem(locales.length - 1);
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
        break;
    }
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={t('language.current', { name: current.nativeName })}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={onButtonKeyDown}
        className={cn(
          'inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-small text-text-secondary',
          'transition-colors duration-[var(--duration-fast)] hover:bg-accent hover:text-foreground',
          'outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
          'data-[state=open]:bg-accent data-[state=open]:text-foreground',
        )}
        data-state={open ? 'open' : 'closed'}
      >
        {isPending ? <Spinner className="size-3.5" /> : <GlobeIcon />}
        <span className="lg:hidden">{current.shortName}</span>
        <span className="hidden lg:inline">{current.nativeName}</span>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-3 opacity-70">
          <path
            d="M6 9.5l6 6 6-6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? (
        <ul
          id={menuId}
          role="menu"
          aria-label={t('language.menuLabel')}
          onKeyDown={onMenuKeyDown}
          className="absolute right-0 z-[var(--z-overlay)] mt-2 min-w-44 rounded-lg border border-border bg-background p-1.5 shadow-lg"
        >
          {locales.map((item, index) => {
            const active = item === locale;
            return (
              <li key={item} role="none">
                <button
                  ref={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  lang={localeMeta[item].htmlLang}
                  onClick={() => {
                    close();
                    switchTo(item);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-small',
                    'outline-none transition-colors duration-[var(--duration-fast)]',
                    'hover:bg-accent focus-visible:bg-accent',
                    active ? 'font-medium text-foreground' : 'text-text-secondary',
                  )}
                >
                  <span>{localeMeta[item].nativeName}</span>
                  {active ? <CheckIcon /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      <span className="sr-only" aria-live="polite">
        {isPending ? t('language.updating') : ''}
      </span>
    </div>
  );
}

/**
 * 移动端语言切换（内嵌在移动菜单里）
 *
 * 用分段按钮而不是下拉：触控目标更大，也不会把菜单撑出屏幕。
 */
export function LanguageSwitcherInline({ locale }: { locale: Locale }) {
  const { switchTo, isPending } = useLanguageSwitch(locale);
  const t = createTranslator(getMessages(locale));

  return (
    <div className="mt-4 border-t border-border pt-4">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-caption font-semibold tracking-wider text-text-muted uppercase">
          <GlobeIcon />
          {t('language.label')}
        </span>
        {isPending ? <Spinner className="size-3.5 text-text-muted" /> : null}
      </div>

      <div
        role="radiogroup"
        aria-label={t('language.switcher')}
        className="mt-2 grid grid-cols-2 gap-2"
      >
        {locales.map((item) => {
          const active = item === locale;
          return (
            <button
              key={item}
              type="button"
              role="radio"
              aria-checked={active}
              lang={localeMeta[item].htmlLang}
              onClick={() => switchTo(item)}
              className={cn(
                'flex h-10 items-center justify-center rounded-md border text-small transition-colors',
                'outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
                active
                  ? 'border-primary bg-accent font-medium text-accent-foreground'
                  : 'border-border text-text-secondary hover:border-border-strong hover:bg-accent',
              )}
            >
              {localeMeta[item].nativeName}
            </button>
          );
        })}
      </div>
      <span className="sr-only" aria-live="polite">
        {isPending ? t('language.updating') : ''}
      </span>
    </div>
  );
}
