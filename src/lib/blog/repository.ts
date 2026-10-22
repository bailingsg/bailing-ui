import { blogCategories, blogPosts } from './demo-data';
import { apiGet, isApiSource, isNotFound, qs } from '@/lib/cms-api';
import { CmsRevalidate, CmsTags } from '@/lib/cms-tags';
import { cleanExcerpt } from './excerpt';
import type {
  BlogCategoryInfo,
  BlogCategorySlug,
  BlogPost,
  BlogPostSummary,
  BlogQuery,
  PaginatedBlogPosts,
} from './types';

/**
 * CMS 公开博客契约（与后端 public.entity.ts 对齐）。
 * 注意：这是**接口形状**，经 toSummaryFromApi 适配为页面使用的 BlogPost 形状。
 */
interface ApiBlogCategoryRef {
  name: string;
  slug: string;
}

interface ApiBlogTagRef {
  name: string;
  slug: string;
}

interface ApiBlogSummary {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  category: ApiBlogCategoryRef | null;
  tags: ApiBlogTagRef[];
  featured: boolean;
  publishedAt: string | null;
  updatedAt: string | null;
  readingMinutes: number;
  seoTitle: string | null;
  seoDescription: string | null;
}

interface ApiBlogDetail extends ApiBlogSummary {
  contentHtml: string;
  /**
   * 关联产品 slug 列表（Phase 5.6，后台「文章编辑」里最多选 4 个）。
   * 后端只下发已发布产品；旧版后端无该字段时按空数组处理。
   */
  relatedProducts?: string[];
}

interface ApiBlogPage {
  items: ApiBlogSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** 接口摘要 → 页面列表项形状 */
function toSummaryFromApi(apiPost: ApiBlogSummary): BlogPostSummary {
  return {
    slug: apiPost.slug,
    title: apiPost.title,
    // 展示层规范化：解码实体 / 去 WP 截断标记（详情页另有正文回退，见 getBlogPostBySlug）
    excerpt: cleanExcerpt(apiPost.excerpt),
    coverImage: apiPost.coverImageUrl,
    coverImageAlt: apiPost.coverImageAlt ?? '',
    category: apiPost.category?.slug ?? 'uncategorized',
    publishedAt: apiPost.publishedAt ?? new Date(0).toISOString(),
    ...(apiPost.updatedAt ? { updatedAt: apiPost.updatedAt } : {}),
    readingMinutes: apiPost.readingMinutes,
    tags: apiPost.tags.map((tag) => tag.name),
    relatedProducts: [],
    seo: {
      title: apiPost.seoTitle ?? apiPost.title,
      description: apiPost.seoDescription ?? apiPost.excerpt ?? '',
    },
  };
}

/**
 * 资讯 / 知识库数据访问层（Repository）
 *
 * 页面只依赖本模块，未来把内容来源从「仓库内登记」切换到「后端 API / CMS」时
 * 页面代码无需改动。
 *
 * 设计原则：
 *   · 全部函数为 async —— 便于未来替换为远端数据源而不改调用方签名；
 *   · 分类与文章全部数据驱动，页面与组件不写死任何具体文章；
 *   · 列表接口不返回正文（`BlogPostSummary`），减少列表页负载。
 */

/** 列表页每页文章数（桌面 3 列 × 2 行） */
export const BLOG_PAGE_SIZE = 9;

/** 分类信息（含文章数量，用于筛选器展示） */
export interface BlogCategoryWithCount extends BlogCategoryInfo {
  count: number;
}

function toSummary(post: BlogPost): BlogPostSummary {
  // 显式剔除正文，避免列表页携带整篇内容
  return {
    slug: post.slug,
    title: post.title,
    excerpt: cleanExcerpt(post.excerpt, post.contentHtml),
    coverImage: post.coverImage,
    coverImageAlt: post.coverImageAlt,
    category: post.category,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    readingMinutes: post.readingMinutes,
    tags: post.tags,
    relatedProducts: post.relatedProducts,
    seo: post.seo,
  };
}

/** 按发布日期倒序（最新在前），同日按标题排序保证顺序稳定 */
function sortPosts(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => {
    const diff = Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
    if (diff !== 0) return diff;
    return a.title.localeCompare(b.title);
  });
}

