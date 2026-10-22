/**
 * CMS 缓存标签与失效策略（Phase 4.8）—— 前后端共享的缓存契约。
 *
 * 设计目标（对应任务书第五~十一节）：
 *   · 内容按性质分层，**不再使用单一的 300s 策略**；
 *   · 每个公开接口的响应都打上稳定 tag，后台内容变更时可**精准失效**，
 *     而不是整站清空；
 *   · tag 名称是前后端之间的**字符串契约**，后端（bailing-backend 的
 *     RevalidationService）与前台（各 repository）必须逐字一致。
 *
 * 失效粒度：
 *   列表 tag（products / blog / …）   —— 列表页与任何「全部」视图
 *   实体 tag（product:{slug} / …）    —— 单个详情页
 *   横切 tag（site / navigation）     —— 站点分区、导航（影响多页）
 */

/** 缓存时长分层（秒）。0 表示 no-store（不缓存）。 */
export const CmsRevalidate = {
  /**
   * 高稳定内容：公司介绍、工厂实力、质量体系、站点分区、导航。
   * 变化频率低，采用较长的 ISR 窗口降低后端压力。
   */
  STABLE: 3600,
  /**
   * 中频内容：产品、应用场景、博客。
   * 有一定更新频率，采用中等 ISR 窗口。
   */
  CONTENT: 300,
  /**
   * 实时 / 敏感内容：员工公开联系方式。
   * 涉及人员变动与隐私，**不做长期缓存**（每次请求取新）。
   */
  REALTIME: 0,
} as const;

export type CmsRevalidateValue = (typeof CmsRevalidate)[keyof typeof CmsRevalidate];

/** 内容实体类型（与后端 tag 前缀一一对应） */
export const CmsTags = {
/* 产品 */
products: 'products',
/** 实体 tag 以产品 id 为键（详情路由 /products/[slugId]，与后端契约逐字一致） */
product: (id: string) => `product:${id}`,
categories: 'categories',

  /* 博客 */
  blog: 'blog',
  blogPost: (slug: string) => `blog:${slug}`,
  blogCategories: 'blog-categories',

  /* 应用场景 */
  applications: 'applications',
  application: (slug: string) => `application:${slug}`,

  /* 单页内容 */
  factory: 'factory',
  quality: 'quality',

  /* 媒体库（按用途分类的图片聚合，后台媒体变更时失效） */
  media: 'media',

  /* 横切内容 */
  site: 'site',
  navigation: 'navigation',
  contacts: 'contacts',

  /* Phase 5.0：SEO 元数据 / 设置 / 重定向（影响全站 metadata） */
  seo: 'seo',
} as const;

/** 所有 tag 的联合类型（用于后端契约校验时的自检） */
export const ALL_STATIC_TAGS = [
  CmsTags.products,
  CmsTags.categories,
  CmsTags.blog,
  CmsTags.blogCategories,
  CmsTags.applications,
  CmsTags.factory,
  CmsTags.quality,
  CmsTags.media,
  CmsTags.site,
  CmsTags.navigation,
  CmsTags.contacts,
  CmsTags.seo,
] as const;
