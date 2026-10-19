import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/page-hero';
import { Section, SectionHeader } from '@/components/layout/section';
import { ContentPlaceholder } from '@/components/layout/content-placeholder';
import { CtaBand } from '@/components/layout/cta-band';
import { OptimizedImage } from '@/components/common/optimized-image';
import { ProductCard } from '@/components/common/product-card';
import { ContentFallbackNotice } from '@/components/common/content-fallback-notice';
import { WebPageSchema } from '@/components/seo/web-page-schema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { resolveSeoMetadata } from '@/lib/seo/resolver';
import { LocaleLink } from '@/i18n/link';
import { getI18n } from '@/i18n';
import { defaultLocale, isLocale, type Locale } from '@/i18n/config';
import { localizedPath } from '@/i18n/paths';
import { getApplications, hasAllApplicationImages, type Application } from '@/lib/applications';
import { getProductBySlug, type ProductListItem } from '@/lib/products';
import type { Translator } from '@/i18n/translate';

/**
 * 应用场景 /applications（中文：/zh-CN/applications）
 *
 * 结构：PageHero → Application Categories（锚点索引）→ 5 个应用区块
 *      → Related Products → RFQ CTA
 *
 * 定位：SEO 流量入口。内容为**行业知识 + 板材应用说明**，
 * 不含客户案例、项目金额、合作品牌等无法验证的业绩信息。
 *
 * 语言：界面文案（含区块标题、按钮、分类索引）随语言切换；
 * 应用条目的标题 / 概述 / 亮点来自 CMS，属业务内容，只有单语言版本，
 * 中文界面下按原文展示并给出明确提示（不伪造译文）。
 *
 * SEO：metadata（绝对标题）+ WebPage 结构化数据；禁止 Product schema。
 */

interface ApplicationsPageProps {
  params: Promise<{ locale: string }>;
}

function resolveLocale(rawLocale: string): Locale {
  return isLocale(rawLocale) ? rawLocale : defaultLocale;
}

export async function generateMetadata({ params }: ApplicationsPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const { m } = getI18n(locale);

  return resolveSeoMetadata({
    title: m.applications.metaTitle,
    description: m.applications.metaDescription,
    path: '/applications',
    locale,
    keywords: [
      'wood panel applications',
      'MDF furniture manufacturing',
      'plywood interior decoration',
      'panel commercial fit-out',
      'door skin production',
      'wooden packaging crating',
    ],
  });
}

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
function ApplicationBlock({
  application,
  index,
  locale,
  t,
}: {
  application: Application;
  index: number;
  locale: Locale;
  t: Translator;
}) {
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
              placeholderLabel={t('common.photoPending')}
            />
          </div>
        </div>

        <div className={`flex flex-col gap-4 ${reversed ? 'lg:order-1' : ''}`}>
          <SectionHeader
            eyebrow={t('applications.blockEyebrow', { index: String(index + 1).padStart(2, '0') })}
            title={application.title}
            description={application.description}
          />
          <p className="text-body text-text-secondary text-pretty">{application.overview}</p>

          <div>
            <h3 className="text-caption font-semibold tracking-wider text-text-muted uppercase">
              {t('applications.blockHighlights')}
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
              <LocaleLink locale={locale} href="/products">
                {t('applications.relatedProducts')}
              </LocaleLink>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <LocaleLink
                locale={locale}
                href={`/contact?product=${encodeURIComponent(application.slug)}#rfq`}
              >
                {t('common.requestQuote')}
              </LocaleLink>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ApplicationsPage({ params }: ApplicationsPageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const { t, m, isDefaultLocale } = getI18n(locale);

  const [items, allHaveImages] = await Promise.all([getApplications(), hasAllApplicationImages()]);
  const relatedProducts = await resolveProducts(collectProductSlugs(items));

  return (
    <>
      <PageHero
        eyebrow={m.applications.eyebrow}
        title={m.applications.title}
        {...(isDefaultLocale ? { titleZh: m.applications.titleZh } : {})}
        description={m.applications.description}
        actions={
          <>
            <Button asChild size="lg">
              <LocaleLink locale={locale} href="/contact#rfq">
                {m.applications.discuss}
              </LocaleLink>
            </Button>
            <Button asChild size="lg" variant="outline">
              <LocaleLink locale={locale} href="/products">
                {t('common.viewProducts')}
              </LocaleLink>
            </Button>
          </>
        }
        aside={
          <div className="flex flex-wrap gap-2">
            <Badge variant="application">{m.applications.badgeKnowledge}</Badge>
            <Badge variant="material">{m.applications.badgeSelection}</Badge>
          </div>
        }
      />

      {/* Application Categories —— 锚点索引 */}
      <Section size="sm" tone="surface">
        <div className="flex flex-col gap-4">
          <span className="text-caption font-semibold tracking-wider text-text-muted uppercase">
            {m.applications.categoriesLabel}
          </span>
          <nav aria-label={m.applications.categoriesAria} className="flex flex-wrap gap-2">
            {items.map((item) => (
              <a key={item.slug} href={`#${item.slug}`} className="outline-none">
                <Badge variant="outline" className="cursor-pointer transition-colors hover:border-primary">
                  {item.title}
                </Badge>
              </a>
            ))}
          </nav>
          {!allHaveImages ? (
            <p className="text-caption text-text-muted">{m.applications.imagesPending}</p>
          ) : null}
          <ContentFallbackNotice locale={locale} variant="subtle" />
        </div>
      </Section>

      {/* 各应用区块 */}
      {items.map((application, index) => (
        <Section key={application.slug} tone={index % 2 === 1 ? 'surface' : 'default'}>
          <ApplicationBlock application={application} index={index} locale={locale} t={t} />
        </Section>
      ))}

      {/* Related Products */}
      <Section tone="surface">
        <SectionHeader
          eyebrow={m.applications.relatedEyebrow}
          title={m.applications.relatedTitle}
          description={m.applications.relatedDescription}
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
                href={`/products/${product.slug}`}
                ctaLabel={t('common.viewDetails')}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <ContentPlaceholder
              locale={locale}
              title={m.applications.relatedEmptyTitle}
              note={m.applications.relatedEmptyNote}
              minHeightClass="min-h-40"
            />
          </div>
        )}
      </Section>

      {/* RFQ CTA */}
      <CtaBand
        locale={locale}
        title={m.applications.ctaTitle}
        description={m.applications.ctaDescription}
        primaryLabel={t('common.requestQuote')}
        secondaryHref="/contact#faq"
        secondaryLabel={m.applications.ctaSecondary}
      />

      {/* 结构化数据 */}
      <WebPageSchema
        name={m.applications.metaTitle}
        description={m.applications.metaDescription}
        path={localizedPath('/applications', locale)}
        locale={locale}
      />
    </>
  );
}
