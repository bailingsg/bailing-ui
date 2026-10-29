import { getI18n } from '@/i18n';
import { defaultLocale, type Locale } from '@/i18n/config';

/**
 * ContentFallbackNotice —— 业务内容缺少对应语言版本时的显式提示
 *
 * 背景：产品、文章、应用场景等业务内容由后端 CMS 提供，当前数据模型只有
 * 单语言（英文）字段。中文界面下这些正文仍以英文原文呈现 —— 我们**不**
 * 用机器翻译或占位文案覆盖业务事实（规格、材质、认证等）。
 *
 * 该提示只出现在中文界面，英文界面不渲染，避免打扰主要访客。
 */
export interface ContentFallbackNoticeProps {
  locale: Locale;
  /** banner：独立提示条；subtle：一行小字（用于首屏，避免压过主视觉） */
  variant?: 'banner' | 'subtle';
  /**
   * 配色语境（2026-10-29 加）：默认深色字配浅底；
   * onDark 用于压在照片/深色区块上的场景（如首页 hero），否则深灰字会读不清。
   */
  tone?: 'default' | 'onDark';
  className?: string;
}

export function ContentFallbackNotice({
  locale,
  variant = 'banner',
  tone = 'default',
  className,
}: ContentFallbackNoticeProps) {
  if (locale === defaultLocale) return null;

  const { t } = getI18n(locale);

  if (variant === 'subtle') {
    const onDark = tone === 'onDark';
    return (
      <p
        role="note"
        lang="en"
        className={[
          'text-caption',
          onDark ? 'text-white/70' : 'text-text-muted',
          className ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className={onDark ? 'font-medium text-white/90' : 'font-medium text-text-secondary'}>
          {t('contentFallback.badge')}：
        </span>
        {t('contentFallback.notice')}
      </p>
    );
  }

  return (
    <div
      role="note"
      className={[
        'flex flex-col gap-1 rounded-lg border border-border bg-surface px-4 py-3 sm:flex-row sm:items-start sm:gap-3',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="w-fit shrink-0 rounded-sm bg-accent px-2 py-0.5 text-caption font-medium text-accent-foreground">
        {t('contentFallback.badge')}
      </span>
      <p className="text-caption text-text-secondary">{t('contentFallback.notice')}</p>
    </div>
  );
}
