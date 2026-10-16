/**
 * 关于我们（About）数据层出口
 *
 * 页面统一从 `@/lib/about` 引入，不直接引用 demo-data / repository 内部实现。
 */
export type {
  AboutImage,
  AboutImageCategory,
  AboutImageCategoryMap,
} from './types';
export {
  ABOUT_GALLERY_CATEGORIES,
  ABOUT_IMAGE_KEYWORDS,
  classifyAboutImageFileName,
  getAboutImageSummary,
  getAboutImages,
  getAboutImagesByCategory,
  getAboutImagesGrouped,
  hasAnyAboutImage,
} from './repository';
