/**
 * 资讯 / 知识库数据层出口
 *
 * 页面统一从 `@/lib/blog` 引入，不直接引用 demo-data / repository 内部实现。
 */
export type {
  BlogBlock,
  BlogCategory,
  BlogCategoryInfo,
  BlogCategorySlug,
  BlogPost,
  BlogPostSummary,
  BlogQuery,
  PaginatedBlogPosts,
} from './types';
export {
  BLOG_PAGE_SIZE,
  getBlogCategories,
  getBlogPostBySlug,
  getBlogPosts,
  getBlogSlugs,
  getRelatedBlogPosts,
  normalizeBlogCategory,
  type BlogCategoryWithCount,
} from './repository';
