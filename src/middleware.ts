import { NextResponse, type NextRequest } from 'next/server';
import {
  defaultLocale,
  isLocale,
  localeAliases,
  localeCookieName,
  localeHeaderName,
  type Locale,
} from '@/i18n/config';
import { stripLocaleFromPath } from '@/i18n/paths';

/**
 * 前台中间件 —— 语言路由 + SEO 重定向（Phase 5.0 规则保持不变）
 *
 * 语言路由策略：**as-needed 前缀**
 *   · 英文（默认）—— 无前缀，`/products` 内部重写到 `/en/products`；
 *     既有 URL 一个都不变，历史收录与外链完全兼容。
 *   · 中文 —— `/zh-CN/products`，真实可抓取、可分享、可 canonical。
 *   · `/en/...` 视为非规范 URL，301 回无前缀地址（避免同页两套 URL）。
 *   · `/zh`、`/zh_CN`、`/en-US` 等别名 301 归一到规范前缀或默认语言。
 *
 * 持久化：Cookie（NEXT_LOCALE）记录用户选择。带中文 Cookie 的访客访问
 * 无前缀地址时 307 跳到对应中文页面；搜索引擎爬虫不带 Cookie，
 * 因此抓到的永远是英文默认页 —— 不会被用户偏好污染收录。
 *
 * SEO 重定向：规则仍来自后端 `GET /public/seo/redirects`（60s 进程内缓存），
 * 匹配的是**去掉语言前缀后**的路径，命中后按当前语言补回前缀。
 */

interface RedirectRule {
  sourcePath: string;
  targetPath: string;
  statusCode: number;
}

/** 进程内缓存（middleware 实例生命周期内有效） */
let cachedRules: RedirectRule[] | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 60_000;

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:4000/api/v1'
).replace(/\/+$/, '');

/** 形如 `en` / `zh-CN` 的语言段（用于识别伪语言前缀） */
const LOCALE_LIKE_SEGMENT = /^[a-z]{2}(-[A-Za-z]{2,4})?$/;

async function loadRules(): Promise<RedirectRule[]> {
  const now = Date.now();
  if (cachedRules && now - cachedAt < CACHE_TTL_MS) {
    return cachedRules;
  }
  try {
    // 注意：middleware 中的 fetch 不使用 Next 数据缓存选项，
    // 新鲜度由本文件的进程内 TTL 缓存控制。
    const response = await fetch(`${API_BASE}/public/seo/redirects`, {
      headers: { accept: 'application/json' },
    });
    if (!response.ok) {
      return cachedRules ?? [];
    }
    // 后端统一响应信封：{ success, data: { redirects: [...] } }
    // （兼容平铺 { redirects } 形态，防止信封调整后规则静默丢失）
    const payload = (await response.json()) as {
      data?: { redirects?: RedirectRule[] };
      redirects?: RedirectRule[];
    };
    cachedRules = payload.data?.redirects ?? payload.redirects ?? [];
    cachedAt = now;
    return cachedRules;
  } catch {
    // 后端不可用：沿用旧缓存（若有），否则放行——绝不让重定向故障拖垮全站
    return cachedRules ?? [];
  }
}

/** 给站内目标补语言前缀（英文无前缀；外链原样返回） */
function withLocale(target: string, locale: Locale): string {
  if (!target.startsWith('/') || target.startsWith('//')) return target;
  if (locale === defaultLocale) return target;
  return target === '/' ? `/${locale}` : `/${locale}${target}`;
}

