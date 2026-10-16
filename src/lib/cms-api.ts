/**
 * 公开 CMS API 客户端（Phase 4.7 建立 / Phase 4.8 增加 tag 与分层缓存）。
 *
 * 前台页面 / 组件**只**通过各模块 repository 取数，不直接 fetch。
 * 数据源由环境变量 NEXT_PUBLIC_CMS_SOURCE 统一控制：
 *   · `demo`（默认）—— 使用仓库内既有演示数据 / 版式，完全离线可构建
 *   · `api`         —— 调用 bailing-backend 公开只读接口（/api/v1/public/*）
 *
 * 设计原则（与产品模块一致）：
 *   · api 模式下游后端不可用**如实抛错**（由 error 边界接管），
 *     绝不静默回退演示数据——避免把占位内容当真实内容展示；
 *   · 公开接口只返回已发布内容（后端强制），这里不再做二次过滤；
 *   · **缓存分层**（Phase 4.8）：每个请求按内容性质选择 ISR 窗口并打 tag，
 *     后台变更后由后端调用 /api/revalidate 精准失效（见 lib/cms-tags.ts）。
 */

import { CmsRevalidate } from './cms-tags';

export type CmsSource = 'demo' | 'api';

/** 当前是否启用后端 CMS 数据源 */
export function isApiSource(): boolean {
  const raw = (process.env.NEXT_PUBLIC_CMS_SOURCE ?? 'demo').trim().toLowerCase();
  return raw === 'api';
}

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:4000/api/v1'
).replace(/\/+$/, '');

/** 后端统一响应包裹 */
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 单次 GET 的缓存选项。
 *
 * `revalidate` 语义（秒）：
 *   · > 0 —— ISR：缓存并在窗口后重验证（默认 CONTENT 档）
 *   · 0   —— no-store：不缓存（敏感 / 实时内容）
 */
export interface ApiGetOptions {
  /** 失效标签（与后端 RevalidationService 的 tag 字符串逐字一致） */
  tags?: string[];
  /** ISR 窗口（秒）；省略时使用 CONTENT 档 */
  revalidate?: number;
}

/**
 * GET 公开接口并解包（非 2xx / 网络错误转为 ApiError 抛出）。
 *
 * 缓存行为集中在此处，禁止调用方再自行拼 `next` / `cache` 选项，
 * 保证全站只有一套缓存策略。
 */
export async function apiGet<T>(path: string, options: ApiGetOptions = {}): Promise<T> {
  const { tags, revalidate = CmsRevalidate.CONTENT } = options;

  // 组装请求初始化：ISR 与 no-store 互斥，避免 Next 报「不能同时指定」。
  const init: RequestInit & { next?: { revalidate?: number; tags?: string[] } } = {
    headers: { accept: 'application/json' },
  };

  if (revalidate > 0) {
    init.next = {
      revalidate,
      ...(tags && tags.length > 0 ? { tags } : {}),
    };
  } else {
    // 实时 / 敏感内容：每次请求取新，且不进入数据缓存。
    init.cache = 'no-store';
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, init);
  } catch (cause) {
    throw new ApiError(0, `CMS API unreachable: ${(cause as Error).message}`);
  }

  if (!response.ok) {
    throw new ApiError(response.status, `CMS API responded with ${response.status}`);
  }

  const body = (await response.json()) as ApiEnvelope<T>;
  return body.data;
}

/** 便捷判定：ApiError 且为 404（调用方转 notFound()） */
export function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

/** 构造查询串（忽略 undefined / 空串） */
export function qs(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}
