import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/page-hero';
import { Section, SectionHeader } from '@/components/layout/section';
import { ContentPlaceholder } from '@/components/layout/content-placeholder';
import { CtaBand } from '@/components/layout/cta-band';
import { GalleryGrid } from '@/components/media/gallery-grid';
import { ProcessFlow } from '@/components/common/process-flow';
import { WebPageSchema } from '@/components/seo/web-page-schema';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { resolveSeoMetadata } from '@/lib/seo/resolver';
import { formatDate } from '@/lib/format';
import { LocaleLink } from '@/i18n/link';
import { getI18n } from '@/i18n';
import { defaultLocale, isLocale, type Locale } from '@/i18n/config';
import { localizedPath } from '@/i18n/paths';
import { getImages } from '@/lib/factory';
import { getQualityCertificates, type QualityRecord } from '@/lib/quality';

/**
 * 质量管控页 /quality（中文：/zh-CN/quality）
 *
 * 结构：Hero → Quality Philosophy → Inspection Process → Quality Control →
 *       Certificates Framework → Packaging Quality → CTA
 *
 * 内容原则（零虚构）：不出现任何证书名称、证书编号（ISO / FSC / CE 等）、
 * 检测数据或第三方机构名称；未确认内容一律显示为"待补充 / 后续更新"。
 *
 * 语言：理念 / 流程 / 字段标签等界面文案随语言切换；
 * 已发布的认证与检测记录属于业务内容（CMS 单语言），按原文展示。
 */

interface QualityPageProps {
  params: Promise<{ locale: string }>;
}

function resolveLocale(rawLocale: string): Locale {
  return isLocale(rawLocale) ? rawLocale : defaultLocale;
}

export async function generateMetadata({ params }: QualityPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const { m } = getI18n(locale);

  return resolveSeoMetadata({
    title: m.quality.metaTitle,
    description: m.quality.metaDescription,
    path: '/quality',
    locale,
  });
}

/** 已发布的质量记录（认证 / 检测报告）——CMS 模式真实数据，演示模式为空数组 */
function PublishedRecords({ records, locale }: { records: QualityRecord[]; locale: Locale }) {
  if (records.length === 0) return null;

  const { t, m } = getI18n(locale);

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {records.map((record) => (
        <Card key={record.slug} className="h-full">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="certificate">
                {record.recordType === 'TEST_REPORT'
                  ? m.quality.recordTestReport
                  : m.quality.recordCertification}
              </Badge>
              {record.isExpired === true ? (
                <Badge variant="outline">{m.quality.recordExpired}</Badge>
              ) : null}
            </div>
            <CardTitle className="mt-2">{record.title}</CardTitle>
            <CardDescription>{record.description}</CardDescription>
          </CardHeader>
          <div className="flex flex-col gap-2 px-6 pb-6 text-small text-text-secondary">
            {record.issuer ? (
              <span>{t('quality.recordIssuer', { issuer: record.issuer })}</span>
            ) : null}
            {record.certificateNumber ? (
              <span>{t('quality.recordNumber', { number: record.certificateNumber })}</span>
            ) : null}
            {record.issueDate ? (
              <span>{t('quality.recordIssued', { date: formatDate(record.issueDate, locale) })}</span>
            ) : null}
            {record.expiryDate ? (
              <span>
                {t('quality.recordValidUntil', { date: formatDate(record.expiryDate, locale) })}
              </span>
            ) : null}
            {record.file ? (
              <a
                href={record.file.url}
                className="text-primary underline underline-offset-4 transition-colors hover:text-primary-hover"
                {...(record.file.isDocument ? { download: true } : {})}
                rel="noopener noreferrer"
              >
                {m.quality.recordViewDocument}
              </a>
            ) : null}
          </div>
        </Card>
      ))}
    </div>
  );
}

