/**
 * 产品数据层出口
 *
 * 页面统一从 `@/lib/products` 引入，不直接引用 demo-data / repository 内部实现。
 */
export * from './types';
export {
  getCategories,
  getProductBySlug,
  getProducts,
  getProductSlugs,
  getProductsSource,
  isDemoSource,
  type ProductsSource,
} from './repository';