/** 读取语言 Cookie（非法值忽略） */
function readLocaleCookie(request: NextRequest): Locale | null {
  const raw = request.cookies.get(localeCookieName)?.value;
  return raw && isLocale(raw) ? raw : null;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;

  // 仅站内相对路径参与处理（外链由 <a> 控制，不经 middleware）
  if (!pathname.startsWith('/') || pathname.startsWith('//')) {
    return NextResponse.next();
  }

  const firstSegment = pathname.split('/')[1] ?? '';

  /* ------------------------------------------------------------------ */
  /* 1. 语言前缀归一化                                                   */
  /* ------------------------------------------------------------------ */
  if (firstSegment === defaultLocale) {
    // 英文规范 URL 不带前缀
    const rest = pathname.slice(defaultLocale.length + 1) || '/';
    return NextResponse.redirect(new URL(`${rest}${search}`, request.url), 301);
  }

  if (firstSegment && !isLocale(firstSegment) && LOCALE_LIKE_SEGMENT.test(firstSegment)) {
    const rest = pathname.slice(firstSegment.length + 1) || '/';
    const alias = localeAliases[firstSegment.toLowerCase()];

    if (alias && alias !== defaultLocale) {
      // /zh/products → /zh-CN/products
      const target = rest === '/' ? `/${alias}` : `/${alias}${rest}`;
      return NextResponse.redirect(new URL(`${target}${search}`, request.url), 301);
    }
    // 不支持的语言（如 /fr/products）→ 回默认语言路径，避免伪语言 URL 被收录
    return NextResponse.redirect(new URL(`${rest}${search}`, request.url), 301);
  }

  const pathLocale = isLocale(firstSegment) ? (firstSegment as Locale) : null;
  const activeLocale = pathLocale ?? readLocaleCookie(request) ?? defaultLocale;

  /* ------------------------------------------------------------------ */
  /* 2. SEO 重定向（规则基于无语言前缀的路径）                            */
  /* ------------------------------------------------------------------ */
  const localeFreePath = pathLocale ? stripLocaleFromPath(pathname) : pathname;
  const rules = await loadRules();

  if (rules.length > 0) {
    const normalized =
      localeFreePath.length > 1 ? localeFreePath.replace(/\/+$/, '') : localeFreePath;
    const matched = rules.find((rule) => {
      const source =
        rule.sourcePath.length > 1 ? rule.sourcePath.replace(/\/+$/, '') : rule.sourcePath;
      return source === normalized;
    });

    if (matched) {
      const status = matched.statusCode === 302 ? 302 : 301;
      const target = matched.targetPath.startsWith('/')
        ? new URL(withLocale(matched.targetPath, activeLocale), request.url)
        : new URL(matched.targetPath);
      return NextResponse.redirect(target, status);
    }
  }

  /* ------------------------------------------------------------------ */
  /* 3. 无前缀路径：按 Cookie 偏好跳到中文，否则内部重写到 /en            */
  /* ------------------------------------------------------------------ */
  // 把本次生效的语言写进请求头：404 / 错误边界拿不到路由参数，
  // 只能靠它决定服务端渲染哪种语言（否则只能等客户端 hydrate）。
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(localeHeaderName, activeLocale);

  if (!pathLocale) {
    if (
      activeLocale !== defaultLocale &&
      (request.method === 'GET' || request.method === 'HEAD')
    ) {
      // 用户此前选择过中文：回到中文版本（307 临时跳转，爬虫不带 Cookie 不受影响）
      const target = pathname === '/' ? `/${activeLocale}` : `/${activeLocale}${pathname}`;
      return NextResponse.redirect(new URL(`${target}${search}`, request.url), 307);
    }

    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = pathname === '/' ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`;
    return NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
  }

  // 带语言前缀的路径（/zh-CN/...）：**同路径 rewrite** 而非直接放行。
  //
  // 原因（2026-10-19 实测 500）：直接 `NextResponse.next()` 放行时，
  // ISR 动态参数路由（如 /zh-CN/products/[slugId]）在运行时回退生成会连
  // not-found 外壳一起以「静态生成」模式渲染；not-found.tsx 里的
  // `await headers()` 触发 DynamicServerError（"Page changed from static
  // to dynamic at runtime, reason: headers"）→ 整个详情页 500。
  // 英文路径因走 rewrite 强制进入 request 渲染模式而从未受影响。
  // 同路径 rewrite 不改变 URL（对 SEO / canonical 零影响），
  // 但让渲染与英文路径完全同模式（request 模式，headers() 可用）。
  return NextResponse.rewrite(request.nextUrl, { request: { headers: requestHeaders } });
}

export const config = {
  /**
   * 匹配所有页面路径，排除：
   *   · api（本站自身的路由处理器）
   *   · _next（Next 内部资源）
   *   · 任何带扩展名的静态文件（robots.txt / sitemap.xml / logo.webp / public 下的图片…）
   */
  matcher: ['/((?!api|_next|.*\\.[^/]+$).*)'],
};
