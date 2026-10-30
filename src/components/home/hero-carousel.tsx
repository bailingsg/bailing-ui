'use client';

import * as React from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getI18n } from '@/i18n';
import { defaultLocale, type Locale } from '@/i18n/config';

/**
 * HeroCarousel —— 首页主视觉轮播（2026-10-30）
 *
 * 背景：旧站首屏是一组「大图 + 缩略图」轮播（6 张板材应用场景），
 * 新站目前是单张森林图。业务方要求把旧站的轮播搬过来，先在 /dashboard2 验证，
 * 确认后再替换正式首页的 hero（本次不动 / 路由）。
 *
 * 实现要点（都是踩过的坑，改动前先读）：
 *   · **固定宽高比容器**：所有 slide 绝对定位叠放，容器本身有 aspect-ratio，
 *     切换时高度不变 —— 否则每换一张图整页就跳一次（CLS）。
 *   · **只给第一张 priority**：其余 5 张懒加载，避免首屏抢带宽把 LCP 拖慢。
 *   · **自动播放可暂停**：悬停 / 键盘聚焦时暂停，另给一个显式暂停按钮
 *     （WCAG 2.2.2 要求自动更新的内容必须能停）。`prefers-reduced-motion`
 *     命中时默认不自动播放。
 *   · **不劫持滚动 / 不锁滚动条**：切图只改透明度，不做 transform 位移，
 *     移动端不会出现横向溢出。
 *   · 文案由服务端渲染后作为 children 传入（同一份 CMS 文案压在每张图上，
 *     与旧站一致），组件本身不持有任何业务文案。
 */

export interface HeroSlide {
  /** 图片地址（public 下的本地文件，如 /images/hero/mdf.webp） */
  src: string;
  /** 替代文本：描述画面本身，不堆关键词 */
  alt: string;
  /** 缩略图上的短标签（板材名） */
  label: string;
}

export interface HeroCarouselProps {
  slides: HeroSlide[];
  locale?: Locale;
  /** 压在图片上的文案 / 按钮（服务端节点） */
  children?: React.ReactNode;
  /** 自动切换间隔（毫秒）；0 表示不自动播放 */
  interval?: number;
  className?: string;
}

