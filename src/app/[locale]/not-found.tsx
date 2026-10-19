import { headers } from 'next/headers';
import { NotFoundContent } from '@/components/common/not-found-content';
import { defaultLocale, isLocale, localeHeaderName, type Locale } from '@/i18n/config';

/**
 * not-found.tsx —— 404 页面
 *
 * 提供返回首页与主要栏目入口，帮助访客继续浏览。
 *
 * 多语言：not-found 边界**不接收 `params`**，语言从 middleware 写入的
 * `x-bailing-locale` 请求头读取，因此正文在服务端就以正确语言输出
 * （不是等客户端 hydrate 才出现）。
 *
 * 不导出 `metadata`：
 *   · 404 响应由 Next.js 自动带上 `<meta name="robots" content="noindex">`；
 *   · 在 not-found 边界里导出 metadata 会让 Next 走「metadata notFound」分支，
 *     只输出空壳 HTML（实测会把 title 模板留成 `%title%`），得不偿失。
 */
export default async function NotFound() {
  const headerList = await headers();
  const raw = headerList.get(localeHeaderName);
  const locale: Locale = raw && isLocale(raw) ? raw : defaultLocale;

  return <NotFoundContent locale={locale} />;
}
