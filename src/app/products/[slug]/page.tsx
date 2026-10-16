import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/container';
import { Section, SectionHeader } from '@/components/layout/section';
import { ContentPlaceholder } from '@/components/layout/content-placeholder';
import { CtaBand } from '@/components/layout/cta-band';
import { ProductCard } from '@/components/common/product-card';
import { ProductGallery } from '@/components/products/product-gallery';
import { ProductSchema } from '@/components/products/product-schema';
import { BreadcrumbSchema } from '@/components/seo/breadcrumb-schema';
import { DemoDataNotice } from '@/components/products/demo-data-notice';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { resolveSeoMetadata } from '@/lib/seo/resolver';
import {
  getProductBySlug,
  getProducts,
  getProductSlugs,
  isDemoSource,
  type ProductDetail,
  type ProductListItem,
} from '@/lib/products';

/**
 * 产品详情页 /products/[slug]
 *
 * 结构：Product Hero（Gallery + Info + Request Quote）→ Description →
 * Specifications → Material & Applications → CTA → Related Products。
 *
 * SEO：动态 metadata（title/description/canonical）+ Product JSON-LD。
 */

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

/** 预渲染已知产品；未列出的 slug 直接返回 404 */
export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

/**
 * 允许按需生成未预渲染的 slug（`dynamicParams = true`）。
 *
 * Phase 4.8 修正：此前设为 `false` 会导致**缓存失效后整页 404**。
 * 机制：`dynamicParams = false` 会把该路由标记为 `fallback: NOT_FOUND`；
 * 一旦缓存条目被 `revalidateTag` / `revalidatePath` / 过期时间失效，
 * 路由模块拿不到 previousCacheEntry，fallbackMode 仍为 NOT_FOUND，
 * 于是抛出 Next 内部 `NoFallbackError` → 整个详情页返回 404，
 * 并且这个 404 会被写进 route-cache 长期生效。
 * 结果就是「CMS 一改产品，前台所有产品详情页集体 404」——与
 * 「发布即刷新」的核心目标完全相反。
 *
 * 改为 `true` 后：
 *   · 预渲染仍由 generateStaticParams 完成（首屏性能不变）；
 *   · 缓存失效时按需重新生成，内容即时更新；
 *   · 未发布（Draft / Archived）/ 已删除 / 不存在的 slug 依旧由
 *     `notFound()` 返回**真正的 HTTP 404**——Next 15 会把渲染期
 *     `metadata.statusCode` 存入 route-cache，读取时用
 *     `res.statusCode = cachedData.status` 原样回放，不再是旧版本的「软 404」。
 */
export const dynamicParams = true;

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
      robots: { index: false, follow: false },
    };
  }

  const primary = product.images.find((image) => image.isPrimary) ?? product.images[0];

  return resolveSeoMetadata({
    title: product.seo.title,
    description: product.seo.description ?? product.shortDescription ?? product.name,
    path: `/products/${product.slug}`,
    titleTemplateKey: 'product',
    ogImage: primary?.url ?? undefined,
    ogImageAlt: primary?.altText ?? product.name,
  });
}

function primaryImageUrl(product: ProductListItem): string | null {
  const primary = product.images.find((image) => image.isPrimary) ?? product.images[0];
  return primary?.url ?? null;
}

