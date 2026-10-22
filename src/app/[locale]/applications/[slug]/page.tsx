import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/container';
import { Section, SectionHeader } from '@/components/layout/section';
import { ContentPlaceholder } from '@/components/layout/content-placeholder';
import { CtaBand } from '@/components/layout/cta-band';
import { OptimizedImage } from '@/components/common/optimized-image';
import { ProductCard } from '@/components/common/product-card';
import { WebPageSchema } from '@/components/seo/web-page-schema';
import { BreadcrumbSchema } from '@/components/seo/breadcrumb-schema';
import { ContentFallbackNotice } from '@/components/common/content-fallback-notice';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { resolveSeoMetadata } from '@/lib/seo/resolver';
import { LocaleLink } from '@/i18n/link';
import { getI18n } from '@/i18n';
import { defaultLocale, isLocale, type Locale } from '@/i18n/config';
import { localizedPath } from '@/i18n/paths';
import { getApplicationBySlug, getApplicationSlugs } from '@/lib/applications';
import { getProductBySlug, productDetailPath, type ProductListItem } from '@/lib/products';

/**
 * 应用场景详情 /applications/[slug]（中文：/zh-CN/applications/[slug]）
 *
 * 结构：Breadcrumb → Hero（标题 / 概述 / 封面）→ 展开说明 → 关联产品
 *      → RFQ CTA。不含客户案例、项目金额、合作品牌等无法验证的信息。
 *
 * 语言：面包屑、标签、按钮、侧栏与 CTA 文案随语言切换；
 * 应用条目的标题 / 概述 / 亮点属于 CMS 业务内容（单语言），
 * 中文界面按原文展示并给出明确提示，不伪造译文。
 *
 * SEO：CMS 的 seoTitle / seoDescription 优先，缺失时回退到「标题 + 概述」
 * 程序默认值（**绝不输出 undefined / null**）；canonical 按语言区分；
 * 输出 WebPage 与 BreadcrumbList 结构化数据（明确**不输出** Product schema）。
 *
 * 404 策略：与产品 / 博客详情一致 —— 允许按需生成（dynamicParams = true），
 * 未发布（Draft / Archived）或已删除的 slug 由 notFound() 返回**真正的 404**。
 */

interface ApplicationDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

function resolveLocale(rawLocale: string): Locale {
  return isLocale(rawLocale) ? rawLocale : defaultLocale;
}

