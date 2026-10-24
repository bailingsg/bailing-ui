'use client';

import * as React from 'react';
import Image from 'next/image';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isVideoUrl } from '@/lib/media-url';
import { getI18n } from '@/i18n';
import { defaultLocale, type Locale } from '@/i18n/config';

/**
 * MediaLightbox —— 图片 / 视频放大查看（灯箱）
 *
 * 能力：
 *  · 图片经 next/image 以 object-contain 完整展示（不裁切、不拉伸）；
 *  · 视频（.mp4 / .webm / .mov 等）用原生 <video controls> 播放；
 *  · 上一张 / 下一张切换（到头循环），键盘 ← / → 同样可用；
 *  · Esc 关闭、点遮罩关闭、打开时锁页面滚动（Radix Dialog 模态层）；
 *  · 计数与图注常驻，深浅色主题均使用语义令牌，不硬编码色值。
 *
 * 用法：受控组件，`index` 为当前查看下标，`null` 表示关闭。
 */

/** 灯箱只依赖图片的**最小结构契约**，任何带 id / url / alt 的素材都可传入 */
export interface LightboxMedia {
  id: string;
  url: string;
  alt: string;
  caption?: string;
}

export interface MediaLightboxProps {
  images: LightboxMedia[];
  /** 当前查看下标；null 表示关闭 */
  index: number | null;
  /** 下标变化回调（关闭时传 null） */
  onIndexChange: (index: number | null) => void;
  /** 当前语言 */
  locale?: Locale;
}

export function MediaLightbox({
  images,
  index,
  onIndexChange,
  locale = defaultLocale,
}: MediaLightboxProps) {
  const { t } = getI18n(locale);
  const open = index !== null && images.length > 0;
  const active = open ? images[index] : undefined;
  const hasMultiple = images.length > 1;

  const go = React.useCallback(
    (delta: number) => {
      if (index === null || images.length === 0) return;
      const next = (index + delta + images.length) % images.length;
      onIndexChange(next);
    },
    [index, images.length, onIndexChange],
  );

  // 键盘导航：← 上一张 / → 下一张（Esc 由 Radix 模态层处理）
  React.useEffect(() => {
    if (!open || !hasMultiple) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        go(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        go(1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, hasMultiple, go]);

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onIndexChange(null);
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-[60] bg-foreground/40 backdrop-blur-[2px]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
          )}
        />
        <DialogPrimitive.Content
          aria-label={active ? active.alt : undefined}
          className={cn(
            'fixed left-1/2 top-1/2 z-[60] flex w-[calc(100vw-2rem)] max-w-5xl',
            '-translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden',
            'rounded-lg border border-border bg-background shadow-lg',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
            'data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
          )}
        >
          {active ? (
            <>
              {/* 头部：计数 + 图注 + 关闭 */}
              <div className="flex items-center gap-3 border-b border-border px-5 py-3 pr-12">
                <span className="text-small font-medium text-text-secondary">
                  {t('common.lightboxCounter', {
                    index: (index ?? 0) + 1,
                    total: images.length,
                  })}
                </span>
                {isVideoUrl(active.url) ? (
                  <span className="rounded-full border border-border px-2 py-0.5 text-caption text-text-muted">
                    {t('common.videoLabel')}
                  </span>
                ) : null}
                {active.caption ? (
                  <span className="truncate text-small text-text-muted">{active.caption}</span>
                ) : null}
              </div>

              {/* 展示区：图片 object-contain 完整显示；视频原生播放器 */}
              <div className="relative flex h-[60dvh] w-full items-center justify-center bg-surface sm:h-[70dvh]">
                {isVideoUrl(active.url) ? (
                  <video
                    key={active.id}
                    src={active.url}
                    controls
                    autoPlay
                    playsInline
                    className="max-h-full max-w-full"
                  />
                ) : (
                  <Image
                    key={active.id}
                    src={active.url}
                    alt={active.alt}
                    fill
                    sizes="(min-width: 1024px) 90vw, 100vw"
                    className="object-contain"
                  />
                )}
              </div>

              {/* 底部：切换 */}
              {hasMultiple ? (
                <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3">
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label={t('common.lightboxPrevious')}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-small',
                      'text-text-secondary outline-none transition-colors',
                      'hover:bg-accent hover:text-foreground',
                      'focus-visible:ring-2 focus-visible:ring-ring/60',
                    )}
                  >
                    <ChevronLeft className="size-4" aria-hidden="true" />
                    {t('common.lightboxPrevious')}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label={t('common.lightboxNext')}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-small',
                      'text-text-secondary outline-none transition-colors',
                      'hover:bg-accent hover:text-foreground',
                      'focus-visible:ring-2 focus-visible:ring-ring/60',
                    )}
                  >
                    {t('common.lightboxNext')}
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </button>
                </div>
              ) : null}
            </>
          ) : null}

          <DialogPrimitive.Close
            aria-label={t('common.lightboxClose')}
            className={cn(
              'absolute top-3.5 right-3.5 rounded-md p-1 text-text-muted outline-none',
              'transition-colors hover:bg-accent hover:text-foreground',
              'focus-visible:ring-2 focus-visible:ring-ring/60',
            )}
          >
            <X className="size-4" aria-hidden="true" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
