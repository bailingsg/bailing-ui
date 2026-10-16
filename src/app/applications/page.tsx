import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/layout/page-hero';
import { Section, SectionHeader } from '@/components/layout/section';
import { ContentPlaceholder } from '@/components/layout/content-placeholder';
import { CtaBand } from '@/components/layout/cta-band';
import { OptimizedImage } from '@/components/common/optimized-image';
import { ProductCard } from '@/components/common/product-card';
import { WebPageSchema } from '@/components/seo/web-page-schema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buildMetadata } from '@/lib/seo';
import { getApplications, hasAllApplicationImages, type Application } from '@/lib/applications';
import { getProductBySlug, type ProductListItem } from '@/lib/products';

/**
 * 应用场景 /applications
 *
 * 结构：PageHero → Application Categories（锚点索引）→ 5 个应用区块
 *      → Related Products → RFQ CTA
 *
 * 定位：SEO 流量入口。内容为**行业知识 + 板材应用说明**，
 * 不含客户案例、项目金额、合作品牌等无法验证的业绩信息。
 *
 * SEO：metadata（绝对标题）+ WebPage 结构化数据；禁止 Product schema。
 *
 * 未来扩展：数据层已为每个应用提供 slug 与 `getApplicationBySlug()`，
 * 启用 `/applications/[slug]` 详情路由时无需改动本文件与数据层。
 */

const META_DESCRIPTION =
  'Wood panel applications explained — furniture manufacturing, interior decoration, commercial fit-outs, door and cabinet production, packaging and custom solutions.';

export const metadata: Metadata = buildMetadata({
  title: 'Wood Applications | Furniture & Interior Solutions',
  absoluteTitle: true,
  description: META_DESCRIPTION,
  path: '/applications',
  keywords: [
    'wood panel applications',
    'MDF furniture manufacturing',
    'plywood interior decoration',
    'panel commercial fit-out',
    'door skin production',
    'wooden packaging crating',
  ],
});

/** 汇总所有应用关联的产品 slug（去重） */
function collectProductSlugs(items: Application[]): string[] {
  const slugs = new Set<string>();
  for (const item of items) {
    for (const slug of item.relatedProducts) slugs.add(slug);
  }
  return [...slugs];
}

/** 解析关联产品；未发布 / 不存在的 slug 自动跳过，不产生死链 */
async function resolveProducts(slugs: string[]): Promise<ProductListItem[]> {
  const resolved = await Promise.all(slugs.map((slug) => getProductBySlug(slug)));
  return resolved.filter((item): item is NonNullable<typeof item> => item !== null);
}

function primaryImageUrl(product: ProductListItem): string | null {
  const primary = product.images.find((image) => image.isPrimary) ?? product.images[0];
  return primary?.url ?? null;
}

/** 单个应用区块（图文左右交替） */
function ApplicationBlock({ application, index }: { application: Application; index: number }) {
  const reversed = index % 2 === 1;

  return (
    <div id={application.slug} className="scroll-mt-24">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
        <div className={reversed ? 'lg:order-2' : ''}>
          <div className="overflow-hidden rounded-lg border border-border">
            <OptimizedImage
              src={application.image}
              alt={application.imageAlt}
              aspectRatio="4/3"
              sizes="(min-width: 1024px) 50vw, 100vw"
              placeholderLabel="Photo to be added"
            />
          </div>
        </div>

        <div className={`flex flex-col gap-4 ${reversed ? 'lg:order-1' : ''}`}>
          <SectionHeader
            eyebrow={`Application ${String(index + 1).padStart(2, '0')}`}
            title={application.title}
            description={application.description}
          />
          <p className="text-body text-text-secondary text-pretty">{application.overview}</p>

          <div>
            <h3 className="text-caption font-semibold tracking-wider text-text-muted uppercase">
              Typical material &amp; specification directions
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              {application.highlights.map((item) => (
                <li key={item} className="flex gap-3 text-small text-text-secondary">
                  <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/products">Related Products</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/contact?product=${encodeURIComponent(application.slug)}#rfq`}>
                Request Quote
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ApplicationsPage() {
  const [items, allHaveImages] = await Promise.all([getApplications(), hasAllApplicationImages()]);
  const relatedProducts = await resolveProducts(collectProductSlugs(items));

  return (
    <>
      <PageHero
        eyebrow="Applications"
        title="Where Our Panels Are Used"
        titleZh="应用场景"
        description="From furniture lines to commercial fit-outs and export packaging — how wood-based panels are selected and used in each application."
        actions={
          <>
            <Button asChild size="lg">
              <Link href="/contact#rfq">Discuss Your Application</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/products">View Products</Link>
            </Button>
          </>
        }
        aside={
          <div className="flex flex-wrap gap-2">
            <Badge variant="application">Industry Knowledge</Badge>
            <Badge variant="material">Material Selection</Badge>
          </div>
        }
      />

      {/* Application Categories —— 锚点索引 */}
      <Section size="sm" tone="surface">
        <div className="flex flex-col gap-4">
          <span className="text-caption font-semibold tracking-wider text-text-muted uppercase">
            Application Categories
          </span>
          <nav aria-label="Application categories" className="flex flex-wrap gap-2">
            {items.map((item) => (
              <Link key={item.slug} href={`#${item.slug}`} className="outline-none">
                <Badge variant="outline" className="cursor-pointer transition-colors hover:border-primary">
                  {item.title}
                </Badge>
              </Link>
            ))}
          </nav>
          {!allHaveImages ? (
            <p className="text-caption text-text-muted">
              Some application photography is still being collected. Placeholders are shown instead of
              stock images.
            </p>
          ) : null}
        </div>
      </Section>

      {/* 各应用区块 */}
      {items.map((application, index) => (
        <Section key={application.slug} tone={index % 2 === 1 ? 'surface' : 'default'}>
          <ApplicationBlock application={application} index={index} />
        </Section>
      ))}

      {/* Related Products */}
      <Section tone="surface">
        <SectionHeader
          eyebrow="Related"
          title="Products used in these applications"
          description="The panel materials referenced above are part of the product catalogue."
          action={
            <Button asChild variant="outline">
              <Link href="/products">View All</Link>
            </Button>
          }
        />
        {relatedProducts.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {relatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                description={product.shortDescription ?? ''}
                imageSrc={primaryImageUrl(product)}
                imageAlt={product.images[0]?.altText ?? product.name}
                badges={
                  product.category
                    ? [{ label: product.category.name, variant: 'application' as const }]
                    : []
                }
                href={`/products/${product.slug}`}
                ctaLabel="View Details"
              />
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <ContentPlaceholder
              title="Related products pending publication"
              note="Product records linked to these applications are not published yet."
              minHeightClass="min-h-40"
            />
          </div>
        )}
      </Section>

      {/* RFQ CTA */}
      <CtaBand
        title="Tell us how the panel will be used"
        description="Share the application, the performance it needs and your destination — we will recommend a suitable specification."
        primaryLabel="Request Quote"
        secondaryHref="/contact#faq"
        secondaryLabel="Read FAQ"
      />

      {/* 结构化数据 */}
      <WebPageSchema
        name="Wood Applications | Furniture & Interior Solutions"
        description={META_DESCRIPTION}
        path="/applications"
      />
    </>
  );
}
