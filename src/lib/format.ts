/**
 * 展示格式化工具（与业务无关的纯函数）
 *
 * 时区固定为 Asia/Shanghai，保证服务端渲染与不同地区访客看到同一日期，
 * 避免出现"同一天显示两个日期"的差异。
 */

const DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  timeZone: 'Asia/Shanghai',
});

/** 把 ISO 日期字符串格式化为 `12 Oct 2026` 形式；非法输入返回空串 */
export function formatDate(iso: string): string {
  const timestamp = Date.parse(iso);
  if (Number.isNaN(timestamp)) return '';
  return DATE_FORMATTER.format(new Date(timestamp));
}

/** 把 ISO 日期字符串格式化为 `<time datetime>` 可用的值 */
export function toDateTimeAttribute(iso: string): string | undefined {
  const timestamp = Date.parse(iso);
  if (Number.isNaN(timestamp)) return undefined;
  return new Date(timestamp).toISOString();
}
