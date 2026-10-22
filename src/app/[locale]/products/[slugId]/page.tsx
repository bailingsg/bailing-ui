import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Container } from '@/components/layout/container';
import { Section, SectionHeader } from '@/components/layout/section';
import { ContentPlaceholder } from '@/components/layout/content-placeholder';
import { CtaBand } from '@/components/layout/cta-band';
import { ProductCard } from '@/components/common/product-card';
import { ProductGallery } from '@/components/products/product-gallery';
import { ProductSchema } from '@/components/products/product-schema';
import { BreadcrumbSchema } from '@/components/seo/breadcrumb-schema';
import { DemoDataNotice } from '@/components/products/demo-data-notice';
import { ContentFallbackNotice } from '@/components/common/content-fallback-notice';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { resolveSeoMetadata } from '@/lib/seo/resolver';
import { LocaleLink } from '@/i18n/link';
import { getI18n } from '@/i18n';
import { defaultLocale, isLocale, type Locale } from '@/i18n/config';
import { localizedPath } from '@/i18n/paths';
import {
  getProductById,
  getProducts,
  getProductSlugIds,
  extractProductId,
  productDetailPath,
  productDetailSegment,
  isDemoSource,
  type ProductDetail,
  type ProductListItem,
} from '@/lib/products';

/**
 * 产品详情页 /products/[slugId]（中文：/zh-CN/products/[slugId]）——URL 由
 * `slug`-`id` 拼接（slug 可读 / SEO，id 唯一稳定）。
 *
 * 路由参数 `slugId` 由 `extractProductId` 解析出真实产品 id（取最后一个
 * `-` 之后片段，兼容纯 id 旧链接 /products/<id>）。
 *
 * 结构：Product Hero（Gallery + Info + Request Quote）→ Description →
 * Specifications → Material & Applications → CTA → Related Products。
 *
 * 语言：面包屑、区块标题、字段标签、按钮等 UI 文案随语言切换；
 * 产品名称 / 描述 / 规格 / 材质属于业务内容，来自 CMS 单语言字段，
 * 中文界面下按英文原文展示，并在页首给出显式提示（不伪造译文）。
 *
 * SEO：动态 metadata（title/description/canonical/hreflang）+ Product JSON-LD。
 */

interface ProductDetailPageProps {
  params: Promise<{ locale: string; slugId: string }>;
}

function resolveLocale(rawLocale: string): Locale {
  return isLocale(rawLocale) ? rawLocale : defaultLocale;
}

/** 预渲染已知产品（slug-id 拼接）；未列出的按需生成 */
export async function generateStaticParams() {
  const items = await getProductSlugIds();
  // 注意：这里必须是**路由片段**（slug-id），不是 `/products/slug-id` 完整路径，
  // 否则会预渲染出 `/products/%2Fproducts%2F...` 这种错误路径
  return items.map((item) => ({ slugId: productDetailSegment(item) }));
}

/**
 * 允许按需生成未预渲染的 id（`dynamicParams = true`）。
 *
 * Phase 4.8 修正：此前设为 `false` 会导致**缓存失效后整页 404**。
 * 机制：`dynamicParams = false` 会把该路由标记为 `fallback: NOT_FOUND`；
 * 一旦缓存条目被 `revalidateTag` / `revalidatePath` / 过期时间失效，
 * 路由模块拿不到 previousCacheEntry，fallbackMode 仍为 NOT_FOUND，
 * 于是抛出 Next 内部 `NoFallbackError` → 整个详情页返回 404，
 * 并且这个 404 会被写进 route-cache 长期生效。
 * 结果就是「CMS 一改产品，前台所有产品详情页集体 404」——与
 * 「发布即刷新」的核心目标完全相反。
 *
 * 改为 `true` 后：
 *   · 预渲染仍由 generateStaticParams 完成（首屏性能不变）；
 *   · 缓存失效时按需重新生成，内容即时更新；
 *   · 未发布（Draft / Archived）/ 已删除 / 不存在的 id 依旧由
 *     `notFound()` 返回**真正的 HTTP 404**——Next 15 会把渲染期
 *     `metadata.statusCode` 存入 route-cache，读取时用
 *     `res.statusCode = cachedData.status` 原样回放，不再是旧版本的「软 404」。
 */
export const dynamicParams = true;

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { locale: rawLocale, slugId } = await params;
  const locale = resolveLocale(rawLocale);
  const { m } = getI18n(locale);
  const product = await getProductById(extractProductId(slugId));

  if (!product) {
    return {
      title: m.productDetail.notFoundTitle,
      description: m.productDetail.notFoundDescription,
      robots: { index: false, follow: false },
    };
  }

  const primary = product.images.find((image) => image.isPrimary) ?? product.images[0];

  return resolveSeoMetadata({
    title: product.seo.title,
    description: product.seo.description ?? product.shortDescription ?? product.name,
    path: productDetailPath(product),
    titleTemplateKey: 'product',
    locale,
    ogImage: primary?.url ?? undefined,
    ogImageAlt: primary?.altText ?? product.name,
  });
}

