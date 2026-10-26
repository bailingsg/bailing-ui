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
 *     （Phase 5.6 起另聚合媒体库按用途分类的图片 /api/v1/public/media）
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

/**
 * 质量页单个图集最多展示的图片数（硬上限，超过一律截断）。
 *
 * 业务规则（2026-10-23 确认）：质量页各图集每个匹配类型最多三张，
 * 只取最新的，不可超过三张。质量页各图集均为三列布局，空态占位数量
 * （placeholderCount）也按 3 对齐。
 */
export const MAX_IMAGES_PER_GALLERY = 3;

/**
 * 工厂页单个图集最多展示的图片数（硬上限，超过一律截断）。
 *
 * 业务规则（2026-10-24 起）：工厂页各板块上限由 3 提高至 6。超出部分
 * 不再直接丢弃——页面拉取全量数据，由客户端组件截断预览数量，
 * 其余照片经「查看更多照片」弹窗展示，因此本常量只约束**预览数量**，
 * 数据层查询请传 `Infinity` 取全量。
 */
export const FACTORY_MAX_IMAGES_PER_GALLERY = 6;

function sortImages(images: FactoryImage[]): FactoryImage[] {
  return [...images].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.id.localeCompare(b.id);
  });
}

/**
 * 排序后截断到limit 张。
 *
 * 「最新」的口径（两种数据源共用）：
 *   · 分区登记图（gallery）—— 按编辑排序在前的优先（策展内容）；
 *   · 媒体库自动聚合图 —— 后端 /public/media 按 createdAt 倒序返回，
 *     这里的 sortOrder 保持该顺序，即**最新上传的在前**。
 * 同一图集内登记图排在聚合图之前（既有约定，不变）。
 */
