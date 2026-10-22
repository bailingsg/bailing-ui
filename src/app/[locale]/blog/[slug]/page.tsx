import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/container';
import { Section, SectionHeader } from '@/components/layout/section';
import { ContentPlaceholder } from '@/components/layout/content-placeholder';
import { CtaBand } from '@/components/layout/cta-band';
import { OptimizedImage } from '@/components/common/optimized-image';
import { ProductCard } from '@/components/common/product-card';
import { BlogCard } from '@/components/blog/blog-card';
import { BlogContent } from '@/components/blog/blog-content';
import { ArticleSchema } from '@/components/blog/article-schema';
import { BreadcrumbSchema } from '@/components/seo/breadcrumb-schema';
import { ContentFallbackNotice } from '@/components/common/content-fallback-notice';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { resolveSeoMetadata } from '@/lib/seo/resolver';
import { formatDate, toDateTimeAttribute } from '@/lib/format';
import { LocaleLink } from '@/i18n/link';
import { getI18n } from '@/i18n';
import { defaultLocale, isLocale, type Locale } from '@/i18n/config';
import { localizedPath } from '@/i18n/paths';
import {
  getBlogCategories,
  getBlogPostBySlug,
  getBlogSlugs,
  getRelatedBlogPosts,
} from '@/lib/blog';
import { getProductBySlug, productDetailPath, type ProductListItem } from '@/lib/products';

/**
 * 文章详情 /blog/[slug]（中文：/zh-CN/blog/[slug]）
 *
 * 结构：Breadcrumb → Article Hero → Content → Tags → Related Products
 *      → Related Articles → RFQ CTA
 *
 * 语言：面包屑、日期格式、阅读时长、侧栏与按钮文案随语言切换；
 * 文章标题 / 摘要 / 正文属于业务内容（CMS 单语言），中文界面按原文展示并提示。
 *
 * SEO：动态 metadata（title / description / canonical / hreflang / article OG）
 * + Article JSON-LD。禁止 Product schema。
 *
 * 404 策略：与 /products/[slug] 一致 —— 允许按需生成（dynamicParams = true），
 * 未发布 / 已删除 / 不存在的 slug 由 notFound() 返回**真正的 HTTP 404**。
 */

interface BlogDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

function resolveLocale(rawLocale: string): Locale {
  return isLocale(rawLocale) ? rawLocale : defaultLocale;
}

/** 预渲染已知文章；未登记的 slug 按需生成 */
export async function generateStaticParams() {
  const slugs = await getBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export const dynamicParams = true;

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const { m } = getI18n(locale);
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: m.blogDetail.notFoundTitle,
      description: m.blogDetail.notFoundDescription,
      robots: { index: false, follow: false },
    };
  }

  return resolveSeoMetadata({
    title: post.seo.title,
    description: post.seo.description,
    path: `/blog/${post.slug}`,
    titleTemplateKey: 'blog',
    locale,
    keywords: post.tags,
    ogType: 'article',
    ogImage: post.coverImage ?? undefined,
    ogImageAlt: post.coverImageAlt,
  });
}

function primaryImageUrl(product: ProductListItem): string | null {
  const primary = product.images.find((image) => image.isPrimary) ?? product.images[0];
  return primary?.url ?? null;
}

