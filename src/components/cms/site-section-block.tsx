import Link from 'next/link';
import { Section, SectionHeader } from '@/components/layout/section';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/common/optimized-image';
import type { SiteSection, SiteSectionItem, SiteSectionStat } from '@/lib/site';

/**
 * 结构化内容分区渲染器（Phase 4.7）
 *
 * SiteSection 是**定式结构化字段**（眉题 / 标题 / 副标题 / 正文 / 媒体 /
 * CTA / 卡片 / 统计项）——不是页面构建器：本组件即这些字段的唯一渲染契约。
 *
 * 安全说明：
 *   · URL 由后端 CMS 写入时统一校验（normalizeSiteUrl：仅站内相对路径或
 *     https / mailto / tel），这里不做二次拦截，但外链必须补 rel；
 *   · 本组件不渲染任何原始 HTML —— items / stats / body 均为结构化字段，
 *     天然无注入面（与博客 contentHtml 的后端净化路径相互独立）。
 */

/** 分区 CTA 链接：站内相对路径用 next/link，其余（https / mailto / tel）用原生 a */
export function SiteCtaLink({
  url,
  label,
  className,
  variant = 'primary',
  size,
}: {
  url: string;
  label: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'forest';
  size?: 'sm' | 'default' | 'lg';
}) {
  const isInternal = url.startsWith('/');
  if (isInternal) {
    return (
      <Button asChild className={className} variant={variant} size={size}>
        <Link href={url}>{label}</Link>
      </Button>
    );
  }
  return (
    <Button asChild className={className} variant={variant} size={size}>
      <a href={url} rel="noopener noreferrer">
        {label}
      </a>
    </Button>
  );
}

/** 正文分段（空行分段，与种子 / 后台多行文本编辑习惯一致） */
function BodyParagraphs({ body }: { body: string }) {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="text-body text-text-secondary text-pretty">
          {paragraph}
        </p>
      ))}
    </>
  );
}

/** 卡片列表（结构化条目：标题 / 描述 / 可选链接） */
function ItemCards({ items }: { items: SiteSectionItem[] }) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <Card key={`${item.title}-${index}`} className="h-full">
          <CardHeader>
            <CardTitle>{item.title}</CardTitle>
            {item.description ? <CardDescription>{item.description}</CardDescription> : null}
          </CardHeader>
          {item.href ? (
            <div className="px-6 pb-6">
              <SiteCtaLink
                url={item.href}
                label="Learn more"
                variant="ghost"
                size="sm"
                className="px-0"
              />
            </div>
          ) : null}
        </Card>
      ))}
    </div>
  );
}

/** 统计项行（label / value） */
function StatRow({ stats }: { stats: SiteSectionStat[] }) {
  return (
    <dl className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div key={`${stat.label}-${index}`} className="rounded-lg border border-border bg-surface p-5">
          <dt className="text-caption tracking-wider text-text-muted uppercase">{stat.label}</dt>
          <dd className="mt-1 text-heading-md text-foreground">{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * 分区内容本体（不含 Section 外壳）。
 * 页面可自行决定包裹容器 / 背景，便于与既有版式对齐。
 */
export function SiteSectionContent({
  section,
  align = 'left',
  headingAs = 'h2',
  mediaAspectRatio = '16/9',
  mediaSizes = '(min-width: 1024px) 720px, 100vw',
}: {
  section: SiteSection;
  align?: 'left' | 'center';
  headingAs?: 'h1' | 'h2' | 'h3';
  mediaAspectRatio?: '16/9' | '4/3' | '1/1';
  mediaSizes?: string;
}) {
  const hasHeader = Boolean(section.title || section.eyebrow || section.subtitle);

  return (
    <div className="flex flex-col gap-6">
      {hasHeader ? (
        <SectionHeader
          eyebrow={section.eyebrow ?? undefined}
          title={section.title ?? ''}
          description={section.subtitle ?? undefined}
          align={align}
          as={headingAs}
        />
      ) : null}

      {section.body ? <BodyParagraphs body={section.body} /> : null}

      {section.media ? (
        <div className="overflow-hidden rounded-lg border border-border">
          <OptimizedImage
            src={section.media.url}
            alt={section.media.altText ?? section.title ?? ''}
            aspectRatio={mediaAspectRatio}
            sizes={mediaSizes}
            placeholderLabel="Photo to be added"
          />
        </div>
      ) : null}

      {section.items.length > 0 ? <ItemCards items={section.items} /> : null}
      {section.stats.length > 0 ? <StatRow stats={section.stats} /> : null}

      {section.ctaLabel && section.ctaUrl ? (
        <div>
          <SiteCtaLink url={section.ctaUrl} label={section.ctaLabel} />
        </div>
      ) : null}
    </div>
  );
}

/** 分区 + Section 外壳（tone / id 由页面指定） */
export function SiteSectionBlock({
  section,
  tone = 'default',
  id,
  align = 'left',
  headingAs = 'h2',
}: {
  section: SiteSection;
  tone?: 'default' | 'surface' | 'brand' | 'forest';
  id?: string;
  align?: 'left' | 'center';
  headingAs?: 'h1' | 'h2' | 'h3';
}) {
  return (
    <Section tone={tone} id={id}>
      <SiteSectionContent section={section} align={align} headingAs={headingAs} />
    </Section>
  );
}
