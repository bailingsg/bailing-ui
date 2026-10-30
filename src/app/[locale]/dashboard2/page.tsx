import type { Metadata } from 'next';
import { Section, SectionHeader } from '@/components/layout/section';
import { ContentPlaceholder } from '@/components/layout/content-placeholder';
import { CtaBand } from '@/components/layout/cta-band';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryCard } from '@/components/home/category-card';
import { HeroCarousel, type HeroSlide } from '@/components/home/hero-carousel';
import { SiteSectionContent, SiteCtaLink } from '@/components/cms/site-section-block';
import { ContentFallbackNotice } from '@/components/common/content-fallback-notice';
import { getSiteSections } from '@/lib/site';
import { getCategories, isDemoSource } from '@/lib/products';
import { siteConfig } from '@/config/site';
import { LocaleLink } from '@/i18n/link';
import { getI18n } from '@/i18n';
import { defaultLocale, isLocale, type Locale } from '@/i18n/config';

/**
 * /dashboard2 —— 首页改版**预览页**（2026-10-30）
 *
 * 业务方要求把旧站首屏的「大图 + 缩略图」轮播搬到新站首页，但**先不动正式首页**，
 * 因此这一版单独挂在 /dashboard2 上评审：除首屏换成轮播外，其余板块与 `/` 完全一致，
 * 方便对比「只换了首屏」的效果。
 *
 * 约定：
 *   · 本页是预览稿，`robots: noindex, nofollow`，不进 sitemap、不进导航；
 *   · 首屏图片是从旧站搬过来的 6 张板材应用场景（已落到 public/images/hero/），
 *     不再依赖旧站域名（旧站随时可能下线）；
 *   · 轮播逻辑见 `@/components/home/hero-carousel`（自动播放可暂停、支持键盘与
 *     减少动态效果偏好）。
 *
 * 评审通过后的收尾动作：把 `/` 的 hero 段替换为 <HeroCarousel>（其余板块已共用
 * 组件，不需要改），然后删除本页。
 */

interface Dashboard2Props {
  params: Promise<{ locale: string }>;
}

function resolveLocale(rawLocale: string): Locale {
  return isLocale(rawLocale) ? rawLocale : defaultLocale;
}

/**
 * 旧站首屏的 6 张板材应用场景（顺序与旧站缩略图一致）。
 *
 * 图片本身是「应用场景渲染图」，不是产品白底图：alt 写画面里到底是什么，
 * 不堆关键词，否则读屏用户会被误导成产品照。
 *
 * 标签与 alt 按语言各写一份 —— 中文页显示英文板材名会变成「界面中文、标签英文」的
 * 半截翻译；板材名属于产品品类名（中密度板 / 胶合板 …），有稳定中文说法，直接写。
 */
const HERO_SLIDES: {
  src: string;
  labels: Record<Locale, string>;
  alts: Record<Locale, string>;
}[] = [
  {
    src: '/images/hero/mdf.webp',
    labels: { en: 'MDF', 'zh-CN': '中密度板' },
    alts: {
      en: 'Modern living and dining interior finished with MDF wall panels and cabinetry',
      'zh-CN': '现代客餐厅，墙面与柜体采用中密度板饰面',
    },
  },
  {
    src: '/images/hero/plywood.webp',
    labels: { en: 'Plywood', 'zh-CN': '胶合板' },
    alts: {
      en: 'Living room with plywood shelving, arched cabinets and a wood-panelled feature wall',
      'zh-CN': '客厅胶合板书架、拱形柜与木饰面背景墙',
    },
  },
  {
    src: '/images/hero/particle-board.webp',
    labels: { en: 'Particle Board', 'zh-CN': '刨花板' },
    alts: {
      en: 'Entryway shoe cabinet built from particle board with an OSB decorative panel',
      'zh-CN': '玄关鞋柜，刨花板柜体搭配欧松板装饰面',
    },
  },
  {
    src: '/images/hero/block-board.webp',
    labels: { en: 'Block Board', 'zh-CN': '细木工板' },
    alts: {
      en: 'Open-plan kitchen and dining area with block board cabinetry and a timber staircase',
      'zh-CN': '开放式厨房与餐厅，细木工板柜体与木楼梯',
    },
  },
  {
    src: '/images/hero/film-faced-plywood.webp',
    labels: { en: 'Film Faced Plywood', 'zh-CN': '覆膜胶合板' },
    alts: {
      en: 'Construction site with steel framing sheathed in film faced plywood panels',
      'zh-CN': '建筑工地钢结构，覆膜胶合板围护施工',
    },
  },
  {
    src: '/images/hero/wall-panel.webp',
    labels: { en: 'Wall Panel', 'zh-CN': '护墙板' },
    alts: {
      en: 'Living room with fluted wood wall panels and a marble-look TV wall',
      'zh-CN': '客厅木格栅护墙板与仿大理石电视墙',
    },
  },
];