function primaryImageUrl(product: ProductListItem): string | null {
  const primary = product.images.find((image) => image.isPrimary) ?? product.images[0];
  return primary?.url ?? null;
}

/** 相关产品：优先同分类，数量不足时用其它产品补齐 */
async function getRelatedProducts(product: ProductDetail, limit = 4): Promise<ProductListItem[]> {
  const sameCategory = await getProducts({
    category: product.category?.slug,
    pageSize: limit + 1,
  });

  const pool = sameCategory.items.filter((item) => item.slug !== product.slug);
  if (pool.length >= limit) return pool.slice(0, limit);

  const fallback = await getProducts({ pageSize: limit + 1 });
  const merged = [...pool];
  for (const item of fallback.items) {
    if (item.slug === product.slug) continue;
    if (merged.some((existing) => existing.slug === item.slug)) continue;
    merged.push(item);
    if (merged.length >= limit) break;
  }
  return merged;
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-3 last:border-b-0 sm:flex-row sm:gap-6">
      <dt className="w-full text-small font-medium text-text-secondary sm:w-40 sm:shrink-0">{label}</dt>
      <dd className="text-small text-foreground">{value}</dd>
    </div>
  );
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { locale: rawLocale, slugId } = await params;
  const locale = resolveLocale(rawLocale);
  const { t, m } = getI18n(locale);

  const product = await getProductById(extractProductId(slugId));
  if (!product) notFound();

  // 规范化：无论旧链接（纯 id）还是拼错 slug，都 301 到 slug-id 规范 URL，
  // 避免同一产品被多 URL 重复收录（duplicate content）。
  //
  // 比较对象必须是**路由片段**（`<slug>-<id>`），不能是完整路径：
  // 拿 `/products/<slug>-<id>` 与 `<slug>-<id>` 比较永远不相等，
  // 会把规范 URL 也重定向到自身，形成 307 死循环（详情页直接打不开）。
  const canonicalSlugId = productDetailSegment(product);
  if (slugId !== canonicalSlugId) {
    redirect(localizedPath(productDetailPath(product), locale));
  }

  const related = await getRelatedProducts(product);
  const specificationEntries = product.specifications
    ? Object.entries(product.specifications)
    : [];
  /** 后台 CMS「应用标签」；未配置时为空数组（不展示，不伪造） */
  const applicationTags = product.applications ?? [];
  const productPath = localizedPath(productDetailPath(product), locale);

  return (
    <>
      {/* Product Hero */}
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
              href="/products"
              className="text-text-muted transition-colors hover:text-foreground"
            >
              {m.nav.products}
            </LocaleLink>
            <span aria-hidden="true" className="text-text-muted">
              /
            </span>
            <span className="text-foreground">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Gallery */}
            <ProductGallery images={product.images} alt={product.name} locale={locale} />

            {/* Info */}
            <div className="flex flex-col gap-5">
              {product.category ? (
                <LocaleLink
                  locale={locale}
                  href={`/products?category=${encodeURIComponent(product.category.slug)}`}
                  className="w-fit"
                >
                  <Badge variant="application" className="cursor-pointer">
                    {product.category.name}
                  </Badge>
                </LocaleLink>
              ) : null}

              <div className="flex flex-col gap-3">
                <h1 className="text-balance">{product.name}</h1>
                {product.shortDescription ? (
                  <p className="text-body-lg text-text-secondary text-pretty">
                    {product.shortDescription}
                  </p>
                ) : null}
              </div>

              <ContentFallbackNotice locale={locale} />

              {/* 关键属性（未配置时不展示，不编造） */}
              {product.material || product.application || applicationTags.length > 0 ? (
                <dl className="flex flex-col gap-3 border-y border-border py-4">
                  {product.material ? (
                    <div className="flex gap-3">
                      <dt className="w-32 shrink-0 text-small font-medium text-text-muted">
                        {m.productDetail.materialTitle}
                      </dt>
                      <dd className="text-small text-foreground">{product.material}</dd>
                    </div>
                  ) : null}
                  {product.application ? (
                    <div className="flex gap-3">
                      <dt className="w-32 shrink-0 text-small font-medium text-text-muted">
                        {m.common.application}
                      </dt>
                      <dd className="text-small text-foreground">{product.application}</dd>
                    </div>
                  ) : null}
                  {applicationTags.length > 0 ? (
                    <div className="flex gap-3">
                      <dt className="w-32 shrink-0 text-small font-medium text-text-muted">
                        {m.productDetail.applicationsTitle}
                      </dt>
                      <dd className="flex flex-wrap gap-2">
                        {applicationTags.map((tag) => (
                          <Badge key={tag} variant="application">
                            {tag}
                          </Badge>
                        ))}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              ) : null}

              {isDemoSource() ? <DemoDataNotice locale={locale} /> : null}

              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <LocaleLink
                    locale={locale}
                    href={`/contact?product=${encodeURIComponent(product.id)}#rfq`}
                  >
                    {t('common.requestQuote')}
                  </LocaleLink>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <LocaleLink locale={locale} href="/products">
                    {m.productDetail.backToProducts}
                  </LocaleLink>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Description */}
      <Section>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionHeader eyebrow={m.common.overview} title={m.productDetail.descriptionTitle} />
            {/*
              产品正文是后端写入时经 sanitizeRichText 白名单净化的 HTML
              （剥离 data-module-name / class 等无关属性、仅放行语义标签）。
              此处直接渲染，不再二次处理——必须用 <div> 而非 <p>，否则浏览器
              遇到块级子元素会提前闭合 <p>，再叠加 dangerouslySetInnerHTML
              时整段被当文本输出（详见 commit 前的回归缺陷）。
            */}
            {product.description ? (
              <div
                className="product-prose mt-6"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              <p className="mt-6 text-body text-text-muted">{m.common.noValue}</p>
            )}
          </div>

          <aside className="lg:col-span-1">
            <h2 className="text-heading-sm">{m.common.atAGlance}</h2>
            <dl className="mt-4 flex flex-col">
              <SpecRow label={m.common.category} value={product.category?.name ?? m.common.noValue} />
              <SpecRow
                label={m.productDetail.materialTitle}
                value={product.material ?? m.common.noValue}
              />
              <SpecRow
                label={m.common.application}
                value={product.application ?? m.common.noValue}
              />
              {applicationTags.length > 0 ? (
                <SpecRow
                  label={m.productDetail.applicationsTitle}
                  value={applicationTags.join(' · ')}
                />
              ) : null}
            </dl>
          </aside>
        </div>
      </Section>

      {/* Specifications */}
      <Section tone="surface">
        <SectionHeader
          eyebrow={m.productDetail.specificationsEyebrow}
          title={m.productDetail.specificationsTitle}
          description={m.productDetail.specificationsDescription}
        />
        <div className="mt-8">
          {specificationEntries.length > 0 ? (
            <dl className="max-w-3xl rounded-lg border border-border bg-surface-elevated px-5 py-2 sm:px-6">
              {specificationEntries.map(([label, value]) => (
                <SpecRow key={label} label={label} value={value} />
              ))}
            </dl>
          ) : (
            <ContentPlaceholder
              locale={locale}
              title={m.productDetail.specificationsEmptyTitle}
              note={m.productDetail.specificationsEmptyNote}
              minHeightClass="min-h-40"
            />
          )}
        </div>
      </Section>

      {/* Material & Applications */}
      <Section>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface-elevated p-6">
            <h2 className="text-heading-sm">{m.productDetail.materialTitle}</h2>
            {product.material ? (
              <p className="text-small text-text-secondary">{product.material}</p>
            ) : (
              <p className="text-small text-text-muted">{m.productDetail.materialMissing}</p>
            )}
          </div>
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface-elevated p-6">
            <h2 className="text-heading-sm">{m.productDetail.applicationsTitle}</h2>
            {applicationTags.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {applicationTags.map((tag) => (
                  <li key={tag}>
                    <Badge variant="application">{tag}</Badge>
                  </li>
                ))}
              </ul>
            ) : product.application ? (
              <p className="text-small text-text-secondary">{product.application}</p>
            ) : (
              <p className="text-small text-text-muted">{m.productDetail.applicationMissing}</p>
            )}
          </div>
        </div>
      </Section>

      {/* Related Products */}
      <Section tone="surface">
        <SectionHeader
          eyebrow={m.productDetail.relatedEyebrow}
          title={m.productDetail.relatedTitle}
          description={m.productDetail.relatedDescription}
          action={
            <Button asChild variant="outline">
              <LocaleLink locale={locale} href="/products">
                {t('common.viewAll')}
              </LocaleLink>
            </Button>
          }
        />
        {related.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {related.map((item) => (
              <ProductCard
                key={item.id}
                locale={locale}
                name={item.name}
                description={item.shortDescription ?? ''}
                imageSrc={primaryImageUrl(item)}
                imageAlt={item.images[0]?.altText ?? item.name}
                badges={
                  item.category
                    ? [{ label: item.category.name, variant: 'application' as const }]
                    : []
                }
                href={productDetailPath(item)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <ContentPlaceholder
              locale={locale}
              title={m.productDetail.relatedEmptyTitle}
              note={m.productDetail.relatedEmptyNote}
              minHeightClass="min-h-40"
            />
          </div>
        )}
      </Section>

      <CtaBand
        locale={locale}
        title={m.productDetail.ctaTitle}
        description={m.productDetail.ctaDescription}
        secondaryHref="/products"
        secondaryLabel={t('common.browseProducts')}
      />

      {/* 结构化数据 */}
      <ProductSchema product={product} locale={locale} />
      <BreadcrumbSchema
        items={[
          { name: t('common.home'), path: localizedPath('/', locale) },
          { name: m.nav.products, path: localizedPath('/products', locale) },
          { name: product.name, path: productPath },
        ]}
      />
    </>
  );
}