export default async function QualityPage({ params }: QualityPageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const { t, m, isDefaultLocale } = getI18n(locale);

  const [inspectionImages, packagingImages, certificateImages, certificates] = await Promise.all([
    getImages(['inspection']),
    getImages(['packaging']),
    // 媒体库「证书」用途：仅在没有任何已发布质量记录时兜底成图片墙
    getImages(['certificate']),
    // demo 模式返回空数组（不发请求），页面展示"待补充"框架
    getQualityCertificates(),
  ]);

  const inspectionSteps = Object.values(m.quality.steps);
  const controlPoints = Object.values(m.quality.control);

  return (
    <>
      <PageHero
        eyebrow={m.quality.eyebrow}
        title={m.quality.title}
        {...(isDefaultLocale ? { titleZh: m.quality.titleZh } : {})}
        description={m.quality.description}
      />

      {/* 1. Quality Philosophy */}
      <Section>
        <SectionHeader
          eyebrow={m.quality.philosophyEyebrow}
          title={m.quality.philosophyTitle}
          description={m.quality.philosophyDescription}
        />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(m.quality.philosophy).map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </Section>

      {/* 2. Inspection Process */}
      <Section tone="surface">
        <SectionHeader
          eyebrow={m.quality.inspectionEyebrow}
          title={m.quality.inspectionTitle}
          description={m.quality.inspectionDescription}
        />
        <ProcessFlow
          className="mt-10"
          steps={inspectionSteps}
          stepLabel={m.quality.stepLabel}
          locale={locale}
        />
        {/* 检验流程照片：无素材时整块隐藏（2026-10-26 用户要求），
            不渲染占位瓦片——流程步骤本身已能表达内容，空框反而像故障。 */}
        {inspectionImages.length > 0 ? (
          <GalleryGrid
            className="mt-10"
            images={inspectionImages}
            columns={3}
            locale={locale}
          />
        ) : null}
      </Section>

      {/* 3. Quality Control */}
      <Section>
        <SectionHeader
          eyebrow={m.quality.controlEyebrow}
          title={m.quality.controlTitle}
          description={m.quality.controlDescription}
        />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {controlPoints.map((point, index) => (
            <Card key={point.title}>
              <CardHeader>
                <span className="text-caption font-semibold tracking-wider text-primary uppercase">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <CardTitle>{point.title}</CardTitle>
                <CardDescription>{point.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </Section>

      {/* 4. Certificates Framework（CMS 已发布记录为真实数据；未发布时展示待补充框架） */}
      <Section id="certificates" tone="surface">
        <SectionHeader
          eyebrow={m.quality.certificatesEyebrow}
          title={m.quality.certificatesTitle}
          description={m.quality.certificatesDescription}
        />
        {certificates.length > 0 ? (
          <PublishedRecords records={certificates} locale={locale} />
        ) : certificateImages.length > 0 ? (
          /* 无已发布质量记录时，用媒体库「证书」用途的图片兜底（2026-10-26） */
          <GalleryGrid className="mt-8" images={certificateImages} columns={3} locale={locale} />
        ) : (
          <>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Badge variant="outline">{m.quality.certificateStatus}</Badge>
              <span className="text-small text-text-muted">{m.quality.certificateNote}</span>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <ContentPlaceholder
                  key={index}
                  locale={locale}
                  title={t('quality.certificatePlaceholderTitle', {
                    index: String(index + 1).padStart(2, '0'),
                  })}
                  note={m.quality.certificatePlaceholderNote}
                  minHeightClass="min-h-44"
                />
              ))}
            </div>
          </>
        )}
      </Section>

      {/* 5. Packaging Quality */}
      <Section>
        <SectionHeader
          eyebrow={m.quality.packagingEyebrow}
          title={m.quality.packagingTitle}
          description={m.quality.packagingDescription}
        />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(m.quality.packaging).map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        {/* 包装品质照片：无素材时整块隐藏（2026-10-26 用户要求），与检验流程同口径 */}
        {packagingImages.length > 0 ? (
          <GalleryGrid
            className="mt-8"
            images={packagingImages}
            columns={3}
            locale={locale}
          />
        ) : null}
        <div className="mt-8">
          <Button asChild variant="outline">
            <LocaleLink locale={locale} href="/factory">
              {m.quality.viewFactoryShipment}
            </LocaleLink>
          </Button>
        </div>
      </Section>

      <CtaBand
        locale={locale}
        title={m.quality.ctaTitle}
        description={m.quality.ctaDescription}
        secondaryHref="/factory"
        secondaryLabel={t('common.viewFactory')}
      />

      {/* 页面级结构化数据（Organization 由根布局全局输出） */}
      <WebPageSchema
        name={m.quality.metaTitle}
        description={m.quality.metaDescription}
        path={localizedPath('/quality', locale)}
        locale={locale}
      />
    </>
  );
}
