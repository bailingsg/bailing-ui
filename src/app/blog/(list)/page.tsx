import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/layout/page-hero';
import { Section, SectionHeader } from '@/components/layout/section';
import { ContentPlaceholder } from '@/components/layout/content-placeholder';
import { CtaBand } from '@/components/layout/cta-band';
import { LinkPagination } from '@/components/common/link-pagination';
import { BlogCard } from '@/components/blog/blog-card';
import { BlogCategoryFilter } from '@/components/blog/blog-category-filter';
import { WebPageSchema } from '@/components/seo/web-page-schema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { resolveSeoMetadata } from '@/lib/seo/resolver';
import {
  BLOG_PAGE_SIZE,
  getBlogCategories,
  getBlogPosts,
  normalizeBlogCategory,
  type BlogCategorySlug,
} from '@/lib/blog';

/**
 * 资讯 / 知识库列表 /blog
 *
 * 结构：Hero → Category Filter → Article Cards → Pagination → CTA
 *
 * 定位：**行业知识内容体系**（Industry Knowledge / Buying Guide /
 * Wood Material Guide / Manufacturing Insights），不是企业新闻。
 *
 * SEO：metadata（绝对标题）+ WebPage 结构化数据；文章详情页输出 Article。
 * canonical 始终指向 /blog，避免筛选组合产生重复内容。
 */

const META_DESCRIPTION =
  'Wood industry insights from Bailing Wooden — buying guides, material comparisons and manufacturing know-how for B2B buyers of MDF, plywood and wood-based panels.';

export async function generateMetadata(): Promise<Metadata> {
  return resolveSeoMetadata({
    title: 'Wood Industry Insights | Bailing Wooden',
    description: META_DESCRIPTION,
    path: '/blog',
    titleTemplateKey: 'blog',
    keywords: [
      'wood industry insights',
      'MDF buying guide',
      'plywood vs MDF',
      'wood panel quality control',
      'wood material guide',
      'panel sourcing guide',
    ],
  });
}

interface BlogPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function buildPageHref(page: number, category?: BlogCategorySlug): string {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (page > 1) params.set('page', String(page));
  const search = params.toString();
  return `/blog${search ? `?${search}` : ''}`;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;

  const rawCategory = firstValue(params.category)?.trim();
  // 非法分类值收敛为"全部"，避免出现空结果页面
  const category = await normalizeBlogCategory(rawCategory);

  const rawPage = Number(firstValue(params.page));
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;

  const [categories, result] = await Promise.all([
    getBlogCategories(),
    getBlogPosts({ category, page, pageSize: BLOG_PAGE_SIZE }),
  ]);

  const categoryNames = new Map(categories.map((item) => [item.slug, item.name]));
  const activeCategory = categories.find((item) => item.slug === category);

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Wood Industry Insights"
        titleZh="行业知识与采购指南"
        description="Practical guides on choosing, specifying and checking wood-based panels — written for buyers, not for search engines."
        actions={
          <>
            <Button asChild size="lg">
              <Link href="/contact#rfq">Request Quote</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/products">View Products</Link>
            </Button>
          </>
        }
        aside={
          <div className="flex flex-wrap gap-2">
            <Badge variant="application">Industry Knowledge</Badge>
            <Badge variant="material">Buying Guide</Badge>
          </div>
        }
      />

      {/* 分类筛选 */}
      <Section size="sm" tone="surface">
        <BlogCategoryFilter categories={categories} activeSlug={category} />
      </Section>

      {/* 文章列表 */}
      <Section>
        <SectionHeader
          eyebrow="Articles"
          title={activeCategory ? activeCategory.name : 'Latest articles'}
          description={
            activeCategory
              ? `${activeCategory.nameZh} — ${result.total} ${result.total === 1 ? 'article' : 'articles'}.`
              : 'Buying guides, material comparisons and manufacturing know-how. New articles are added as the library grows.'
          }
          action={
            <span className="text-small text-text-muted">
              {result.total} {result.total === 1 ? 'article' : 'articles'}
            </span>
          }
        />

        {result.items.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((post) => (
              <BlogCard key={post.slug} post={post} categoryLabel={categoryNames.get(post.category)} />
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <ContentPlaceholder
              title={category ? 'No articles in this category yet' : 'No articles published yet'}
              note="Articles are added from the content system once available."
              minHeightClass="min-h-56"
            />
          </div>
        )}

        <LinkPagination
          page={result.page}
          totalPages={result.totalPages}
          buildHref={(target) => buildPageHref(target, category)}
          label="Blog pagination"
        />
      </Section>

      <CtaBand
        title="Need a material recommendation?"
        description="Tell us the application and the performance it needs — we will suggest a suitable panel specification."
        primaryLabel="Request Quote"
        secondaryHref="/applications"
        secondaryLabel="View Applications"
      />

      {/* 结构化数据 */}
      <WebPageSchema
        name="Wood Industry Insights | Bailing Wooden"
        description={META_DESCRIPTION}
        path="/blog"
      />
    </>
  );
}
