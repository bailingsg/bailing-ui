/**
 * 语言路由工具（纯函数，服务端 / 客户端通用）
 *
 * 约定：
 *   · 英文（默认语言）—— 无前缀：`/products`
 *   · 中文 —— `/zh-CN` 前缀：`/zh-CN/products`
 *
 * 所有站内链接、canonical、hreflang、sitemap 都必须经本模块生成，
 * 禁止在页面里手工拼接语言前缀（否则必然出现「URL 是英文、内容却是中文」）。
 */

import { defaultLocale, isLocale, type Locale } from './config';

/** 是否为可加语言前缀的站内路径（外链 / mailto / tel / 纯锚点一律不加） */
export function isLocalizablePath(path: string): boolean {
  if (!path) return false;
  if (!path.startsWith('/')) return false;
  // 协议相对地址（//cdn.example.com/x）不是站内路径
  if (path.startsWith('//')) return false;
  return true;
}

/** 拆分 `path?query#hash`（只按第一个 ? 与第一个 # 切分） */
function splitPath(path: string): { pathname: string; query: string; hash: string } {
  const hashIndex = path.indexOf('#');
  const hash = hashIndex >= 0 ? path.slice(hashIndex) : '';
  const withoutHash = hashIndex >= 0 ? path.slice(0, hashIndex) : path;
  const queryIndex = withoutHash.indexOf('?');
  const query = queryIndex >= 0 ? withoutHash.slice(queryIndex) : '';
  const pathname = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  return { pathname, query, hash };
}

/**
 * 为站内路径加上语言前缀。
 *
 * localizedPath('/products?category=x#top', 'zh-CN') → '/zh-CN/products?category=x#top'
 * localizedPath('/contact#rfq', 'en')               → '/contact#rfq'
 * localizedPath('#rfq', 'zh-CN')                    → '#rfq'（纯锚点不动）
 * localizedPath('https://x.com', 'zh-CN')           → 原样返回
 */
export function localizedPath(path: string, locale: Locale): string {
  if (!path) return path;
  if (path.startsWith('#')) return path;
  if (!isLocalizablePath(path)) return path;

  const { pathname, query, hash } = splitPath(path);
  const clean = pathname === '' ? '/' : pathname;

  const base =
    locale === defaultLocale
      ? clean
      : `/${locale}${clean === '/' ? '' : clean.replace(/\/+$/, '')}`;

  return `${base}${query}${hash}`;
}

/** 当前路径是否带受支持的语言前缀 */
export function detectLocaleFromPath(pathname: string): Locale | null {
  if (!pathname || !pathname.startsWith('/')) return null;
  const segment = pathname.split('/')[1] ?? '';
  return isLocale(segment) ? segment : null;
}

/**
 * 去掉路径上的语言前缀，返回「语言无关路径」。
 *
 * 用于：面包屑 / 语言切换 / 站内导航高亮 —— 这些逻辑不应关心前缀。
 */
export function stripLocaleFromPath(pathname: string): string {
  const locale = detectLocaleFromPath(pathname);
  if (!locale) return pathname || '/';
  const rest = pathname.slice(locale.length + 1);
  return rest === '' ? '/' : rest;
}

/**
 * 计算切换语言后的目标地址。
 *
 * 保留当前页面路径、查询串与锚点 —— 切换语言不丢失页面上下文；
 * 对应语言的页面不存在时由页面自身的 404 兜底（绝不生成错误 URL）。
 */
export function switchLocalePath(
  pathname: string,
  search: string,
  hash: string,
  target: Locale,
): string {
  const path = stripLocaleFromPath(pathname);
  const suffix = `${search || ''}${hash || ''}`;
  return localizedPath(`${path}${suffix}`, target);
}
