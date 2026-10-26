'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getI18n } from '@/i18n';
import { defaultLocale, type Locale } from '@/i18n/config';

/**
 * OptimizedImage —— 统一图片组件
 *
 * 能力：
 *  - 基于 next/image（自动优化、懒加载、响应式 sizes）
 *  - 固定宽高比容器（aspect-ratio），避免 CLS 布局跳动
 *  - fallback：未提供图片或加载失败时展示统一的占位样式（不伪造图片素材）
 *
 * 说明：产品图片最终会来自对象存储 / CDN，届时在 next.config.ts 的
 * images.remotePatterns 中登记允许的域名即可，无需改动组件。
 */
const aspectRatioClasses = {
  '1/1': 'aspect-square',
  '4/3': 'aspect-[4/3]',
  '3/2': 'aspect-[3/2]',
  '16/9': 'aspect-video',
  '3/4': 'aspect-[3/4]',
} as const;

export type AspectRatio = keyof typeof aspectRatioClasses;

export interface OptimizedImageProps {
  /** 图片地址；为空时渲染占位（Phase 3.2 尚无正式图片素材） */
  src?: string | null;
  /** 替代文本（可访问性与 SEO 必需） */
  alt: string;
  aspectRatio?: AspectRatio;
  /** 首屏图片设为 true 以取消懒加载并提升 LCP */
  priority?: boolean;
  /**
   * 图片填充方式（2026-10-26 新增）。
   *  · cover（默认）—— 铺满容器、允许裁切，适合实景照片；
   *  · contain —— 完整显示不裁切，适合证书 / 检测报告这类竖版文件。
   */
  objectFit?: 'cover' | 'contain';
  /** 响应式尺寸提示，默认按全宽卡片估算 */
  sizes?: string;
  className?: string;
  /** 占位文案（无图时显示） */
  placeholderLabel?: string;
  /** 当前语言（决定默认占位 / 失败文案） */
  locale?: Locale;
}

function ImagePlaceholder({ label }: { label: string }) {
  return (
    <div
      aria-hidden="true"
      className="flex size-full flex-col items-center justify-center gap-2 bg-surface text-text-muted"
    >
      {/* 木纹环占位图形（内联 SVG，无外部素材） */}
      <svg viewBox="0 0 48 48" fill="none" className="size-10 opacity-60">
        <circle cx="24" cy="24" r="22" className="stroke-border-strong" strokeWidth="1.5" />
        <path
          d="M24 12c6.6 0 12 5.4 12 12s-5.4 12-12 12-12-5.4-12-12"
          className="stroke-border-strong"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="24" cy="24" r="4" className="fill-border-strong" />
      </svg>
      <span className="text-caption">{label}</span>
    </div>
  );
}

export function OptimizedImage({
  src,
  alt,
  aspectRatio = '4/3',
  priority = false,
  objectFit = 'cover',
  sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
  className,
  placeholderLabel,
  locale = defaultLocale,
}: OptimizedImageProps) {
  const [failed, setFailed] = React.useState(false);
  /**
   * 加载完成淡入。
   *
   * 只做透明度过渡、不引入 blurDataURL 占位图——项目约定「不伪造图片素材」，
   * 用占位图打底等于给每张图配一张假预览。底下的 bg-surface 已经是中性底色，
   * 缺的只是「灰块 → 真图」那一下硬切，补 300ms 淡入即可。
   */
  const [loaded, setLoaded] = React.useState(false);
  const imageRef = React.useRef<HTMLImageElement | null>(null);
  const { t } = getI18n(locale);
  const label = placeholderLabel ?? t('common.photoPending');

  // 命中浏览器缓存时 onLoad 可能在 hydration 之前就触发完毕，之后不再回调；
  // 挂载后补一次 complete 检查，避免这类图片永远停在 opacity-0。
  React.useEffect(() => {
    if (imageRef.current?.complete) setLoaded(true);
  }, [src]);

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden bg-surface',
        aspectRatioClasses[aspectRatio],
        className,
      )}
    >
      {src && !failed ? (
        <Image
          ref={imageRef}
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            objectFit === 'contain' ? 'object-contain' : 'object-cover',
            'transition-opacity duration-300 ease-out',
            loaded ? 'opacity-100' : 'opacity-0',
          )}
        />
      ) : (
        <ImagePlaceholder label={failed ? t('common.imageLoadFailed') : label} />
      )}
    </div>
  );
}
