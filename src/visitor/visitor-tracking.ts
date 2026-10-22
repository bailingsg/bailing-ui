/**
 * 访客上报（访客统计实现规格 7.2 / 7.3 / 7.4）。
 *
 * 挂在 [locale] 根布局的 client 组件里，全站只此一处：
 *   · usePathname + useSearchParams 监听路由变化（Next App Router 版
 *     「route.matched」——首次渲染即最终 path，无双导航问题）；
 *   · immediate + lastReportedPath 去重：同一路径只报一次，失败不补发
 *     （统计不做重试，避免放大错误）；
 *   · requestIdleCallback(task, { timeout: 2000 }) 不阻塞渲染，
 *     从不 await 上报；
 *   · 请求 5s 超时（刻意短），失败全部吞掉——页面无任何提示。
 *
 * 请求只发 { visitorId } 一个字段：不发路径 / 商品 / 账户 / UA。
 */

'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { ensureVisitorId } from './visitor-id';

/** 上报超时（ms）：统计不该长期挂着 */
const REPORT_TIMEOUT_MS = 5000;

/** 上报 API 基址（与 lib/cms-api.ts 保持一致） */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:4000/api/v1';

/** 模块级去重：跨组件挂载/卸载保持（布局刷新时路由不变不重报） */
let lastReportedPath: string | null = null;

export function VisitorTracking(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scheduled = useRef(false);

  useEffect(() => {
    // query 变化也算新访问（与 fullPath 语义一致）
    const fullPath = searchParams?.toString()
      ? `${pathname}${pathname.includes('?') ? '&' : '?'}${searchParams.toString()}`
      : pathname;
    if (!fullPath || fullPath === lastReportedPath) return;
    lastReportedPath = fullPath; // 先记账，后调度
    if (scheduled.current) return;
    scheduled.current = true;

    scheduleIdle(() => {
      scheduled.current = false;
      void send();
    });
  }, [pathname, searchParams]);

  return null;
}

/** requestIdleCallback 必须**以方法形式**调用（解构后单独调用会 Illegal invocation） */
function scheduleIdle(task: () => void): void {
  const w = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  };
  if (typeof w.requestIdleCallback === 'function') {
    w.requestIdleCallback(task, { timeout: 2000 });
  } else {
    window.setTimeout(task, 0);
  }
}

async function send(): Promise<void> {
  const visitorId = ensureVisitorId();
  if (!visitorId) return; // 存储不可用 ⇒ 放弃统计
  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), REPORT_TIMEOUT_MS);
    await fetch(`${API_BASE}/visitor/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId }),
      signal: controller.signal,
    });
    window.clearTimeout(timer);
  } catch {
    // 失败静默：页面无任何提示、无 console.error
  }
}
