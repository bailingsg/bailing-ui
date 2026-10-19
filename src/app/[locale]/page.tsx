import type { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { Section, SectionHeader } from '@/components/layout/section';
import { ContentPlaceholder } from '@/components/layout/content-placeholder';
import { CtaBand } from '@/components/layout/cta-band';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OptimizedImage } from '@/components/common/optimized-image';
import { ContentFallbackNotice } from '@/components/common/content-fallback-notice';
import { SiteSectionContent, SiteCtaLink } from '@/components/cms/site-section-block';
import { WebSiteSchema } from '@/components/seo/website-schema';
import { resolveSeoMetadata } from '@/lib/seo/resolver';
import { siteConfig } from '@/config/site';
import { getCmsPageSeo, getSiteSections } from '@/lib/site';
import { getCategories, isDemoSource } from '@/lib/products';
import { LocaleLink } from '@/i18n/link';
import { getI18n } from '@/i18n';
import { defaultLocale, isLocale, type Locale } from '@/i18n/config';

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
 * 语言：页面文案（含未发布槽位的兜底文案）随语言切换；
 * CMS 已发布分区属于业务内容，只有单语言版本，中文界面下按原文展示并给出提示。
 */

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

function resolveLocale(rawLocale: string): Locale {
  return isLocale(rawLocale) ? rawLocale : defaultLocale;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const { m } = getI18n(locale);

  // 中文页面不使用 CMS 派生的单语言 SEO（会把英文标题写到中文页）
  if (locale !== defaultLocale) {
    return resolveSeoMetadata({
      title: m.home.metaTitle,
      description: m.home.metaDescription,
      path: '/',
      locale,
    });
  }

  const seo = await getCmsPageSeo('HOME', 'home.hero');
  return resolveSeoMetadata({
    title: seo.title ?? m.home.metaTitle,
    description: seo.description ?? siteConfig.description,
    path: '/',
    locale,
    ...(seo.ogImage ? { ogImage: seo.ogImage, ogImageAlt: seo.ogImageAlt } : {}),
  });
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const { t, m, isDefaultLocale } = getI18n(locale);

  // demo 模式下 getSiteSections 直接返回空数组（不发请求），页面行为与此前一致
  const sections = await getSiteSections('HOME');
  const byKey = new Map(sections.map((section) => [section.sectionKey, section]));

  /**
   * 中文页**不使用** CMS 的页面营销文案。
   *
   * 原因：CMS 的分区文案（眉题 / 标题 / 副标题 / 正文 / 卡片 / CTA 标签）
   * 目前只有英文一套，直接套到中文页会出现「界面是中文、整页正文却是英文」。
   * 这里改为按语言取用：英文页继续由 CMS 驱动（后台可编辑），
   * 中文页改用 messages/zh-CN.ts 里同一批中文文案。
   *
   * 注意：业务数据（产品目录、文章、应用场景记录）不受影响——它们走各自的数据源，
   * 中文界面下按原文展示并给出「内容语言」提示。
   */
  const useCmsCopy = isDefaultLocale;

  const heroSection = useCmsCopy ? (byKey.get('home.hero') ?? null) : null;
  const capabilitiesSection = useCmsCopy ? (byKey.get('home.capabilities') ?? null) : null;
  const productsSection = useCmsCopy ? (byKey.get('home.products') ?? null) : null;
  const applicationsSection = useCmsCopy ? (byKey.get('home.applications') ?? null) : null;
  const ctaSection = useCmsCopy ? (byKey.get('home.cta') ?? null) : null;

  // 产品分类：仅 api 模式拉取真实目录；demo 模式保持占位卡片
  const categories = isDemoSource() ? [] : await getCategories();

  return (
    <>
      {/* 首页 WebSite 结构化数据（Organization 由根布局输出） */}
      <WebSiteSchema locale={locale} />
      {/* Hero */}
      <section className="border-b border-border bg-surface">
        <Container className="py-16 sm:py-20 lg:py-28">
          {heroSection ? (
            /* CMS 模式：结构化 hero 分区（业务内容，单语言） */
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
                    locale={locale}
                  />
                ) : (
                  <Button asChild size="lg">
                    <LocaleLink locale={locale} href="/contact#rfq">
                      {t('common.requestQuote')}
                    </LocaleLink>
                  </Button>
                )}
                <Button asChild size="lg" variant="outline">
                  <LocaleLink locale={locale} href="/products">
                    {t('home.exploreProducts')}
                  </LocaleLink>
                </Button>
              </div>
              {heroSection.media ? (
                <div className="mt-4 overflow-hidden rounded-lg border border-border">
                  <OptimizedImage
                    src={heroSection.media.url}
                    alt={heroSection.media.altText ?? heroSection.title ?? ''}
                    locale={locale}
                    aspectRatio="16/9"
                    sizes="(min-width: 1024px) 720px, 100vw"
                    placeholderLabel={t('common.photoPending')}
                  />
                </div>
              ) : null}
              <ContentFallbackNotice locale={locale} variant="subtle" className="mt-1" />
            </div>
          ) : (
            /* 演示模式 / 未发布 hero：按语言呈现框架文案 */
            <div className="flex max-w-3xl flex-col gap-6">
              <Badge variant="material" className="w-fit">
                {t('home.heroBadge')}
              </Badge>
              {/* 英文页主标题用英文品牌名 + 中文品牌副行；中文页主标题用中文品牌名 */}
              <h1 className="text-display text-balance">
                {isDefaultLocale ? siteConfig.name : siteConfig.nameZh}
              </h1>
              <p className="text-heading-sm font-normal text-text-muted">
                {isDefaultLocale
                  ? `${siteConfig.nameZh} · ${siteConfig.taglineZh}`
                  : siteConfig.taglineZh}
              </p>
              <p className="max-w-2xl text-body-lg text-text-secondary text-pretty">
                {isDefaultLocale ? siteConfig.description : siteConfig.descriptionZh}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <LocaleLink locale={locale} href="/contact#rfq">
                    {t('common.requestQuote')}
                  </LocaleLink>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <LocaleLink locale={locale} href="/products">
                    {t('home.exploreProducts')}
                  </LocaleLink>
                </Button>
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* 核心能力 */}
      <Section>
        {capabilitiesSection ? (
          <SiteSectionContent section={capabilitiesSection} locale={locale} />
        ) : (
          <>
            <SectionHeader
              eyebrow={m.home.capabilitiesEyebrow}
              title={m.home.capabilitiesTitle}
              description={m.home.capabilitiesDescription}
            />
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Object.values(m.home.capabilities).map((item) => (
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
            <SiteSectionContent section={productsSection} locale={locale} />
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
              eyebrow={m.home.productsEyebrow}
              title={m.home.productsTitle}
              description={m.home.productsDescription}
              action={
                <Button asChild variant="outline">
                  <LocaleLink locale={locale} href="/products">
                    {t('common.viewProducts')}
                  </LocaleLink>
                </Button>
              }
            />
            {/* 有真实分类就展示分类入口；否则仅在 demo 数据源下显示占位卡片 */}
            {categories.length > 0 ? (
              <>
                <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {categories.map((category) => (
                    <Card key={category.id ?? category.slug}>
                      <CardHeader>
                        <CardTitle>
                          <LocaleLink
                            locale={locale}
                            href={`/products?category=${encodeURIComponent(category.slug)}`}
                            className="transition-colors hover:text-primary"
                          >
                            {category.name}
                          </LocaleLink>
                        </CardTitle>
                        {category.description ? (
                          <CardDescription>{category.description}</CardDescription>
                        ) : null}
                      </CardHeader>
                    </Card>
                  ))}
                </div>
                <ContentFallbackNotice locale={locale} variant="subtle" className="mt-4" />
              </>
            ) : isDemoSource() ? (
              <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => (
                  <ContentPlaceholder
                    key={index}
                    locale={locale}
                    title={t('home.productsPlaceholderTitle', {
                      index: String(index + 1).padStart(2, '0'),
                    })}
                    note={m.home.productsPlaceholderNote}
                    minHeightClass="min-h-44"
                  />
                ))}
              </div>
            ) : null}
          </>
        )}
      </Section>

      {/* 应用领域 */}
      <Section>
        {applicationsSection ? (
          <SiteSectionContent section={applicationsSection} locale={locale} />
        ) : (
          <>
            <SectionHeader
              eyebrow={m.home.applicationsEyebrow}
              title={m.home.applicationsTitle}
              description={m.home.applicationsDescription}
            />
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Object.values(m.home.applications).map((item) => (
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
          locale={locale}
          title={ctaSection.title ?? undefined}
          description={ctaSection.subtitle ?? ctaSection.body ?? undefined}
          primaryLabel={ctaSection.ctaLabel ?? undefined}
        />
      ) : (
        <CtaBand locale={locale} />
      )}
    </>
  );
}
