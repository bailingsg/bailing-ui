/**
 * 访客标识 visitorId（访客统计实现规格 7.1）。
 *
 * 硬约束：
 *   · 前端生成的 UUID v4，存 localStorage，一个浏览器一个 ID，
 *     跨刷新 / 跨标签页 / 跨路由不变，与登录态无关；
 *   · localStorage 不可用（隐私模式 / 禁用存储）时**宁可不统计**——
 *     退回内存临时 ID 会让每次刷新都算新访客，把 UV 用 PV 冒充；
 *   · 生成三级回退，全部产出合法 v4 格式（后端按 v4 校验）。
 */

const STORAGE_KEY = 'bailing.visitor.id.v1';

/** UUID v4 正则（第 3 组以 4 开头、第 4 组以 8/9/a/b 开头） */
const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let cached: string | null = null;

/** 取（并按需创建）访客 ID。无法生成或无法持久化时返回 null = 放弃统计。 */
export function ensureVisitorId(): string | null {
  if (cached) return cached;

  const stored = readStored();
  if (stored) {
    cached = stored;
    return cached;
  }

  const id = generateUuidV4();
  if (!id) return null; // 拿不到随机源 ⇒ 放弃
  if (!persist(id)) return null; // 无法持久化 ⇒ 放弃
  cached = id;
  return id;
}

/** 只读已存储值，不做创建（测试与调试用） */
export function readStoredVisitorId(): string | null {
  return readStored();
}

function readStored(): string | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (value && UUID_V4_RE.test(value)) return value;
    // 历史脏值直接清掉，避免反复读到非法格式
    if (value) window.localStorage.removeItem(STORAGE_KEY);
    return null;
  } catch {
    return null; // 存储被禁用
  }
}

/** 写入并**回读确认**——setItem 在存储被禁用时可能静默失败 */
function persist(id: string): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
    return window.localStorage.getItem(STORAGE_KEY) === id;
  } catch {
    return false;
  }
}

/**
 * UUID v4 生成，三级回退：
 *   1. crypto.randomUUID()（仅安全上下文 https/localhost；局域网 http 常不可用）
 *   2. crypto.getRandomValues（非安全上下文可用，手工按 RFC 4122 布局拼装）
 *   3. Math.random()（最后兜底；visitorId 不是凭据，最坏后果是访客数高估）
 */
function generateUuidV4(): string | null {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') {
    try {
      return c.randomUUID();
    } catch {
      // 安全上下文外会抛，继续回退
    }
  }
  if (c && typeof c.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    c.getRandomValues(bytes);
    // RFC 4122 layout：version 4 + variant 1
    bytes[6] = (bytes[6]! & 0x0f) | 0x40;
    bytes[8] = (bytes[8]! & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return (
      hex.slice(0, 8) +
      '-' +
      hex.slice(8, 12) +
      '-' +
      hex.slice(12, 16) +
      '-' +
      hex.slice(16, 20) +
      '-' +
      hex.slice(20)
    );
  }
  return mathRandomUuid();
}

function mathRandomUuid(): string {
  const hex = (n: number) =>
    Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  const variant = '89ab'[Math.floor(Math.random() * 4)] ?? '8';
  // version 4 + variant 1 的布局在字符串层强制拼出（满足后端 v4 校验）
  return `${hex(8)}-${hex(4)}-4${hex(3)}-${variant}${hex(3)}-${hex(12)}`;
}
