/**
 * 关于我们（About）领域类型
 *
 * 本模块只描述「企业形象素材」——公司环境、团队、工厂、展会、办公场景。
 * 与产品图片（ProductImage）、工厂页素材（FactoryImage）分离，避免页面之间
 * 互相耦合。
 *
 * 说明：
 *   · 图片只登记 URL 与元数据，不绑定任何存储服务（未来可指向 COS/CDN）；
 *   · 分类（category）由数据驱动，组件不写死任何具体图片；
 *   · 未提供素材的分类一律返回空数组，由组件渲染统一占位 ——
 *     **绝不使用 AI 生成图、图库素材或任何虚假图片**。
 */

/** 关于我们页图片分类 */
export type AboutImageCategory =
  | 'company' // 公司 / 厂区环境
  | 'team' // 团队 / 员工
  | 'factory' // 生产车间
  | 'exhibition' // 展会现场
  | 'office'; // 办公场景

export interface AboutImage {
  id: string;
  /** 图片地址（站内路径如 /about/xxx.webp，或绝对 URL） */
  url: string;
  /** 替代文本（SEO / 可访问性必需，需真实描述画面内容） */
  alt: string;
  category: AboutImageCategory;
  /** 排序，越小越靠前 */
  sortOrder: number;
  /** 可选图注（展示在图片下方） */
  caption?: string;
}

/** 按分类聚合后的图片集合 */
export type AboutImageCategoryMap = Partial<Record<AboutImageCategory, AboutImage[]>>;
