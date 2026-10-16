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
import { buildMetadata } from '@/lib/seo';
import { getFactoryOverview, getImages } from '@/lib/factory';

/**
 * 工厂实力页 /factory
 *
 * 结构：Hero → Factory Introduction → Factory Gallery → Production Process →
 *       Equipment → Loading & Shipment → Exhibition → CTA
 *
 * 内容原则（零虚构）：不出现工厂面积、年产量、员工数量、设备数量、客户名称、
 * 合作品牌、证书编号或任何检测数据；未确认内容一律显示为"待补充"。
 */
export const metadata: Metadata = buildMetadata({
  title: 'Factory',
  description: 'Manufacturing capability and production information of Bailing Wooden.',
  path: '/factory',
});

/** 生产流程（体系框架，非真实产能/参数声明） */
const productionSteps = [
  { title: 'Raw Material', description: 'Timber and components received against the agreed specification.' },
  { title: 'Processing', description: 'Cutting, machining and surface preparation.' },
  { title: 'Quality Inspection', description: 'In-process checks before the goods move to packing.' },
  { title: 'Packaging', description: 'Export packing, labelling and moisture protection.' },
  { title: 'Shipment', description: 'Loading, container stowage and export documentation.' },
];

/** 装车与发运环节（外贸信任重点） */
const shipmentPoints = [
  {
    title: 'Loading',
    description: 'Goods loaded under supervision, with loading photos recorded for each shipment.',
  },
  {
    title: 'Packaging',
    description: 'Export-grade packing and marking applied according to the shipping plan.',
  },
  {
    title: 'Shipment Preparation',
    description: 'Container stowage, sealing and export documentation prepared before departure.',
  },
];

export default async function FactoryPage() {
  const [facilityImages, equipmentImages, loadingImages, exhibitionImages, overview] =
    await Promise.all([
      getImages(['factory', 'production']),
      getImages(['equipment']),
      getImages(['loading']),
      getImages(['exhibition']),
      // demo 模式返回 null（不发请求），页面保留既有待补充版式
      getFactoryOverview(),
    ]);

  return (
    <>
      <PageHero
        eyebrow="Factory"
        title="Wood Manufacturing Capability"
        titleZh="工厂实力"
        description="Production workflow, workshop and shipment records for wooden product manufacturing. Factory information is published once verified by the business."
      />

      {/* 1. Factory Introduction */}
      <Section>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col gap-4">
            <SectionHeader
              eyebrow="Overview"
              title={overview?.title ?? 'Manufacturing capability'}
              description={
                overview?.summary ??
                'A verified factory profile — production base, workshop layout and manufacturing scope — will be published in this section.'
              }
            />
            {overview?.content ? (
              <p className="text-body text-text-secondary text-pretty whitespace-pre-line">
                {overview.content}
              </p>
            ) : (
              <p className="text-body text-text-secondary">Factory information will be updated.</p>
            )}
            <p className="text-small text-text-muted">
              No figures (floor area, output, headcount or equipment count) are displayed until they
              are confirmed by the business, so that overseas buyers always see accurate information.
            </p>
            <div>
              <Button asChild variant="outline">
                <Link href="/contact">Contact Our Team</Link>
              </Button>
            </div>
          </div>
          <ContentPlaceholder
            title="Factory overview photo"
            note="Photo to be added"
            minHeightClass="min-h-72"
          />
        </div>
      </Section>

      {/* 2. Factory Gallery */}
      <Section tone="surface">
        <SectionHeader
          eyebrow="Gallery"
          title="Factory & workshop"
          description="Photographs of the production base, workshops and production lines will be displayed here."
        />
        <GalleryGrid
          className="mt-10"
          images={facilityImages}
          columns={3}
          placeholderCount={6}
          placeholderLabel="Photo to be added"
          emptyNotice="Factory photographs will be updated once provided by the business."
        />
      </Section>

      {/* 3. Production Process */}
      <Section>
        <SectionHeader
          eyebrow="Process"
          title="Production process"
          description="The production workflow from raw material to shipment. This outlines the process framework and does not state production parameters."
        />
        <ProcessFlow className="mt-10" steps={productionSteps} />
      </Section>

      {/* 4. Equipment */}
      <Section tone="surface">
        <SectionHeader
          eyebrow="Equipment"
          title="Production equipment"
          description="Photographs of the machinery and production lines will be displayed here."
        />
        <GalleryGrid
          className="mt-10"
          images={equipmentImages}
          columns={3}
          placeholderCount={3}
          placeholderLabel="Equipment photo to be added"
          emptyNotice="Equipment details will be updated."
        />
      </Section>

      {/* 5. Loading & Shipment（外贸信任重点） */}
      <Section>
        <SectionHeader
          eyebrow="Loading & Shipment"
          title="Loading and shipment"
          description="Loading, packaging and shipment preparation records — evidence of how each order is handled before departure."
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

        <GalleryGrid
          className="mt-8"
          images={loadingImages}
          columns={3}
          placeholderCount={3}
          placeholderLabel="Loading photo to be added"
          emptyNotice="Loading and shipment photographs will be updated once provided by the business."
        />
      </Section>

      {/* 6. Exhibition */}
      <Section tone="surface">
        <SectionHeader
          eyebrow="Exhibition"
          title="Exhibition gallery"
          description="Photographs from trade fairs and exhibitions will be displayed here."
        />
        <GalleryGrid
          className="mt-10"
          images={exhibitionImages}
          columns={3}
          placeholderCount={3}
          placeholderLabel="Exhibition photo to be added"
          emptyNotice="Exhibition photographs will be updated once provided by the business."
        />
      </Section>

      <CtaBand
        title="Planning a factory visit or audit?"
        description="Contact our export team to arrange a video tour or an on-site visit."
        secondaryHref="/quality"
        secondaryLabel="View Quality Control"
      />

      {/* 页面级结构化数据（Organization 由根布局全局输出） */}
      <WebPageSchema
        name="Factory"
        description="Manufacturing capability and production information of Bailing Wooden."
        path="/factory"
      />
    </>
  );
}
