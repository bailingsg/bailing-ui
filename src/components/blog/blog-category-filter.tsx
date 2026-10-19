import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { LocaleLink } from '@/i18n/link';
import { getI18n } from '@/i18n';
import { defaultLocale, type Locale } from '@/i18n/config';
import type { BlogCategorySlug, BlogCategoryWithCount } from '@/lib/blog';

/**
 * BlogCategoryFilter —— 文章分类筛选器
 *
 * 分类体系完全由数据驱动（`@/lib/blog` 的分类清单），代码中不写死。
 * 采用链接式筛选（`?category=slug`），无需客户端状态，利于 SEO 与静态缓存。
 * 分类为空时不渲染任何内容（允许空数据）。
 */
export interface BlogCategoryFilterProps {
  categories: BlogCategoryWithCount[];
  /** 当前选中的分类 slug */
  activeSlug?: BlogCategorySlug;
  className?: string;
  /** 当前语言 */
  locale?: Locale;
}

function buildHref(slug?: BlogCategorySlug): string {
  return slug ? `/blog?category=${encodeURIComponent(slug)}` : '/blog';
}

export function BlogCategoryFilter({
  categories,
  activeSlug,
  className,
  locale = defaultLocale,
}: BlogCategoryFilterProps) {
  if (categories.length === 0) return null;

  const { t } = getI18n(locale);

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="mr-1 text-caption font-semibold tracking-wider text-text-muted uppercase">
        {t('blog.filterLabel')}
      </span>

      <LocaleLink
        locale={locale}
        href={buildHref()}
        aria-current={!activeSlug ? 'page' : undefined}
        className="outline-none"
      >
        <Badge
          variant={!activeSlug ? 'default' : 'outline'}
          className={cn(
            'cursor-pointer transition-colors',
            !activeSlug ? '' : 'hover:border-primary hover:text-foreground',
          )}
        >
          {t('common.all')}
        </Badge>
      </LocaleLink>

      {categories.map((category) => {
        const active = category.slug === activeSlug;
        return (
          <LocaleLink
            key={category.slug}
            locale={locale}
            href={buildHref(category.slug)}
            aria-current={active ? 'page' : undefined}
            className="outline-none"
          >
            <Badge
              variant={active ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer transition-colors',
                active ? '' : 'hover:border-primary hover:text-foreground',
              )}
            >
              {category.name}
              <span className="ml-1 text-caption opacity-70">{category.count}</span>
            </Badge>
          </LocaleLink>
        );
      })}
    </div>
  );
}
