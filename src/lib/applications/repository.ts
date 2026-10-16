import { applications } from './demo-data';
import { apiGet, isApiSource, isNotFound } from '@/lib/cms-api';
import { CmsRevalidate, CmsTags } from '@/lib/cms-tags';
import type { Application } from './types';

/**
 * 应用场景数据访问层（Repository）
 *
 * 页面只依赖本模块，数据来源从「仓库内登记」切换到「后端 API / CMS」时
 * 页面代码无需改动。
 *
 * 数据源（Phase 4.7 起统一到 NEXT_PUBLIC_CMS_SOURCE）：
 *   · demo（默认）—— 仓库内演示数据
 *   · api —— bailing-backend 公开只读接口 /api/v1/public/applications（仅 PUBLISHED）
 *
 * 设计原则：
 *   · 全部函数为 async —— 替换远端数据源不改调用方签名；
 *   · slug 由数据驱动，页面与组件不写死任何具体应用；
 *   · 未来启用 `/applications/[slug]` 时，只需新增路由文件调用
 *     `getApplicationBySlug()` / `getApplicationSlugs()`，本模块无需改动。
 */

/** 列表页每页展示的应用数量（当前 5 个，为未来扩展预留分页能力） */
export const APPLICATIONS_PAGE_SIZE = 12;

function sortApplications(items: Application[]): Application[] {
  return [...items].sort((a, b) => a.slug.localeCompare(b.slug));
}

/* ---------------------------------------------------------------------------
 * CMS（api）模式
 *
 * 后端 Application 没有前端 Application 的 highlights 字段（那是演示数据的
 * "典型材料方向"），映射时留空数组——页面渲染为空列表，不虚构条目。
 *
 * 性能（Phase 4.8）：**列表页只发 1 个请求**。关联产品（products）只出现在
 * 详情视图，因此仅 `getApplicationBySlug` 才额外拉一次详情接口，
 * 避免列表页对每个应用各发一次请求（N+1）。
 * --------------------------------------------------------------------------*/

/** 公开接口：应用列表项 / 详情（与后端 public.entity.ts 对齐） */
interface ApiApplicationProduct {
  name: string;
  slug: string;
  shortDescription: string | null;
  coverImageUrl: string | null;
}

interface ApiApplicationListItem {
  name: string;
  slug: string;
  summary: string | null;
  coverImageUrl: string | null;
  featured: boolean;
  publishedAt: string | null;
}

interface ApiApplicationDetail extends ApiApplicationListItem {
  description: string | null;
  products: ApiApplicationProduct[];
  seoTitle: string | null;
  seoDescription: string | null;
}

/** 列表项 → 页面形状（不含关联产品，避免列表页 N+1） */
function toApplication(item: ApiApplicationListItem): Application {
  return {
    slug: item.slug,
    title: item.name,
    description: item.summary ?? '',
    overview: item.summary ?? '',
    highlights: [],
    image: item.coverImageUrl,
    imageAlt: item.name,
    relatedProducts: [],
  };
}

/** 详情 → 页面形状（含关联产品 slug 与 SEO 覆盖） */
function toApplicationDetail(detail: ApiApplicationDetail): Application {
  return {
    ...toApplication(detail),
    overview: detail.description ?? detail.summary ?? '',
    relatedProducts: detail.products.map((product) => product.slug),
    ...(detail.seoTitle || detail.seoDescription
      ? {
          seo: {
            ...(detail.seoTitle ? { title: detail.seoTitle } : {}),
            ...(detail.seoDescription ? { description: detail.seoDescription } : {}),
          },
        }
      : {}),
  };
}

/** 拉取已发布应用场景列表（单次请求） */
async function fetchApiApplicationList(): Promise<ApiApplicationListItem[]> {
  const list = await apiGet<{ items: ApiApplicationListItem[]; total: number }>(
    '/public/applications',
    { tags: [CmsTags.applications], revalidate: CmsRevalidate.CONTENT },
  );
  return list.items;
}

/** 全部应用场景（列表页 / 索引） */
export async function getApplications(): Promise<Application[]> {
  if (isApiSource()) {
    return sortApplications((await fetchApiApplicationList()).map(toApplication));
  }
  return sortApplications(applications);
}

/** 按 slug 取单个应用场景；不存在返回 null */
export async function getApplicationBySlug(slug: string): Promise<Application | null> {
  if (isApiSource()) {
    try {
      const detail = await apiGet<ApiApplicationDetail>(
        `/public/applications/${encodeURIComponent(slug)}`,
        { tags: [CmsTags.application(slug), CmsTags.applications], revalidate: CmsRevalidate.CONTENT },
      );
      return toApplicationDetail(detail);
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }
  return applications.find((item) => item.slug === slug) ?? null;
}

/**
 * 用于 `generateStaticParams` / sitemap 的 slug 列表。
 *
 * 未发布 / 已归档的应用不会出现在公开列表接口中，因此天然不会进入 sitemap。
 */
export async function getApplicationSlugs(): Promise<string[]> {
  if (isApiSource()) {
    try {
      return (await fetchApiApplicationList()).map((item) => item.slug);
    } catch (error) {
      if (isNotFound(error)) return [];
      throw error;
    }
  }
  return applications.map((item) => item.slug);
}

/** 是否所有应用都具备真实封面素材（页面据此决定是否展示占位提示） */
export async function hasAllApplicationImages(): Promise<boolean> {
  if (isApiSource()) {
    const items = await fetchApiApplicationList();
    return items.length > 0 && items.every((item) => Boolean(item.coverImageUrl));
  }
  return applications.every((item) => Boolean(item.image));
}