/** 预渲染已知应用场景；未登记的 slug 按需生成后 404 */
export async function generateStaticParams() {
  const slugs = await getApplicationSlugs();
  return slugs.map((slug) => ({ slug }));
}

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: ApplicationDetailPageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const { m } = getI18n(locale);
  const application = await getApplicationBySlug(slug);

  if (!application) {
    return {
      title: m.applicationDetail.notFoundTitle,
      description: m.applicationDetail.notFoundDescription,
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

  return resolveSeoMetadata({
    title,
    description,
    path: `/applications/${application.slug}`,
    locale,
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
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const { t, m } = getI18n(locale);

  const application = await getApplicationBySlug(slug);
  if (!application) notFound();

  const relatedProducts = await resolveProducts(application.relatedProducts);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-surface">
        <Container className="py-10 sm:py-14">
          {/* 面包屑（与 BreadcrumbList 结构化数据一致） */}
          <nav aria-label={t('common.breadcrumb')} className="mb-6 flex flex-wrap items-center gap-2 text-caption">
            <LocaleLink
              locale={locale}
              href="/"
              className="text-text-muted transition-colors hover:text-foreground"
            >
              {t('common.home')}
            </LocaleLink>
            <span aria-hidden="true" className="text-text-muted">
              /
            </span>
            <LocaleLink
              locale={locale}
              href="/applications"
              className="text-text-muted transition-colors hover:text-foreground"
            >
              {m.nav.applications}
            </LocaleLink>
            <span aria-hidden="true" className="text-text-muted">
              /
            </span>
            <span className="text-foreground">{application.title}</span>
          </nav>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
            <div className="flex flex-col gap-5">
              <Badge variant="application" className="w-fit">
                {m.applicationDetail.badge}
              </Badge>
              <h1 className="text-balance">{application.title}</h1>
              {application.description ? (
                <p className="text-body-lg text-text-secondary text-pretty">
                  {application.description}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <LocaleLink
                    locale={locale}
                    href={`/contact?product=${encodeURIComponent(application.slug)}#rfq`}
                  >
                    {t('common.requestQuote')}
                  </LocaleLink>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <LocaleLink locale={locale} href="/applications">
                    {m.applicationDetail.allApplications}
                  </LocaleLink>
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
                placeholderLabel={t('common.photoPending')}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Overview */}
      <Section>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionHeader
              eyebrow={t('common.overview')}
              title={t('applicationDetail.overviewTitle', { title: application.title })}
            />
            <p className="mt-6 whitespace-pre-line text-body text-text-secondary text-pretty">
              {application.overview || application.description}
            </p>
            <ContentFallbackNotice locale={locale} />
          </div>

          <aside className="lg:col-span-1">
            <h2 className="text-heading-sm">{t('common.atAGlance')}</h2>
            <dl className="mt-4 flex flex-col">
              <div className="flex flex-col gap-1 border-b border-border py-3 sm:flex-row sm:gap-6">
                <dt className="w-full text-small font-medium text-text-secondary sm:w-32 sm:shrink-0">
                  {m.applicationDetail.categoryLabel}
                </dt>
                <dd className="text-small text-foreground">{m.applicationDetail.categoryValue}</dd>
              </div>
              <div className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-6">
                <dt className="w-full text-small font-medium text-text-secondary sm:w-32 sm:shrink-0">
                  {m.applicationDetail.materialsLabel}
                </dt>
                <dd className="text-small text-foreground">
                  {application.highlights.length > 0
                    ? t('applicationDetail.materialsValue', {
                        count: String(application.highlights.length),
                      })
                    : t('common.toBeConfirmed')}
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
            eyebrow={m.applicationDetail.highlightsEyebrow}
            title={m.applicationDetail.highlightsTitle}
            description={m.applicationDetail.highlightsDescription}
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
          eyebrow={t('common.related')}
          title={m.applicationDetail.relatedTitle}
          description={m.applicationDetail.relatedDescription}
          action={
            <Button asChild variant="outline">
              <LocaleLink locale={locale} href="/products">
                {t('common.viewAll')}
              </LocaleLink>
            </Button>
          }
        />
        {relatedProducts.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {relatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                locale={locale}
                name={product.name}
                description={product.shortDescription ?? ''}
                imageSrc={primaryImageUrl(product)}
                imageAlt={product.images[0]?.altText ?? product.name}
                badges={
                  product.category
                    ? [{ label: product.category.name, variant: 'application' as const }]
                    : []
                }
                href={productDetailPath(product)}
                ctaLabel={t('common.viewDetails')}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <ContentPlaceholder
              locale={locale}
              title={m.applicationDetail.relatedEmptyTitle}
              note={m.applicationDetail.relatedEmptyNote}
              minHeightClass="min-h-40"
            />
          </div>
        )}
      </Section>

      <CtaBand
        locale={locale}
        title={m.applicationDetail.ctaTitle}
        description={m.applicationDetail.ctaDescription}
        primaryLabel={t('common.requestQuote')}
        secondaryHref="/applications"
        secondaryLabel={m.applicationDetail.allApplications}
      />

      {/* 结构化数据 */}
      <WebPageSchema
        name={application.title}
        description={application.seo?.description ?? application.description}
        path={localizedPath(`/applications/${application.slug}`, locale)}
        locale={locale}
      />
      <BreadcrumbSchema
        items={[
          { name: t('common.home'), path: localizedPath('/', locale) },
          { name: m.nav.applications, path: localizedPath('/applications', locale) },
          {
            name: application.title,
            path: localizedPath(`/applications/${application.slug}`, locale),
          },
        ]}
      />
    </>
  );
}