export async function generateMetadata({ params }: Dashboard2Props): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const { m } = getI18n(locale);

  // 预览页不收录：内容与首页重复，且随时会被替换
  return {
    title: m.home.metaTitle,
    description: m.home.metaDescription,
    robots: { index: false, follow: false },
  };
}

export default async function Dashboard2Page({ params }: Dashboard2Props) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const { t, m, isDefaultLocale } = getI18n(locale);

  const sections = await getSiteSections('HOME');
  const byKey = new Map(sections.map((section) => [section.sectionKey, section]));

  /** 中文页不使用 CMS 单语言文案（与 `/` 同一规则，避免中英混排） */
  const useCmsCopy = isDefaultLocale;

  const heroSection = useCmsCopy ? (byKey.get('home.hero') ?? null) : null;
  const capabilitiesSection = useCmsCopy ? (byKey.get('home.capabilities') ?? null) : null;
  const productsSection = useCmsCopy ? (byKey.get('home.products') ?? null) : null;
  const applicationsSection = useCmsCopy ? (byKey.get('home.applications') ?? null) : null;
  const ctaSection = useCmsCopy ? (byKey.get('home.cta') ?? null) : null;

  const categories = isDemoSource() ? [] : await getCategories();
  const categoriesWithProducts = categories.filter((category) => (category.productCount ?? 0) > 0);

  /** 按当前语言取标签与 alt（轮播组件本身不持有业务文案） */
  const slides: HeroSlide[] = HERO_SLIDES.map((slide) => ({
    src: slide.src,
    label: slide.labels[locale],
    alt: slide.alts[locale],
  }));

  return (
    <>
      {/* 预览标识：避免被当成线上首页 */}
      <div className="border-b border-warning-600/25 bg-warning-50">
        <div className="mx-auto flex w-full max-w-[1080px] flex-wrap items-center gap-2 px-6 py-2 text-caption text-warning-600">
          <span className="font-semibold">PREVIEW</span>
          <span>/dashboard2</span>
          <span className="opacity-80">— 首页轮播改版预览，正式首页未改动</span>
        </div>
      </div>

      <HeroCarousel slides={slides} locale={locale}>
        <div className="flex max-w-3xl flex-col gap-5">
          {heroSection?.eyebrow ? (
            <Badge variant="material" className="w-fit">
              {heroSection.eyebrow}
            </Badge>
          ) : (
            <Badge variant="material" className="w-fit">
              {t('home.heroBadge')}
            </Badge>
          )}

          <h1 className="text-display text-balance text-white">
            {heroSection?.title ?? (isDefaultLocale ? siteConfig.name : siteConfig.nameZh)}
          </h1>

          <p className="text-heading-sm font-normal text-white/85">
            {heroSection?.subtitle ??
              (isDefaultLocale
                ? `${siteConfig.nameZh} · ${siteConfig.taglineZh}`
                : siteConfig.taglineZh)}
          </p>

          <p className="max-w-2xl text-body-lg text-white/90 text-pretty">
            {heroSection?.body ??
              (isDefaultLocale ? siteConfig.description : siteConfig.descriptionZh)}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {heroSection?.ctaLabel && heroSection.ctaUrl ? (
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
        </div>
      </HeroCarousel>

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