/** 文章列表（分页 / 分类筛选） */
export async function getBlogPosts(query: BlogQuery = {}): Promise<PaginatedBlogPosts> {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, query.pageSize ?? BLOG_PAGE_SIZE));

  if (isApiSource()) {
    const result = await apiGet<ApiBlogPage>(
      `/public/blog${qs({ page, pageSize, category: query.category })}`,
      { tags: [CmsTags.blog], revalidate: CmsRevalidate.CONTENT },
    );
    return { ...result, items: result.items.map(toSummaryFromApi) };
  }

  let rows = sortPosts(blogPosts);
  if (query.category) {
    rows = rows.filter((post) => post.category === query.category);
  }

  const total = rows.length;
  const start = (page - 1) * pageSize;

  return {
    items: rows.slice(start, start + pageSize).map(toSummary),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/** 文章详情；不存在返回 null（页面据此调用 notFound()） */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (isApiSource()) {
    try {
      const detail = await apiGet<ApiBlogDetail>(`/public/blog/${encodeURIComponent(slug)}`, {
        tags: [CmsTags.blogPost(slug), CmsTags.blog],
        revalidate: CmsRevalidate.CONTENT,
      });
      return {
        slug: detail.slug,
        title: detail.title,
        // 自动截断摘要（WP [&hellip;]）→ 回退正文首段重新生成；人工摘要仅解码
        excerpt: cleanExcerpt(detail.excerpt, detail.contentHtml),
        content: [],
        contentHtml: detail.contentHtml,
        coverImage: detail.coverImageUrl,
        coverImageAlt: detail.coverImageAlt ?? '',
        category: detail.category?.slug ?? 'uncategorized',
        publishedAt: detail.publishedAt ?? new Date(0).toISOString(),
        ...(detail.updatedAt ? { updatedAt: detail.updatedAt } : {}),
        readingMinutes: detail.readingMinutes,
        tags: detail.tags.map((tag) => tag.name),
        // Phase 5.6：后台配置的关联产品（slug），由详情页 resolveProducts 解析后渲染卡片
        relatedProducts: detail.relatedProducts ?? [],
        seo: {
          title: detail.seoTitle ?? detail.title,
          description: detail.seoDescription ?? cleanExcerpt(detail.excerpt, detail.contentHtml),
        },
      };
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }
  return blogPosts.find((post) => post.slug === slug) ?? null;
}

/** 用于 generateStaticParams 的 slug 列表（CMS 模式翻页收集） */
export async function getBlogSlugs(): Promise<string[]> {
  if (isApiSource()) {
    const slugs: string[] = [];
    const pageSize = 24;
    for (let page = 1; page <= 20; page += 1) {
      const result = await apiGet<ApiBlogPage>(`/public/blog${qs({ page, pageSize })}`, {
        tags: [CmsTags.blog],
        revalidate: CmsRevalidate.CONTENT,
      });
      slugs.push(...result.items.map((item) => item.slug));
      if (page >= result.totalPages) break;
    }
    return slugs;
  }
  return blogPosts.map((post) => post.slug);
}

/** 分类清单（含各分类文章数量；数量为 0 的分类不展示） */
export async function getBlogCategories(): Promise<BlogCategoryWithCount[]> {
  if (isApiSource()) {
    const result = await apiGet<{
      items: { slug: string; name: string; description: string | null; postCount: number }[];
    }>('/public/blog/categories', {
      tags: [CmsTags.blogCategories],
      revalidate: CmsRevalidate.STABLE,
    });
    return result.items
      .map((category) => ({
        slug: category.slug,
        name: category.name,
        nameZh: category.name,
        description: category.description,
        count: category.postCount,
      }))
      .filter((category) => category.count > 0);
  }
  return blogCategories
    .map((category) => ({
      ...category,
      count: blogPosts.filter((post) => post.category === category.slug).length,
    }))
    .filter((category) => category.count > 0);
}

/**
 * 校验分类 slug 是否合法（用于把 `?category=` 查询参数收敛到已知分类）。
 * 非法值返回 undefined，页面按"全部分类"处理，避免出现空结果页面。
 */
export async function normalizeBlogCategory(value?: string): Promise<BlogCategorySlug | undefined> {
  if (!value) return undefined;
  if (isApiSource()) {
    const categories = await getBlogCategories();
    return categories.find((category) => category.slug === value)?.slug;
  }
  const match = blogCategories.find((category) => category.slug === value);
  return match?.slug;
}

/**
 * 相关文章：同分类优先，数量不足时用最新文章补齐。
 * 只返回列表项（不含正文）。
 */
export async function getRelatedBlogPosts(slug: string, limit = 3): Promise<BlogPostSummary[]> {
  const current = await getBlogPostBySlug(slug);
  if (!current) return [];

  if (isApiSource()) {
    // 同分类优先（数量不足由最新文章补齐）；拉取两页摘要后本地归并
    const [sameCategoryResult, latestResult] = await Promise.all([
      apiGet<ApiBlogPage>(`/public/blog${qs({ pageSize: 24, category: current.category })}`, {
        tags: [CmsTags.blog],
        revalidate: CmsRevalidate.CONTENT,
      }),
      apiGet<ApiBlogPage>(`/public/blog${qs({ pageSize: 24 })}`, {
        tags: [CmsTags.blog],
        revalidate: CmsRevalidate.CONTENT,
      }),
    ]);
    const sameCategory = sameCategoryResult.items.filter((item) => item.slug !== slug);
    const rest = latestResult.items.filter(
      (item) => item.slug !== slug && item.category?.slug !== current.category,
    );
    const merged: ApiBlogSummary[] = [];
    const seen = new Set<string>();
    for (const item of [...sameCategory, ...rest]) {
      if (seen.has(item.slug)) continue;
      seen.add(item.slug);
      merged.push(item);
      if (merged.length >= limit) break;
    }
    return merged.map(toSummaryFromApi);
  }

  const others = sortPosts(blogPosts).filter((post) => post.slug !== slug);
  const sameCategory = others.filter((post) => post.category === current.category);
  const rest = others.filter((post) => post.category !== current.category);

  return [...sameCategory, ...rest].slice(0, limit).map(toSummary);
}
