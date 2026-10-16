import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * ProductPagination —— 产品列表分页
 *
 * 链接式分页（保留 category 过滤条件），无客户端状态。
 * 单页时不渲染。
 */
export interface ProductPaginationProps {
  page: number;
  totalPages: number;
  category?: string;
}

function buildHref(page: number, category?: string): string {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (page > 1) params.set('page', String(page));
  const search = params.toString();
  return `/products${search ? `?${search}` : ''}`;
}

export function ProductPagination({ page, totalPages, category }: ProductPaginationProps) {
  if (totalPages <= 1) return null;

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav
      aria-label="Pagination"
      className="mt-12 flex items-center justify-center gap-4 border-t border-border pt-8"
    >
      <Button asChild={hasPrev} variant="outline" size="sm" disabled={!hasPrev}>
        {hasPrev ? (
          <Link href={buildHref(page - 1, category)} rel="prev">
            Previous
          </Link>
        ) : (
          <span>Previous</span>
        )}
      </Button>

      <span className="text-small text-text-muted">
        Page {page} of {totalPages}
      </span>

      <Button asChild={hasNext} variant="outline" size="sm" disabled={!hasNext}>
        {hasNext ? (
          <Link href={buildHref(page + 1, category)} rel="next">
            Next
          </Link>
        ) : (
          <span>Next</span>
        )}
      </Button>
    </nav>
  );
}
