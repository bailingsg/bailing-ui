'use client';

/**
 * 客户端 i18n 钩子
 *
 * 语言一律从路由参数读取（与服务端渲染同源），
 * 不读 localStorage / navigator.language —— 保证首屏与客户端状态一致。
 */

import { useParams, usePathname } from 'next/navigation';
import { resolveLocale, type Locale } from './config';
import { stripLocaleFromPath } from './paths';

/** 当前页面语言（来自 `[locale]` 路由参数） */
export function useLocale(): Locale {
  const params = useParams<{ locale?: string | string[] }>();
  const raw = params?.locale;
  return resolveLocale(Array.isArray(raw) ? raw[0] : raw);
}

/**
 * 当前页面的「语言无关路径」。
 *
 * middleware 会把无前缀地址内部重写到 `/en/...`，`usePathname()` 可能返回
 * 带前缀的结果；这里统一剥掉，供高亮 / 语言切换使用。
 */
export function useLocalePathname(): string {
  const pathname = usePathname();
  return stripLocaleFromPath(pathname || '/');
}