async function resolveProducts(slugs: string[]): Promise<ProductListItem[]> {
  const resolved = await Promise.all(slugs.map((slug) => getProductBySlug(slug)));
  return resolved.filter((item): item is NonNullable<typeof item> => item !== null);
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const { t, m } = getI18n(locale);

  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const [categories, relatedProducts, relatedPosts] = await Promise.all([
    getBlogCategories(),
    resolveProducts(post.relatedProducts),
    getRelatedBlogPosts(post.slug, 3),
  ]);

  const category = categories.find((item) => item.slug === post.category);
  const categoryNames = new Map(categories.map((item) => [item.slug, item.name]));
  const published = formatDate(post.publishedAt, locale);
  const updated = post.updatedAt ? formatDate(post.updatedAt, locale) : '';

  return (
    <>
      {/* Article Hero */}
      <section className="border-b border-border bg-surface">
        <Container className="py-10 sm:py-14">
          {/* 面包屑 */}
          <nav aria-label={t('common.breadcrumb')} className="mb-6 flex flex-wrap items-center gap-2 text-caption">
            <LocaleLink
              locale={locale}
              href="/"
              className="text-text-muted transition-colors hover:text-foreground"
            >
              {t('common.home')}
            </LocaleLink>
            <span aria-hidden="true" className="text-text-muted">
              /
            </span>
            <LocaleLink
              locale={locale}
              href="/blog"
              className="text-text-muted transition-colors hover:text-foreground"
            >
              {m.nav.blog}
            </LocaleLink>
            <span aria-hidden="true" className="text-text-muted">
              /
            </span>
            <span className="text-foreground">{post.title}</span>
          </nav>

          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-3">
              <LocaleLink
                locale={locale}
                href={`/blog?category=${encodeURIComponent(post.category)}`}
                className="outline-none"
              >
                <Badge variant="application" className="cursor-pointer">
                  {category?.name ?? post.category}
                </Badge>
              </LocaleLink>
              {published ? (
                <time
                  dateTime={toDateTimeAttribute(post.publishedAt)}
                  className="text-caption text-text-muted"
                >
                  {t('common.published', { date: published })}
                </time>
              ) : null}
              {updated ? (
                <span className="text-caption text-text-muted">
                  {t('common.updated', { date: updated })}
                </span>
              ) : null}
              <span className="text-caption text-text-muted">
                {t('common.minRead', { minutes: post.readingMinutes })}
              </span>
            </div>

            <h1 className="max-w-4xl text-balance">{post.title}</h1>

            <p className="max-w-3xl text-body-lg text-text-secondary text-pretty">{post.excerpt}</p>

            <ContentFallbackNotice locale={locale} className="max-w-3xl" />
          </div>
        </Container>
      </section>

      {/* Cover */}
      {post.coverImage ? (
        <Section size="sm" tone="default">
          <div className="overflow-hidden rounded-lg border border-border">
            <OptimizedImage
              src={post.coverImage}
              alt={post.coverImageAlt}
              locale={locale}
              aspectRatio="16/9"
              priority
              sizes="(min-width: 1024px) 1024px, 100vw"
            />
          </div>
        </Section>
      ) : null}

      {/* Content */}
      <Section>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <article className="min-w-0 max-w-narrow">
            {/*
              正文双形态：
              · CMS 模式（NEXT_PUBLIC_CMS_SOURCE=api）—— post.contentHtml 为后端
                富文本编辑器写入时已净化的 HTML（rich-text.sanitizer 白名单单一切片：
                仅放行语义标签/属性，script、事件属性、javascript: 协议一律剥离），
                此处直接渲染，前端不再二次处理（避免双重转义）；
              · Demo 模式 —— 结构化区块 BlogBlock[]，交由 BlogContent 渲染。
            */}
            {post.contentHtml ? (
              <div
                className="blog-prose"
                // 信任边界：仅 CMS 模式进入此分支，HTML 来源为后端入库前净化结果
                dangerouslySetInnerHTML={{ __html: post.contentHtml }}
              />
            ) : (
              <BlogContent blocks={post.content} />
            )}

            {post.tags.length > 0 ? (
              <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-border pt-6">
                <span className="text-caption font-semibold tracking-wider text-text-muted uppercase">
                  {t('common.tags')}
                </span>
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}
          </article>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface-elevated p-6">
              <h2 className="text-heading-sm">{m.blogDetail.asideTitle}</h2>
              <p className="text-small text-text-secondary">{m.blogDetail.asideText}</p>
              <Button asChild className="w-fit">
                <LocaleLink locale={locale} href="/contact#rfq">
                  {t('common.requestQuote')}
                </LocaleLink>
              </Button>
              <Button asChild variant="outline" className="w-fit">
                <LocaleLink locale={locale} href="/products">
                  {t('common.viewProducts')}
                </LocaleLink>
              </Button>
            </div>
          </aside>
        </div>
      </Section>

      {/* Related Products */}
      <Section tone="surface">
        <SectionHeader
          eyebrow={m.blogDetail.relatedProductsEyebrow}
          title={m.blogDetail.relatedProductsTitle}
          description={m.blogDetail.relatedProductsDescription}
          action={
            <Button asChild variant="outline">
              <LocaleLink locale={locale} href="/products">
                {t('common.viewAll')}
              </LocaleLink>
            </Button>
          }
        />
        {relatedProducts.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {relatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                locale={locale}
                name={product.name}
                description={product.shortDescription ?? ''}
                imageSrc={primaryImageUrl(product)}
                imageAlt={product.images[0]?.altText ?? product.name}
                badges={
                  product.category
                    ? [{ label: product.category.name, variant: 'application' as const }]
                    : []
                }
                href={productDetailPath(product)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <ContentPlaceholder
              locale={locale}
              title={m.blogDetail.relatedProductsEmptyTitle}
              note={m.blogDetail.relatedProductsEmptyNote}
              minHeightClass="min-h-40"
            />
          </div>
        )}
      </Section>

      {/* Related Articles */}
      {relatedPosts.length > 0 ? (
        <Section>
          <SectionHeader
            eyebrow={m.blogDetail.keepReadingEyebrow}
            title={m.blogDetail.relatedArticlesTitle}
            description={m.blogDetail.relatedArticlesDescription}
            action={
              <Button asChild variant="outline">
                <LocaleLink locale={locale} href="/blog">
                  {m.blogDetail.allArticles}
                </LocaleLink>
              </Button>
            }
          />
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((item) => (
              <BlogCard
                key={item.slug}
                post={item}
                categoryLabel={categoryNames.get(item.category)}
                locale={locale}
              />
            ))}
          </div>
        </Section>
      ) : null}

      {/* RFQ CTA */}
      <CtaBand
        locale={locale}
        title={m.blogDetail.ctaTitle}
        description={m.blogDetail.ctaDescription}
        secondaryHref="/quality"
        secondaryLabel={t('common.viewQuality')}
      />

      {/* 结构化数据 */}
      <ArticleSchema post={post} section={category?.name} locale={locale} />
      <BreadcrumbSchema
        items={[
          { name: t('common.home'), path: localizedPath('/', locale) },
          { name: m.nav.blog, path: localizedPath('/blog', locale) },
          { name: post.title, path: localizedPath(`/blog/${post.slug}`, locale) },
        ]}
      />
    </>
  );
}
