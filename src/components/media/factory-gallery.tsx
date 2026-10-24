'use client';

import * as React from 'react';
import { Expand, Play } from 'lucide-react';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { OptimizedImage, type AspectRatio } from '@/components/common/optimized-image';
import { MediaLightbox, type LightboxMedia } from './media-lightbox';
import { isVideoUrl } from '@/lib/media-url';
import { cn } from '@/lib/utils';
import { getI18n } from '@/i18n';
import { defaultLocale, type Locale } from '@/i18n/config';

/**
 * FactoryGallery —— 工厂页模块图集（预览 + 查看更多 + 点击放大）
 *
 * 行为：
 *  · 预览网格只展示前 `previewCount` 张（工厂页现行上限 6）；
 *  · 超出部分不丢弃——「查看更多照片」按钮打开弹窗展示该模块**全部**照片；
 *  · 预览网格 / 弹窗中的图片与视频点击均可放大（MediaLightbox），
 *    放大大后可在该模块的全集里前后切换；
 *  · 无素材时渲染统一占位瓦片并展示 emptyNotice（不伪造图片）。
 *
 * 视频：后台媒体库当前仅开放图片上传，但分区 gallery / 展会照片可能登记
 * 视频地址（.mp4 / .webm / .mov 等），按扩展名判别并用原生播放器展示。
 */

/** 与灯箱共用的最小素材契约（id / url / alt / caption） */
export type FactoryGalleryImage = LightboxMedia;

export interface FactoryGalleryProps {
  images: FactoryGalleryImage[];
  /** 预览网格展示数量（默认 6） */
  previewCount?: number;
  /** 「查看更多照片」弹窗标题（模块名，如「工厂与车间」） */
  dialogTitle: string;
  /** 桌面列数（手机 1 列、平板 2 列固定） */
  columns?: 3 | 4;
  aspectRatio?: AspectRatio;
  /** 无素材时渲染的占位瓦片数量 */
  placeholderCount?: number;
  /** 占位瓦片文案 */
  placeholderLabel?: string;
  /** 无素材时展示的说明文案 */
  emptyNotice?: string;
  /** 响应式 sizes 提示 */
  sizes?: string;
  className?: string;
  /** 当前语言 */
  locale?: Locale;
}

const desktopColumns: Record<3 | 4, string> = {
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
};

/** 与 OptimizedImage 一致宽高比类名（视频瓦片复用） */
const aspectRatioClasses: Record<AspectRatio, string> = {
  '1/1': 'aspect-square',
  '4/3': 'aspect-[4/3]',
  '3/2': 'aspect-[3/2]',
  '16/9': 'aspect-video',
  '3/4': 'aspect-[3/4]',
};

/** 单块素材瓦片（图片走 next/image，视频走原生播放器；点击均放大） */
function MediaTile({
  image,
  onOpen,
  locale,
  aspectRatio,
  sizes,
}: {
  image: FactoryGalleryImage;
  onOpen: () => void;
  locale: Locale;
  aspectRatio: AspectRatio;
  sizes: string;
}) {
  const { t } = getI18n(locale);
  const video = isVideoUrl(image.url);

  return (
    <figure className="flex flex-col gap-2 overflow-hidden rounded-lg border border-border bg-surface-elevated">
      <button
        type="button"
        onClick={onOpen}
        aria-label={
          video
            ? `${t('common.playVideo')} — ${image.alt}`
            : `${t('common.lightboxZoomIn')} — ${image.alt}`
        }
        className={cn(
          'group relative block w-full cursor-zoom-in outline-none',
          'focus-visible:ring-2 focus-visible:ring-ring/60',
        )}
      >
        {video ? (
          <div className={cn('relative w-full overflow-hidden bg-surface', aspectRatioClasses[aspectRatio])}>
            <video
              src={image.url}
              className="size-full object-cover"
              preload="metadata"
              muted
              playsInline
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-10 items-center justify-center rounded-full bg-background/85 text-foreground shadow">
                <Play className="size-5" aria-hidden="true" />
              </span>
            </span>
          </div>
        ) : (
          <OptimizedImage
            src={image.url}
            alt={image.alt}
            locale={locale}
            aspectRatio={aspectRatio}
            sizes={sizes}
          />
        )}
        {/* 悬停提示：可放大 */}
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 flex items-center justify-center',
            'bg-foreground/0 transition-colors duration-[var(--duration-fast)]',
            'group-hover:bg-foreground/10 group-focus-visible:bg-foreground/10',
          )}
        >
          <Expand
            className="size-5 text-background opacity-0 transition-opacity duration-[var(--duration-fast)] group-hover:opacity-100 group-focus-visible:opacity-100"
          />
        </span>
      </button>
      {image.caption ? (
        <figcaption className="px-4 pb-4 text-caption text-text-muted">{image.caption}</figcaption>
      ) : null}
    </figure>
  );
}

export function FactoryGallery({
  images,
  previewCount = 6,
  dialogTitle,
  columns = 3,
  aspectRatio = '4/3',
  placeholderCount = 6,
  placeholderLabel,
  emptyNotice,
  sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
  className,
  locale = defaultLocale,
}: FactoryGalleryProps) {
  const { t } = getI18n(locale);
  const [allOpen, setAllOpen] = React.useState(false);
  const [zoomIndex, setZoomIndex] = React.useState<number | null>(null);

  const isEmpty = images.length === 0;
  const preview = isEmpty ? [] : images.slice(0, previewCount);
  const hasMore = images.length > previewCount;

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {isEmpty && emptyNotice ? (
        <p className="text-small text-text-muted">{emptyNotice}</p>
      ) : null}

      <div className={cn('grid grid-cols-1 gap-5 sm:grid-cols-2', desktopColumns[columns])}>
        {isEmpty
          ? Array.from({ length: placeholderCount }, (_, index) => (
              <div
                key={`placeholder-${index}`}
                className="overflow-hidden rounded-lg border border-border"
              >
                <OptimizedImage
                  src={null}
                  alt=""
                  aspectRatio={aspectRatio}
                  sizes={sizes}
                  placeholderLabel={placeholderLabel ?? t('common.photoPending')}
                />
              </div>
            ))
          : preview.map((image, index) => (
              <MediaTile
                key={image.id}
                image={image}
                onOpen={() => setZoomIndex(index)}
                locale={locale}
                aspectRatio={aspectRatio}
                sizes={sizes}
              />
            ))}
      </div>

      {hasMore ? (
        <div>
          <Button type="button" variant="outline" onClick={() => setAllOpen(true)}>
            {t('factory.viewMorePhotos', { count: images.length })}
          </Button>
        </div>
      ) : null}

      {/* 查看更多照片：该模块全部素材 */}
      <Dialog open={allOpen} onOpenChange={setAllOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <p className="text-small text-text-muted">
              {t('factory.viewMorePhotos', { count: images.length })}
            </p>
          </DialogHeader>
          <DialogBody>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image, index) => (
                <MediaTile
                  key={image.id}
                  image={image}
                  onOpen={() => setZoomIndex(index)}
                  locale={locale}
                  aspectRatio={aspectRatio}
                  sizes={sizes}
                />
              ))}
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* 点击放大（灯箱）：在该模块全集内前后切换 */}
      <MediaLightbox images={images} index={zoomIndex} onIndexChange={setZoomIndex} locale={locale} />
    </div>
  );
}
