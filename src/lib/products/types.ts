/**
 * 产品领域类型（前端）
 *
 * 与后端 `bailing-backend/src/modules/products/product.dto.ts` 的公开契约
 * 一一对应，保证「Mock 数据层」与「API 数据源」可无缝互换。
 *
 * 注意：百灵木业为 B2B 制造商，产品不含 price / stock / sku / rating / review。
 */

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductCategoryRef {
  id: string;
  slug: string;
  name: string;
}

/** 产品列表项（网格卡片） */
export interface ProductListItem {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  category: ProductCategoryRef | null;
  material: string | null;
  application: string | null;
  /**
   * 应用标签（后台 CMS「应用标签」维护，最多 20 项）。
   * 未配置 / 非法结构一律为 null（不伪造标签）。
   */
  applications: string[] | null;
  featured: boolean;
  images: ProductImage[];
}

/** 产品详情 */
export interface ProductDetail extends ProductListItem {
  description: string;
  /** 规格参数键值对；未配置为 null（不伪造规格） */
  specifications: Record<string, string> | null;
  seo: {
    title: string;
    description: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProducts {
  items: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** 分类（用于筛选器；体系由数据驱动，不在代码中写死） */
export interface ProductCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  parentId: string | null;
  sortOrder: number;
  productCount: number;
}

export interface ProductQuery {
  page?: number;
  pageSize?: number;
  category?: string;
  featured?: boolean;
}
