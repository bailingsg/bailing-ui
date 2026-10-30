import { notFound, permanentRedirect } from 'next/navigation';
import { getBlogPostBySlug } from '@/lib/blog';
import { getProductBySlug, productDetailPath } from '@/lib/products';
import { resolveLegacyPath } from '@/lib/legacy-redirects';
import { localizedPath } from '@/i18n/paths';
import { defaultLocale, isLocale, type Locale } from '@/i18n/config';

/**
 * 兜底路由 /[locale]/[...rest]
 *
 * 职责有两层：
 *
 * 1. **旧站链接兼容（2026-10-30 起）**
 *    旧 WordPress 站的地址形态与新站不同（`/product-category/mdf/`、`/product/<slug>/`、
 *    根路径下的 `/<文章slug>/`）。这里在落到 404 之前先按旧站规则解析一次：
 *    能确定目标的用 **301** 永久跳转（保住历史收录与已发出去的外链）；
 *    产品和文章按 slug 反查、确认存在后才跳 —— 查不到就照常 404，绝不伪造页面。
 *    规则见 `@/lib/legacy-redirects`。
 *
 * 2. **本地化 404**
 *    把 `not-found.tsx` 移入 `[locale]` 之后，`notFound()` 抛出的是该段 404 边界；
 *    但**完全未匹配的路由**（如 `/abc`、`/zh-CN/abc`）会被 Next 用根级默认 404 渲染
 *    —— 无样式、只有英文。本 catch-all 让所有未匹配路径先进 `[locale]` 段，再由
 *    `notFound()` 触发品牌化 404，语言取自 URL 前缀，HTTP 状态码仍是真实 404。
 *
 * 说明：更具体的路由（`/products/[slugId]`、`/blog/[slug]` 等）优先匹配，
 * 本文件只在全部真实路由都不匹配时生效，不影响任何既有页面与 ISR 缓存。
 */
interface CatchAllProps {
  params: Promise<{ locale: string; rest?: string[] }>;
}

export default async function CatchAllNotFound({ params }: CatchAllProps) {
  const { locale: rawLocale, rest } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  /**
   * `[locale]` 段会吞掉任意首段（如 `/product-category/mdf` 会被解析成
   * locale='product-category' + rest=['mdf']）。正常请求由 middleware 先补成
   * `/en/...` 再进来，这里只是兜底：首段不是合法语言时，把它拼回路径，
   * 避免旧链接被误当成「文章 slug」。
   */
  const segments = isLocale(rawLocale) ? (rest ?? []) : [rawLocale, ...(rest ?? [])];

  const legacy = resolveLegacyPath(segments);

  if (legacy?.target) {
    permanentRedirect(localizedPath(legacy.target, locale));
  }

  if (legacy?.productSlug) {
    // 后端不可用时不能让整站 404 变成 500：查不到就照常走 404
    const product = await safeLookup(() => getProductBySlug(legacy.productSlug!));
    if (product) {
      permanentRedirect(localizedPath(productDetailPath(product), locale));
    }
  }

  if (legacy?.blogSlug) {
    const post = await safeLookup(() => getBlogPostBySlug(legacy.blogSlug!));
    if (post) {
      permanentRedirect(localizedPath(`/blog/${post.slug}`, locale));
    }
  }

  notFound();
}

/** 反查失败（接口异常 / 超时）时按「没找到」处理，保证 404 仍然是 404 */
async function safeLookup<T>(lookup: () => Promise<T | null>): Promise<T | null> {
  try {
    return await lookup();
  } catch {
    return null;
  }
}
