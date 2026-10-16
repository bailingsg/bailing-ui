import { footerColumns, mainNav, primaryCta } from '@/config/site';
import { apiGet, isApiSource, isNotFound, qs } from '@/lib/cms-api';
import { CmsRevalidate, CmsTags } from '@/lib/cms-tags';
import type {
  NavLocation,
  PublicNavItem,
  SitePageKey,
  SiteSection,
} from './types';

/**
 * 站点内容 / 导航数据访问层（Phase 4.7）。
 *
 * 数据源由 NEXT_PUBLIC_CMS_SOURCE 控制：
 *   · demo（默认）—— 导航回退 config/site 的既有结构（mainNav / footerColumns），
 *     分区返回空数组（页面继续使用其既有演示版式）
 *   · api —— 调用后端 /api/v1/public/navigation 与 /api/v1/public/site/:page
 *
 * api 模式下后端不可用会如实抛错（不静默回退 demo），由 error 边界接管。
 */

export { isApiSource };

/** 导航项（demo 模式回退配置结构） */
export async function getNavItems(location: NavLocation): Promise<PublicNavItem[]> {
  if (!isApiSource()) {
    if (location === 'HEADER') {
      return mainNav.map((item, index) => ({
        id: `demo-header-${index}`,
        label: item.label,
        url: item.href,
        sortOrder: (index + 1) * 10,
        openInNewTab: false,
      }));
    }
    // 页脚：把三个栏目拍平为链接组（顺序即展示顺序）
    const flat = footerColumns.flatMap((column) => column.links);
    return flat.map((item, index) => ({
      id: `demo-footer-${index}`,
      label: item.label,
      url: item.href,
      sortOrder: (index + 1) * 10,
      openInNewTab: false,
    }));
  }

  const result = await apiGet<{ items: PublicNavItem[] }>(`/public/navigation${qs({ location })}`, {
    tags: [CmsTags.navigation],
    revalidate: CmsRevalidate.STABLE,
  });
  return result.items;
}

/** 页面已发布分区（demo 模式返回空数组，由页面回退既有版式） */
export async function getSiteSections(page: SitePageKey): Promise<SiteSection[]> {
  if (!isApiSource()) return [];

  const result = await apiGet<{ items: SiteSection[] }>(`/public/site/${page}`, {
    tags: [CmsTags.site],
    revalidate: CmsRevalidate.STABLE,
  });
  return result.items;
}

/** 按分区键取单个分区（不存在返回 null） */
export async function getSiteSection(
  page: SitePageKey,
  sectionKey: string,
): Promise<SiteSection | null> {
  if (!isApiSource()) return null;

  try {
    return await apiGet<SiteSection>(`/public/site/${page}/${sectionKey}`, {
      tags: [CmsTags.site],
      revalidate: CmsRevalidate.STABLE,
    });
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

/** 主 CTA（演示与 API 模式共用：站点级配置，不属于内容分区） */
export const sitePrimaryCta = primaryCta;

/** 页面 SEO 元数据（由 CMS 分区派生，缺失字段由页面回退到程序默认值） */
export interface CmsPageSeo {
  title?: string;
  description?: string;
  /** 分享图（分区媒体，可能为 null） */
  ogImage?: string | null;
  ogImageAlt?: string;
}

/** 描述长度上限：过长的正文不适合直接作为 meta description */
const SEO_DESCRIPTION_MAX = 300;

function clampDescription(value: string | null | undefined): string | undefined {
  const text = (value ?? '').trim().replace(/\s+/g, ' ');
  if (!text) return undefined;
  return text.length > SEO_DESCRIPTION_MAX ? `${text.slice(0, SEO_DESCRIPTION_MAX - 1)}…` : text;
}

/**
 * 从指定页面的分区派生页面级 SEO（Phase 4.8）。
 *
 * 用途：首页 / 关于我们 / 联系页的 metadata 需要**跟随 CMS 立即变化**
 * （任务书第十六~十八节）。这些页面没有独立的 SEO 字段，
 * 因此以「hero 分区」的 title / subtitle（其次 body）作为来源；
 * 分区不存在（demo 模式或未发布）时返回空对象，页面回退程序默认值。
 *
 * 不编造：只使用 CMS 中真实存在的文案。
 */
export async function getCmsPageSeo(
  page: SitePageKey,
  sectionKey: string,
): Promise<CmsPageSeo> {
  const sections = await getSiteSections(page);
  const section = sections.find((item) => item.sectionKey === sectionKey);
  if (!section) return {};

  const title = (section.title ?? '').trim() || undefined;
  const description =
    clampDescription(section.subtitle) ?? clampDescription(section.body) ?? undefined;

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ogImage: section.media?.url ?? null,
    ...(section.media?.altText ? { ogImageAlt: section.media.altText } : {}),
  };
}
