import { notFound } from 'next/navigation';

/**
 * 兜底路由 /[locale]/[...rest] —— 让未知路径落到**本地化的 404 页面**
 *
 * 为什么需要：把 `not-found.tsx` 移入 `[locale]` 之后，`notFound()` 抛出的
 * 页面会使用 `[locale]/not-found.tsx`；但**完全未匹配的路由**（如 `/abc`、
 * `/zh-CN/abc`）由 Next.js 直接用根级默认 404 渲染 —— 那是无样式、只有英文
 * 的内置页面，既破坏品牌一致性，也不满足多语言要求。
 *
 * 本 catch-all 让所有未匹配路径先进入 `[locale]` 段，再由 `notFound()`
 * 触发该段的 404 边界，从而：
 *   · 输出品牌化 404 版式；
 *   · 语言取自 URL 前缀（`/zh-CN/abc` → 中文 404）；
 *   · HTTP 状态码仍为真实 404（不做软 404）。
 *
 * 说明：更具体的路由（`/products/[slug]`、`/blog/[slug]` 等）优先匹配，
 * 本文件只在全部真实路由都不匹配时生效，不影响任何既有页面与 ISR 缓存。
 */
export default function CatchAllNotFound(): never {
  notFound();
}
