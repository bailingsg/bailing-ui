import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/layout/page-hero';
import { Section, SectionHeader } from '@/components/layout/section';
import { ContentPlaceholder } from '@/components/layout/content-placeholder';
import { CtaBand } from '@/components/layout/cta-band';
import { GalleryGrid } from '@/components/media/gallery-grid';
import { OptimizedImage } from '@/components/common/optimized-image';
import { WebPageSchema } from '@/components/seo/web-page-schema';
import { AboutSchema } from '@/components/seo/about-schema';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { resolveSeoMetadata } from '@/lib/seo/resolver';
import { siteConfig } from '@/config/site';
import { getCmsPageSeo, getSiteSections } from '@/lib/site';
import { SiteSectionBlock } from '@/components/cms/site-section-block';
import {
  getAboutImagesByCategory,
  hasAnyAboutImage,
  type AboutImageCategory,
} from '@/lib/about';

/**
 * 关于我们 /about
 *
 * 结构：PageHero → Company Introduction → Our Story（含团队）→ Business Philosophy
 *      → Why Choose Bailing → Products & Solutions → Global Market
 *      → Factory / Quality CTA → RFQ CTA
 *
 * 零虚构原则（与 Phase 3.6 一致）：
 *   不编造成立年份、厂房面积、年产量、员工人数、客户名单、合作品牌、
 *   认证编号或项目金额。未确认的信息一律以"待确认"表述呈现，
 *   图片只使用业务方提供的真实素材（见 src/lib/about）。
 *
 * SEO：metadata（绝对标题）+ WebPage + Organization 结构化数据；禁止 Product schema。
 */

const META_DESCRIPTION =
  'Bailing Wooden is a wood panel manufacturer and B2B export supplier based in Shouguang, Shandong, China — producing MDF, plywood, particle board and decorative panels for furniture, interior and construction applications.';

export async function generateMetadata(): Promise<Metadata> {
  // CMS 的 about.hero 变更后，本页 title / description 立即跟随（任务书第十七节）
  const seo = await getCmsPageSeo('ABOUT', 'about.hero');
  return resolveSeoMetadata({
    title: seo.title ?? 'About Bailing Wooden | Wood Manufacturer',
    description: seo.description ?? META_DESCRIPTION,
    path: '/about',
    keywords: [
      'wood panel manufacturer',
      'MDF manufacturer China',
      'plywood supplier',
      'particle board manufacturer',
      'decorative panel supplier',
      'B2B wood export',
    ],
    ...(seo.ogImage ? { ogImage: seo.ogImage, ogImageAlt: seo.ogImageAlt } : {}),
  });
}

/** 经营理念（通用表述，不含任何业绩数据） */
const philosophy: { title: string; description: string }[] = [
  {
    title: 'Consistent Quality',
    description:
      'Every order is produced against an agreed specification, so the boards you receive match the samples you approved.',
  },
  {
    title: 'Practical Craftsmanship',
    description:
      'Panels are judged by how they perform on the production line — machining, edge quality, surface finish and stability.',
  },
  {
    title: 'Responsible Sourcing',
    description:
      'Raw materials are sourced with traceability in mind, and offcuts are recovered back into production wherever possible.',
  },
  {
    title: 'Long-term Partnership',
    description:
      'We work as a supply partner rather than a one-off seller: clear communication before the order and support after it ships.',
  },
];

/** 为什么选择百灵（能力维度，非业绩数字） */
const reasons: { title: string; description: string }[] = [
  {
    title: 'Material know-how',
    description:
      'MDF, plywood, particle board and decorative panels each behave differently. We help you match the board to the application.',
  },
  {
    title: 'Specification clarity',
    description:
      'Thickness, density, glue type, surface treatment and tolerances are confirmed in writing before production starts.',
  },
  {
    title: 'Production control',
    description:
      'Incoming material, in-process panels and finished boards are checked at defined stages of the production flow.',
  },
  {
    title: 'Export documentation',
    description:
      'Commercial invoice, packing list and the shipping documents your forwarder needs are prepared as part of the order.',
  },
  {
    title: 'OEM & custom sizes',
    description:
      'Custom dimensions, cut-to-size panels and private-label surface finishes can be produced against your drawing.',
  },
  {
    title: 'Responsive communication',
    description:
      'Enquiries are reviewed by a person, not a queue — you get a straight answer on what is feasible and what is not.',
  },
];

