import {
  demoCategories,
  demoProducts,
  findDemoProduct,
  queryDemoProducts,
} from './demo-data';
import type {
  PaginatedProducts,
  ProductCategory,
  ProductDetail,
  ProductQuery,
} from './types';
import { apiGet, isApiSource, isNotFound, qs } from '@/lib/cms-api';

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
  );
  return result;
}

/** 产品详情；不存在或未发布返回 null（页面据此调用 notFound()） */
export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  if (getProductsSource() === 'demo') {
    return findDemoProduct(slug);
  }

  try {
    return await apiGet<ProductDetail>(`/products/${encodeURIComponent(slug)}`);
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

  const result = await apiGet<{ items: ProductCategory[]; total: number }>('/categories');
  return result.items;
}

/**
 * 用于 generateStaticParams / sitemap 的 slug 列表。
 *
 * api 模式下接口不可用会如实抛错（构建失败即暴露问题，而不是静默产出
 * 一个"看似成功但内容缺失"的站点）——与 blog / 站点内容模块保持一致。
 */
export async function getProductSlugs(): Promise<string[]> {
  if (getProductsSource() === 'demo') {
    return demoProducts.map((product) => product.slug);
  }

  const result = await apiGet<PaginatedProducts>('/products?pageSize=48');
  return result.items.map((item) => item.slug);
}
