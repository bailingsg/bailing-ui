/**
 * 资讯 / 知识库（Blog）领域类型
 *
 * 定位：**行业知识内容体系**，不是企业新闻。
 *   Industry Knowledge · Buying Guide · Wood Material Guide · Manufacturing Insights
 *
 * 内容边界：
 *   不编造企业新闻、客户案例、合作品牌、认证编号或业绩数字。
 *   允许的题材是行业知识、选材指南、生产工艺说明。
 *
 * 正文结构：使用**结构化区块**（BlogBlock）而不是 Markdown 字符串 ——
 *   无需引入 Markdown 解析依赖，渲染结果可控，且不会因内容中的特殊字符
 *   产生注入风险。未来接入 CMS 时把富文本转换为同样的区块数组即可。
 */

/**
 * 文章分类。
 *
 * 演示数据使用固定 slug 联合类型；接入 CMS（Phase 4.7）后分类由后端
 * /public/blog/categories 数据驱动，slug 不再限定为这四个值，
 * 因此对外统一以 string 承载（演示值天然兼容）。
 */
export type BlogCategory = 'buying-guide' | 'material-guide' | 'industry-insight' | 'manufacturing';

/** 分类标识（CMS 模式下为任意 slug 字符串） */
export type BlogCategorySlug = BlogCategory | (string & {});

export interface BlogCategoryInfo {
  slug: BlogCategorySlug;
  /** 英文分类名（展示 + 筛选链接） */
  name: string;
  /** 中文分类名（辅助展示） */
  nameZh: string;
}

/** 正文区块 */
export type BlogBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'note'; text: string };

/** 文章（列表项 = 去掉正文的文章） */
export interface BlogPost {
  slug: string;
  title: string;
  /** 摘要（列表卡片 + 详情页导语） */
  excerpt: string;
  /** 正文区块（演示数据） */
  content: BlogBlock[];
  /**
   * 正文 HTML（CMS 模式，Phase 4.7）。
   * 后端写入时已经 rich-text.sanitizer 白名单净化（无 script/事件属性/危险协议），
   * 公开站据此直接渲染；与 content 二选一（演示数据用 blocks，CMS 用 HTML）。
   */
  contentHtml?: string;
  /** 封面图地址；无真实素材时为 null（渲染占位） */
  coverImage: string | null;
  /** 封面图替代文本 */
  coverImageAlt: string;
  /** 分类 slug（演示为四个固定值；CMS 模式由后端数据驱动） */
  category: BlogCategorySlug;
  /** 发布日期（ISO 8601） */
  publishedAt: string;
  /** 最后更新日期（ISO 8601，可选） */
  updatedAt?: string;
  /** 预计阅读时长（分钟） */
  readingMinutes: number;
  /** 标签（SEO 与站内关联用） */
  tags: string[];
  /**
   * 关联产品 slug（对应 /products/[slug]）。
   * 解析失败时页面自动跳过，不产生死链。
   */
  relatedProducts: string[];
  seo: {
    title: string;
    description: string;
  };
}

/** 列表项（不含正文，减少列表页传输与内存占用） */
export type BlogPostSummary = Omit<BlogPost, 'content' | 'contentHtml'>;

export interface BlogQuery {
  page?: number;
  pageSize?: number;
  /** 按分类筛选（对应 ?category=，CMS 模式为任意 slug） */
  category?: BlogCategorySlug;
}

export interface PaginatedBlogPosts {
  items: BlogPostSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
