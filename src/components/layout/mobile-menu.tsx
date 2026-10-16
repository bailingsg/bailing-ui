'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { primaryCta } from '@/config/site';
import type { PublicNavItem } from '@/lib/site';

/**
 * MobileMenu —— 移动端导航面板（< 768px）
 *
 * 动画保持克制：仅使用 max-height + opacity 的简单过渡，不引入动画库。
 * 可访问性：aria-expanded / aria-controls 由 Navbar 提供，Esc 关闭，
 * 点击导航项后自动收起。
 */
export interface MobileMenuProps {
  id: string;
  open: boolean;
  onClose: () => void;
  /** 当前激活路径，用于高亮 */
  activePath?: string;
  /** 导航项（CMS 驱动，由 Navbar 从服务端透传） */
  items: PublicNavItem[];
}

export function MobileMenu({ id, open, onClose, activePath = '/', items }: MobileMenuProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);

  // Esc 关闭
  React.useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <div
      id={id}
      ref={panelRef}
      hidden={!open}
      className={cn(
        'border-t border-border bg-background md:hidden',
        'overflow-hidden transition-[max-height,opacity] duration-[var(--duration-base)] ease-[var(--ease-standard)]',
        open ? 'max-h-[32rem] opacity-100' : 'max-h-0 opacity-0',
      )}
    >
      <nav aria-label="移动端导航" className="px-4 pt-2 pb-6 sm:px-6">
        <ul className="flex flex-col">
          {items.map((item) => {
            const active = item.url === activePath;
            return (
              <li key={item.id}>
                <Link
                  href={item.url}
                  onClick={onClose}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center justify-between rounded-md px-3 py-3 text-body',
                    'transition-colors duration-[var(--duration-fast)]',
                    active
                      ? 'bg-accent font-medium text-accent-foreground'
                      : 'text-text-secondary hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <Button asChild fullWidth size="lg" className="mt-4">
          <Link href={primaryCta.href} onClick={onClose}>
            {primaryCta.label}
          </Link>
        </Button>
      </nav>
    </div>
  );
}
