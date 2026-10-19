import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/page-hero';
import { Section, SectionHeader } from '@/components/layout/section';
import { ContentPlaceholder } from '@/components/layout/content-placeholder';
import { CtaBand } from '@/components/layout/cta-band';
import { LinkPagination } from '@/components/common/link-pagination';
import { BlogCard } from '@/components/blog/blog-card';
import { BlogCategoryFilter } from '@/components/blog/blog-category-filter';
import { WebPageSchema } from '@/components/seo/web-page-schema';
import { ContentFallbackNotice } from '@/components/common/content-fallback-notice';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { resolveSeoMetadata } from '@/lib/seo/resolver';
import { LocaleLink } from '@/i18n/link';
import { getI18n } from '@/i18n';
import { defaultLocale, isLocale, type Locale } from '@/i18n/config';
import { localizedPath } from '@/i18n/paths';
import {
  BLOG_PAGE_SIZE,
  getBlogCategories,
  getBlogPosts,
  normalizeBlogCategory,
  type BlogCategorySlug,
} from '@/lib/blog';

/**
 * 资讯 / 知识库列表 /blog（中文：/zh-CN/blog）
 *
 * 结构：Hero → Category Filter → Article Cards → Pagination → CTA
 *
 * 定位：**行业知识内容体系**（Industry Knowledge / Buying Guide /
 * Wood Material Guide / Manufacturing Insights），不是企业新闻。
 *
 * 语言：界面文案与日期格式随语言切换；文章标题 / 摘要 / 正文为业务内容
 * （CMS 单语言），中文界面下按英文原文展示并给出提示。
 *
 * SEO：metadata（绝对标题）+ WebPage 结构化数据；canonical 指向本语言的 /blog。
 */
interface BlogPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function resolveLocale(rawLocale: string): Locale {
  return isLocale(rawLocale) ? rawLocale : defaultLocale;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const { m } = getI18n(locale);

  return resolveSeoMetadata({
    title: m.blog.metaTitle,
    description: m.blog.metaDescription,
    path: '/blog',
    titleTemplateKey: 'blog',
    locale,
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

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  const [{ locale: rawLocale }, query] = await Promise.all([params, searchParams]);
  const locale = resolveLocale(rawLocale);
  const { t, m, isDefaultLocale } = getI18n(locale);

  const rawCategory = firstValue(query.category)?.trim();
  // 非法分类值收敛为"全部"，避免出现空结果页面
  const category = await normalizeBlogCategory(rawCategory);

  const rawPage = Number(firstValue(query.page));
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
        eyebrow={m.blog.eyebrow}
        title={m.blog.title}
        {...(isDefaultLocale ? { titleZh: m.blog.titleZh } : {})}
        description={m.blog.description}
        actions={
          <>
            <Button asChild size="lg">
              <LocaleLink locale={locale} href="/contact#rfq">
                {t('common.requestQuote')}
              </LocaleLink>
            </Button>
            <Button asChild size="lg" variant="outline">
              <LocaleLink locale={locale} href="/products">
                {t('common.viewProducts')}
              </LocaleLink>
            </Button>
          </>
        }
        aside={
          <div className="flex flex-wrap gap-2">
            <Badge variant="application">{m.blog.badgeKnowledge}</Badge>
            <Badge variant="material">{m.blog.badgeGuide}</Badge>
          </div>
        }
      />

      {/* 分类筛选 */}
      <Section size="sm" tone="surface">
        <BlogCategoryFilter
          categories={categories}
          activeSlug={category}
          locale={locale}
        />
      </Section>

      {/* 文章列表 */}
      <Section>
        <SectionHeader
          eyebrow={m.blog.articlesEyebrow}
          title={activeCategory ? activeCategory.name : m.blog.latestArticles}
          description={
            activeCategory
              ? t('blog.categorySummary', { count: result.total })
              : m.blog.articlesDescription
          }
          action={
            <span className="text-small text-text-muted">
              {result.total === 1
                ? t('common.countArticleOne', { count: result.total })
                : t('common.countArticles', { count: result.total })}
            </span>
          }
        />

        {result.items.length > 0 ? (
          <>
            <ContentFallbackNotice locale={locale} className="mt-6" />
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((post) => (
                <BlogCard
                  key={post.slug}
                  post={post}
                  categoryLabel={categoryNames.get(post.category)}
                  locale={locale}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="mt-10">
            <ContentPlaceholder
              locale={locale}
              title={category ? m.blog.emptyCategoryTitle : m.blog.emptyTitle}
              note={m.blog.emptyNote}
              minHeightClass="min-h-56"
            />
          </div>
        )}

        <LinkPagination
          page={result.page}
          totalPages={result.totalPages}
          buildHref={(target) => buildPageHref(target, category)}
          label={m.blog.paginationLabel}
          locale={locale}
        />
      </Section>

      <CtaBand
        locale={locale}
        title={m.blog.ctaTitle}
        description={m.blog.ctaDescription}
        secondaryHref="/applications"
        secondaryLabel={t('common.viewApplications')}
      />

      {/* 结构化数据 */}
      <WebPageSchema
        name={m.blog.metaTitle}
        description={m.blog.metaDescription}
        path={localizedPath('/blog', locale)}
        locale={locale}
      />
    </>
  );
}