export function HeroCarousel({
  slides,
  locale = defaultLocale,
  children,
  interval = 6000,
  className,
}: HeroCarouselProps) {
  const { t } = getI18n(locale);
  const [index, setIndex] = React.useState(0);
  /** 用户显式暂停（按钮） */
  const [userPaused, setUserPaused] = React.useState(false);
  /** 悬停 / 聚焦时的临时暂停 */
  const [hovered, setHovered] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  const total = slides.length;
  const canAutoplay = total > 1 && interval > 0;

  // 系统「减少动态效果」偏好：命中则永不自动播放（无障碍要求）
  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const playing = canAutoplay && !userPaused && !hovered && !reducedMotion;

  React.useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % total);
    }, interval);
    return () => window.clearTimeout(timer);
  }, [playing, index, interval, total]);

  const goTo = React.useCallback(
    (next: number) => {
      if (total === 0) return;
      setIndex(((next % total) + total) % total);
    },
    [total],
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(index - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(index + 1);
    }
  };

  if (total === 0) return null;

  return (
    <div
      className={cn('relative isolate overflow-hidden border-b border-border bg-surface', className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={t('home.carouselLabel')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
      onKeyDown={onKeyDown}
    >
      {/*
        画面区：移动端用 min-height（竖屏下按 2.4:1 裁切会只剩一条缝，文字放不下），
        平板起回到原始 2.4:1。高度由容器决定，6 张图切换时不会跳动。
      */}
      <div className="relative min-h-[440px] w-full sm:aspect-[2.4/1] sm:min-h-0">
        {slides.map((slide, slideIndex) => (
          <div
            key={slide.src}
            role="group"
            aria-roledescription="slide"
            aria-label={t('home.carouselSlideOf', {
              index: slideIndex + 1,
              total,
            })}
            aria-hidden={slideIndex !== index}
            className={cn(
              'absolute inset-0 transition-opacity duration-700 ease-out',
              slideIndex === index ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              // 首屏第一张立刻加载；其余等切换时再拉，避免抢占首屏带宽
              priority={slideIndex === 0}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ))}

        {/* 文字压图：整幅均匀暗化（不产生白雾断层），保证白字在亮部也读得清 */}
        <div aria-hidden="true" className="absolute inset-0 bg-black/35" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
        />

        <div className="relative z-10 flex h-full items-end">
          <div className="mx-auto w-full max-w-[1080px] px-6 pb-10 sm:pb-14">{children}</div>
        </div>

        {/* 左右切换：桌面显示，移动端靠缩略图 */}
        {total > 1 ? (
          <div className="absolute inset-y-0 right-4 hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label={t('home.carouselPrev')}
              className="grid size-10 place-items-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
            >
              <ChevronLeft aria-hidden="true" className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label={t('home.carouselNext')}
              className="grid size-10 place-items-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
            >
              <ChevronRight aria-hidden="true" className="size-5" />
            </button>
          </div>
        ) : null}

        {/* 屏幕阅读器播报：切图后朗读「第 n 张，共 m 张」 */}
        <p aria-live="polite" className="sr-only">
          {t('home.carouselSlideOf', { index: index + 1, total })}
        </p>
      </div>

      {/* 缩略图条（与旧站一致：点缩略图换大图，标签即板材名） */}
      {total > 1 ? (
        <div className="border-t border-border bg-surface-elevated">
          <div className="mx-auto flex w-full max-w-[1080px] items-center gap-3 px-6 py-3">
            {/*
              min-w-0 必须保留：flex 子项默认 min-width:auto，6 个缩略图的固有宽度
              会把整行撑破，移动端就会出现整页横向溢出（文字被切在屏幕外）。
              加上它之后溢出只发生在 ul 内部，由 overflow-x-auto 横向滚动。
            */}
            <ul className="flex min-w-0 flex-1 items-stretch gap-2 overflow-x-auto pb-1">
              {slides.map((slide, slideIndex) => {
                const active = slideIndex === index;
                return (
                  <li key={slide.src} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => goTo(slideIndex)}
                      aria-label={slide.label}
                      aria-current={active ? 'true' : undefined}
                      className={cn(
                        'group flex w-[84px] flex-col gap-1 rounded-md p-1 text-left transition-colors sm:w-[116px]',
                        active ? 'bg-primary/10' : 'hover:bg-cream',
                      )}
                    >
                      <span
                        className={cn(
                          'relative block aspect-[3/2] w-full overflow-hidden rounded-sm border-2',
                          active ? 'border-primary' : 'border-transparent',
                        )}
                      >
                        <Image
                          src={slide.src}
                          alt=""
                          fill
                          sizes="120px"
                          className={cn(
                            'object-cover transition-opacity',
                            active ? 'opacity-100' : 'opacity-70 group-hover:opacity-100',
                          )}
                        />
                      </span>
                      {/* 标签最多两行：板材名较长（Particle Board / Film Faced Plywood），单行必然被截 */}
                      <span
                        className={cn(
                          'line-clamp-2 text-caption leading-tight',
                          active ? 'font-semibold text-foreground' : 'text-text-muted',
                        )}
                      >
                        {slide.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* 自动播放开关（WCAG 2.2.2：自动更新的内容必须可暂停） */}
            {canAutoplay ? (
              <button
                type="button"
                onClick={() => setUserPaused((paused) => !paused)}
                aria-label={
                  userPaused || reducedMotion ? t('home.carouselPlay') : t('home.carouselPause')
                }
                className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-text-secondary transition-colors hover:border-primary hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
              >
                {userPaused || reducedMotion ? (
                  <Play aria-hidden="true" className="size-4" />
                ) : (
                  <Pause aria-hidden="true" className="size-4" />
                )}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
