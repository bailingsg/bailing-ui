import { allImages, factoryImages, qualityImages } from './demo-data';
import { apiGet, isApiSource } from '@/lib/cms-api';
import { CmsRevalidate, CmsTags } from '@/lib/cms-tags';
import type {
  FactoryImage,
  FactoryImageCategory,
  ImageCategory,
  QualityImageCategory,
} from './types';

/**
 * 图片数据访问层（Repository）
 *
 * 页面只依赖本模块，因此数据来源从「仓库内登记」切换到「后端 CMS」时
 * 页面代码无需改动。
 *
 * 数据源（Phase 4.7 起统一到 NEXT_PUBLIC_CMS_SOURCE）：
 *   · demo（默认）—— 仓库内登记的企业实景素材（当前为空数组，渲染占位）
 *   · api —— bailing-backend 公开只读接口 /api/v1/public/factory
 *
 * 设计原则：
 *   · 全部函数为 async —— 替换远端数据源不改调用方签名；
 *   · 分类由数据驱动，组件不写死任何具体图片；
 *   · 无素材时返回空数组，由组件渲染统一占位（不伪造图片）。
 */

/** 工厂页展示的图片分类（顺序即页面展示顺序） */
export const FACTORY_GALLERY_CATEGORIES: FactoryImageCategory[] = [
  'factory',
  'production',
  'equipment',
  'loading',
  'exhibition',
];

/** 质量页展示的图片分类 */
export const QUALITY_GALLERY_CATEGORIES: QualityImageCategory[] = [
  'inspection',
  'certificate',
  'packaging',
];

function sortImages(images: FactoryImage[]): FactoryImage[] {
  return [...images].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.id.localeCompare(b.id);
  });
}

/* ---------------------------------------------------------------------------
 * CMS（api）模式：后端 FactorySection → 页面图片分类
 *
 * 后端分区类型枚举 FactorySectionType：OVERVIEW / FACILITY / EQUIPMENT /
 * PRODUCTION / LOADING / EXHIBITION。页面图片分类是其面向展示的归并：
 *   · OVERVIEW + FACILITY → factory（工厂全景 / 厂房）
 *   · 其余一一对应
 * 展会照片归入 exhibition；未知类型（后端新增枚举时）安全降级为 factory。
 * --------------------------------------------------------------------------*/
const SECTION_TYPE_TO_CATEGORY: Record<string, ImageCategory> = {
  OVERVIEW: 'factory',
  FACILITY: 'factory',
  EQUIPMENT: 'equipment',
  PRODUCTION: 'production',
  LOADING: 'loading',
  EXHIBITION: 'exhibition',
};

/** 公开接口：工厂分区列表项 / 详情（与后端 public.entity.ts 对齐） */
interface ApiFactoryImage {
  url: string;
  altText: string | null;
}

interface ApiFactoryExhibition {
  name: string;
  heldOn: string | null;
  location: string | null;
  description: string | null;
  photos: ApiFactoryImage[];
}

interface ApiFactorySectionListItem {
  title: string;
  slug: string;
  sectionType: string;
  summary: string | null;
  coverImageUrl: string | null;
  publishedAt: string | null;
}

interface ApiFactorySectionDetail extends ApiFactorySectionListItem {
  content: string | null;
  gallery: ApiFactoryImage[];
  exhibitions: ApiFactoryExhibition[];
  seoTitle: string | null;
  seoDescription: string | null;
}

/**
 * 拉取全站已发布工厂素材（api 模式）。
 *
 * 一次列表 + N 个详情**并行**请求（分区数量为个位数，非串行 N+1）。
 *
 * 注意（Phase 4.8）：这里**不再使用进程级模块缓存**。模块缓存会绕过
 * Next 的数据缓存与 revalidateTag —— 后台删除素材后前台仍读旧值。
 * 同一次渲染内的重复调用由 Next 的 fetch 去重（同一 URL 只请求一次）承担，
 * 跨请求的复用交给带 tag 的 ISR 缓存。
 */
