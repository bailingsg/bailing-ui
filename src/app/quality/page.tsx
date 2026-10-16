import type { Metadata } from 'next';
import Link from 'next/link';
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
import { getImages } from '@/lib/factory';
import { getQualityCertificates, type QualityRecord } from '@/lib/quality';

/**
 * 质量管控页 /quality
 *
 * 结构：Hero → Quality Philosophy → Inspection Process → Quality Control →
 *       Certificates Framework → Packaging Quality → CTA
 *
 * 内容原则（零虚构）：不出现任何证书名称、证书编号（ISO / FSC / CE 等）、
 * 检测数据或第三方机构名称；未确认内容一律显示为"待补充 / 后续更新"。
 */
export async function generateMetadata(): Promise<Metadata> {
  return resolveSeoMetadata({
    title: 'Quality Control',
    description:
      'Quality control at Bailing Wooden — incoming material inspection, in-process checks, final inspection and packaging protection for wooden products.',
    path: '/quality',
  });
}

/** 质量理念（管理原则，非数据声明） */
const qualityPhilosophy = [
  {
    title: 'Specification First',
    description:
      'Every order is produced against a confirmed specification and approved sample, so buyer and factory work from the same standard.',
  },
  {
    title: 'Inspect at Every Stage',
    description:
      'Checks are applied from incoming material through production to pre-shipment, rather than only at the end of the line.',
  },
  {
    title: 'Records for Traceability',
    description:
      'Inspection and loading records are kept for each shipment, so the handling of an order can be traced afterwards.',
  },
  {
    title: 'Continuous Improvement',
    description:
      'Findings from inspections are fed back into the process to reduce repeat issues on following orders.',
  },
];

/** 检验流程（体系框架，不声明检测数值或频次） */
const inspectionSteps = [
  { title: 'Incoming Material Check', description: 'Timber and components checked against the agreed specification.' },
  { title: 'Production Inspection', description: 'Dimensional and visual checks carried out during production.' },
  { title: 'Final Inspection', description: 'Finished goods inspected before packing.' },
  { title: 'Packaging Check', description: 'Export packing, labelling and moisture protection verified.' },
];

/** 质量管控要点 */
const controlPoints = [
  {
    title: 'Material Inspection',
    description: 'Incoming timber and components are checked against the agreed specification before use.',
  },
  {
    title: 'Production Monitoring',
    description: 'In-process checks monitor dimensions and appearance while the order is being produced.',
  },
  {
    title: 'Final Check',
    description: 'Finished goods are inspected before they are released to packing.',
  },
  {
    title: 'Packaging Protection',
    description: 'Export packing and moisture protection are verified to keep goods in condition during transit.',
  },
];

/** 已发布的质量记录（认证 / 检测报告）——CMS 模式真实数据，演示模式为空数组 */
function PublishedRecords({ records }: { records: QualityRecord[] }) {
  if (records.length === 0) return null;

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {records.map((record) => (
        <Card key={record.slug} className="h-full">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="certificate">
                {record.recordType === 'TEST_REPORT' ? 'Test report' : 'Certification'}
              </Badge>
              {record.isExpired === true ? (
                <Badge variant="outline">Expired</Badge>
              ) : null}
            </div>
            <CardTitle className="mt-2">{record.title}</CardTitle>
            <CardDescription>{record.description}</CardDescription>
          </CardHeader>
          <div className="flex flex-col gap-2 px-6 pb-6 text-small text-text-secondary">
            {record.issuer ? <span>Issuer: {record.issuer}</span> : null}
            {record.certificateNumber ? <span>No.: {record.certificateNumber}</span> : null}
            {record.issueDate ? <span>Issued: {formatDate(record.issueDate)}</span> : null}
            {record.expiryDate ? <span>Valid until: {formatDate(record.expiryDate)}</span> : null}
            {record.file ? (
              <a
                href={record.file.url}
                className="text-primary underline underline-offset-4 transition-colors hover:text-primary-hover"
                {...(record.file.isDocument ? { download: true } : {})}
                rel="noopener noreferrer"
              >
                View document
              </a>
            ) : null}
          </div>
        </Card>
      ))}
    </div>
  );
}

export default async function QualityPage() {
  const [inspectionImages, packagingImages, certificates] = await Promise.all([
    getImages(['inspection']),
    getImages(['packaging']),
    // demo 模式返回空数组（不发请求），页面展示"待补充"框架
    getQualityCertificates(),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Quality"
        title="Quality Control System"
        titleZh="品质管控"
        description="Quality is managed at every stage of production — from incoming material to pre-shipment inspection. Certificates and test reports are published once verified by the business."
      />

      {/* 1. Quality Philosophy */}
      <Section>
        <SectionHeader
          eyebrow="Philosophy"
          title="How we approach quality"
          description="The principles behind our quality management — process discipline, staged inspection and traceable records."
        />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {qualityPhilosophy.map((item) => (
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
          eyebrow="Inspection"
          title="Inspection process"
          description="A staged inspection process designed to keep every shipment consistent with the approved sample."
        />
        <ProcessFlow className="mt-10" steps={inspectionSteps} stepLabel="Stage" />
        <GalleryGrid
          className="mt-10"
          images={inspectionImages}
          columns={3}
          placeholderCount={3}
          placeholderLabel="Inspection photo to be added"
          emptyNotice="Inspection photographs will be updated once provided by the business."
        />
      </Section>

      {/* 3. Quality Control */}
      <Section>
        <SectionHeader
          eyebrow="Control"
          title="Quality control"
          description="The control points applied across material, production, final goods and packaging."
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
          eyebrow="Certificates"
          title="Certifications & compliance"
          description="Certificates and compliance information will be updated."
        />
        {certificates.length > 0 ? (
          <PublishedRecords records={certificates} />
        ) : (
          <>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Badge variant="outline">Status: To be confirmed</Badge>
              <span className="text-small text-text-muted">
                No certificate names, numbers or issuing bodies are displayed until they are verified
                by the business.
              </span>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <ContentPlaceholder
                  key={index}
                  title={`Certificate ${String(index + 1).padStart(2, '0')}`}
                  note="Certificate information will be updated"
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
          eyebrow="Packaging"
          title="Packaging quality"
          description="Export packing is checked to protect the goods through handling, stowage and transit."
        />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Packing & Protection</CardTitle>
              <CardDescription>
                Export-grade packing and moisture protection applied according to the shipping plan.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Labelling & Marking</CardTitle>
              <CardDescription>
                Shipping marks and labelling checked against the order documents before loading.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Loading Check</CardTitle>
              <CardDescription>
                Condition of packed goods verified at loading, with loading photos recorded per shipment.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        <GalleryGrid
          className="mt-8"
          images={packagingImages}
          columns={3}
          placeholderCount={3}
          placeholderLabel="Packaging photo to be added"
          emptyNotice="Packaging photographs will be updated once provided by the business."
        />
        <div className="mt-8">
          <Button asChild variant="outline">
            <Link href="/factory">View Factory &amp; Shipment</Link>
          </Button>
        </div>
      </Section>

      <CtaBand
        title="Need specific test reports?"
        description="Tell us the standard or test you require and we will confirm the applicable documentation."
        secondaryHref="/factory"
        secondaryLabel="View Factory"
      />

      {/* 页面级结构化数据（Organization 由根布局全局输出） */}
      <WebPageSchema
        name="Quality Control"
        description="Quality control at Bailing Wooden — incoming material inspection, in-process checks, final inspection and packaging protection for wooden products."
        path="/quality"
      />
    </>
  );
}
