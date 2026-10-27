import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/page-hero';
import { Section, SectionHeader } from '@/components/layout/section';
import { CtaBand } from '@/components/layout/cta-band';
import { FactoryGallery } from '@/components/media/factory-gallery';
import { ProcessFlow } from '@/components/common/process-flow';
import { ContentFallbackNotice } from '@/components/common/content-fallback-notice';
import { WebPageSchema } from '@/components/seo/web-page-schema';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { resolveSeoMetadata } from '@/lib/seo/resolver';
import { LocaleLink } from '@/i18n/link';
import { getI18n } from '@/i18n';
import { defaultLocale, isLocale, type Locale } from '@/i18n/config';
import { localizedPath } from '@/i18n/paths';
import { getFactoryOverview, getImages, FACTORY_MAX_IMAGES_PER_GALLERY } from '@/lib/factory';

/**
 * 工厂实力页 /factory（中文：/zh-CN/factory）
 *
 * 结构：Hero → Factory Introduction → Factory Gallery → Production Process →
 *       Equipment → Loading & Shipment → Exhibition → CTA
 *
 * 内容原则（零虚构）：不出现工厂面积、年产量、员工数量、设备数量、客户名称、
 * 合作品牌、证书编号或任何检测数据；未确认内容一律显示为"待补充"。
 *
 * 语言：流程 / 图集 / 按钮等界面文案随语言切换；CMS 的工厂概述属于业务内容，
 * 只有单语言版本，中文界面下按原文展示并给出提示。
 */

interface FactoryPageProps {
  params: Promise<{ locale: string }>;
}

function resolveLocale(rawLocale: string): Locale {
  return isLocale(rawLocale) ? rawLocale : defaultLocale;
}

export async function generateMetadata({ params }: FactoryPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const { m } = getI18n(locale);

  // 中文页面不使用 CMS 概述（单语言）作为 SEO 描述
  if (locale !== defaultLocale) {
    return resolveSeoMetadata({
      title: m.factory.metaTitle,
      description: m.factory.metaDescription,
      path: '/factory',
      locale,
    });
  }

  const overview = await getFactoryOverview();
  return resolveSeoMetadata({
    title: overview?.title ?? m.factory.metaTitle,
    description: overview?.summary ?? m.factory.metaDescription,
    path: '/factory',
    locale,
  });
}

