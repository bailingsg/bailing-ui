import { cn } from '@/lib/utils';
import { OptimizedImage } from '@/components/common/optimized-image';
import { getI18n } from '@/i18n';
import { defaultLocale, type Locale } from '@/i18n/config';

/**
 * GalleryGrid —— 可复用图片画廊
 *
 * 用于工厂页 / 质量页的企业实景素材，以及关于我们页的公司与团队素材展示。
 *
 * 响应式（Mobile First）：
 *   手机 1 列 → 平板 2 列 → 桌面 `columns` 列（默认 3）
 *
 * 无素材时：渲染统一占位瓦片（`OptimizedImage` 的占位），并展示
 * `emptyNotice` 文案 —— 不伪造任何图片，也不使用图库素材。
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
  aspectRatio?: '4/3' | '3/2' | '16/9' | '1/1' | '3/4';
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
  placeholderCount = 6,
  placeholderLabel,
  emptyNotice,
  showCaption = true,
  sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
  className,
  locale = defaultLocale,
}: GalleryGridProps) {
  const { t } = getI18n(locale);
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
          : images.map((image) => (
              <figure
                key={image.id}
                className="flex flex-col gap-2 overflow-hidden rounded-lg border border-border bg-surface-elevated"
              >
                <OptimizedImage
                  src={image.url}
                  alt={image.alt}
                  locale={locale}
                  aspectRatio={aspectRatio}
                  sizes={sizes}
                />
                {showCaption && image.caption ? (
                  <figcaption className="px-4 pb-4 text-caption text-text-muted">
                    {image.caption}
                  </figcaption>
                ) : null}
              </figure>
            ))}
      </div>
    </div>
  );
}
