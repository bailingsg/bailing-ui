import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { Section, SectionHeader } from '@/components/layout/section';
import { ContentPlaceholder } from '@/components/layout/content-placeholder';
import { CtaBand } from '@/components/layout/cta-band';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OptimizedImage } from '@/components/common/optimized-image';
import { SiteSectionContent, SiteCtaLink } from '@/components/cms/site-section-block';
import { buildMetadata } from '@/lib/seo';
import { primaryCta, siteConfig } from '@/config/site';
import { getCmsPageSeo, getSiteSections } from '@/lib/site';
import { getCategories, isDemoSource } from '@/lib/products';

/**
 * 首页 metadata：优先使用 CMS 的 home.hero（标题 / 副标题 / 封面图），
 * 未发布或 demo 模式时回退到程序默认值（真实品牌信息，非占位文案）。
 */
export async function generateMetadata(): Promise<Metadata> {
  const seo = await getCmsPageSeo('HOME', 'home.hero');
  return buildMetadata({
    title: seo.title ?? 'Bailing Wooden | Wooden Products Manufacturer & B2B Export Supplier',
    absoluteTitle: true,
    description: seo.description ?? siteConfig.description,
    path: '/',
    ...(seo.ogImage ? { ogImage: seo.ogImage, ogImageAlt: seo.ogImageAlt } : {}),
  });
}

/**
 * 首页 —— 站点框架页
 *
 * 结构：Hero → 核心能力 → 产品分类 → 应用领域 → 询价引导。
 *
 * 双数据源（NEXT_PUBLIC_CMS_SOURCE）：
 *   · demo（默认）—— 既有演示版式；产品分类为占位卡片（无虚构数据）；
 *   · api —— 已发布 SiteSection（home.hero / capabilities / products /
 *     applications / cta）按 sectionKey 覆盖对应槽位，未发布的槽位
 *     自动回退演示版式；产品分类取自产品目录公开接口。
 *
 * 说明：本阶段只搭建版式与导航骨架，所有具体产品、图片、企业数据均留待
 * 业务方确认后补充，页面不出现任何虚构数据。
 */

/** 核心能力（通用行业能力，非虚构业绩） */
const capabilities: { title: string; description: string }[] = [
  {
    title: 'OEM & ODM',
    description:
      'Custom wooden products manufactured to your drawings, samples and specifications.',
  },
  {
    title: 'Quality Control',
    description:
      'Incoming material inspection, in-process checks and pre-shipment inspection before loading.',
  },
  {
    title: 'Export Logistics',
    description:
      'FOB / CIF terms with full export documentation support for international shipping.',
  },
  {
    title: 'Sustainable Sourcing',
    description: 'Responsibly sourced timber supported by traceability documentation.',
  },
];

/** 典型应用领域（通用场景，具体案例待补充） */
const applications: { title: string; description: string }[] = [
  {
    title: 'Furniture Manufacturing',
    description: 'Components and panels supplied to furniture producers.',
  },
  {
    title: 'Building & Construction',
    description: 'Wood-based materials for interior and structural applications.',
  },
  {
    title: 'Packaging & Logistics',
    description: 'Wooden packaging solutions for industrial shipping.',
  },
  {
    title: 'DIY & Home Improvement',
    description: 'Retail-ready wooden products for consumer markets.',
  },
];

