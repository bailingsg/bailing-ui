import { allAboutImages } from './demo-data';
import type { AboutImage, AboutImageCategory, AboutImageCategoryMap } from './types';

/**
 * 关于我们页素材数据访问层（Repository）
 *
 * 页面只依赖本模块，因此未来把素材来源从「仓库内登记」切换到
 * 「后端 API / CMS / COS」时，页面代码无需改动。
 *
 * 设计原则：
 *   · 全部函数为 async —— 便于未来替换为远端数据源而不改调用方签名；
 *   · 分类由数据驱动，组件不写死任何具体图片；
 *   · 无素材时返回空数组，由组件渲染统一占位（不伪造图片）。
 */

/** 关于我们页展示的图片分类（顺序即页面展示顺序） */
export const ABOUT_GALLERY_CATEGORIES: AboutImageCategory[] = [
  'company',
  'team',
  'factory',
  'exhibition',
  'office',
];

/**
 * 文件名 → 分类的**关键词匹配规则**（自动绑定用）
 *
 * 用途：当业务方把新素材丢进素材目录时，`docs/sync-about-assets.cjs`
 * 依据本规则自动判定分类并生成登记表 —— 无需人工逐个指定分类。
 *
 * 注意：规则只在**素材入库**阶段使用；页面渲染一律读登记表，
 * 因此组件与页面中不存在任何硬编码文件名。
 */
export const ABOUT_IMAGE_KEYWORDS: Record<AboutImageCategory, string[]> = {
  company: ['about', 'company', 'campus', 'plant', 'aerial', 'overview'],
  team: ['team', 'staff', 'member', 'people', 'portrait', 'employee'],
  factory: ['factory', 'production', 'machine', 'workshop', 'line'],
  exhibition: ['exhibition', 'show', 'fair', 'expo', 'booth'],
  office: ['office', 'meeting', 'showroom', 'reception'],
};

/**
 * 依据文件名关键词推断图片分类。
 *
 * @param fileName 文件名（可含扩展名，大小写不敏感）
 * @returns 命中的分类；无任何关键词命中时返回 null（交由人工确认）
 */
export function classifyAboutImageFileName(fileName: string): AboutImageCategory | null {
  const lower = fileName.toLowerCase();
  const order = Object.keys(ABOUT_IMAGE_KEYWORDS) as AboutImageCategory[];
  for (const category of order) {
    if (ABOUT_IMAGE_KEYWORDS[category].some((keyword) => lower.includes(keyword))) {
      return category;
    }
  }
  return null;
}

function sortImages(images: AboutImage[]): AboutImage[] {
  return [...images].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.id.localeCompare(b.id);
  });
}

/** 按分类取图片（单分类） */
export async function getAboutImagesByCategory(category: AboutImageCategory): Promise<AboutImage[]> {
  return sortImages(allAboutImages.filter((image) => image.category === category));
}

/** 按多个分类取图片（合并后统一排序） */
export async function getAboutImages(
  categories: AboutImageCategory[] = ABOUT_GALLERY_CATEGORIES,
): Promise<AboutImage[]> {
  const wanted = new Set<AboutImageCategory>(categories);
  return sortImages(allAboutImages.filter((image) => wanted.has(image.category)));
}

/** 是否存在任何素材（页面据此决定是否展示"待补充"提示） */
export async function hasAnyAboutImage(categories: AboutImageCategory[]): Promise<boolean> {
  const wanted = new Set<AboutImageCategory>(categories);
  return allAboutImages.some((image) => wanted.has(image.category));
}

/** 按分类聚合（供需要分组渲染的页面使用） */
export async function getAboutImagesGrouped(): Promise<AboutImageCategoryMap> {
  const map: AboutImageCategoryMap = {};
  for (const category of ABOUT_GALLERY_CATEGORIES) {
    const images = await getAboutImagesByCategory(category);
    if (images.length > 0) map[category] = images;
  }
  return map;
}

/** 素材总览（用于自检 / 调试，不直接渲染） */
export async function getAboutImageSummary(): Promise<Record<AboutImageCategory, number>> {
  const summary = {} as Record<AboutImageCategory, number>;
  for (const category of ABOUT_GALLERY_CATEGORIES) {
    summary[category] = allAboutImages.filter((image) => image.category === category).length;
  }
  return summary;
}