/** 相关产品：优先同分类，数量不足时用其它产品补齐 */
async function getRelatedProducts(product: ProductDetail, limit = 4): Promise<ProductListItem[]> {
  const sameCategory = await getProducts({
    category: product.category?.slug,
    pageSize: limit + 1,
  });

  const pool = sameCategory.items.filter((item) => item.slug !== product.slug);
  if (pool.length >= limit) return pool.slice(0, limit);

  const fallback = await getProducts({ pageSize: limit + 1 });
  const merged = [...pool];
  for (const item of fallback.items) {
    if (item.slug === product.slug) continue;
    if (merged.some((existing) => existing.slug === item.slug)) continue;
    merged.push(item);
    if (merged.length >= limit) break;
  }
  return merged;
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-3 last:border-b-0 sm:flex-row sm:gap-6">
      <dt className="w-full text-small font-medium text-text-secondary sm:w-40 sm:shrink-0">{label}</dt>
      <dd className="text-small text-foreground">{value}</dd>
    </div>
  );
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const related = await getRelatedProducts(product);
  const specificationEntries = product.specifications
    ? Object.entries(product.specifications)
    : [];

  return (
    <>
      {/* Product Hero */}
      <section className="border-b border-border bg-surface">
        <Container className="py-10 sm:py-14">
          {/* 面包屑 */}
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-caption">
            <Link
              href="/"
              className="text-text-muted transition-colors hover:text-foreground"
            >
              Home
            </Link>
            <span aria-hidden="true" className="text-text-muted">
              /
            </span>
            <Link
              href="/products"
              className="text-text-muted transition-colors hover:text-foreground"
            >
              Products
            </Link>
            <span aria-hidden="true" className="text-text-muted">
              /
            </span>
            <span className="text-foreground">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Gallery */}
            <ProductGallery images={product.images} alt={product.name} />

            {/* Info */}
            <div className="flex flex-col gap-5">
              {product.category ? (
                <Link href={`/products?category=${encodeURIComponent(product.category.slug)}`} className="w-fit">
                  <Badge variant="application" className="cursor-pointer">
                    {product.category.name}
                  </Badge>
                </Link>
              ) : null}

              <div className="flex flex-col gap-3">
                <h1 className="text-balance">{product.name}</h1>
                {product.shortDescription ? (
                  <p className="text-body-lg text-text-secondary text-pretty">
                    {product.shortDescription}
                  </p>
                ) : null}
              </div>

              {/* 关键属性（未配置时不展示，不编造） */}
              {product.material || product.application ? (
                <dl className="flex flex-col gap-3 border-y border-border py-4">
                  {product.material ? (
                    <div className="flex gap-3">
                      <dt className="w-32 shrink-0 text-small font-medium text-text-muted">Material</dt>
                      <dd className="text-small text-foreground">{product.material}</dd>
                    </div>
                  ) : null}
                  {product.application ? (
                    <div className="flex gap-3">
                      <dt className="w-32 shrink-0 text-small font-medium text-text-muted">
                        Application
                      </dt>
                      <dd className="text-small text-foreground">{product.application}</dd>
                    </div>
                  ) : null}
                </dl>
              ) : null}

              {isDemoSource() ? <DemoDataNotice /> : null}

              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href={`/contact?product=${encodeURIComponent(product.slug)}#rfq`}>
                    Request Quote
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/products">Back to Products</Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Description */}
      <Section>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionHeader eyebrow="Overview" title="Product description" />
            <p className="mt-6 whitespace-pre-line text-body text-text-secondary text-pretty">
              {product.description}
            </p>
          </div>

          <aside className="lg:col-span-1">
            <h2 className="text-heading-sm">At a glance</h2>
            <dl className="mt-4 flex flex-col">
              <SpecRow label="Category" value={product.category?.name ?? '—'} />
              <SpecRow label="Material" value={product.material ?? '—'} />
              <SpecRow label="Application" value={product.application ?? '—'} />
            </dl>
          </aside>
        </div>
      </Section>

      {/* Specifications */}
      <Section tone="surface">
        <SectionHeader
          eyebrow="Specifications"
          title="Technical specifications"
          description="Specification values are maintained in the product catalog. Unconfirmed values are intentionally left blank."
        />
        <div className="mt-8">
          {specificationEntries.length > 0 ? (
            <dl className="max-w-3xl rounded-lg border border-border bg-surface-elevated px-5 py-2 sm:px-6">
              {specificationEntries.map(([label, value]) => (
                <SpecRow key={label} label={label} value={value} />
              ))}
            </dl>
          ) : (
            <ContentPlaceholder
              title="Specifications to be confirmed"
              note="No specification data has been provided for this product yet."
              minHeightClass="min-h-40"
            />
          )}
        </div>
      </Section>

      {/* Material & Applications */}
      <Section>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface-elevated p-6">
            <h2 className="text-heading-sm">Material</h2>
            {product.material ? (
              <p className="text-small text-text-secondary">{product.material}</p>
            ) : (
              <p className="text-small text-text-muted">
                Material information will be published once confirmed.
              </p>
            )}
          </div>
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface-elevated p-6">
            <h2 className="text-heading-sm">Applications</h2>
            {product.application ? (
              <p className="text-small text-text-secondary">{product.application}</p>
            ) : (
              <p className="text-small text-text-muted">
                Application information will be published once confirmed.
              </p>
            )}
          </div>
        </div>
      </Section>

      {/* Related Products */}
      <Section tone="surface">
        <SectionHeader
          eyebrow="Related"
          title="Related products"
          description="Other products from the catalog you may be interested in."
          action={
            <Button asChild variant="outline">
              <Link href="/products">View All</Link>
            </Button>
          }
        />
        {related.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {related.map((item) => (
              <ProductCard
                key={item.id}
                name={item.name}
                description={item.shortDescription ?? ''}
                imageSrc={primaryImageUrl(item)}
                imageAlt={item.images[0]?.altText ?? item.name}
                badges={
                  item.category
                    ? [{ label: item.category.name, variant: 'application' as const }]
                    : []
                }
                href={`/products/${item.slug}`}
                ctaLabel="View Details"
              />
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <ContentPlaceholder
              title="No related products yet"
              note="Related products appear once more catalog items are published."
              minHeightClass="min-h-40"
            />
          </div>
        )}
      </Section>

      <CtaBand
        title="Request a quotation for this product"
        description="Send your specification, quantity and destination port — our export team will respond with a quotation."
        primaryLabel="Request Quote"
        secondaryHref="/products"
        secondaryLabel="Browse Products"
      />

      {/* 结构化数据 */}
      <ProductSchema product={product} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', path: '/' },
          { name: 'Products', path: '/products' },
          { name: product.name, path: `/products/${product.slug}` },
        ]}
      />
    </>
  );
}
