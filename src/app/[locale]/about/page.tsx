import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/page-hero';
import { Section, SectionHeader } from '@/components/layout/section';
import { ContentPlaceholder } from '@/components/layout/content-placeholder';
import { CtaBand } from '@/components/layout/cta-band';
import { TeamMembers } from '@/components/contacts/team-members';
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
import { getAboutImagesByCategory, hasAnyAboutImage, type AboutImageCategory } from '@/lib/about';
import { getPublicTeam } from '@/lib/contacts';

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

/**
 * 本页必须动态渲染（2026-10-27）。
 *
 * 原因：「订单背后的人」读的是员工联系方式（no-store 实时数据），后台改头像 / 姓名 /
 * 职位后必须立刻反映。页面一旦被当成静态路由预渲染，Next 会在 build 阶段遇到
 * `revalidate: 0` 的 fetch 直接抛错退出（实测 /zh-CN/about prerender error）。
 *
 * 其余分区（CMS site_sections、图片素材）仍各自走自己的 ISR 缓存，
 * 这里只是不再把整页结果固化下来。
 */
export const dynamic = 'force-dynamic';

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

  const [companyImages, teamMembers, hasFactoryImages, hasExhibitionImages, hasOfficeImages, sections] =
    await Promise.all([
      getAboutImagesByCategory('company'),
      // 「订单背后的人」= 可接单员工（账号启用 + 询盘联系人 + 公开展示），
      // 与联系页共用同一份公开契约，后台改头像后本区块立即跟随
      getPublicTeam(),
      hasAnyAboutImage(['factory']),
      hasAnyAboutImage(['exhibition']),
      hasAnyAboutImage(['office']),
      // demo 模式返回空数组（不发请求），页面行为与此前一致
      getSiteSections('ABOUT'),
    ]);

  const byKey = new Map(sections.map((section) => [section.sectionKey, section]));

  /**
   * 中文页不使用 CMS 的分区文案（CMS 只有英文一套），
   * 改用 messages/zh-CN.ts 里的中文版式；英文页仍由 CMS 驱动。
   */
  const useCmsCopy = isDefaultLocale;

  // 分区键与后端 seed-site-content.ts 的 about.* 命名保持一致
  const heroSection = useCmsCopy ? (byKey.get('about.hero') ?? null) : null;
  const profileSection = useCmsCopy ? (byKey.get('about.profile') ?? null) : null;
  const storySection = useCmsCopy ? (byKey.get('about.story') ?? null) : null;
  const philosophySection = useCmsCopy ? (byKey.get('about.philosophy') ?? null) : null;
  const whySection = useCmsCopy ? (byKey.get('about.why') ?? null) : null;
  const solutionsSection = useCmsCopy ? (byKey.get('about.solutions') ?? null) : null;

  const heroImage = companyImages[0];
  const hasCmsSections = useCmsCopy && sections.length > 0;

  /** 团队/公司素材缺失时的分类说明（用于占位提示，保持诚实） */
  const emptyCategoryNote: Partial<Record<AboutImageCategory, string>> = {
    factory: m.about.noteFactory,
    exhibition: m.about.noteExhibition,
    office: m.about.noteOffice,
  };

  /**
   * 「关键信息」表：值为空（或仅空白）的行直接不渲染，
   * 避免未确认信息以「待补充」占位长期挂在前台。
   * 文案来源见 src/i18n/messages/{zh-CN,en}.ts 的 glanceXxxValue。
   */
  const glanceRows = [
    { label: m.about.glanceBusiness, value: m.about.glanceBusinessValue },
    { label: m.about.glanceLocation, value: m.about.glanceLocationValue },
    { label: m.about.glanceMaterials, value: m.about.glanceMaterialsValue },
    { label: m.about.glanceBuyers, value: m.about.glanceBuyersValue },
    { label: m.about.glanceFounded, value: m.about.glanceFoundedValue },
    { label: m.about.glanceCapacity, value: m.about.glanceCapacityValue },
  ].filter((row) => row.value.trim().length > 0);

  return (
    <>
      <PageHero
        eyebrow={heroSection?.eyebrow ?? m.about.eyebrow}
        title={heroSection?.title ?? m.about.title}
        subtitle={m.about.subtitle}
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
              {glanceRows.length > 0 ? (
                <dl className="mt-4 flex flex-col divide-y divide-border rounded-lg border border-border bg-surface-elevated px-5">
                  {glanceRows.map((row) => (
                    <div key={row.label} className="flex flex-col gap-1 py-3">
                      <dt className="text-caption font-semibold tracking-wider text-text-muted uppercase">
                        {row.label}
                      </dt>
                      <dd className="text-small text-foreground">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </aside>
          </div>
        </Section>
      )}

      {/*
        3. 订单背后的人（可接单员工）
        独立于 CMS story 分区：英文站一旦发布了 about.story，团队区块原先会整块消失。
        数据来自公开联系人接口的 leadOnly 视图，因此「后台改头像 → 前台立即更新」，
        不再依赖 lib/about 里那份静态 team 图片登记表。
      */}
      <Section>
        <SectionHeader
          eyebrow={m.about.teamEyebrow}
          title={m.about.teamTitle}
          description={m.about.teamDescription}
        />
        <div className="mt-8">
          <TeamMembers members={teamMembers} emptyNotice={m.about.teamEmptyNotice} />
        </div>
      </Section>

      {/* 4. Business Philosophy */}
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

      {/* 5. Why Choose Bailing */}
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

      {/* 6. Products & Solutions */}
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

      {/* 7. Global Market */}
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

      {/* 8. Factory / Quality CTA */}
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

      {/* 9. RFQ CTA */}
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