/** 产品与解决方案（对应产品目录的分类方向） */
const solutions: { title: string; description: string; href: string }[] = [
  {
    title: 'MDF & HMR MDF',
    description: 'Standard, moisture-resistant and special-surface fibreboard for furniture and interiors.',
    href: '/products',
  },
  {
    title: 'Plywood',
    description: 'Commercial, film-faced and structural plywood for furniture, formwork and transport.',
    href: '/products',
  },
  {
    title: 'Particle Board',
    description: 'Raw and melamine-faced particle board for cabinets, shelving and flat-pack furniture.',
    href: '/products',
  },
  {
    title: 'Decorative Panels',
    description: 'Melamine, veneer, PET, UV and WPC surfaces for visible, design-facing applications.',
    href: '/products',
  },
  {
    title: 'Furniture Solutions',
    description: 'Door skins, edge banding, block board and cut-to-size components for furniture makers.',
    href: '/products',
  },
];

/** 团队/公司素材缺失时的分类说明（用于占位提示，保持诚实） */
const EMPTY_CATEGORY_NOTE: Partial<Record<AboutImageCategory, string>> = {
  factory: 'Production-floor photography will be added here once supplied.',
  exhibition: 'Trade fair photography will be added here once supplied.',
  office: 'Office and showroom photography will be added here once supplied.',
};

