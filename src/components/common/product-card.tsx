import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardMedia,
  CardTitle,
} from '@/components/ui/card';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/common/optimized-image';
import { LocaleLink } from '@/i18n/link';
import { getI18n } from '@/i18n';
import { defaultLocale, type Locale } from '@/i18n/config';

/**
 * ProductCard —— 产品卡片
 *
 * 结构：Product Image · Product Name · Short Description · CTA Button
 * 说明：产品页面与数据在后续阶段开发，本组件只定义展示契约，
 * 不内置任何示例产品数据（由调用方通过 props 传入）。
 */
export interface ProductCardBadge {
  label: string;
  variant?: BadgeProps['variant'];
}

export interface ProductCardProps {
  /** 产品名称 */
  name: string;
  /** 简短描述 */
  description: string;
  /** 产品图片地址（暂缺时展示占位） */
  imageSrc?: string | null;
  /** 图片替代文本，缺省回退为产品名 */
  imageAlt?: string;
  /** 分类 / 材质等标签 */
  badges?: ProductCardBadge[];
  /** 详情链接（Phase 3.3 接入 /products/[slug]） */
  href?: string;
  /** CTA 文案（默认按语言取「查看详情」） */
  ctaLabel?: string;
  className?: string;
  /** 当前语言（决定链接前缀与默认文案） */
  locale?: Locale;
}

export function ProductCard({
  name,
  description,
  imageSrc,
  imageAlt,
  badges = [],
  href = '/products',
  ctaLabel,
  className,
  locale = defaultLocale,
}: ProductCardProps) {
  const { t } = getI18n(locale);
  return (
    <Card className={cn('group h-full hover:border-border-strong hover:shadow-md', className)}>
      <CardMedia>
        <OptimizedImage
          src={imageSrc}
          alt={imageAlt ?? name}
          locale={locale}
          aspectRatio="4/3"
          className="transition-transform duration-[var(--duration-slow)] ease-[var(--ease-standard)] group-hover:scale-[1.02]"
        />
      </CardMedia>

      <CardHeader className="pb-3">
        <CardTitle>{name}</CardTitle>
        {badges.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {badges.map((badge) => (
              <Badge key={badge.label} variant={badge.variant ?? 'material'}>
                {badge.label}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardHeader>

      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>

      <CardFooter>
        <Button asChild variant="outline" size="sm">
          <LocaleLink locale={locale} href={href}>
            {ctaLabel ?? t('common.viewDetails')}
          </LocaleLink>
        </Button>
      </CardFooter>
    </Card>
  );
}
