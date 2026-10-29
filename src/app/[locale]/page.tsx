import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Section, SectionHeader } from '@/components/layout/section';
import { ContentPlaceholder } from '@/components/layout/content-placeholder';
import { CtaBand } from '@/components/layout/cta-band';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { OptimizedImage } from '@/components/common/optimized-image';
import { ContentFallbackNotice } from '@/components/common/content-fallback-notice';
import { SiteSectionContent, SiteCtaLink } from '@/components/cms/site-section-block';
import { WebSiteSchema } from '@/components/seo/website-schema';
import { resolveSeoMetadata } from '@/lib/seo/resolver';
import { siteConfig } from '@/config/site';
import { getCmsPageSeo, getSiteSections } from '@/lib/site';
import { getCategories, isDemoSource } from '@/lib/products';
import type { ProductCategory } from '@/lib/products/types';
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

/**
 * 首页「产品分类」卡片。
 *
 * 描述来自 CMS（单语言英文，各分类长短不一），所以 CTA 用 `mt-auto` 贴卡片底部：
 * 同一行卡片等高时按钮自然对齐，不会随描述行数上下浮动。
 *
 * CTA 是右下角的下划线文字链（无边框、无底色），文案随界面语言切换：
 * 中文「点此查看相关产品」/ 英文 "View related products"，不混排双语。
 */
function CategoryCard({
  category,
  locale,
  cta,
}: {
  category: ProductCategory;
  locale: Locale;
  cta: string;
}) {
  const href = `/products?category=${encodeURIComponent(category.slug)}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <LocaleLink locale={locale} href={href} className="transition-colors hover:text-primary">
            {category.name}
          </LocaleLink>
        </CardTitle>
        {category.description ? <CardDescription>{category.description}</CardDescription> : null}
      </CardHeader>
      <CardFooter className="mt-auto justify-end">
        <LocaleLink
          locale={locale}
          href={href}
          className="group inline-flex items-center gap-1.5 text-small font-medium text-primary underline decoration-1 underline-offset-4 transition-colors hover:text-primary-hover"
        >
          {cta}
          <ArrowRight
            aria-hidden="true"
            className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
          />
        </LocaleLink>
      </CardFooter>
    </Card>
  );
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

  /**
   * 只有「有已发布产品」的分类才允许出现在首页。
   *
   * 后端 /categories 的 productCount 就是**已发布（PUBLISHED）**产品数，
   * 因此 productCount === 0 意味着访客点进去只会看到空列表——这种分类
   * 宁可不在首页露出（分类本身仍可在后台维护，产品上架后自动出现）。
   */
  const categoriesWithProducts = categories.filter((category) => (category.productCount ?? 0) > 0);

  return (
    <>
      {/* 首页 WebSite 结构化数据（Organization 由根布局输出） */}
      <WebSiteSchema locale={locale} />
      {/*
        Hero 背景图是 CSS background-image：浏览器必须先解析完 CSSOM 才会发起
        这个请求，是全页**发现得最晚**的资源，而它恰恰压在首屏 LCP 上。
        显式 preload 让它与 HTML 解析并行开跑；media 条件保证只下载当前断点
        真正会用到的那一张，不会把两张都拉下来。两张都命中浏览器缓存后，
        后续 CSS 里的 background-image 直接复用，不产生重复请求。
      */}
      <link
        rel="preload"
        as="image"
        href="/images/hero-forest.webp"
        media="(min-width: 768px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href="/images/hero-forest-mobile.webp"
        media="(max-width: 767px)"
        fetchPriority="high"
      />
      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b border-border bg-surface">
        {/*
          背景：森林实拍图（原图 1920×400 全景，已裁成 3:1 横幅；移动端换 1.6:1 裁切，
          避免竖屏下把横幅图放大过头）。两个断点各用一张，靠 bg-cover 自适应。
        */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-cover bg-center md:hidden"
          style={{ backgroundImage: "url('/images/hero-forest-mobile.webp')" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 hidden bg-cover bg-center md:block"
          style={{ backgroundImage: "url('/images/hero-forest.webp')" }}
        />
        {/*
          2026-10-29 业务方要求露出完整照片：原「左侧实色 → 右侧透明」的白色渐变遮罩已移除。
          但照片本身明暗不均（树干深、草地亮），深色文字直接压上去会读不清，
          因此改为**一层均匀的轻暗化 + 白色文字**：
            · 暗化是整幅均匀的，不产生白雾或左右断层，照片保持完整；
            · 文字转白后在高光草地与深色树干上都有足够对比度。
          若以后换更亮/更暗的照片，只调 bg-black/NN 的数值即可，不要恢复渐变白雾。
        */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/35" />
        <Container className="py-16 sm:py-20 lg:py-28">
          {heroSection ? (
            /* CMS 模式：结构化 hero 分区（业务内容，单语言） */
            <div className="flex max-w-3xl flex-col gap-6">
              {heroSection.eyebrow ? (
                <Badge variant="material" className="w-fit">
                  {heroSection.eyebrow}
                </Badge>
              ) : null}
              <h1 className="text-display text-balance text-white">
                {heroSection.title ?? siteConfig.name}
              </h1>
              {heroSection.subtitle ? (
                <p className="text-heading-sm font-normal text-white/85">
                  {heroSection.subtitle}
                </p>
              ) : null}
              {heroSection.body ? (
                <p className="max-w-2xl text-body-lg text-white/90 text-pretty">
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
              <ContentFallbackNotice locale={locale} variant="subtle" tone="onDark" className="mt-1" />
            </div>
          ) : (
            /* 演示模式 / 未发布 hero：按语言呈现框架文案 */
            <div className="flex max-w-3xl flex-col gap-6">
              <Badge variant="material" className="w-fit">
                {t('home.heroBadge')}
              </Badge>
              {/* 英文页主标题用英文品牌名 + 中文品牌副行；中文页主标题用中文品牌名 */}
              <h1 className="text-display text-balance text-white">
                {isDefaultLocale ? siteConfig.name : siteConfig.nameZh}
              </h1>
              <p className="text-heading-sm font-normal text-white/85">
                {isDefaultLocale
                  ? `${siteConfig.nameZh} · ${siteConfig.taglineZh}`
                  : siteConfig.taglineZh}
              </p>
              <p className="max-w-2xl text-body-lg text-white/90 text-pretty">
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
            {categoriesWithProducts.length > 0 ? (
              <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {categoriesWithProducts.map((category) => (
                  <CategoryCard
                    key={category.id ?? category.slug}
                    category={category}
                    locale={locale}
                    cta={m.home.categoryCta}
                  />
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
            {/* 有真实分类（且含已发布产品）就展示分类入口；否则仅在 demo 数据源下显示占位卡片 */}
            {categoriesWithProducts.length > 0 ? (
              <>
                <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {categoriesWithProducts.map((category) => (
                    <CategoryCard
                      key={category.id ?? category.slug}
                      category={category}
                      locale={locale}
                      cta={m.home.categoryCta}
                    />
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
