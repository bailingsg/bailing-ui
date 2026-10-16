import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Container } from '@/components/layout/container';

/**
 * Section —— 页面区块
 *
 * 统一区块垂直留白（手机 64px → 桌面 120px），并提供背景变体，
 * 页面只需 <Section><SectionHeader/>…</Section> 即可获得一致的节奏。
 */
const sectionVariants = cva('w-full', {
  variants: {
    tone: {
      default: 'bg-background text-foreground',
      surface: 'bg-surface text-foreground',
      brand: 'bg-surface-brand text-foreground',
      forest: 'bg-surface-forest text-foreground',
      inverse: 'bg-surface-inverse text-surface-inverse-foreground',
    },
    size: {
      default: 'py-section',
      sm: 'py-section-sm',
      none: 'py-0',
    },
  },
  defaultVariants: {
    tone: 'default',
    size: 'default',
  },
});

export interface SectionProps
  extends React.ComponentProps<'section'>,
    VariantProps<typeof sectionVariants> {
  /** 是否由 Section 内部包裹 Container（默认 true） */
  contained?: boolean;
  /** Container 宽度（contained 为 true 时生效） */
  containerWidth?: 'narrow' | 'page' | 'wide' | 'full';
}

function Section({
  className,
  tone = 'default',
  size = 'default',
  contained = true,
  containerWidth = 'page',
  children,
  ...props
}: SectionProps) {
  return (
    <section
      data-slot="section"
      className={cn(sectionVariants({ tone, size }), className)}
      {...props}
    >
      {contained ? <Container width={containerWidth}>{children}</Container> : children}
    </section>
  );
}

/**
 * SectionHeader —— 区块标题
 * 结构：eyebrow（小标签）→ 标题 → 描述 → 可选操作区
 */
export interface SectionHeaderProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  /** 标题上方的小标签（如 "Our Products"） */
  eyebrow?: React.ReactNode;
  /** 主标题 */
  title: React.ReactNode;
  /** 描述文本 */
  description?: React.ReactNode;
  /** 对齐方式 */
  align?: 'left' | 'center';
  /** 标题语义层级（h2 默认） */
  as?: 'h1' | 'h2' | 'h3';
  /** 右侧操作区（如 "View All" 按钮），align=center 时居中显示 */
  action?: React.ReactNode;
}

function SectionHeader({
  className,
  eyebrow,
  title,
  description,
  align = 'left',
  as: Heading = 'h2',
  action,
  ...props
}: SectionHeaderProps) {
  const centered = align === 'center';

  return (
    <div
      data-slot="section-header"
      className={cn(
        'flex flex-col gap-3',
        centered ? 'items-center text-center' : 'items-start text-left',
        action && !centered && 'sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
      {...props}
    >
      <div className={cn('flex flex-col gap-3', centered && 'items-center', !centered && 'max-w-2xl')}>
        {eyebrow ? (
          <span className="text-caption font-semibold tracking-wider text-primary uppercase">
            {eyebrow}
          </span>
        ) : null}
        <Heading className="text-balance">{title}</Heading>
        {description ? (
          <p className="text-body-lg text-text-secondary text-pretty">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-3">{action}</div> : null}
    </div>
  );
}

export { Section, SectionHeader, sectionVariants };
