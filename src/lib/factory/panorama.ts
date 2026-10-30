import type { FactoryImage } from './types';

/**
 * 工厂页「工厂全景」独立图位
 *
 * 背景（2026-10-30 业务方反馈）：
 *   · 工厂页原先有一个独立的「工厂全景照片」图位（右栏大图），在 commit
 *     100e577 中随占位模块一并移除；此后厂区照片全部并入「工厂与车间」
 *     三列网格，视觉上被压成小方图。
 *   · 业务方要求把「工厂入口」这张厂区代表照片放回**原工厂全景图的位置**，
 *     即图集网格上方的一张通栏大图。
 *
 * 数据侧约束：媒体库 / CMS 工厂分区都没有「全景」这一概念，只有分类
 * （`factory` = 工厂全景 / 厂区）与上传时间排序。因此这里按两级口径选图：
 *   1. 标题 / 图注命中全景关键词（工厂入口、厂区全景、factory entrance…）
 *      —— 显式命名，最贴近业务意图；
 *   2. 否则取 `factory` 分类里排序最前的一张（该类目语义就是「工厂全景 /
 *      厂区」，排序即后台策展顺序）。
 * 两者都取不到时不渲染全景位，退化为纯图集，不伪造图片。
 *
 * 选中的那张会从下方网格中剔除，避免同一张照片在页面上出现两次。
 */

/** 命中即视为「全景 / 厂区代表照」的关键词（大小写不敏感） */
const PANORAMA_KEYWORDS = [
  '工厂全景',
  '厂区全景',
  '工厂入口',
  '厂区入口',
  '工厂大门',
  '厂区大门',
  'panorama',
  'factory entrance',
  'factory gate',
  'factory overview',
];

function matchesPanorama(image: FactoryImage): boolean {
  const haystack = `${image.alt} ${image.caption ?? ''}`.toLowerCase();
  return PANORAMA_KEYWORDS.some((keyword) => haystack.includes(keyword.toLowerCase()));
}

export interface FactoryPanoramaSplit {
  /** 通栏全景图；无可选素材时为 null（页面据此跳过整个图位） */
  panorama: FactoryImage | null;
  /** 其余照片，供下方图集网格使用 */
  gallery: FactoryImage[];
}

/**
 * 把工厂页拉到的厂区素材拆成「全景大图 + 图集网格」两部分。
 *
 * 纯函数，不改变入参顺序；返回的 `gallery` 保持原有排序。
 */
export function splitFactoryPanorama(images: FactoryImage[]): FactoryPanoramaSplit {
  if (images.length === 0) return { panorama: null, gallery: [] };

  const panorama =
    images.find(matchesPanorama) ?? images.find((image) => image.category === 'factory') ?? null;

  if (!panorama) return { panorama: null, gallery: images };

  return {
    panorama,
    gallery: images.filter((image) => image.id !== panorama.id),
  };
}
