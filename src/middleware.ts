import { NextResponse, type NextRequest } from 'next/server';

/**
 * 前台中间件（Phase 5.0）—— SEO 重定向执行（任务书二十八节）
 *
 * 规则来源：后端 `GET /public/seo/redirects`（SEO → Redirects 管理，
 * 支持 301 / 302、启用停用、防环 / 防自指向校验见后端 SeoRedirectService）。
 *
 * 设计要点：
 *   · 规则带 60s 进程内缓存（middleware 每次请求都会执行，不能每次回源）；
 *   · 只处理**站内路径**（以 / 开头、非 // 开头）；外部目标直接 301/302 跳转；
 *   · 未命中任何规则 → 放行（next()），零额外开销；
 *   · API / 静态资源 / 后台路径不进入匹配（见 config.matcher）。
 */

interface RedirectRule {
  sourcePath: string;
  targetPath: string;
  statusCode: number;
}

/** 进程内缓存（ middleware 实例生命周期内有效） */
let cachedRules: RedirectRule[] | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 60_000;

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:4000/api/v1'
).replace(/\/+$/, '');

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

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // 仅站内相对路径参与匹配（外链由 <a> 控制，不经 middleware）
  if (!pathname.startsWith('/') || pathname.startsWith('//')) {
    return NextResponse.next();
  }

  const rules = await loadRules();
  if (rules.length === 0) return NextResponse.next();

  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const matched = rules.find((rule) => {
    const source = rule.sourcePath.length > 1 ? rule.sourcePath.replace(/\/+$/, '') : rule.sourcePath;
    return source === normalized;
  });

  if (!matched) return NextResponse.next();

  const status = matched.statusCode === 302 ? 302 : 301;
  // 站内目标保持同源跳转；外部目标允许跨域
  const target = matched.targetPath.startsWith('/')
    ? new URL(matched.targetPath, request.url)
    : new URL(matched.targetPath);

  return NextResponse.redirect(target, status);
}

export const config = {
  /**
   * 匹配所有页面路径，排除：
   *   · api（本站自身的路由处理器）
   *   · _next/static（Next 内部资源）
   *   · 常见静态文件扩展名
   */
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo.webp|robots.txt|sitemap.xml).*)'],
};
