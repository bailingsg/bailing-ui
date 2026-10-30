import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/link';
import { getI18n } from '@/i18n';
import { defaultLocale, type Locale } from '@/i18n/config';

/**
 * ProductPagination —— 产品列表分页
 *
 * 链接式分页（保留 category / q 过滤条件），无客户端状态。
 * 单页时不渲染。
 */
export interface ProductPaginationProps {
  page: number;
  totalPages: number;
  category?: string;
  /** 当前搜索关键词（?q=），翻页时必须保留，否则第 2 页会退回全站列表 */
  query?: string;
  /** 当前语言 */
  locale?: Locale;
}

function buildHref(page: number, category?: string, query?: string): string {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (query) params.set('q', query);
  if (page > 1) params.set('page', String(page));
  const search = params.toString();
  return `/products${search ? `?${search}` : ''}`;
}

export function ProductPagination({
  page,
  totalPages,
  category,
  query,
  locale = defaultLocale,
}: ProductPaginationProps) {
  if (totalPages <= 1) return null;

  const { t } = getI18n(locale);

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav
      aria-label={t('common.pagination')}
      className="mt-12 flex items-center justify-center gap-4 border-t border-border pt-8"
    >
      <Button asChild={hasPrev} variant="outline" size="sm" disabled={!hasPrev}>
        {hasPrev ? (
          <LocaleLink locale={locale} href={buildHref(page - 1, category, query)} rel="prev">
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
          <LocaleLink locale={locale} href={buildHref(page + 1, category, query)} rel="next">
            {t('common.next')}
          </LocaleLink>
        ) : (
          <span>{t('common.next')}</span>
        )}
      </Button>
    </nav>
  );
}