function capLatest(images: FactoryImage[], limit: number): FactoryImage[] {
  const sorted = sortImages(images);
  if (!Number.isFinite(limit) || limit < 0) return sorted;
  return sorted.slice(0, limit);
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
  const seenUrls = new Set<string>();
  const push = (image: FactoryImage): void => {
    if (!image.url || seenUrls.has(image.url)) return;
    seenUrls.add(image.url);
    images.push(image);
  };

  for (const detail of details) {
    const category = SECTION_TYPE_TO_CATEGORY[detail.sectionType] ?? 'factory';
    detail.gallery.forEach((image, index) => {
      push({
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
        push({
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

  // 媒体库按用途自动聚合的图（Phase 5.6）：排在分区登记图之后，
  // 已登记过的同一 URL 不重复出现（去重在 push 内完成）。
  const mediaImages = await fetchApiMediaImages();
  mediaImages.forEach(push);

  return sortImages(images);
}

/* ---------------------------------------------------------------------------
 * 媒体库按用途自动聚合（Phase 5.6）
 *
 * 后台媒体库上传时选了「工厂 / 生产 / 装车 / 展会」等用途，前台工厂页
 * 无需在业务表里重复登记即可自动取到——媒体库里改用途即改页面图集。
 *
 * 用途 → 页面图片分类的映射（MediaUsage → ImageCategory）：
 *   · FACTORY     → factory     工厂全景 / 厂区   →「工厂与车间」板块
 *   · PRODUCTION  → equipment   生产设备 / 工序   →「生产设备」板块
 *   · LOADING     → loading     装车 / 发运       →「装柜发货」板块
 *   · EXHIBITION  → exhibition  展会              →「参展记录」板块
 *   · INSPECTION  → inspection  检验过程照片      → 质量页「检验流程」
 *   · PACKAGING   → packaging   包装品质照片      → 质量页「包装品质」
 *   · CERTIFICATE → certificate 证书 / 检测报告   → 质量页「认证与报告」兜底
 * 其余用途（文章 / 产品 / 应用 / 站点 / 其它）不属于这两页，忽略。
 *
 * ⚠️ 2026-10-26 调整：`PRODUCTION` 原先映射到 `production` 分类，与 `factory`
 * 合并后统一进「工厂与车间」板块，导致「生产设备」板块**永远取不到媒体库的图**
 * （`equipment` 分类只能来自 CMS 工厂分区登记图集）。现改为映射到 `equipment`，
 * 让后台「生产」标签直达「生产设备」板块，与「工厂 → 工厂与车间」对齐。
 * `production` 分类因此只由 CMS 分区登记图（sectionType=PRODUCTION，生产流程）填充，
 * 仍归入「工厂与车间」板块，不受影响。
 *
 * ⚠️ 同日补：质量页的 inspection / packaging 两个图集此前**没有任何数据源**
 * （媒体库无对应用途、质量记录也不产出图集），永远渲染 3 个「照片待补充」占位。
 * 后端 MediaUsage 新增 INSPECTION / PACKAGING 后在此接上；CERTIFICATE 复用既有值，
 * 质量页在没有已发布记录时以图片墙兜底。
 * --------------------------------------------------------------------------*/
const MEDIA_USAGE_TO_CATEGORY: Record<string, ImageCategory> = {
  FACTORY: 'factory',
  PRODUCTION: 'equipment',
  LOADING: 'loading',
  EXHIBITION: 'exhibition',
  INSPECTION: 'inspection',
  PACKAGING: 'packaging',
  CERTIFICATE: 'certificate',
};

/** 需要从媒体库聚合的全部用途（与上面映射的键一一对应） */
const PAGE_MEDIA_USAGES = Object.keys(MEDIA_USAGE_TO_CATEGORY);

/** 媒体库自动聚合图的排序基址（排在分区登记图之后） */
const MEDIA_SORT_BASE = 5000;

/** 公开接口：按用途列出的媒体项（与后端 PublicMediaItem 对齐） */
interface ApiMediaItem {
  id: string;
  url: string;
  altText: string | null;
  title: string | null;
  caption: string | null;
  usage: string;
  createdAt: string;
}

/**
 * 拉取媒体库中已按用途分类的图片（api 模式）。
 *
 * **按用途分别查询**（2026-10-26 修）：此前一次 `/public/media?limit=48`
 * 取「最近 48 条已分类媒体」再在前端过滤，而接口 `limit` 上限就是 48。
 * 媒体库产品图一度占 143 张，工厂/质量图很容易被挤出这 48 条窗口，
 * 表现为「后台上传了、前台就是不出图」。改为每个用途各查一次（上限 48/用途），
 * 各用途互不挤占。
 *
 * 数量截断仍不在这里做——由 `capLatest()` 在按分类查询时统一执行
 * （工厂页预览 6 张 / 质量页 3 张）。
 */
async function fetchApiMediaImages(): Promise<FactoryImage[]> {
  const responses = await Promise.all(
    PAGE_MEDIA_USAGES.map((usage) =>
      apiGet<{ items: ApiMediaItem[]; total: number }>(
        `/public/media?usage=${encodeURIComponent(usage)}&limit=48`,
        { tags: [CmsTags.media], revalidate: CmsRevalidate.STABLE },
      ),
    ),
  );

  // 分用途查询后需重新归并，恢复「最新上传在前」的统一口径
  const items = responses.flatMap((response) => response.items);
  items.sort((a, b) => {
    const diff = Date.parse(b.createdAt) - Date.parse(a.createdAt);
    return diff !== 0 ? diff : a.id.localeCompare(b.id);
  });

  const images: FactoryImage[] = [];
  items.forEach((item, index) => {
    const category = MEDIA_USAGE_TO_CATEGORY[item.usage];
    if (!category) return; // 不属于工厂页 / 质量页的用途
    images.push({
      id: `media-${item.id}`,
      url: item.url,
      alt: item.altText ?? item.title ?? '',
      category,
      sortOrder: MEDIA_SORT_BASE + index * 10,
      caption: item.caption ?? item.title ?? undefined,
    });
  });
  return images;
}

/**
 * 按分类取图片（单分类）。
 *
 * 默认只取最新的 `MAX_IMAGES_PER_GALLERY`（3）张；limit 传 `Infinity`
 * 或负数可显式取全量（自检 / 调试场景）。
 */
export async function getImagesByCategory(
  category: ImageCategory,
  limit: number = MAX_IMAGES_PER_GALLERY,
): Promise<FactoryImage[]> {
  if (isApiSource()) {
    const images = await fetchApiImages();
    return capLatest(
      images.filter((image) => image.category === category),
      limit,
    );
  }
  return capLatest(
    allImages.filter((image) => image.category === category),
    limit,
  );
}

/**
 * 按多个分类取图片（合并后统一排序、截断）。
 *
 * 截断按**整个查询**计：一次调用最多返回 limit 张（默认 3，质量页口径）。
 * 工厂页预览 6 张且需「查看更多」全量，页面显式传
 * `FACTORY_MAX_IMAGES_PER_GALLERY`（预览）或 `Infinity`（全量）。
 */
export async function getImages(
  categories: ImageCategory[],
  limit: number = MAX_IMAGES_PER_GALLERY,
): Promise<FactoryImage[]> {
  const wanted = new Set<ImageCategory>(categories);
  if (isApiSource()) {
    const images = await fetchApiImages();
    return capLatest(
      images.filter((image) => wanted.has(image.category)),
      limit,
    );
  }
  return capLatest(
    allImages.filter((image) => wanted.has(image.category)),
    limit,
  );
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
