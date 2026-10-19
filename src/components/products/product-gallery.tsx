'use client';

import * as React from 'react';
import { OptimizedImage } from '@/components/common/optimized-image';
import { cn } from '@/lib/utils';
import { getI18n } from '@/i18n';
import { defaultLocale, type Locale } from '@/i18n/config';
import type { ProductImage } from '@/lib/products';

/**
 * ProductGallery —— 产品图集
 *
 * · 无图片素材时（当前 Demo 数据）统一展示 OptimizedImage 的占位，不伪造图片
 * · 多图时提供缩略图切换（客户端状态，无第三方图库依赖）
 * · 图片一律经 next/image 优化，不使用裸 <img>
 */
export interface ProductGalleryProps {
  images: ProductImage[];
  /** 产品名，用作图片替代文本回退 */
  alt: string;
  className?: string;
  /** 当前语言 */
  locale?: Locale;
}

export function ProductGallery({
  images,
  alt,
  className,
  locale = defaultLocale,
}: ProductGalleryProps) {
  const { t } = getI18n(locale);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const active = images[activeIndex];

  if (images.length === 0) {
    return (
      <OptimizedImage
        src={null}
        alt={alt}
        aspectRatio="4/3"
        priority
        sizes="(min-width: 1024px) 50vw, 100vw"
        locale={locale}
        placeholderLabel={t('common.productImagePending')}
        className={className}
      />
    );
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <OptimizedImage
        src={active.url}
        alt={active.altText ?? alt}
        aspectRatio="4/3"
        priority
        sizes="(min-width: 1024px) 50vw, 100vw"
      />

      {images.length > 1 ? (
        <ul className="grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-pressed={index === activeIndex}
                aria-label={t('common.showImage', { index: index + 1, total: images.length })}
                className={cn(
                  'block w-full overflow-hidden rounded-md border outline-none',
                  'transition-colors duration-[var(--duration-fast)]',
                  'focus-visible:ring-2 focus-visible:ring-ring/60',
                  index === activeIndex
                    ? 'border-primary'
                    : 'border-border hover:border-border-strong',
                )}
              >
                <OptimizedImage
                  locale={locale}
                  src={image.url}
                  alt={image.altText ?? t('common.imageAltSuffix', { alt, n: index + 1 })}
                  aspectRatio="1/1"
                  sizes="120px"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
