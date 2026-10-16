/**
 * 应用场景（Applications）领域类型
 *
 * 应用页定位是 **SEO 流量入口**：描述"百灵的板材被用在什么地方"，
 * 属于行业知识 + 产品应用说明，因此**不含任何客户案例、项目金额或合作品牌**。
 *
 * 结构设计为"可路由"：每个应用都有唯一 slug，未来可直接启用
 * `/applications/[slug]` 详情路由而无需改动本文件。
 */

export interface Application {
  /** 路由标识（未来 /applications/{slug} 使用） */
  slug: string;
  /** 英文标题（面向海外采购商） */
  title: string;
  /** 中文标题（辅助展示） */
  titleZh?: string;
  /** 一句话概述（列表卡片 + meta description 素材） */
  description: string;
  /** 该场景的展开说明（详情页 / 卡片展开用） */
  overview: string;
  /** 典型材料与规格方向（通用技术说明，非客户数据） */
  highlights: string[];
  /** 封面图地址；无真实素材时为 null（渲染占位） */
  image: string | null;
  /** 封面图替代文本 */
  imageAlt: string;
  /**
   * 关联产品 slug（对应 /products/[slug]）。
   * 只登记 slug，具体产品信息由产品数据源解析，避免两处维护同一份数据。
   */
  relatedProducts: string[];

  /**
   * CMS SEO 覆盖（Phase 4.8）。
   * 未配置时详情页回退到「标题 + 概述」等程序默认值——绝不输出 undefined/null。
   */
  seo?: {
    title?: string;
    description?: string;
  };
}

/** 应用场景查询条件（为未来详情页 / 分页预留） */
export interface ApplicationQuery {
  /** 按 slug 精确查询 */
  slug?: string;
}
