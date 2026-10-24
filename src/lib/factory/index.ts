/**
 * 工厂 / 质量图片数据层出口
 *
 * 页面统一从 `@/lib/factory` 引入，不直接引用 demo-data / repository 内部实现。
 */
export type {
  FactoryImage,
  FactoryImageCategory,
  QualityImageCategory,
  ImageCategory,
  ImageCategoryMap,
} from './types';
export {
  FACTORY_GALLERY_CATEGORIES,
  FACTORY_MAX_IMAGES_PER_GALLERY,
  MAX_IMAGES_PER_GALLERY,
  QUALITY_GALLERY_CATEGORIES,
  getFactoryOverview,
  getGallerySummary,
  getImages,
  getImagesByCategory,
  hasAnyImage,
} from './repository';
