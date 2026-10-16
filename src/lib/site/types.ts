/**
 * 站点结构化内容与导航领域类型（Phase 4.7）。
 *
 * 首页 / 关于我们 / 联系页的分区是**定式结构化字段**（眉题 / 标题 / 副标题 /
 * 正文 / 媒体 / CTA / 卡片 / 统计项），不是页面构建器——本类型即契约。
 */

export type SitePageKey = 'HOME' | 'ABOUT' | 'CONTACT';
export type NavLocation = 'HEADER' | 'FOOTER';

/** 站内导航项（公开契约） */
export interface PublicNavItem {
  id: string;
  label: string;
  /** 站内相对路径或 https 外链（后端写入时已做安全校验） */
  url: string;
  sortOrder: number;
  openInNewTab: boolean;
}

/** 结构化卡片项 */
export interface SiteSectionItem {
  title: string;
  description: string | null;
  href: string | null;
}

/** 结构化统计项 */
export interface SiteSectionStat {
  label: string;
  value: string;
}

/** 分区媒体引用（白名单：无 storageKey 等内部字段） */
export interface SiteSectionMedia {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}

/** 站点内容分区（公开契约，与后端 public-site.entity.ts 对齐） */
export interface SiteSection {
  sectionKey: string;
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  media: SiteSectionMedia | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  items: SiteSectionItem[];
  stats: SiteSectionStat[];
  publishedAt: string | null;
}
