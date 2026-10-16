import { applications } from './demo-data';
import { apiGet, isApiSource, isNotFound } from '@/lib/cms-api';
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
 * 关联产品来自详情接口的 products（仅已发布产品），并行拉取，非串行 N+1。
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

/** 拉取全部已发布应用场景（含关联产品 slug） */
async function fetchApiApplications(): Promise<Application[]> {
  const list = await apiGet<{ items: ApiApplicationListItem[]; total: number }>(
    '/public/applications',
  );
  const details = await Promise.all(
    list.items.map((item) =>
      apiGet<ApiApplicationDetail>(`/public/applications/${encodeURIComponent(item.slug)}`),
    ),
  );

  return details.map((detail) => ({
    slug: detail.slug,
    title: detail.name,
    description: detail.summary ?? '',
    overview: detail.description ?? detail.summary ?? '',
    highlights: [],
    image: detail.coverImageUrl,
    imageAlt: detail.name,
    relatedProducts: detail.products.map((product) => product.slug),
  }));
}

/** 全部应用场景 */
export async function getApplications(): Promise<Application[]> {
  if (isApiSource()) {
    return sortApplications(await fetchApiApplications());
  }
  return sortApplications(applications);
}

/** 按 slug 取单个应用场景；不存在返回 null */
export async function getApplicationBySlug(slug: string): Promise<Application | null> {
  if (isApiSource()) {
    const items = await fetchApiApplications();
    return items.find((item) => item.slug === slug) ?? null;
  }
  return applications.find((item) => item.slug === slug) ?? null;
}

/**
 * 用于 `generateStaticParams` 的 slug 列表。
 *
 * 当前未启用 `/applications/[slug]` 路由，但先提供该能力，
 * 未来开启详情页时无需改动数据层。
 */
export async function getApplicationSlugs(): Promise<string[]> {
  if (isApiSource()) {
    try {
      const result = await apiGet<{ items: ApiApplicationListItem[]; total: number }>(
        '/public/applications',
      );
      return result.items.map((item) => item.slug);
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
    const items = await fetchApiApplications();
    return items.length > 0 && items.every((item) => Boolean(item.image));
  }
  return applications.every((item) => Boolean(item.image));
}
