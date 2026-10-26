'use client';

import * as React from 'react';
import { Expand } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OptimizedImage, type AspectRatio } from '@/components/common/optimized-image';
import { MediaLightbox } from './media-lightbox';
import { getI18n } from '@/i18n';
import { defaultLocale, type Locale } from '@/i18n/config';

/**
 * GalleryGrid —— 可复用图片画廊（支持点击放大）
 *
 * 用于工厂页 / 质量页的企业实景素材，以及关于我们页的公司与团队素材展示。
 *
 * 响应式（Mobile First）：
 *   手机 1 列 → 平板 2 列 → 桌面 `columns` 列（默认 3）
 *
 * 无素材时：渲染统一占位瓦片（`OptimizedImage` 的占位），并展示
 * `emptyNotice` 文案 —— 不伪造任何图片，也不使用图库素材。
 *
 * 点击放大（2026-10-26 补）：图片瓦片为按钮，点击经 `MediaLightbox`
 * 以 object-contain 完整展示，可在本图集内左右切换、键盘 ←/→ 导航、Esc 关闭。
 * 此前本组件没有任何放大能力，质量页「认证与合规」等区域无法查看大图。
 *
 * 与 `FactoryGallery` 的分工：
 *   · GalleryGrid —— 单一图集，全量平铺，无「查看更多」弹窗；
 *   · FactoryGallery —— 预览截断 + 查看更多弹窗 + 灯箱（工厂页用）。
 */

/**
 * 画廊只依赖图片的**最小结构契约**，因此 `FactoryImage`、`AboutImage`
 * 等任何带 id / url / alt 的素材类型都可以直接传入，无需类型转换。
 */
export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
}

export interface GalleryGridProps {
  images: GalleryImage[];
  /** 桌面列数（手机 1 列、平板 2 列固定） */
  columns?: 3 | 4;
  aspectRatio?: AspectRatio;
  /** 图片填充方式：cover（默认，可裁切）/ contain（完整显示，适合证书竖版文件） */
  objectFit?: 'cover' | 'contain';
  /** 无素材时渲染的占位瓦片数量 */
  placeholderCount?: number;
  /** 占位瓦片文案 */
  placeholderLabel?: string;
  /** 无素材时展示的说明文案（如 "Equipment details will be updated."） */
  emptyNotice?: string;
  /** 是否展示图注（image.caption） */
  showCaption?: boolean;
  /** 响应式 sizes 提示 */
  sizes?: string;
  className?: string;
  /** 当前语言（决定默认占位文案） */
  locale?: Locale;
}

const desktopColumns: Record<3 | 4, string> = {
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
};

export function GalleryGrid({
  images,
  columns = 3,
  aspectRatio = '4/3',
  objectFit = 'cover',
  placeholderCount = 6,
  placeholderLabel,
  emptyNotice,
  showCaption = true,
  sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
  className,
  locale = defaultLocale,
}: GalleryGridProps) {
  const { t } = getI18n(locale);
  const [zoomIndex, setZoomIndex] = React.useState<number | null>(null);
  const isEmpty = images.length === 0;

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {isEmpty && emptyNotice ? (
        <p className="text-small text-text-muted">{emptyNotice}</p>
      ) : null}

      <div className={cn('grid grid-cols-1 gap-5 sm:grid-cols-2', desktopColumns[columns])}>
        {isEmpty
          ? Array.from({ length: placeholderCount }, (_, index) => (
              <div key={`placeholder-${index}`} className="overflow-hidden rounded-lg border border-border">
                <OptimizedImage
                  src={null}
                  alt=""
                  aspectRatio={aspectRatio}
                  sizes={sizes}
                  placeholderLabel={placeholderLabel ?? t('common.photoPending')}
                />
              </div>
            ))
          : images.map((image, index) => (
              <figure
                key={image.id}
                className="flex flex-col gap-2 overflow-hidden rounded-lg border border-border bg-surface-elevated"
              >
                <button
                  type="button"
                  onClick={() => setZoomIndex(index)}
                  aria-label={`${t('common.lightboxZoomIn')} — ${image.alt}`}
                  className={cn(
                    'group relative block w-full cursor-zoom-in outline-none',
                    'focus-visible:ring-2 focus-visible:ring-ring/60',
                  )}
                >
                  <OptimizedImage
                    src={image.url}
                    alt={image.alt}
                    locale={locale}
                    aspectRatio={aspectRatio}
                    objectFit={objectFit}
                    sizes={sizes}
                  />
                  {/* 悬停提示：可放大 */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'pointer-events-none absolute inset-0 flex items-center justify-center',
                      'bg-foreground/0 transition-colors duration-[var(--duration-fast)]',
                      'group-hover:bg-foreground/10 group-focus-visible:bg-foreground/10',
                    )}
                  >
                    <Expand className="size-5 text-background opacity-0 transition-opacity duration-[var(--duration-fast)] group-hover:opacity-100 group-focus-visible:opacity-100" />
                  </span>
                </button>
                {showCaption && image.caption ? (
                  <figcaption className="px-4 pb-4 text-caption text-text-muted">
                    {image.caption}
                  </figcaption>
                ) : null}
              </figure>
            ))}
      </div>

      {/* 点击放大（灯箱）：在本图集内前后切换 */}
      <MediaLightbox
        images={images}
        index={zoomIndex}
        onIndexChange={setZoomIndex}
        locale={locale}
      />
    </div>
  );
}
