/**
 * 公开 CMS API 客户端（Phase 4.7）。
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
 *   · ISR 缓存：内容型数据 300 秒重验证，降低后端压力。
 */

export type CmsSource = 'demo' | 'api';

/** 当前是否启用后端 CMS 数据源 */
export function isApiSource(): boolean {
  const raw = (process.env.NEXT_PUBLIC_CMS_SOURCE ?? 'demo').trim().toLowerCase();
  return raw === 'api';
}

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:4000/api/v1'
).replace(/\/+$/, '');

/** 接口缓存时长（秒）：CMS 内容变化不频繁 */
const REVALIDATE_SECONDS = 300;

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

/** GET 公开接口并解包（非 2xx / 网络错误转为 ApiError 抛出） */
export async function apiGet<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { accept: 'application/json' },
    });
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
