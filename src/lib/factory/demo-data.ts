import type { FactoryImage } from './types';

/**
 * ⚠️ 企业实景素材登记表（当前为空）
 *
 * 百灵木业已有真实素材（工厂 / 生产 / 装车 / 展会 / 质检 / 证书 / 包装照片），
 * 但素材文件尚未纳入本仓库，因此**本文件当前不登记任何图片**。
 *
 * 为什么不放示例图：
 *   本阶段明确禁止使用 AI 生成工厂图、图库素材或任何虚假图片。
 *   图片位在页面上以统一占位呈现（"Photo to be added"），
 *   真实素材到位后按下表登记即可，页面无需改动。
 *
 * 接入真实素材的步骤：
 *   1. 把原图放入 `public/factory/`（或未来接入 COS/CDN 后使用其 URL）；
 *   2. 在下方数组登记一条记录（id 唯一、category 从类型中选取、sortOrder 决定顺序）；
 *   3. alt 必须填写真实描述（SEO 与无障碍都需要），建议 8–15 个英文单词。
 *
 * 示例（**请勿直接启用，需替换为真实素材**）：
 *   {
 *     id: 'factory-overview-01',
 *     url: '/factory/factory-overview-01.jpg',
 *     alt: 'Exterior view of the Bailing Wooden manufacturing facility',
 *     category: 'factory',
 *     sortOrder: 10,
 *     caption: 'Factory exterior',
 *   }
 */
export const factoryImages: FactoryImage[] = [];

/** 质量页素材（检验 / 证书 / 包装）。当前为空，原因同上。 */
export const qualityImages: FactoryImage[] = [];

/** 全部素材（供统一排序与检索） */
export const allImages: FactoryImage[] = [...factoryImages, ...qualityImages];
