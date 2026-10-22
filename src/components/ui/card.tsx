import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Card —— 通用卡片容器
 *
 * 组合式 API：Card / CardMedia / CardHeader / CardTitle / CardDescription /
 * CardContent / CardFooter，覆盖产品卡片、工厂展示、博客、案例等场景。
 * 支持 image、title、description、footer action 四段式结构。
 */
function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'flex flex-col overflow-hidden rounded-lg border border-border bg-surface-elevated text-card-foreground shadow-xs',
        'transition-[box-shadow,border-color,transform] duration-[var(--duration-base)] ease-[var(--ease-standard)]',
        className,
      )}
      {...props}
    />
  );
}

/** 卡片媒体区：统一图片比例容器，避免布局跳动 */
function CardMedia({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-media"
      className={cn('relative aspect-[4/3] w-full overflow-hidden bg-surface', className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn('flex flex-col gap-2 p-5 sm:p-6', className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3
      data-slot="card-title"
      // 自定义字号 token 与颜色 token 不经 cn()：tailwind-merge 不识别
      // @theme 注册的 text-heading-*，会误判为 text-* 颜色类而互相吞掉
      className={['text-heading-sm font-semibold text-foreground', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="card-description"
      // 同上：text-small 与 text-text-secondary 必须原样并列
      className={['text-small text-text-secondary', className].filter(Boolean).join(' ')}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-5 pb-5 sm:px-6 sm:pb-6', className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('mt-auto flex items-center gap-3 px-5 pb-5 sm:px-6 sm:pb-6', className)}
      {...props}
    />
  );
}

export { Card, CardMedia, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
