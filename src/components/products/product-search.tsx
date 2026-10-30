import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getI18n } from '@/i18n';
import { defaultLocale, type Locale } from '@/i18n/config';
import { localizedPath } from '@/i18n/paths';

/**
 * ProductSearch —— 产品关键词搜索框
 *
 * 2026-10-30 新增：对比报告指出产品列表「客户想直接搜 melamine MDF 搜不了」。
 *
 * 实现方式是**原生 GET 表单**（`?q=`），不做客户端状态：
 *   · 搜索结果是一个真实可分享、可收录的 URL；
 *   · 无需 JS 也能用，服务端直接按关键词查询后端（search 参数）；
 *   · 与分类筛选叠加：当前分类作为隐藏字段一起提交，搜索不会丢掉筛选条件。
 *
 * 空提交（只输空格）直接回到不带 q 的列表页，避免出现「搜了个空格、全站清空」。
 */
export interface ProductSearchProps {
  locale?: Locale;
  /** 当前关键词（来自 ?q=） */
  query?: string;
  /** 当前分类 slug（来自 ?category=），搜索时保留 */
  category?: string;
  className?: string;
}

export function ProductSearch({
  locale = defaultLocale,
  query,
  category,
  className,
}: ProductSearchProps) {
  const { t } = getI18n(locale);
  const action = localizedPath('/products', locale);
  // 清空按钮回到「当前分类」的列表，而不是全站列表
  const clearHref = localizedPath(
    category ? `/products?category=${encodeURIComponent(category)}` : '/products',
    locale,
  );

  return (
    <form action={action} method="get" role="search" className={cn('flex w-full gap-2', className)}>
      {category ? <input type="hidden" name="category" value={category} /> : null}
      <label htmlFor="product-search" className="sr-only">
        {t('products.searchLabel')}
      </label>
      <div className="relative flex-1">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted"
        />
        <input
          id="product-search"
          type="search"
          name="q"
          defaultValue={query ?? ''}
          placeholder={t('products.searchPlaceholder')}
          autoComplete="off"
          className="h-10 w-full rounded-md border border-border bg-surface-elevated pr-3 pl-9 text-small text-foreground placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="h-10 shrink-0 rounded-md bg-primary px-4 text-small font-medium text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
      >
        {t('products.searchButton')}
      </button>
      {query ? (
        <a
          href={clearHref}
          className="inline-flex h-10 shrink-0 items-center gap-1 rounded-md border border-border px-3 text-small text-text-secondary transition-colors hover:border-primary hover:text-foreground"
        >
          <X aria-hidden="true" className="size-3.5" />
          {t('products.searchClear')}
        </a>
      ) : null}
    </form>
  );
}
