/**
 * 站点图片（工厂 / 质量）领域类型
 *
 * 与产品图片不同，这里的图片是**企业实景素材**（工厂、生产、装车、展会、
 * 质检、证书、包装），用于建立可扩展的图片展示体系。
 *
 * 说明：
 *   · 图片只登记 URL 与元数据，不绑定任何存储服务（未来可指向 COS/CDN）；
 *   · 分类（category）由数据驱动，组件不写死任何具体图片；
 *   · 本阶段数据为空数组 —— 业务方提供真实素材后再登记，**绝不使用
 *     AI 生成图 / 图库素材 / 任何虚假图片**。
 */

/** 工厂页图片分类 */
export type FactoryImageCategory =
  | 'factory' // 工厂全景 / 厂区
  | 'production' // 生产车间 / 工序
  | 'equipment' // 设备
  | 'loading' // 装车 / 发运
  | 'exhibition'; // 展会

/** 质量页图片分类 */
export type QualityImageCategory =
  | 'inspection' // 检验过程
  | 'certificate' // 证书 / 报告
  | 'packaging'; // 包装

export type ImageCategory = FactoryImageCategory | QualityImageCategory;

export interface FactoryImage {
  id: string;
  /** 图片地址（站内路径如 /factory/xxx.jpg，或绝对 URL） */
  url: string;
  /** 替代文本（SEO / 可访问性必需） */
  alt: string;
  category: ImageCategory;
  /** 排序，越小越靠前 */
  sortOrder: number;
  /** 可选图注（展示在图片下方） */
  caption?: string;
}

/** 按分类聚合后的图片集合 */
export type ImageCategoryMap = Partial<Record<ImageCategory, FactoryImage[]>>;