export default async function FactoryPage({ params }: FactoryPageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const { t, m, isDefaultLocale } = getI18n(locale);

  // 工厂页各板块拉取**全量**素材：预览截断到 FACTORY_MAX_IMAGES_PER_GALLERY（6）
  // 由客户端组件负责，其余照片经「查看更多照片」弹窗展示（2026-10-24 起）。
  const [facilityImages, equipmentImages, loadingImages, exhibitionImages, overview] =
    await Promise.all([
      getImages(['factory', 'production'], Number.POSITIVE_INFINITY),
      getImages(['equipment'], Number.POSITIVE_INFINITY),
      getImages(['loading'], Number.POSITIVE_INFINITY),
      getImages(['exhibition'], Number.POSITIVE_INFINITY),
      // demo 模式返回 null（不发请求），页面保留既有待补充版式；
      // 中文页不使用 CMS 概述（只有英文），改用 messages 里的中文文案
      isDefaultLocale ? getFactoryOverview() : Promise.resolve(null),
    ]);

  const productionSteps = Object.values(m.factory.steps);
  const shipmentPoints = Object.values(m.factory.shipment);

  return (
    <>
      <PageHero
        eyebrow={m.factory.eyebrow}
        title={m.factory.title}
        subtitle={m.factory.subtitle}
        description={m.factory.description}
      />

      {/* 1. Factory Introduction（单栏：原右侧「工厂全景照片」占位模块已去除） */}
      <Section>
        <div className="flex max-w-3xl flex-col gap-4">
          <SectionHeader
            eyebrow={m.factory.overviewEyebrow}
            title={overview?.title ?? m.factory.overviewTitle}
            description={overview?.summary ?? m.factory.overviewDescription}
          />
          {overview?.content ? (
            <>
              <p className="text-body text-text-secondary text-pretty whitespace-pre-line">
                {overview.content}
              </p>
              <ContentFallbackNotice locale={locale} />
            </>
          ) : (
            <p className="text-body text-text-secondary">{m.factory.overviewPending}</p>
          )}
          <p className="text-small text-text-muted">{m.factory.overviewNote}</p>
          <div>
            <Button asChild variant="outline">
              <LocaleLink locale={locale} href="/contact">
                {m.factory.contactTeam}
              </LocaleLink>
            </Button>
          </div>
        </div>
      </Section>

      {/* 2. Factory Gallery（工厂 + 生产合并图集；预览上限 6 张，其余经「查看更多」展示，见 lib/factory） */}
      <Section tone="surface">
        <SectionHeader
          eyebrow={m.factory.galleryEyebrow}
          title={m.factory.galleryTitle}
          description={m.factory.galleryDescription}
        />
        <FactoryGallery
          className="mt-10"
          images={facilityImages}
          previewCount={FACTORY_MAX_IMAGES_PER_GALLERY}
          placeholderCount={FACTORY_MAX_IMAGES_PER_GALLERY}
          dialogTitle={m.factory.galleryTitle}
          columns={3}
          locale={locale}
          placeholderLabel={t('common.photoPending')}
          emptyNotice={m.factory.galleryEmptyNotice}
        />
      </Section>

      {/* 3. Production Process */}
      <Section>
        <SectionHeader
          eyebrow={m.factory.processEyebrow}
          title={m.factory.processTitle}
          description={m.factory.processDescription}
        />
        <ProcessFlow className="mt-10" steps={productionSteps} locale={locale} />
      </Section>

      {/* 4. Equipment */}
      <Section tone="surface">
        <SectionHeader
          eyebrow={m.factory.equipmentEyebrow}
          title={m.factory.equipmentTitle}
          description={m.factory.equipmentDescription}
        />
        <FactoryGallery
          className="mt-10"
          images={equipmentImages}
          previewCount={FACTORY_MAX_IMAGES_PER_GALLERY}
          placeholderCount={FACTORY_MAX_IMAGES_PER_GALLERY}
          dialogTitle={m.factory.equipmentTitle}
          columns={3}
          locale={locale}
          placeholderLabel={m.factory.equipmentPlaceholder}
          emptyNotice={m.factory.equipmentEmptyNotice}
        />
      </Section>

      {/* 5. Loading & Shipment（外贸信任重点） */}
      <Section>
        <SectionHeader
          eyebrow={m.factory.loadingEyebrow}
          title={m.factory.loadingTitle}
          description={m.factory.loadingDescription}
        />

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shipmentPoints.map((point) => (
            <Card key={point.title}>
              <CardHeader>
                <CardTitle>{point.title}</CardTitle>
                <CardDescription>{point.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <FactoryGallery
          className="mt-8"
          images={loadingImages}
          previewCount={FACTORY_MAX_IMAGES_PER_GALLERY}
          placeholderCount={FACTORY_MAX_IMAGES_PER_GALLERY}
          dialogTitle={m.factory.loadingTitle}
          columns={3}
          locale={locale}
          placeholderLabel={m.factory.loadingPlaceholder}
          emptyNotice={m.factory.loadingEmptyNotice}
        />
      </Section>

      {/* 6. Exhibition */}
      <Section tone="surface">
        <SectionHeader
          eyebrow={m.factory.exhibitionEyebrow}
          title={m.factory.exhibitionTitle}
          description={m.factory.exhibitionDescription}
        />
        <FactoryGallery
          className="mt-10"
          images={exhibitionImages}
          previewCount={FACTORY_MAX_IMAGES_PER_GALLERY}
          placeholderCount={FACTORY_MAX_IMAGES_PER_GALLERY}
          dialogTitle={m.factory.exhibitionTitle}
          columns={3}
          locale={locale}
          placeholderLabel={m.factory.exhibitionPlaceholder}
          emptyNotice={m.factory.exhibitionEmptyNotice}
        />
      </Section>

      <CtaBand
        locale={locale}
        title={m.factory.ctaTitle}
        description={m.factory.ctaDescription}
        secondaryHref="/quality"
        secondaryLabel={t('common.viewQuality')}
      />

      {/* 页面级结构化数据（Organization 由根布局全局输出） */}
      <WebPageSchema
        name={m.factory.metaTitle}
        description={m.factory.metaDescription}
        path={localizedPath('/factory', locale)}
        locale={locale}
      />
    </>
  );
}
