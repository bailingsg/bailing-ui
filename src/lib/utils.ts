import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并 Tailwind 类名，后写的类优先（shadcn/ui 标准工具函数）。
 *
 * ⚠️ 已知限制（勿依赖 cn 合并「设计系统自定义字号 token」）：
 * tailwind-merge 不知道我们 `@theme` 注册的 text-display / text-heading-* /
 * text-body / text-body-lg / text-small / text-caption，会把它们当成
 * `text-*` 颜色类，与 text-foreground / text-text-secondary 等互斥合并
 * —— 后写的输、先写的 token 被丢掉。
 *
 * 因此：**自定义字号 token 不要和颜色 token 一起传给 cn()**。
 * 组件内需要两者并存时用数组 join（参考 ui/card.tsx 的写法）：
 *   ['text-small text-text-secondary', className].filter(Boolean).join(' ')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
