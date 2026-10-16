import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * POST /api/revalidate —— 内容发布即刷新端点（Phase 4.8）
 *
 * 调用方：bailing-backend 的 RevalidationService（内容发布 / 下架 / 删除后触发）。
 * 作用：让前台在**不重建、不删 .next/cache** 的前提下，下一次访问即拿到最新内容，
 *       彻底解决 Phase 4.7 发现的「fetch 缓存跨构建复用旧数据」问题。
 *
 * 安全约束（任务书第九节）：
 *   · 仅接受 POST；GET/PUT 等一律 405（不允许通过 GET 触发）。
 *   · 必须携带与 REVALIDATE_SECRET 完全一致的密钥（Header 或 body 皆可）。
 *   · 未配置密钥 → 503（诚实报错，不静默放行）；密钥错误 → 401。
 *   · 响应只回显被失效的 tag / path 与时间戳，**不泄漏**任何内部信息、堆栈或环境变量。
 */

/** 该路由始终动态执行，绝不进入任何缓存 */
export const dynamic = 'force-dynamic';

/** 读取并规范化密钥（仅来自环境变量，禁止硬编码） */
function readSecret(): string {
  return (process.env.REVALIDATE_SECRET ?? '').trim();
}

/** 从请求中提取密钥：优先 Header，其次 JSON body */
async function extractSecret(request: Request): Promise<{ secret: string; body: unknown }> {
  const headerSecret = (request.headers.get('x-revalidate-secret') ?? '').trim();

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const bodySecret =
    body && typeof body === 'object' && typeof (body as { secret?: unknown }).secret === 'string'
      ? ((body as { secret: string }).secret ?? '').trim()
      : '';

  return { secret: headerSecret || bodySecret, body };
}

function pickStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    // 去重，避免重复失效
    .filter((item, index, all) => all.indexOf(item) === index);
}

export async function POST(request: Request): Promise<NextResponse> {
  const expected = readSecret();
  if (!expected) {
    // 未配置密钥：不猜测、不放行，明确告知调用方该能力当前不可用。
    return NextResponse.json(
      { revalidated: false, error: 'revalidation_disabled' },
      { status: 503 },
    );
  }

  const { secret, body } = await extractSecret(request);
  if (secret !== expected) {
    return NextResponse.json({ revalidated: false, error: 'unauthorized' }, { status: 401 });
  }

  const payload = (body ?? {}) as { tags?: unknown; paths?: unknown; revalidateLayout?: unknown };
  const tags = pickStringArray(payload.tags);
  const paths = pickStringArray(payload.paths);
  const asLayout = payload.revalidateLayout === true;

  if (tags.length === 0 && paths.length === 0) {
    return NextResponse.json(
      { revalidated: false, error: 'nothing_to_revalidate' },
      { status: 400 },
    );
  }

  for (const tag of tags) {
    revalidateTag(tag);
  }
  for (const path of paths) {
    revalidatePath(path, asLayout ? 'layout' : 'page');
  }

  return NextResponse.json({
    revalidated: true,
    tags,
    paths,
    revalidateLayout: asLayout,
    now: Date.now(),
  });
}

/** 明确拒绝非 POST 触发（含 GET），避免被搜索引擎或第三方误调用 */
export function GET(): NextResponse {
  return NextResponse.json({ revalidated: false, error: 'method_not_allowed' }, { status: 405 });
}

export function PUT(): NextResponse {
  return NextResponse.json({ revalidated: false, error: 'method_not_allowed' }, { status: 405 });
}

export function DELETE(): NextResponse {
  return NextResponse.json({ revalidated: false, error: 'method_not_allowed' }, { status: 405 });
}