export default async function AboutPage() {
  const [companyImages, teamImages, hasFactoryImages, hasExhibitionImages, hasOfficeImages, sections] =
    await Promise.all([
      getAboutImagesByCategory('company'),
      getAboutImagesByCategory('team'),
      hasAnyAboutImage(['factory']),
      hasAnyAboutImage(['exhibition']),
      hasAnyAboutImage(['office']),
      // demo 模式返回空数组（不发请求），页面行为与此前一致
      getSiteSections('ABOUT'),
    ]);

  const byKey = new Map(sections.map((section) => [section.sectionKey, section]));
  // 分区键与后端 seed-site-content.ts 的 about.* 命名保持一致
  const heroSection = byKey.get('about.hero') ?? null;
  const profileSection = byKey.get('about.profile') ?? null;
  const storySection = byKey.get('about.story') ?? null;
  const philosophySection = byKey.get('about.philosophy') ?? null;
  const whySection = byKey.get('about.why') ?? null;
  const solutionsSection = byKey.get('about.solutions') ?? null;

  const heroImage = companyImages[0];

  return (
    <>
      <PageHero
        eyebrow={heroSection?.eyebrow ?? 'About'}
        title={heroSection?.title ?? 'About Bailing Wooden'}
        titleZh="关于百灵木业"
        description={
          heroSection?.subtitle ??
          heroSection?.body ??
          'Reliable Wood Solutions for Global Partners — a wood panel manufacturer and export supplier working with furniture makers, importers and distributors.'
        }
        actions={
          <>
            <Button asChild size="lg">
              <Link href={heroSection?.ctaUrl ?? '/contact#rfq'}>
                {heroSection?.ctaLabel ?? 'Request Quote'}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/products">View Products</Link>
            </Button>
          </>
        }
      />

      {/* 1. Company Introduction */}
      {profileSection ? (
        <SiteSectionBlock section={profileSection} />
      ) : (
        <Section>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
            <div className="flex flex-col gap-5">
              <SectionHeader
                eyebrow="Company Profile"
                title="A wood panel manufacturer built around process"
                description={`${siteConfig.name} (${siteConfig.nameZh}) manufactures and exports wood-based panels from Shouguang, Shandong, China.`}
              />
              <p className="text-body text-text-secondary text-pretty">
                Our product range covers MDF, plywood, particle board and decorative panels, supplied to
                furniture manufacturers, interior contractors, distributors and importers. We handle
                product development, production control and export supply as one continuous process —
                from confirming the specification to loading the container.
              </p>
              <p className="text-body text-text-secondary text-pretty">
                Because we produce rather than only trade, questions about material behaviour, tolerance
                and surface finish are answered by the people who make the boards. That is what makes a
                specification realistic instead of optimistic.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="material">MDF</Badge>
                <Badge variant="material">Plywood</Badge>
                <Badge variant="material">Particle Board</Badge>
                <Badge variant="material">Decorative Panels</Badge>
                <Badge variant="eco">Responsible Sourcing</Badge>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-border">
              <OptimizedImage
                src={heroImage?.url ?? null}
                alt={heroImage?.alt ?? 'Bailing Wooden manufacturing campus'}
                aspectRatio="4/3"
                sizes="(min-width: 1024px) 50vw, 100vw"
                placeholderLabel="Photo to be added"
              />
            </div>
          </div>
        </Section>
      )}

      {/* 2. Our Story */}
      {storySection ? (
        <SiteSectionBlock section={storySection} tone="surface" />
      ) : (
        <Section tone="surface">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <SectionHeader eyebrow="Our Story" title="From panel production to export supply" />
              <div className="mt-6 flex flex-col gap-4">
                <p className="text-body text-text-secondary text-pretty">
                  Bailing Wooden started in panel manufacturing — pressing, sanding and finishing boards
                  for domestic furniture producers. As buyers from overseas began asking for the same
                  products to their own specifications, the business grew into a direct export supplier
                  with its own quality and documentation process.
                </p>
                <p className="text-body text-text-secondary text-pretty">
                  That path shaped how we work today. Instead of pushing a fixed catalogue, we start from
                  the application: what the board has to do, how it will be machined, what surface it
                  needs, and where it is going. The specification follows from there.
                </p>
                <p className="text-body text-text-secondary text-pretty">
                  Our team combines production, quality and export coordination under one roof, so an
                  enquiry does not have to travel between three companies before you get an answer.
                </p>
              </div>
            </div>

            <aside className="lg:col-span-1">
              <h2 className="text-heading-sm">At a glance</h2>
              <dl className="mt-4 flex flex-col divide-y divide-border rounded-lg border border-border bg-surface-elevated px-5">
                <div className="flex flex-col gap-1 py-3">
                  <dt className="text-caption font-semibold tracking-wider text-text-muted uppercase">
                    Business
                  </dt>
                  <dd className="text-small text-foreground">Wood panel manufacturing &amp; export</dd>
                </div>
                <div className="flex flex-col gap-1 py-3">
                  <dt className="text-caption font-semibold tracking-wider text-text-muted uppercase">
                    Location
                  </dt>
                  <dd className="text-small text-foreground">Shouguang, Shandong, China</dd>
                </div>
                <div className="flex flex-col gap-1 py-3">
                  <dt className="text-caption font-semibold tracking-wider text-text-muted uppercase">
                    Main materials
                  </dt>
                  <dd className="text-small text-foreground">
                    MDF · Plywood · Particle board · Decorative panels
                  </dd>
                </div>
                <div className="flex flex-col gap-1 py-3">
                  <dt className="text-caption font-semibold tracking-wider text-text-muted uppercase">
                    Buyers served
                  </dt>
                  <dd className="text-small text-foreground">
                    Furniture makers, interior contractors, importers, distributors
                  </dd>
                </div>
                <div className="flex flex-col gap-1 py-3">
                  <dt className="text-caption font-semibold tracking-wider text-text-muted uppercase">
                    Founding year
                  </dt>
                  <dd className="text-small text-text-muted">{siteConfig.placeholderText}</dd>
                </div>
                <div className="flex flex-col gap-1 py-3">
                  <dt className="text-caption font-semibold tracking-wider text-text-muted uppercase">
                    Plant area &amp; capacity
                  </dt>
                  <dd className="text-small text-text-muted">{siteConfig.placeholderText}</dd>
                </div>
              </dl>
            </aside>
          </div>

          {/* 团队 */}
          <div className="mt-14 flex flex-col gap-6">
            <SectionHeader
              eyebrow="Our Team"
              title="The people behind the orders"
              description="Production, quality and export coordination are handled in-house. Individual names and roles will be published once confirmed."
            />
            <GalleryGrid
              images={teamImages}
              columns={4}
              aspectRatio="3/4"
              placeholderCount={8}
              placeholderLabel="Photo to be added"
              showCaption={false}
              emptyNotice="Team photography will be added here once supplied."
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            />
          </div>
        </Section>
      )}

      {/* 3. Business Philosophy */}
      {philosophySection ? (
        <SiteSectionBlock section={philosophySection} />
      ) : (
        <Section>
          <SectionHeader
            eyebrow="Philosophy"
            title="How we approach the work"
            description="Four principles that decide how a specification is agreed, produced and shipped."
          />
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {philosophy.map((item) => (
              <Card key={item.title}>
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* 4. Why Choose Bailing */}
      {whySection ? (
        <SiteSectionBlock section={whySection} tone="surface" />
      ) : (
        <Section tone="surface">
          <SectionHeader
            eyebrow="Why Bailing"
            title="What you get when you work with us"
            description="Capability and process — not unverifiable claims about scale."
          />
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reasons.map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-2 rounded-lg border border-border bg-surface-elevated p-6"
              >
                <h3 className="text-heading-sm">{item.title}</h3>
                <p className="text-small text-text-secondary">{item.description}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 5. Products & Solutions */}
      {solutionsSection ? (
        <SiteSectionBlock section={solutionsSection} />
      ) : (
        <Section>
          <SectionHeader
            eyebrow="Products & Solutions"
            title="What we manufacture"
            description="Five product directions covering the panels and components our buyers order most often."
            action={
              <Button asChild variant="outline">
                <Link href="/products">View Full Catalogue</Link>
              </Button>
            }
          />
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {solutions.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="flex flex-col gap-2 rounded-lg border border-border bg-surface-elevated p-6 transition-colors hover:border-border-strong"
              >
                <h3 className="text-heading-sm">{item.title}</h3>
                <p className="text-small text-text-secondary">{item.description}</p>
                <span className="mt-1 text-caption font-semibold tracking-wider text-primary uppercase">
                  Browse range →
                </span>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* 6. Global Market */}
      <Section tone="surface">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">
          <div className="flex flex-col gap-5">
            <SectionHeader
              eyebrow="Global Market"
              title="Built to ship, not just to produce"
              description="Export supply means the order is not finished when the board is made."
            />
            <p className="text-body text-text-secondary text-pretty">
              Orders are packed for container loading, labelled to your instruction and documented for
              customs and your forwarder. Where a buyer needs consistency across repeat shipments, we
              hold the agreed specification so the second container matches the first.
            </p>
            <p className="text-body text-text-secondary text-pretty">
              We work with importers, distributors and manufacturers who value a supplier that can
              explain what a board will do before it is bought — and stand behind it afterwards.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="application">Container loading</Badge>
              <Badge variant="application">Export documentation</Badge>
              <Badge variant="application">Repeat-order consistency</Badge>
              <Badge variant="application">OEM / ODM</Badge>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="overflow-hidden rounded-lg border border-border">
              <OptimizedImage
                src={companyImages[1]?.url ?? null}
                alt={companyImages[1]?.alt ?? 'Bailing Wooden plant and loading area'}
                aspectRatio="4/3"
                sizes="(min-width: 1024px) 50vw, 100vw"
                placeholderLabel="Photo to be added"
              />
            </div>
            {!hasFactoryImages ? (
              <p className="text-caption text-text-muted">{EMPTY_CATEGORY_NOTE.factory}</p>
            ) : null}
          </div>
        </div>
      </Section>

      {/* 7. Factory / Quality CTA */}
      <Section>
        <SectionHeader
          eyebrow="Go Deeper"
          title="See how we make and check the boards"
          description="Manufacturing capability and quality control each have their own page."
        />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface-elevated p-6">
            <h3 className="text-heading-sm">Manufacturing Capability</h3>
            <p className="text-small text-text-secondary">
              Factory structure, production flow, equipment categories and loading — the operational
              side of the business.
            </p>
            <Button asChild variant="outline" className="mt-auto w-fit">
              <Link href="/factory">View Factory</Link>
            </Button>
          </div>
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface-elevated p-6">
            <h3 className="text-heading-sm">Quality Control</h3>
            <p className="text-small text-text-secondary">
              Inspection stages, quality control approach, certificates framework and packaging
              checks.
            </p>
            <Button asChild variant="outline" className="mt-auto w-fit">
              <Link href="/quality">View Quality Control</Link>
            </Button>
          </div>
        </div>

        {/* 未提供素材的分类：显式占位，保持诚实 */}
        {!hasExhibitionImages || !hasOfficeImages ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {!hasExhibitionImages ? (
              <ContentPlaceholder
                title="Trade fair gallery"
                note={EMPTY_CATEGORY_NOTE.exhibition}
                minHeightClass="min-h-40"
              />
            ) : null}
            {!hasOfficeImages ? (
              <ContentPlaceholder
                title="Office & showroom"
                note={EMPTY_CATEGORY_NOTE.office}
                minHeightClass="min-h-40"
              />
            ) : null}
          </div>
        ) : null}
      </Section>

      {/* 8. RFQ CTA */}
      <CtaBand
        title="Let's talk about your next order"
        description="Send your specification, quantity and destination port — our export team will review it and respond with a quotation."
        primaryLabel="Request Quote"
        secondaryHref="/applications"
        secondaryLabel="View Applications"
      />

      {/* 结构化数据 */}
      <WebPageSchema
        name="About Bailing Wooden | Wood Manufacturer"
        description={META_DESCRIPTION}
        path="/about"
      />
      <AboutSchema description={META_DESCRIPTION} path="/about" />
    </>
  );
}
