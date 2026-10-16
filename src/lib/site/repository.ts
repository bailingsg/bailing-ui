import { footerColumns, mainNav, primaryCta } from '@/config/site';
import { apiGet, isApiSource, isNotFound, qs } from '@/lib/cms-api';
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

  const result = await apiGet<{ items: PublicNavItem[] }>(`/public/navigation${qs({ location })}`);
  return result.items;
}

/** 页面已发布分区（demo 模式返回空数组，由页面回退既有版式） */
export async function getSiteSections(page: SitePageKey): Promise<SiteSection[]> {
  if (!isApiSource()) return [];

  const result = await apiGet<{ items: SiteSection[] }>(`/public/site/${page}`);
  return result.items;
}

/** 按分区键取单个分区（不存在返回 null） */
export async function getSiteSection(
  page: SitePageKey,
  sectionKey: string,
): Promise<SiteSection | null> {
  if (!isApiSource()) return null;

  try {
    return await apiGet<SiteSection>(`/public/site/${page}/${sectionKey}`);
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

/** 主 CTA（演示与 API 模式共用：站点级配置，不属于内容分区） */
export const sitePrimaryCta = primaryCta;
