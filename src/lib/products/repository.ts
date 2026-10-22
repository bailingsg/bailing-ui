import {
  demoCategories,
  demoProducts,
  findDemoProduct,
  findDemoProductById,
  queryDemoProducts,
} from './demo-data';
import type {
  PaginatedProducts,
  ProductCategory,
  ProductDetail,
  ProductQuery,
} from './types';
import { apiGet, isApiSource, isNotFound, qs } from '@/lib/cms-api';
import { CmsRevalidate, CmsTags } from '@/lib/cms-tags';

/**
 * 产品数据访问层（Repository）
 *
 * 页面只依赖本模块，不直接关心数据来自哪里。
 *
 * 数据源（Phase 4.7 起统一到共享开关）：
 *   · `NEXT_PUBLIC_CMS_SOURCE=api` —— 调用 bailing-backend 的 /api/v1/products 接口
 *   · 其余情况（默认 demo）—— 使用仓库内 Demo / Placeholder 数据，完全离线可静态构建
 *
 * 兼容：`NEXT_PUBLIC_PRODUCTS_SOURCE=api` 为旧开关，仍然有效（与 CMS_SOURCE 任一为
 * api 即走接口），保证既有部署不需要改配置。
 *
 * 说明：api 模式下接口不可用会如实抛出错误（由 error 边界接管），**不会**回退到
 * Demo 数据 —— 避免把占位内容当成真实产品展示给访客。
 */

export type ProductsSource = 'demo' | 'api';

/** 旧开关（向后兼容，Phase 4.7 起推荐统一使用 NEXT_PUBLIC_CMS_SOURCE） */
function isLegacyApiSource(): boolean {
  return (process.env.NEXT_PUBLIC_PRODUCTS_SOURCE ?? '').trim().toLowerCase() === 'api';
}

export function getProductsSource(): ProductsSource {
  return isApiSource() || isLegacyApiSource() ? 'api' : 'demo';
}

/** 当前是否使用 Demo / Placeholder 数据（页面据此展示提示条） */
export function isDemoSource(): boolean {
  return getProductsSource() === 'demo';
}

/** 产品列表（分页 / 分类 / 精选） */
export async function getProducts(query: ProductQuery = {}): Promise<PaginatedProducts> {
  if (getProductsSource() === 'demo') {
    return queryDemoProducts(query);
  }

  const result = await apiGet<PaginatedProducts>(
    `/products${qs({
      page: query.page,
      pageSize: query.pageSize,
      category: query.category,
      featured: query.featured,
    })}`,
    { tags: [CmsTags.products], revalidate: CmsRevalidate.CONTENT },
  );
  return result;
}

/**
 * 产品详情：按 id 查询（前台详情路由 /products/[slugId]，由 slug-id 解析出 id）。
 *
 * 实体缓存 tag 以 id 为键，与后端失效契约（cms/products notifyFrontend）一致。
 */
export async function getProductById(id: string): Promise<ProductDetail | null> {
  if (getProductsSource() === 'demo') {
    return findDemoProductById(id);
  }

  try {
    return await apiGet<ProductDetail>(`/products/by-id/${encodeURIComponent(id)}`, {
      // 同时挂列表 tag：产品改名 / 换图会影响列表卡片
      tags: [CmsTags.product(id), CmsTags.products],
      revalidate: CmsRevalidate.CONTENT,
    });
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

/**
 * 产品详情：按 slug 查询（兼容保留：应用场景 / 博客关联产品解析、
 * 旧链接 `?product=slug` 回落）。实体粒度 tag 由 id 版承担，
 * 这里只挂列表 tag（失效粒度由 300s revalidate 兜底）。
 */
export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  if (getProductsSource() === 'demo') {
    return findDemoProduct(slug);
  }

  try {
    return await apiGet<ProductDetail>(`/products/${encodeURIComponent(slug)}`, {
      tags: [CmsTags.products],
      revalidate: CmsRevalidate.CONTENT,
    });
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

/** 产品分类（数据驱动，不在代码中写死） */
export async function getCategories(): Promise<ProductCategory[]> {
  if (getProductsSource() === 'demo') {
    return demoCategories;
  }

  const result = await apiGet<{ items: ProductCategory[]; total: number }>('/categories', {
    tags: [CmsTags.categories],
    revalidate: CmsRevalidate.STABLE,
  });
  return result.items;
}

/**
 * 用于 generateStaticParams / sitemap 的产品 id 列表（详情路由 /products/[id]）。
 *
 * api 模式下接口不可用会如实抛错（构建失败即暴露问题，而不是静默产出
 * 一个"看似成功但内容缺失"的站点）——与 blog / 站点内容模块保持一致。
 */
export async function getProductIds(): Promise<string[]> {
  if (getProductsSource() === 'demo') {
    return demoProducts.map((product) => product.id);
  }

  const result = await apiGet<PaginatedProducts>('/products?pageSize=48', {
    tags: [CmsTags.products],
    revalidate: CmsRevalidate.CONTENT,
  });
  return result.items.map((item) => item.id);
}

/** slug + id 对（详情路由 /products/[slugId] 的预渲染键） */
export interface ProductSlugId {
  slug: string;
  id: string;
}

/**
 * 用于 generateStaticParams / sitemap 的产品 slug-id 列表（详情路由
 * /products/[slugId]，URL 由 slug-id 拼接而成）。
 *
 * 与 getProductIds 同源（/products?pageSize=48），仅投影字段不同。
 */
export async function getProductSlugIds(): Promise<ProductSlugId[]> {
  if (getProductsSource() === 'demo') {
    return demoProducts.map((product) => ({ slug: product.slug, id: product.id }));
  }

  const result = await apiGet<PaginatedProducts>('/products?pageSize=48', {
    tags: [CmsTags.products],
    revalidate: CmsRevalidate.CONTENT,
  });
  return result.items.map((item) => ({ slug: item.slug, id: item.id }));
}
