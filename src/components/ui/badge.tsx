import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { cn } from '@/lib/utils';

/**
 * Badge —— 标签 / 徽章
 *
 * 用途：New（新品）、Certificate（资质）、Material（材质）、Application（应用场景）
 * 变体沿用语义令牌，不硬编码颜色。
 */
const badgeVariants = cva(
  [
    'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden',
    'rounded-full border border-transparent px-2.5 py-0.5 text-caption font-medium whitespace-nowrap',
    'transition-[color,background-color,border-color] duration-[var(--duration-fast)]',
    'focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    '[&>svg]:pointer-events-none [&>svg]:size-3',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground [a&]:hover:bg-primary-hover',
        secondary: 'bg-secondary text-secondary-foreground [a&]:hover:bg-secondary-hover',
        outline:
          'border-border-strong text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        destructive: 'bg-destructive text-destructive-foreground [a&]:hover:opacity-90',
        ghost: '[a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 [a&]:hover:underline',
        /* ---- 业务语义变体 ---- */
        /** New：新品 / 上新 */
        new: 'bg-primary text-primary-foreground',
        /** Certificate：资质证书 */
        certificate: 'bg-forest text-forest-foreground',
        /** Material：材质说明 */
        material: 'bg-beige-200 text-brand-900',
        /** Application：应用场景 */
        application: 'bg-neutral-100 text-neutral-700',
        /** 环保 / 可持续 */
        eco: 'border-forest-200 bg-surface-forest text-forest-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.ComponentProps<'span'>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

function Badge({ className, variant = 'default', asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot.Root : 'span';

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
