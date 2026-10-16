import type { Metadata } from 'next';
import Link from 'next/link';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { resolveSeoMetadata } from '@/lib/seo/resolver';
import { formatDate, toDateTimeAttribute } from '@/lib/format';
import {
  getBlogCategories,
  getBlogPostBySlug,
  getBlogSlugs,
  getRelatedBlogPosts,
} from '@/lib/blog';
import { getProductBySlug, type ProductListItem } from '@/lib/products';

/**
 * 文章详情 /blog/[slug]
 *
 * 结构：Breadcrumb → Article Hero → Content → Tags → Related Products
 *      → Related Articles → RFQ CTA
 *
 * SEO：动态 metadata（title / description / canonical / article OG）+ Article JSON-LD。
 * 禁止 Product schema。
 *
 * 404 策略：与 /products/[slug] 一致 —— 允许按需生成（dynamicParams = true），
 * 未发布 / 已删除 / 不存在的 slug 由 notFound() 返回**真正的 HTTP 404**。
 * （Phase 4.8 修正：`dynamicParams = false` 会让缓存失效后整页 404，详见产品详情页注释。）
 */

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

/** 预渲染已知文章；未登记的 slug 直接返回 404 */
export async function generateStaticParams() {
  const slugs = await getBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export const dynamicParams = true;

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.',
      robots: { index: false, follow: false },
    };
  }

  return resolveSeoMetadata({
    title: post.seo.title,
    description: post.seo.description,
    path: `/blog/${post.slug}`,
    titleTemplateKey: 'blog',
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
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) notFound();

  const [categories, relatedProducts, relatedPosts] = await Promise.all([
    getBlogCategories(),
    resolveProducts(post.relatedProducts),
    getRelatedBlogPosts(post.slug, 3),
  ]);

  const category = categories.find((item) => item.slug === post.category);
  const categoryNames = new Map(categories.map((item) => [item.slug, item.name]));
  const published = formatDate(post.publishedAt);
  const updated = post.updatedAt ? formatDate(post.updatedAt) : '';

  return (
    <>
      {/* Article Hero */}
      <section className="border-b border-border bg-surface">
        <Container className="py-10 sm:py-14">
          {/* 面包屑 */}
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-caption">
            <Link href="/" className="text-text-muted transition-colors hover:text-foreground">
              Home
            </Link>
            <span aria-hidden="true" className="text-text-muted">
              /
            </span>
            <Link href="/blog" className="text-text-muted transition-colors hover:text-foreground">
              Blog
            </Link>
            <span aria-hidden="true" className="text-text-muted">
              /
            </span>
            <span className="text-foreground">{post.title}</span>
          </nav>

          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/blog?category=${encodeURIComponent(post.category)}`}
                className="outline-none"
              >
                <Badge variant="application" className="cursor-pointer">
                  {category?.name ?? post.category}
                </Badge>
              </Link>
              {published ? (
                <time
                  dateTime={toDateTimeAttribute(post.publishedAt)}
                  className="text-caption text-text-muted"
                >
                  Published {published}
                </time>
              ) : null}
              {updated ? (
                <span className="text-caption text-text-muted">Updated {updated}</span>
              ) : null}
              <span className="text-caption text-text-muted">{post.readingMinutes} min read</span>
            </div>

            <h1 className="max-w-4xl text-balance">{post.title}</h1>

            <p className="max-w-3xl text-body-lg text-text-secondary text-pretty">{post.excerpt}</p>
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
                  Tags
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
              <h2 className="text-heading-sm">Sourcing this material?</h2>
              <p className="text-small text-text-secondary">
                Send your specification, quantity and destination port — our export team will review
                it and respond with a quotation.
              </p>
              <Button asChild className="w-fit">
                <Link href="/contact#rfq">Request Quote</Link>
              </Button>
              <Button asChild variant="outline" className="w-fit">
                <Link href="/products">View Products</Link>
              </Button>
            </div>
          </aside>
        </div>
      </Section>

      {/* Related Products */}
      <Section tone="surface">
        <SectionHeader
          eyebrow="Related"
          title="Products mentioned in this article"
          description="The panel materials discussed above are part of the product catalogue."
          action={
            <Button asChild variant="outline">
              <Link href="/products">View All</Link>
            </Button>
          }
        />
        {relatedProducts.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {relatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                description={product.shortDescription ?? ''}
                imageSrc={primaryImageUrl(product)}
                imageAlt={product.images[0]?.altText ?? product.name}
                badges={
                  product.category
                    ? [{ label: product.category.name, variant: 'application' as const }]
                    : []
                }
                href={`/products/${product.slug}`}
                ctaLabel="View Details"
              />
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <ContentPlaceholder
              title="Related products pending publication"
              note="Product records linked to this article are not published yet."
              minHeightClass="min-h-40"
            />
          </div>
        )}
      </Section>

      {/* Related Articles */}
      {relatedPosts.length > 0 ? (
        <Section>
          <SectionHeader
            eyebrow="Keep Reading"
            title="Related articles"
            description="More guides on the same and adjacent topics."
            action={
              <Button asChild variant="outline">
                <Link href="/blog">All Articles</Link>
              </Button>
            }
          />
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((item) => (
              <BlogCard
                key={item.slug}
                post={item}
                categoryLabel={categoryNames.get(item.category)}
              />
            ))}
          </div>
        </Section>
      ) : null}

      {/* RFQ CTA */}
      <CtaBand
        title="Have a specification to check?"
        description="Send us the board you are considering and how it will be used — we will tell you what will work and what will not."
        primaryLabel="Request Quote"
        secondaryHref="/quality"
        secondaryLabel="View Quality Control"
      />

      {/* 结构化数据 */}
      <ArticleSchema post={post} section={category?.name} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />
    </>
  );
}