export default async function HomePage() {
  // demo 模式下 getSiteSections 直接返回空数组（不发请求），页面行为与此前一致
  const sections = await getSiteSections('HOME');
  const byKey = new Map(sections.map((section) => [section.sectionKey, section]));

  const heroSection = byKey.get('home.hero') ?? null;
  const capabilitiesSection = byKey.get('home.capabilities') ?? null;
  const productsSection = byKey.get('home.products') ?? null;
  const applicationsSection = byKey.get('home.applications') ?? null;
  const ctaSection = byKey.get('home.cta') ?? null;

  // 产品分类：仅 api 模式拉取真实目录；demo 模式保持占位卡片
  const categories = isDemoSource() ? [] : await getCategories();

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-surface">
        <Container className="py-16 sm:py-20 lg:py-28">
          {heroSection ? (
            /* CMS 模式：结构化 hero 分区 */
            <div className="flex max-w-3xl flex-col gap-6">
              {heroSection.eyebrow ? (
                <Badge variant="material" className="w-fit">
                  {heroSection.eyebrow}
                </Badge>
              ) : null}
              <h1 className="text-display text-balance">
                {heroSection.title ?? siteConfig.name}
              </h1>
              {heroSection.subtitle ? (
                <p className="text-heading-sm font-normal text-text-muted">
                  {heroSection.subtitle}
                </p>
              ) : null}
              {heroSection.body ? (
                <p className="max-w-2xl text-body-lg text-text-secondary text-pretty">
                  {heroSection.body}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-3">
                {heroSection.ctaLabel && heroSection.ctaUrl ? (
                  <SiteCtaLink
                    url={heroSection.ctaUrl}
                    label={heroSection.ctaLabel}
                    size="lg"
                  />
                ) : (
                  <Button asChild size="lg">
                    <Link href={primaryCta.href}>{primaryCta.label}</Link>
                  </Button>
                )}
                <Button asChild size="lg" variant="outline">
                  <Link href="/products">Explore Products</Link>
                </Button>
              </div>
              {heroSection.media ? (
                <div className="mt-4 overflow-hidden rounded-lg border border-border">
                  <OptimizedImage
                    src={heroSection.media.url}
                    alt={heroSection.media.altText ?? heroSection.title ?? ''}
                    aspectRatio="16/9"
                    sizes="(min-width: 1024px) 720px, 100vw"
                    placeholderLabel="Photo to be added"
                  />
                </div>
              ) : null}
            </div>
          ) : (
            /* 演示模式：既有框架 hero */
            <div className="flex max-w-3xl flex-col gap-6">
              <Badge variant="material" className="w-fit">
                B2B Wooden Products Manufacturer
              </Badge>
              <h1 className="text-display text-balance">{siteConfig.name}</h1>
              <p className="text-heading-sm font-normal text-text-muted">
                {siteConfig.nameZh} · {siteConfig.taglineZh}
              </p>
              <p className="max-w-2xl text-body-lg text-text-secondary text-pretty">
                {siteConfig.description}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href={primaryCta.href}>{primaryCta.label}</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/products">Explore Products</Link>
                </Button>
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* 核心能力 */}
      <Section>
        {capabilitiesSection ? (
          <SiteSectionContent section={capabilitiesSection} />
        ) : (
          <>
            <SectionHeader
              eyebrow="Capabilities"
              title="What we do"
              description="A complete manufacturing and export workflow, from custom production to documentation and shipment."
            />
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {capabilities.map((item) => (
                <Card key={item.title}>
                  <CardHeader>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </>
        )}
      </Section>

      {/* 产品分类 */}
      <Section tone="surface">
        {productsSection ? (
          <>
            <SiteSectionContent section={productsSection} />
            {categories.length > 0 ? (
              <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <Card key={category.id ?? category.slug}>
                    <CardHeader>
                      <CardTitle>{category.name}</CardTitle>
                      {category.description ? (
                        <CardDescription>{category.description}</CardDescription>
                      ) : null}
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <>
            <SectionHeader
              eyebrow="Products"
              title="Product categories"
              description="Product categories and specifications will be published from the product catalog."
              action={
                <Button asChild variant="outline">
                  <Link href="/products">View Products</Link>
                </Button>
              }
            />
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <ContentPlaceholder
                  key={index}
                  title={`Product Category ${String(index + 1).padStart(2, '0')}`}
                  note="Populated from the product catalog in the next phase"
                  minHeightClass="min-h-44"
                />
              ))}
            </div>
          </>
        )}
      </Section>

      {/* 应用领域 */}
      <Section>
        {applicationsSection ? (
          <SiteSectionContent section={applicationsSection} />
        ) : (
          <>
            <SectionHeader
              eyebrow="Applications"
              title="Where our products are used"
              description="Typical application areas served by wooden product manufacturers. Detailed case studies are pending confirmation."
            />
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {applications.map((item) => (
                <Card key={item.title}>
                  <CardHeader>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </>
        )}
      </Section>

      {/* 询价引导 */}
      {ctaSection ? (
        <CtaBand
          title={ctaSection.title ?? undefined}
          description={ctaSection.subtitle ?? ctaSection.body ?? undefined}
          primaryLabel={ctaSection.ctaLabel ?? undefined}
        />
      ) : (
        <CtaBand />
      )}
    </>
  );
}
