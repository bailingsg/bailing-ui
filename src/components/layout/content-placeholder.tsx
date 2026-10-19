import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { getI18n } from '@/i18n';
import { defaultLocale, type Locale } from '@/i18n/config';

/**
 * ContentPlaceholder —— 内容待补充占位块
 *
 * 用于框架阶段：区块结构已就位，但真实内容（产品图、工厂照片、证书、文章等）
 * 由业务方确认后补充。本组件不伪造任何企业数据或图片素材。
 */
export interface ContentPlaceholderProps {
  /** 占位标题（说明此处将展示什么） */
  title: string;
  /** 补充说明 */
  note?: string;
  /** 可选图标（内联 SVG，无外部素材） */
  icon?: ReactNode;
  /** 自定义最小高度类（默认 min-h-40） */
  minHeightClass?: string;
  className?: string;
  /** 当前语言（决定默认说明文案） */
  locale?: Locale;
}

function DefaultIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="size-9 opacity-60">
      <rect
        x="7"
        y="9"
        width="34"
        height="30"
        rx="3"
        className="stroke-border-strong"
        strokeWidth="1.5"
      />
      <path d="M7 31l9-8 7 6 6-5 12 9" className="stroke-border-strong" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="17" cy="18" r="2.4" className="stroke-border-strong" strokeWidth="1.5" />
    </svg>
  );
}

export function ContentPlaceholder({
  title,
  note,
  icon,
  minHeightClass = 'min-h-40',
  className,
  locale = defaultLocale,
}: ContentPlaceholderProps) {
  const { t } = getI18n(locale);
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border-strong bg-surface px-6 py-10 text-center',
        minHeightClass,
        className,
      )}
    >
      {icon ?? <DefaultIcon />}
      <p className="text-body font-medium text-text-secondary">{title}</p>
      <p className="text-caption text-text-muted">{note ?? t('placeholder.contentNote')}</p>
    </div>
  );
}
