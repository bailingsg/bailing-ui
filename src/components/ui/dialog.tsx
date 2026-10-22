'use client';

import * as React from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Dialog —— 模态对话框（Radix Dialog 封装）
 *
 * 能力：焦点圈定 / Esc 关闭 / 点遮罩关闭 / 打开时锁页面滚动，全部由 Radix 处理；
 * 样式只引用语义令牌（bg-background / border-border ...），不硬编码色值。
 *
 * 场景：Sales Contacts 的「发送给某销售」站内信箱弹窗。
 */

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-foreground/40 backdrop-blur-[2px]',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = 'DialogOverlay';

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    /** 是否显示右上角关闭按钮（默认显示） */
    showClose?: boolean;
  }
>(({ className, children, showClose = true, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)]',
        'max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col gap-0 overflow-hidden',
        'rounded-lg border border-border bg-background shadow-lg',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
        'data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
        className,
      )}
      {...props}
    >
      {children}
      {showClose ? (
        <DialogPrimitive.Close
          className={cn(
            'absolute top-3.5 right-3.5 rounded-md p-1 text-text-muted outline-none',
            'transition-colors hover:bg-accent hover:text-foreground',
            'focus-visible:ring-2 focus-visible:ring-ring/60',
          )}
          aria-label="Close"
        >
          <X className="size-4" aria-hidden="true" />
        </DialogPrimitive.Close>
      ) : null}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = 'DialogContent';

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col gap-2 border-b border-border px-6 py-5 pr-12', className)}
      {...props}
    />
  );
}

/** 弹窗内容滚动区：标题区固定，表单区独立滚动（长表单也不会顶出屏幕） */
function DialogBody({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('overflow-y-auto px-6 py-5', className)} {...props} />;
}

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-heading-sm font-semibold text-foreground', className)}
    {...props}
  />
));
DialogTitle.displayName = 'DialogTitle';

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-small text-text-secondary', className)}
    {...props}
  />
));
DialogDescription.displayName = 'DialogDescription';

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogDescription,
};
