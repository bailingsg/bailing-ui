import type { RfqFieldName, RfqReceipt, RfqSubmitPayload } from './types';

/**
 * RFQ 提交（浏览器端直连后端公开接口）。
 *
 * 说明：POST /api/v1/rfq 是**公开接口**，无需令牌；后台接口才需要 X-Admin-Token。
 * 后端地址由 NEXT_PUBLIC_API_BASE_URL 提供（构建期注入）。
 */
const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:4000/api/v1'
).replace(/\/$/, '');

/** 提交失败（含后端返回的字段级错误明细） */
export class RfqSubmitError extends Error {
  readonly fieldErrors: Partial<Record<RfqFieldName, string>>;
  readonly status: number | null;

  constructor(
    message: string,
    options: { fieldErrors?: Partial<Record<RfqFieldName, string>>; status?: number | null } = {},
  ) {
    super(message);
    this.name = 'RfqSubmitError';
    this.fieldErrors = options.fieldErrors ?? {};
    this.status = options.status ?? null;
  }
}

interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiFailure {
  success: false;
  error: { code: number | string; message: string | string[]; details?: unknown };
}

/** 去掉空字符串与 undefined，避免把空值发给后端 */
function compact(payload: RfqSubmitPayload): RfqSubmitPayload {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === 'string' && value.trim() !== '') out[key] = value.trim();
  }
  return out as unknown as RfqSubmitPayload;
}

/**
 * 把后端 ValidationPipe 的错误信息映射到字段。
 * Nest 默认格式形如 "email must be an email" / "message must be longer than 10 characters"。
 */
function mapFieldErrors(messages: string[]): Partial<Record<RfqFieldName, string>> {
  const known: RfqFieldName[] = [
    'name',
    'company',
    'email',
    'phone',
    'country',
    'productId',
    'productName',
    'message',
    'quantity',
    'attachmentUrl',
  ];
  const result: Partial<Record<RfqFieldName, string>> = {};
  for (const raw of messages) {
    const field = known.find((f) => raw.startsWith(f));
    if (field && !result[field]) result[field] = raw;
  }
  return result;
}

/**
 * 提交询盘。
 *
 * @throws {RfqSubmitError} 网络异常、非 2xx 响应或响应结构异常
 */
export async function submitRfq(payload: RfqSubmitPayload): Promise<RfqReceipt> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/rfq`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(compact(payload)),
    });
  } catch {
    throw new RfqSubmitError('network', { status: null });
  }

  const json = (await response.json().catch(() => null)) as
    | ApiSuccess<RfqReceipt>
    | ApiFailure
    | null;

  if (!response.ok || !json || json.success !== true) {
    const failure = json && json.success === false ? json.error : null;
    const messages = failure
      ? Array.isArray(failure.message)
        ? failure.message
        : [failure.message]
      : [];
    throw new RfqSubmitError('rejected', {
      status: response.status,
      fieldErrors: response.status === 400 ? mapFieldErrors(messages) : {},
    });
  }

  return json.data;
}
