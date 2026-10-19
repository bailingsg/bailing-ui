import { Badge } from '@/components/ui/badge';
import { getI18n } from '@/i18n';
import { defaultLocale, type Locale } from '@/i18n/config';

/**
 * DemoDataNotice —— Demo / Placeholder 数据提示条
 *
 * 当产品数据源为内置 Demo 数据时展示，明确告知访客与验收方：
 * 当前内容为占位数据，产品信息以 CMS 上线后的正式内容为准。
 */
export function DemoDataNotice({
  className,
  locale = defaultLocale,
}: {
  className?: string;
  locale?: Locale;
}) {
  const { t } = getI18n(locale);
  return (
    <div
      role="note"
      className={[
        'flex flex-col gap-1 rounded-lg border border-border-brand bg-surface-brand px-4 py-3 sm:flex-row sm:items-center sm:gap-3',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Badge variant="material" className="w-fit">
        {t('products.demoBadge')}
      </Badge>
      <p className="text-caption text-text-secondary">{t('products.demoText')}</p>
    </div>
  );
}
