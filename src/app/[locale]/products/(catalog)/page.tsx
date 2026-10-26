import type { Metadata } from 'next';
import { BookOpen } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';
import { Section, SectionHeader } from '@/components/layout/section';
import { ContentPlaceholder } from '@/components/layout/content-placeholder';
import { CtaBand } from '@/components/layout/cta-band';
import { ProductCard } from '@/components/common/product-card';
import { ProductFilter } from '@/components/products/product-filter';
import { ProductPagination } from '@/components/products/product-pagination';
import { DemoDataNotice } from '@/components/products/demo-data-notice';
import { ContentFallbackNotice } from '@/components/common/content-fallback-notice';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { resolveSeoMetadata } from '@/lib/seo/resolver';
import { CATALOG_VIEWER_PATH } from '@/lib/catalog';
import { getCategories, getProducts, isDemoSource, productDetailPath, type ProductListItem } from '@/lib/products';
import { getI18n } from '@/i18n';
import { defaultLocale, isLocale, type Locale } from '@/i18n/config';

/**
 * 产品列表页 /products（中文：/zh-CN/products）
 *
 * 结构：PageHero → 分类筛选 → 产品网格 → 分页 → CTA
 * 数据来源见 @/lib/products（Phase 3.5 默认使用 Demo / Placeholder 数据）。
 *
 * 注：筛选通过查询参数（?category= / ?page=）实现，canonical 始终指向
 * 本语言的 /products，避免筛选组合产生重复内容。
 */
interface ProductsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function resolveLocale(rawLocale: string): Locale {
  return isLocale(rawLocale) ? rawLocale : defaultLocale;
}

export async function generateMetadata({ params }: ProductsPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const { m } = getI18n(locale);

  return resolveSeoMetadata({
    title: m.products.metaTitle,
    description: m.products.metaDescription,
    path: '/products',
    titleTemplateKey: 'product',
    locale,
  });
}

const PAGE_SIZE = 12;

function firstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function primaryImageUrl(product: ProductListItem): string | null {
  const primary = product.images.find((image) => image.isPrimary) ?? product.images[0];
  return primary?.url ?? null;
}

export default async function ProductsPage({ params, searchParams }: ProductsPageProps) {
  const [{ locale: rawLocale }, query] = await Promise.all([params, searchParams]);
  const locale = resolveLocale(rawLocale);
  const { t, m } = getI18n(locale);

  const category = firstValue(query.category)?.trim() || undefined;
  const rawPage = Number(firstValue(query.page));
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;

  const [categories, result] = await Promise.all([
    getCategories(),
    getProducts({ category, page, pageSize: PAGE_SIZE }),
  ]);

  /**
   * 筛选器只列「有已发布产品」的分类（与首页分类卡片同一口径）。
   *
   * 后端 productCount 即已发布产品数，为 0 的分类点进去只会得到空列表，
   * 因此不放进筛选器；但 `?category=` 直链仍按**全量**分类解析——
   * 老链接 / 已收藏链接依然得到"该分类暂无产品"的明确空态，而不是 404。
   */
  const filterCategories = categories.filter((item) => (item.productCount ?? 0) > 0);

  const activeCategory = categories.find((item) => item.slug === category);
  const showDemoNotice = isDemoSource();

  return (
    <>
      <PageHero
        eyebrow={m.products.eyebrow}
        title={m.products.title}
        subtitle={m.products.subtitle}
        description={m.products.description}
        actions={
          /* 产品图册入口：新窗口打开 /catalog（独立浏览页，见 src/app/catalog） */
          <Button asChild size="lg" variant="outline">
            <a href={CATALOG_VIEWER_PATH} target="_blank" rel="noopener noreferrer">
              <BookOpen aria-hidden="true" />
              {t('common.viewCatalog')}
            </a>
          </Button>
        }
        aside={
          <div className="flex flex-wrap gap-2">
            <Badge variant="material">{m.products.badgeOem}</Badge>
            <Badge variant="eco">{m.products.badgeSourcing}</Badge>
          </div>
        }
      />

      {/* 分类筛选 */}
      <Section size="sm" tone="surface">
        <div className="flex flex-col gap-4">
          {showDemoNotice ? <DemoDataNotice locale={locale} /> : null}
          <ProductFilter categories={filterCategories} activeSlug={category} locale={locale} />
        </div>
      </Section>

      {/* 产品网格 */}
      <Section>
        <SectionHeader
          eyebrow={m.products.catalogEyebrow}
          title={activeCategory ? activeCategory.name : m.products.allProducts}
          description={activeCategory?.description ?? m.products.allProductsDescription}
          action={
            <span className="text-small text-text-muted">
              {result.total === 1
                ? t('common.countProductOne', { count: result.total })
                : t('common.countProducts', { count: result.total })}
            </span>
          }
        />

        {result.items.length > 0 ? (
          <>
            <ContentFallbackNotice locale={locale} className="mt-6" />
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {result.items.map((product) => (
                <ProductCard
                  key={product.id}
                  locale={locale}
                  name={product.name}
                  description={product.shortDescription ?? ''}
                  imageSrc={primaryImageUrl(product)}
                  imageAlt={product.images[0]?.altText ?? product.name}
                  badges={[
                    ...(product.category
                      ? [{ label: product.category.name, variant: 'application' as const }]
                      : []),
                    ...(product.material
                      ? [{ label: product.material, variant: 'material' as const }]
                      : []),
                  ]}
                  href={productDetailPath(product)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="mt-10">
            <ContentPlaceholder
              locale={locale}
              title={
                category ? m.products.emptyCategoryTitle : m.products.emptyTitle
              }
              note={m.products.emptyNote}
              minHeightClass="min-h-56"
            />
          </div>
        )}

        <ProductPagination
          page={result.page}
          totalPages={result.totalPages}
          category={category}
          locale={locale}
        />
      </Section>

      <CtaBand
        locale={locale}
        title={m.products.ctaTitle}
        description={m.products.ctaDescription}
        secondaryHref="/applications"
        secondaryLabel={t('common.viewApplications')}
      />
    </>
  );
}
