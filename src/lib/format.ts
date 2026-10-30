/**
 * 展示格式化工具（与业务无关的纯函数）
 *
 * 时区固定为 Asia/Shanghai，保证服务端渲染与不同地区访客看到同一日期，
 * 避免出现"同一天显示两个日期"的差异。
 * 日期格式随界面语言变化（英文 `12 Oct 2026` / 中文 `2026年10月12日`）。
 */

import { defaultLocale, localeMeta, type Locale } from '@/i18n/config';

const DATE_FORMATTERS = new Map<Locale, Intl.DateTimeFormat>();

function dateFormatter(locale: Locale): Intl.DateTimeFormat {
  const cached = DATE_FORMATTERS.get(locale);
  if (cached) return cached;

  const formatter = new Intl.DateTimeFormat(localeMeta[locale].dateLocale, {
    year: 'numeric',
    month: locale === defaultLocale ? 'short' : 'long',
    day: '2-digit',
    timeZone: 'Asia/Shanghai',
  });
  DATE_FORMATTERS.set(locale, formatter);
  return formatter;
}

/** 把 ISO 日期字符串格式化为本地化日期；非法输入返回空串 */
export function formatDate(iso: string, locale: Locale = defaultLocale): string {
  const timestamp = Date.parse(iso);
  if (Number.isNaN(timestamp)) return '';
  return dateFormatter(locale).format(new Date(timestamp));
}

/** 把 ISO 日期字符串格式化为 `<time datetime>` 可用的值 */
export function toDateTimeAttribute(iso: string): string | undefined {
  const timestamp = Date.parse(iso);
  if (Number.isNaN(timestamp)) return undefined;
  return new Date(timestamp).toISOString();
}

/**
 * 规范化 WhatsApp 号码为国际格式（Phase 4.8）。
 *
 * 后台录入的号码形态各异（`+86 138 0000 0000`、`0086-138-0000-0000`、
 * `13800000000` 等）。直接拼接会出现 `wa.me/+86 138 ...` 这类非法 URL，
 * 因此统一：只保留数字，去掉国际前缀 `00`，再交给 wa.me。
 *
 * @returns 规范化后的号码（仅数字，含国家码）；无法解析时返回 null
 */
export function normalizeWhatsAppNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let digits = raw.replace(/\D/g, '');
  // 00 是国际长途前缀（等价于 +），wa.me 不接受
  if (digits.startsWith('00')) digits = digits.slice(2);
  // 过短（不足 6 位）几乎不可能是有效国际号码，拒绝而不是产出坏链接
  if (digits.length < 6) return null;
  return digits;
}

/**
 * 把一段可能被截断的文案收成「完整的一句话」。
 *
 * 背景（2026-10-30，对比报告首页 / 产品列表两项）：CMS 里的分类描述与产品简述
 * 有一部分是旧数据导入时按字符数硬截断的，末尾停在半句话
 * （如「… sustainable production, Sh」），列表卡片上看起来像页面没做完。
 *
 * 规则：
 *   · 已以句末标点结尾 → 原样返回（完整文案不动）；
 *   · 结尾缺标点（判定为被截断）→ 回退到最后一个完整句号处，宁可少一句，不留半句；
 *   · 找不到可回退的句号 → 原样返回，交给 CSS 的 line-clamp 兜底。
 */
const TERMINAL_PUNCTUATION = /[.!?。！？…"”'’]$/;

export function trimToCompleteSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed || TERMINAL_PUNCTUATION.test(trimmed)) return trimmed;

  const cut = Math.max(
    trimmed.lastIndexOf('. '),
    trimmed.lastIndexOf('。'),
    trimmed.lastIndexOf('！'),
    trimmed.lastIndexOf('？'),
  );
  // 只在「回退后仍保留一半以上内容」时裁剪，避免为凑整句把一句短文案砍掉大半
  return cut > 60 && cut >= trimmed.length / 2 ? trimmed.slice(0, cut + 1) : trimmed;
}

/**
 * 生成 WhatsApp 会话链接（`https://wa.me/<号码>`）。
 *
 * 号码无法规范化时返回 null —— 调用方应回退为纯文本展示，
 * **绝不**产出 `https://wa.me/+86 138...` 这类错误链接。
 */
export function toWhatsAppUrl(raw: string | null | undefined): string | null {
  const number = normalizeWhatsAppNumber(raw);
  return number ? `https://wa.me/${number}` : null;
}