async function fetchApiImages(): Promise<FactoryImage[]> {
  const list = await apiGet<{ items: ApiFactorySectionListItem[]; total: number }>(
    '/public/factory',
    { tags: [CmsTags.factory], revalidate: CmsRevalidate.STABLE },
  );
  const details = await Promise.all(
    list.items.map((item) =>
      apiGet<ApiFactorySectionDetail>(`/public/factory/${encodeURIComponent(item.slug)}`, {
        tags: [CmsTags.factory],
        revalidate: CmsRevalidate.STABLE,
      }),
    ),
  );

  const images: FactoryImage[] = [];
  for (const detail of details) {
    const category = SECTION_TYPE_TO_CATEGORY[detail.sectionType] ?? 'factory';
    detail.gallery.forEach((image, index) => {
      if (!image.url) return; // 无媒体关联的图不出现在公开响应中，防御性跳过
      images.push({
        id: `${detail.slug}-gallery-${index}`,
        url: image.url,
        alt: image.altText ?? detail.title,
        category,
        sortOrder: index * 10,
        caption: detail.title,
      });
    });
    // 展会照片：caption 带展会名（真实展会记录，非虚构）
    detail.exhibitions.forEach((exhibition) => {
      exhibition.photos.forEach((image, index) => {
        if (!image.url) return;
        images.push({
          id: `${detail.slug}-exhibition-${exhibition.name}-${index}`,
          url: image.url,
          alt: image.altText ?? exhibition.name,
          category: 'exhibition',
          sortOrder: 1000 + index * 10,
          caption: exhibition.name,
        });
      });
    });
  }

  return sortImages(images);
}

/** 按分类取图片（单分类） */
export async function getImagesByCategory(category: ImageCategory): Promise<FactoryImage[]> {
  if (isApiSource()) {
    const images = await fetchApiImages();
    return images.filter((image) => image.category === category);
  }
  return sortImages(allImages.filter((image) => image.category === category));
}

/** 按多个分类取图片（合并后统一排序） */
export async function getImages(categories: ImageCategory[]): Promise<FactoryImage[]> {
  const wanted = new Set<ImageCategory>(categories);
  if (isApiSource()) {
    const images = await fetchApiImages();
    return images.filter((image) => wanted.has(image.category));
  }
  return sortImages(allImages.filter((image) => wanted.has(image.category)));
}

/** 是否存在任何素材（页面据此决定是否展示"待补充"提示） */
export async function hasAnyImage(categories: ImageCategory[]): Promise<boolean> {
  const wanted = new Set<ImageCategory>(categories);
  if (isApiSource()) {
    const images = await fetchApiImages();
    return images.some((image) => wanted.has(image.category));
  }
  return allImages.some((image) => wanted.has(image.category));
}

/** 素材总览（用于自检 / 调试，不直接渲染） */
export async function getGallerySummary(): Promise<{
  total: number;
  factory: number;
  quality: number;
}> {
  if (isApiSource()) {
    const images = await fetchApiImages();
    return {
      total: images.length,
      factory: images.filter((image) => image.category !== 'certificate').length,
      quality: 0,
    };
  }
  return {
    total: allImages.length,
    factory: factoryImages.length,
    quality: qualityImages.length,
  };
}

/**
 * 工厂介绍分区正文（api 模式；demo 模式返回 null）。
 *
 * 页面据此在「已发布」时展示真实介绍，未发布时保留待补充框架——
 * 不虚构任何面积 / 产能 / 员工数字。
 */
export async function getFactoryOverview(): Promise<{
  title: string;
  summary: string | null;
  content: string | null;
} | null> {
  if (!isApiSource()) return null;

  const list = await apiGet<{ items: ApiFactorySectionListItem[]; total: number }>(
    '/public/factory',
    { tags: [CmsTags.factory], revalidate: CmsRevalidate.STABLE },
  );
  const overview = list.items.find((item) => item.sectionType === 'OVERVIEW');
  if (!overview) return null;

  const detail = await apiGet<ApiFactorySectionDetail>(
    `/public/factory/${encodeURIComponent(overview.slug)}`,
    { tags: [CmsTags.factory], revalidate: CmsRevalidate.STABLE },
  );
  return {
    title: detail.title,
    summary: detail.summary,
    content: detail.content,
  };
}
