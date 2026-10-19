import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/page-hero';
import { Section, SectionHeader } from '@/components/layout/section';
import { ContentPlaceholder } from '@/components/layout/content-placeholder';
import { CtaBand } from '@/components/layout/cta-band';
import { GalleryGrid } from '@/components/media/gallery-grid';
import { OptimizedImage } from '@/components/common/optimized-image';
import { ContentFallbackNotice } from '@/components/common/content-fallback-notice';
import { WebPageSchema } from '@/components/seo/web-page-schema';
import { AboutSchema } from '@/components/seo/about-schema';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { resolveSeoMetadata } from '@/lib/seo/resolver';
import { siteConfig } from '@/config/site';
import { getCmsPageSeo, getSiteSections } from '@/lib/site';
import { SiteSectionBlock } from '@/components/cms/site-section-block';
import { LocaleLink } from '@/i18n/link';
import { getI18n } from '@/i18n';
import { defaultLocale, isLocale, type Locale } from '@/i18n/config';
import { localizedPath } from '@/i18n/paths';
import {
  getAboutImagesByCategory,
  hasAnyAboutImage,
  type AboutImageCategory,
} from '@/lib/about';

/**
 * 关于我们 /about（中文：/zh-CN/about）
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
 * 语言：页面文案随语言切换；CMS 已发布分区（about.*）属于业务内容，
 * 只有单语言版本，中文界面下按原文展示并给出提示。
 */

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

