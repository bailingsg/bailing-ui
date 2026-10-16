'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

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
  /** 响应式尺寸提示，默认按全宽卡片估算 */
  sizes?: string;
  className?: string;
  /** 占位文案（无图时显示） */
  placeholderLabel?: string;
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
  sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
  className,
  placeholderLabel = '图片待补充',
}: OptimizedImageProps) {
  const [failed, setFailed] = React.useState(false);

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
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          onError={() => setFailed(true)}
          className="object-cover"
        />
      ) : (
        <ImagePlaceholder label={failed ? '图片加载失败' : placeholderLabel} />
      )}
    </div>
  );
}
