import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Container } from '@/components/layout/container';

/**
 * PageHero —— 页面级标题区
 *
 * 全站二级页面统一使用，保证「面包屑式 eyebrow → H1 → 副标题 → 描述 → 操作区」
 * 的结构与留白一致。H1 由本组件输出，页面内其余标题从 H2 起，避免多 H1。
 *
 * 副标题（subtitle）必须**按当前语言取文案**（`m.<page>.subtitle`），
 * 不得再输出另一种语言的固定字符串——否则英文站会出现中文小字。
 */
export interface PageHeroProps {
  /** 标题上方的小标签（如 "Products"） */
  eyebrow?: string;
  /** 页面 H1（英文，面向海外采购商） */
  title: ReactNode;
  /** 副标题（跟随当前语言，与 H1 互补而非重复） */
  subtitle?: string;
  /** 页面描述 */
  description?: ReactNode;
  /** 操作区（如 CTA 按钮） */
  actions?: ReactNode;
  /** 右侧附加内容（如关键指标占位），桌面端右对齐 */
  aside?: ReactNode;
  containerWidth?: 'narrow' | 'page' | 'wide';
  className?: string;
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  description,
  actions,
  aside,
  containerWidth = 'page',
  className,
}: PageHeroProps) {
  return (
    <section className={cn('border-b border-border bg-surface', className)}>
      <Container width={containerWidth} className="py-12 sm:py-16 lg:py-20">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-3xl flex-col gap-4">
            {eyebrow ? (
              <span className="text-caption font-semibold tracking-wider text-primary uppercase">
                {eyebrow}
              </span>
            ) : null}
            <div className="flex flex-col gap-2">
              <h1 className="text-balance">{title}</h1>
              {subtitle ? (
                <p className="text-heading-sm font-normal text-text-muted">{subtitle}</p>
              ) : null}
            </div>
            {description ? (
              <p className="max-w-2xl text-body-lg text-text-secondary text-pretty">
                {description}
              </p>
            ) : null}
            {actions ? <div className="mt-1 flex flex-wrap items-center gap-3">{actions}</div> : null}
          </div>
          {aside ? <div className="shrink-0">{aside}</div> : null}
        </div>
      </Container>
    </section>
  );
}