function resolveLocale(rawLocale: string): Locale {
  return isLocale(rawLocale) ? rawLocale : defaultLocale;
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const { m } = getI18n(locale);

  if (locale !== defaultLocale) {
    return resolveSeoMetadata({
      title: m.about.metaTitle,
      description: m.about.metaDescription,
      path: '/about',
      locale,
    });
  }

  // CMS 的 about.hero 变更后，本页 title / description 立即跟随（任务书第十七节）
  const seo = await getCmsPageSeo('ABOUT', 'about.hero');
  return resolveSeoMetadata({
    title: seo.title ?? m.about.metaTitle,
    description: seo.description ?? m.about.metaDescription,
    path: '/about',
    locale,
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

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const { t, m, isDefaultLocale } = getI18n(locale);

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
  const hasCmsSections = sections.length > 0;

  /** 团队/公司素材缺失时的分类说明（用于占位提示，保持诚实） */
  const emptyCategoryNote: Partial<Record<AboutImageCategory, string>> = {
    factory: m.about.noteFactory,
    exhibition: m.about.noteExhibition,
    office: m.about.noteOffice,
  };

  return (
    <>
      <PageHero
        eyebrow={heroSection?.eyebrow ?? m.about.eyebrow}
        title={heroSection?.title ?? m.about.title}
        {...(isDefaultLocale ? { titleZh: m.about.titleZh } : {})}
        description={heroSection?.subtitle ?? heroSection?.body ?? m.about.description}
        actions={
          <>
            <Button asChild size="lg">
              <LocaleLink locale={locale} href={heroSection?.ctaUrl ?? '/contact#rfq'}>
                {heroSection?.ctaLabel ?? t('common.requestQuote')}
              </LocaleLink>
            </Button>
            <Button asChild size="lg" variant="outline">
              <LocaleLink locale={locale} href="/products">
                {t('common.viewProducts')}
              </LocaleLink>
            </Button>
          </>
        }
      />

      {hasCmsSections ? (
        <Section size="sm" tone="default" className="pb-0">
          <ContentFallbackNotice locale={locale} />
        </Section>
      ) : null}

      {/* 1. Company Introduction */}
      {profileSection ? (
        <SiteSectionBlock section={profileSection} locale={locale} />
      ) : (
        <Section>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
            <div className="flex flex-col gap-5">
              <SectionHeader
                eyebrow={m.about.profileEyebrow}
                title={m.about.profileTitle}
                description={t('about.profileLead', {
                  name: siteConfig.name,
                  nameZh: siteConfig.nameZh,
                })}
              />
              <p className="text-body text-text-secondary text-pretty">{m.about.profileBody1}</p>
              <p className="text-body text-text-secondary text-pretty">{m.about.profileBody2}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="material">{m.about.badgeMdf}</Badge>
                <Badge variant="material">{m.about.badgePlywood}</Badge>
                <Badge variant="material">{m.about.badgeParticleBoard}</Badge>
                <Badge variant="material">{m.about.badgeDecorative}</Badge>
                <Badge variant="eco">{m.about.badgeSourcing}</Badge>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-border">
              <OptimizedImage
                src={heroImage?.url ?? null}
                alt={heroImage?.alt ?? 'Bailing Wooden manufacturing campus'}
                locale={locale}
                aspectRatio="4/3"
                sizes="(min-width: 1024px) 50vw, 100vw"
                placeholderLabel={t('common.photoPending')}
              />
            </div>
          </div>
        </Section>
      )}

      {/* 2. Our Story */}
      {storySection ? (
        <SiteSectionBlock section={storySection} tone="surface" locale={locale} />
      ) : (
        <Section tone="surface">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <SectionHeader eyebrow={m.about.storyEyebrow} title={m.about.storyTitle} />
              <div className="mt-6 flex flex-col gap-4">
                <p className="text-body text-text-secondary text-pretty">{m.about.storyBody1}</p>
                <p className="text-body text-text-secondary text-pretty">{m.about.storyBody2}</p>
                <p className="text-body text-text-secondary text-pretty">{m.about.storyBody3}</p>
              </div>
            </div>

            <aside className="lg:col-span-1">
              <h2 className="text-heading-sm">{m.common.atAGlance}</h2>
              <dl className="mt-4 flex flex-col divide-y divide-border rounded-lg border border-border bg-surface-elevated px-5">
                {[
                  { label: m.about.glanceBusiness, value: m.about.glanceBusinessValue, muted: false },
                  { label: m.about.glanceLocation, value: m.about.glanceLocationValue, muted: false },
                  { label: m.about.glanceMaterials, value: m.about.glanceMaterialsValue, muted: false },
                  { label: m.about.glanceBuyers, value: m.about.glanceBuyersValue, muted: false },
                  {
                    label: m.about.glanceFounded,
                    value: isDefaultLocale ? siteConfig.placeholderText : siteConfig.placeholderTextZh,
                    muted: true,
                  },
                  {
                    label: m.about.glanceCapacity,
                    value: isDefaultLocale ? siteConfig.placeholderText : siteConfig.placeholderTextZh,
                    muted: true,
                  },
                ].map((row) => (
                  <div key={row.label} className="flex flex-col gap-1 py-3">
                    <dt className="text-caption font-semibold tracking-wider text-text-muted uppercase">
                      {row.label}
                    </dt>
                    <dd className={row.muted ? 'text-small text-text-muted' : 'text-small text-foreground'}>
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </aside>
          </div>

          {/* 团队 */}
          <div className="mt-14 flex flex-col gap-6">
            <SectionHeader
              eyebrow={m.about.teamEyebrow}
              title={m.about.teamTitle}
              description={m.about.teamDescription}
            />
            <GalleryGrid
              images={teamImages}
              columns={4}
              aspectRatio="3/4"
              placeholderCount={8}
              locale={locale}
              placeholderLabel={t('common.photoPending')}
              showCaption={false}
              emptyNotice={m.about.teamEmptyNotice}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            />
          </div>
        </Section>
      )}

      {/* 3. Business Philosophy */}
      {philosophySection ? (
        <SiteSectionBlock section={philosophySection} locale={locale} />
      ) : (
        <Section>
          <SectionHeader
            eyebrow={m.about.philosophyEyebrow}
            title={m.about.philosophyTitle}
            description={m.about.philosophyDescription}
          />
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Object.values(m.about.philosophy).map((item) => (
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
        <SiteSectionBlock section={whySection} tone="surface" locale={locale} />
      ) : (
        <Section tone="surface">
          <SectionHeader
            eyebrow={m.about.whyEyebrow}
            title={m.about.whyTitle}
            description={m.about.whyDescription}
          />
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Object.values(m.about.reasons).map((item) => (
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
        <SiteSectionBlock section={solutionsSection} locale={locale} />
      ) : (
        <Section>
          <SectionHeader
            eyebrow={m.about.solutionsEyebrow}
            title={m.about.solutionsTitle}
            description={m.about.solutionsDescription}
            action={
              <Button asChild variant="outline">
                <LocaleLink locale={locale} href="/products">
                  {m.about.viewCatalogue}
                </LocaleLink>
              </Button>
            }
          />
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Object.values(m.about.solutions).map((item) => (
              <LocaleLink
                key={item.title}
                locale={locale}
                href="/products"
                className="flex flex-col gap-2 rounded-lg border border-border bg-surface-elevated p-6 transition-colors hover:border-border-strong"
              >
                <h3 className="text-heading-sm">{item.title}</h3>
                <p className="text-small text-text-secondary">{item.description}</p>
                <span className="mt-1 text-caption font-semibold tracking-wider text-primary uppercase">
                  {m.about.browseRange}
                </span>
              </LocaleLink>
            ))}
          </div>
        </Section>
      )}

      {/* 6. Global Market */}
      <Section tone="surface">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">
          <div className="flex flex-col gap-5">
            <SectionHeader
              eyebrow={m.about.marketEyebrow}
              title={m.about.marketTitle}
              description={m.about.marketDescription}
            />
            <p className="text-body text-text-secondary text-pretty">{m.about.marketBody1}</p>
            <p className="text-body text-text-secondary text-pretty">{m.about.marketBody2}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="application">{m.about.badgeLoading}</Badge>
              <Badge variant="application">{m.about.badgeDocumentation}</Badge>
              <Badge variant="application">{m.about.badgeRepeat}</Badge>
              <Badge variant="application">{m.about.badgeOem}</Badge>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="overflow-hidden rounded-lg border border-border">
              <OptimizedImage
                src={companyImages[1]?.url ?? null}
                alt={companyImages[1]?.alt ?? 'Bailing Wooden plant and loading area'}
                locale={locale}
                aspectRatio="4/3"
                sizes="(min-width: 1024px) 50vw, 100vw"
                placeholderLabel={t('common.photoPending')}
              />
            </div>
            {!hasFactoryImages ? (
              <p className="text-caption text-text-muted">{emptyCategoryNote.factory}</p>
            ) : null}
          </div>
        </div>
      </Section>

      {/* 7. Factory / Quality CTA */}
      <Section>
        <SectionHeader
          eyebrow={m.about.deeperEyebrow}
          title={m.about.deeperTitle}
          description={m.about.deeperDescription}
        />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface-elevated p-6">
            <h3 className="text-heading-sm">{m.about.capabilityTitle}</h3>
            <p className="text-small text-text-secondary">{m.about.capabilityText}</p>
            <Button asChild variant="outline" className="mt-auto w-fit">
              <LocaleLink locale={locale} href="/factory">
                {t('common.viewFactory')}
              </LocaleLink>
            </Button>
          </div>
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface-elevated p-6">
            <h3 className="text-heading-sm">{m.about.qualityTitle}</h3>
            <p className="text-small text-text-secondary">{m.about.qualityText}</p>
            <Button asChild variant="outline" className="mt-auto w-fit">
              <LocaleLink locale={locale} href="/quality">
                {t('common.viewQuality')}
              </LocaleLink>
            </Button>
          </div>
        </div>

        {/* 未提供素材的分类：显式占位，保持诚实 */}
        {!hasExhibitionImages || !hasOfficeImages ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {!hasExhibitionImages ? (
              <ContentPlaceholder
                locale={locale}
                title={m.about.tradeFairTitle}
                note={emptyCategoryNote.exhibition}
                minHeightClass="min-h-40"
              />
            ) : null}
            {!hasOfficeImages ? (
              <ContentPlaceholder
                locale={locale}
                title={m.about.officeTitle}
                note={emptyCategoryNote.office}
                minHeightClass="min-h-40"
              />
            ) : null}
          </div>
        ) : null}
      </Section>

      {/* 8. RFQ CTA */}
      <CtaBand
        locale={locale}
        title={m.about.ctaTitle}
        description={m.about.ctaDescription}
        secondaryHref="/applications"
        secondaryLabel={t('common.viewApplications')}
      />

      {/* 结构化数据 */}
      <WebPageSchema
        name={m.about.metaTitle}
        description={m.about.metaDescription}
        path={localizedPath('/about', locale)}
        locale={locale}
      />
      <AboutSchema
        description={m.about.metaDescription}
        path={localizedPath('/about', locale)}
        locale={locale}
      />
    </>
  );
}
