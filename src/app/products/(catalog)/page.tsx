import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/page-hero';
import { Section, SectionHeader } from '@/components/layout/section';
import { ContentPlaceholder } from '@/components/layout/content-placeholder';
import { CtaBand } from '@/components/layout/cta-band';
import { ProductCard } from '@/components/common/product-card';
import { ProductFilter } from '@/components/products/product-filter';
import { ProductPagination } from '@/components/products/product-pagination';
import { DemoDataNotice } from '@/components/products/demo-data-notice';
import { Badge } from '@/components/ui/badge';
import { resolveSeoMetadata } from '@/lib/seo/resolver';
import { getCategories, getProducts, isDemoSource, type ProductListItem } from '@/lib/products';

/**
 * 产品列表页 /products
 *
 * 结构：PageHero → 分类筛选 → 产品网格 → 分页 → CTA
 * 数据来源见 @/lib/products（Phase 3.5 默认使用 Demo / Placeholder 数据）。
 *
 * 注：筛选通过查询参数（?category= / ?page=）实现，canonical 始终指向
 * /products，避免筛选组合产生重复内容。
 */
export async function generateMetadata(): Promise<Metadata> {
  return resolveSeoMetadata({
    title: 'Products',
    description:
      'Explore the wooden product range from Bailing Wooden — panels, components, packaging and custom OEM products for B2B buyers worldwide.',
    path: '/products',
    titleTemplateKey: 'product',
  });
}

const PAGE_SIZE = 12;

interface ProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function primaryImageUrl(product: ProductListItem): string | null {
  const primary = product.images.find((image) => image.isPrimary) ?? product.images[0];
  return primary?.url ?? null;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;

  const category = firstValue(params.category)?.trim() || undefined;
  const rawPage = Number(firstValue(params.page));
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;

  const [categories, result] = await Promise.all([
    getCategories(),
    getProducts({ category, page, pageSize: PAGE_SIZE }),
  ]);

  const activeCategory = categories.find((item) => item.slug === category);
  const showDemoNotice = isDemoSource();

  return (
    <>
      <PageHero
        eyebrow="Products"
        title="Wooden Products"
        titleZh="产品中心"
        description="Product categories, specifications and datasheets will be published here. Filtering and search are available below."
        aside={
          <div className="flex flex-wrap gap-2">
            <Badge variant="material">OEM / ODM</Badge>
            <Badge variant="eco">Sustainable Sourcing</Badge>
          </div>
        }
      />

      {/* 分类筛选 */}
      <Section size="sm" tone="surface">
        <div className="flex flex-col gap-4">
          {showDemoNotice ? <DemoDataNotice /> : null}
          <ProductFilter categories={categories} activeSlug={category} />
        </div>
      </Section>

      {/* 产品网格 */}
      <Section>
        <SectionHeader
          eyebrow="Catalog"
          title={activeCategory ? activeCategory.name : 'All products'}
          description={
            activeCategory?.description ??
            'Each product page presents a gallery, description, specifications, material and application details.'
          }
          action={
            <span className="text-small text-text-muted">
              {result.total} {result.total === 1 ? 'product' : 'products'}
            </span>
          }
        />

        {result.items.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {result.items.map((product) => (
              <ProductCard
                key={product.id}
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
                href={`/products/${product.slug}`}
                ctaLabel="View Details"
              />
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <ContentPlaceholder
              title={category ? 'No products in this category yet' : 'No products published yet'}
              note="Product data will be published from the CMS once available."
              minHeightClass="min-h-56"
            />
          </div>
        )}

        <ProductPagination page={result.page} totalPages={result.totalPages} category={category} />
      </Section>

      <CtaBand
        title="Cannot find the product you need?"
        description="Send us your specification or drawing — custom production is available for OEM and ODM projects."
        secondaryHref="/applications"
        secondaryLabel="View Applications"
      />
    </>
  );
}
