import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

/**
 * Button —— 设计系统按钮
 *
 * 变体：primary（品牌主按钮）/ secondary / outline / ghost / danger
 * 状态：default / hover / active / disabled / loading
 * 场景：Request Quote、Contact Us、View Products
 *
 * 说明：颜色一律引用语义令牌（bg-primary / text-primary-foreground ...），
 * 不硬编码色值；danger 与既有 destructive 别名等价，保证旧代码兼容。
 */
const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap',
    'rounded-md font-medium transition-[color,background-color,border-color,box-shadow]',
    'duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
    'outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
    'aria-busy:pointer-events-none',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(' '),
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover active:bg-primary-active',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-hover',
        outline:
          'border border-border-strong bg-background text-foreground hover:border-primary hover:bg-accent hover:text-accent-foreground active:bg-secondary',
        ghost:
          'bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground active:bg-secondary',
        danger:
          'bg-destructive text-destructive-foreground shadow-xs hover:bg-danger-600/90 active:bg-danger-600',
        /** @deprecated 使用 danger（保留别名以兼容既有代码） */
        destructive:
          'bg-destructive text-destructive-foreground shadow-xs hover:bg-danger-600/90 active:bg-danger-600',
        /** 品牌强调：森林绿，用于环保 / 可持续相关场景 */
        forest:
          'bg-forest text-forest-foreground shadow-xs hover:bg-forest-hover active:bg-forest-hover',
        link: 'text-primary underline-offset-4 hover:underline',
        /** @deprecated 使用 primary（保留别名以兼容既有代码） */
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover active:bg-primary-active',
      },
      size: {
        sm: 'h-8 gap-1.5 rounded-md px-3 text-small',
        default: 'h-10 px-4 text-small',
        lg: 'h-11 rounded-md px-6 text-body',
        xl: 'h-12 rounded-md px-7 text-body-lg',
        icon: 'size-10',
        'icon-sm': 'size-8',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
      fullWidth: false,
    },
  },
);

export interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** 加载态：显示 Spinner、禁止交互并标注 aria-busy */
  loading?: boolean;
}

function Button({
  className,
  variant = 'primary',
  size = 'default',
  fullWidth = false,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button';

  // asChild 时不注入 Spinner，避免破坏"单一子元素"约束
  const content = asChild ? (
    children
  ) : (
    <>
      {loading ? <Spinner /> : null}
      {children}
    </>
  );

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      aria-busy={loading || undefined}
      disabled={asChild ? undefined : disabled || loading}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      {...props}
    >
      {content}
    </Comp>
  );
}

export { Button, buttonVariants };
