import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/container';
import { Section, SectionHeader } from '@/components/layout/section';
import { ContentPlaceholder } from '@/components/layout/content-placeholder';
import { CtaBand } from '@/components/layout/cta-band';
import { OptimizedImage } from '@/components/common/optimized-image';
import { ProductCard } from '@/components/common/product-card';
import { WebPageSchema } from '@/components/seo/web-page-schema';
import { BreadcrumbSchema } from '@/components/seo/breadcrumb-schema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buildMetadata } from '@/lib/seo';
import { getApplicationBySlug, getApplicationSlugs } from '@/lib/applications';
import { getProductBySlug, type ProductListItem } from '@/lib/products';

/**
 * 应用场景详情 /applications/[slug]（Phase 4.8 新增）
 *
 * 数据层（getApplicationBySlug / getApplicationSlugs）自 Phase 4.7 起已就绪，
 * 本页只负责路由与呈现，不新增任何数据接口。
 *
 * 结构：Breadcrumb → Hero（标题 / 概述 / 封面）→ 展开说明 → 关联产品
 *      → RFQ CTA。不含客户案例、项目金额、合作品牌等无法验证的信息。
 *
 * SEO：CMS 的 seoTitle / seoDescription 优先，缺失时回退到「标题 + 概述」
 * 程序默认值（**绝不输出 undefined / null**）；canonical 指向本页；
 * 输出 WebPage 与 BreadcrumbList 结构化数据（明确**不输出** Product schema）。
 *
 * 404 策略：与产品 / 博客详情一致 —— 允许按需生成（dynamicParams = true），
 * 未发布（Draft / Archived）或已删除的 slug 由 notFound() 返回**真正的 404**。
 * （Phase 4.8 修正：`dynamicParams = false` 会让缓存失效后整页 404，详见产品详情页注释。）
 */

interface ApplicationDetailPageProps {
  params: Promise<{ slug: string }>;
}

/** 预渲染已知应用场景；未登记的 slug 直接 404 */
export async function generateStaticParams() {
  const slugs = await getApplicationSlugs();
  return slugs.map((slug) => ({ slug }));
}

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: ApplicationDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const application = await getApplicationBySlug(slug);

  if (!application) {
    return {
      title: 'Application Not Found',
      description: 'The requested application could not be found.',
      robots: { index: false, follow: false },
    };
  }

  // SEO 优先用 CMS 覆盖值；缺失时回退到标题 / 概述（保证永远有真实文案）
  const title = application.seo?.title?.trim() || application.title;
  const description =
    application.seo?.description?.trim() ||
    application.description ||
    application.overview ||
    application.title;

  return buildMetadata({
    title,
    description,
    path: `/applications/${application.slug}`,
    keywords: ['wood panel application', application.title],
    ogImage: application.image ?? undefined,
    ogImageAlt: application.imageAlt,
  });
}

function primaryImageUrl(product: ProductListItem): string | null {
  const primary = product.images.find((image) => image.isPrimary) ?? product.images[0];
  return primary?.url ?? null;
}

/** 解析关联产品；未发布 / 不存在的 slug 自动跳过，不产生死链 */
async function resolveProducts(slugs: string[]): Promise<ProductListItem[]> {
  const resolved = await Promise.all(slugs.map((slug) => getProductBySlug(slug)));
  return resolved.filter((item): item is NonNullable<typeof item> => item !== null);
}

export default async function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  const { slug } = await params;
  const application = await getApplicationBySlug(slug);

  if (!application) notFound();

  const relatedProducts = await resolveProducts(application.relatedProducts);

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Applications', path: '/applications' },
    { name: application.title, path: `/applications/${application.slug}` },
  ];

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-surface">
        <Container className="py-10 sm:py-14">
          {/* 面包屑（与 BreadcrumbList 结构化数据一致） */}
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-caption">
            <Link href="/" className="text-text-muted transition-colors hover:text-foreground">
              Home
            </Link>
            <span aria-hidden="true" className="text-text-muted">
              /
            </span>
            <Link
              href="/applications"
              className="text-text-muted transition-colors hover:text-foreground"
            >
              Applications
            </Link>
            <span aria-hidden="true" className="text-text-muted">
              /
            </span>
            <span className="text-foreground">{application.title}</span>
          </nav>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
            <div className="flex flex-col gap-5">
              <Badge variant="application" className="w-fit">
                Application
              </Badge>
              <h1 className="text-balance">{application.title}</h1>
              {application.description ? (
                <p className="text-body-lg text-text-secondary text-pretty">
                  {application.description}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href={`/contact?product=${encodeURIComponent(application.slug)}#rfq`}>
                    Request Quote
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/applications">All Applications</Link>
                </Button>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-border">
              <OptimizedImage
                src={application.image}
                alt={application.imageAlt}
                aspectRatio="4/3"
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                placeholderLabel="Photo to be added"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Overview */}
      <Section>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionHeader eyebrow="Overview" title={`${application.title} explained`} />
            <p className="mt-6 whitespace-pre-line text-body text-text-secondary text-pretty">
              {application.overview || application.description}
            </p>
          </div>

          <aside className="lg:col-span-1">
            <h2 className="text-heading-sm">At a glance</h2>
            <dl className="mt-4 flex flex-col">
              <div className="flex flex-col gap-1 border-b border-border py-3 sm:flex-row sm:gap-6">
                <dt className="w-full text-small font-medium text-text-secondary sm:w-32 sm:shrink-0">
                  Category
                </dt>
                <dd className="text-small text-foreground">Panel application</dd>
              </div>
              <div className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-6">
                <dt className="w-full text-small font-medium text-text-secondary sm:w-32 sm:shrink-0">
                  Materials
                </dt>
                <dd className="text-small text-foreground">
                  {application.highlights.length > 0
                    ? `${application.highlights.length} specification directions`
                    : 'To be confirmed'}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </Section>

      {/* Highlights（仅在 CMS 提供时展示；demo 模式无该字段，不虚构条目） */}
      {application.highlights.length > 0 ? (
        <Section tone="surface">
          <SectionHeader
            eyebrow="Specification"
            title="Typical material & specification directions"
            description="General technical directions for this application — not customer project data."
          />
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {application.highlights.map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-lg border border-border bg-surface-elevated p-5 text-small text-text-secondary"
              >
                <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* Related Products */}
      <Section tone={application.highlights.length > 0 ? 'default' : 'surface'}>
        <SectionHeader
          eyebrow="Related"
          title="Products used in this application"
          description="Panel materials from the catalogue that fit this application."
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
              note="Product records linked to this application are not published yet."
              minHeightClass="min-h-40"
            />
          </div>
        )}
      </Section>

      <CtaBand
        title="Discuss your application"
        description="Tell us how the panel will be used and what it needs to withstand — our export team will advise on the right specification."
        primaryLabel="Request Quote"
        secondaryHref="/applications"
        secondaryLabel="All Applications"
      />

      {/* 结构化数据 */}
      <WebPageSchema
        name={application.title}
        description={application.seo?.description ?? application.description}
        path={`/applications/${application.slug}`}
      />
      <BreadcrumbSchema items={breadcrumbs} />
    </>
  );
}
