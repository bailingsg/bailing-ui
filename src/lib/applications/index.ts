/**
 * 应用场景数据层出口
 *
 * 页面统一从 `@/lib/applications` 引入，不直接引用 demo-data / repository 内部实现。
 */
export type { Application, ApplicationQuery } from './types';
export {
  APPLICATIONS_PAGE_SIZE,
  getApplicationBySlug,
  getApplicationSlugs,
  getApplications,
  hasAllApplicationImages,
} from './repository';
