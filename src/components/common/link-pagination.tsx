import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/link';
import { getI18n } from '@/i18n';
import { defaultLocale, type Locale } from '@/i18n/config';

/**
 * LinkPagination —— 通用链接式分页
 *
 * 无客户端状态：每页是一个真实 URL，利于 SEO 与静态缓存。
 * 由调用方通过 `buildHref` 决定链接形式（便于保留分类等查询条件）。
 * 单页时（totalPages <= 1）不渲染任何内容。
 */
export interface LinkPaginationProps {
  page: number;
  totalPages: number;
  /** 生成指定页码的链接地址 */
  buildHref: (page: number) => string;
  /** 无障碍标签（如 "Blog pagination"） */
  label?: string;
  className?: string;
  /** 当前语言 */
  locale?: Locale;
}

export function LinkPagination({
  page,
  totalPages,
  buildHref,
  label,
  className,
  locale = defaultLocale,
}: LinkPaginationProps) {
  if (totalPages <= 1) return null;

  const { t } = getI18n(locale);

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav
      aria-label={label ?? t('common.pagination')}
      className={cn(
        'mt-12 flex items-center justify-center gap-4 border-t border-border pt-8',
        className,
      )}
    >
      <Button asChild={hasPrev} variant="outline" size="sm" disabled={!hasPrev}>
        {hasPrev ? (
          <LocaleLink locale={locale} href={buildHref(page - 1)} rel="prev">
            {t('common.previous')}
          </LocaleLink>
        ) : (
          <span>{t('common.previous')}</span>
        )}
      </Button>

      <span className="text-small text-text-muted">
        {t('common.pageOf', { page, total: totalPages })}
      </span>

      <Button asChild={hasNext} variant="outline" size="sm" disabled={!hasNext}>
        {hasNext ? (
          <LocaleLink locale={locale} href={buildHref(page + 1)} rel="next">
            {t('common.next')}
          </LocaleLink>
        ) : (
          <span>{t('common.next')}</span>
        )}
      </Button>
    </nav>
  );
}
