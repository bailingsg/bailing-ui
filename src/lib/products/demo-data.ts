import type {
  PaginatedProducts,
  ProductCategory,
  ProductDetail,
  ProductListItem,
} from './types';

/**
 * ⚠️ Demo / Placeholder 数据层
 *
 * 这些**不是真实产品**：名称统一以 "Demo ·" 开头，描述明确标注 [DEMO DATA]，
 * 且**不含**任何编造的规格参数、认证、价格、客户案例或图片素材。
 *
 * 用途：在 CMS / 产品数据接入前，验证产品列表页与详情页模板与数据管道。
 * 内容与后端种子数据（bailing-backend/prisma/seed.ts）保持一致，
 * 便于把数据源从 `demo` 切到 `api` 时页面表现完全对齐。
 *
 * 移除方式：产品数据接入 CMS 后，将 NEXT_PUBLIC_PRODUCTS_SOURCE 设为 `api`
 * 并删除本文件即可（页面代码无需改动）。
 */

const DEMO_NOTE =
  '[DEMO DATA] This is a placeholder product record. It exists only to verify the product listing and detail templates. It will be replaced by CMS-managed content and does not describe a real product.';

const SHORT_DESCRIPTION = 'Placeholder entry used to validate the product template.';

export const demoCategories: ProductCategory[] = [
  {
    id: 'demo-cat-wood-products',
    slug: 'wood-products',
    name: 'Wood Products',
    description: 'Solid wood panels and wooden components.',
    parentId: null,
    sortOrder: 10,
    productCount: 1,
  },
  {
    id: 'demo-cat-packaging-products',
    slug: 'packaging-products',
    name: 'Packaging Products',
    description: 'Wooden packaging, crating and pallets.',
    parentId: null,
    sortOrder: 20,
    productCount: 1,
  },
  {
    id: 'demo-cat-industrial-products',
    slug: 'industrial-products',
    name: 'Industrial Products',
    description: 'Wood-based industrial materials.',
    parentId: null,
    sortOrder: 30,
    productCount: 0,
  },
  {
    id: 'demo-cat-custom-solutions',
    slug: 'custom-solutions',
    name: 'Custom Solutions',
    description: 'OEM / ODM custom wooden products.',
    parentId: null,
    sortOrder: 40,
    productCount: 1,
  },
];

function demoProduct(
  slug: string,
  name: string,
  categorySlug: string,
  featured: boolean,
): ProductDetail {
  const category = demoCategories.find((item) => item.slug === categorySlug) ?? null;
  const timestamp = '2026-01-01T00:00:00.000Z';

  return {
    id: `demo-product-${slug}`,
    slug,
    name,
    shortDescription: SHORT_DESCRIPTION,
    category: category ? { id: category.id, slug: category.slug, name: category.name } : null,
    material: null,
    application: null,
    applications: null,
    featured,
    // 不提供任何图片素材：详情页将展示 OptimizedImage 的统一占位
    images: [],
    description: DEMO_NOTE,
    specifications: null,
    seo: { title: name, description: SHORT_DESCRIPTION },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export const demoProducts: ProductDetail[] = [
  demoProduct('demo-wood-panel', 'Demo · Wood Panel', 'wood-products', true),
  demoProduct('demo-wooden-crate', 'Demo · Wooden Crate', 'packaging-products', false),
  demoProduct(
    'demo-custom-component',
    'Demo · Custom Wooden Component',
    'custom-solutions',
    false,
  ),
];

/** 详情 → 列表项（与后端 mapper 行为一致） */
function toListItem(product: ProductDetail): ProductListItem {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    category: product.category,
    material: product.material,
    application: product.application,
    applications: product.applications,
    featured: product.featured,
    images: product.images,
  };
}

/** 以内存数据模拟分页 / 过滤，行为与后端 API 保持一致 */
export function queryDemoProducts(query: {
  page?: number;
  pageSize?: number;
  category?: string;
  featured?: boolean;
}): PaginatedProducts {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, query.pageSize ?? 12));

  let rows = [...demoProducts];
  if (query.category) {
    rows = rows.filter((item) => item.category?.slug === query.category);
  }
  if (query.featured !== undefined) {
    rows = rows.filter((item) => item.featured === query.featured);
  }
  rows.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  const total = rows.length;
  const start = (page - 1) * pageSize;

  return {
    items: rows.slice(start, start + pageSize).map(toListItem),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export function findDemoProduct(slug: string): ProductDetail | null {
  return demoProducts.find((item) => item.slug === slug) ?? null;
}

/** 按 id 查找（前台详情路由 /products/[slugId]，由 slug-id 解析出 id） */
export function findDemoProductById(id: string): ProductDetail | null {
  return demoProducts.find((item) => item.id === id) ?? null;
}
