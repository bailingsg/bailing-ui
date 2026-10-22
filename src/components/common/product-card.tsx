import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardMedia,
  CardTitle,
} from '@/components/ui/card';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { OptimizedImage } from '@/components/common/optimized-image';
import { LocaleLink } from '@/i18n/link';
import { getI18n } from '@/i18n';
import { defaultLocale, type Locale } from '@/i18n/config';

/**
 * ProductCard —— 产品卡片
 *
 * 结构：Product Image · Product Name · Short Description
 *
 * 交互：**整张卡片可点击**（不再有独立的「查看详情」按钮）。
 * 实现方式是铺一层 `absolute inset-0` 的链接，而不是把整卡包进 `<a>`：
 * 卡片内部没有别的链接，铺层既保证任意位置可点，也不会产生嵌套 `<a>`；
 * 链接文字用 aria-label 承载（产品名 + 动作），读屏仍可识别。
 *
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
  /** 详情链接（/products/[slugId]，由 slug-id 拼接） */
  href?: string;
  /** 动作文案（默认按语言取「查看详情」；仅用于读屏与悬浮提示） */
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
  const actionLabel = ctaLabel ?? t('common.viewDetails');

  return (
    <Card className={cn('group relative h-full hover:border-border-strong hover:shadow-md', className)}>
      {/* 整卡热区：铺满卡片，任意位置点击都进详情 */}
      <LocaleLink
        locale={locale}
        href={href}
        aria-label={`${name} — ${actionLabel}`}
        title={actionLabel}
        className="absolute inset-0 z-10 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      />

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
        <CardTitle className="transition-colors group-hover:text-primary">{name}</CardTitle>
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
    </Card>
  );
}
