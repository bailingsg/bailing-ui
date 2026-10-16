import { apiGet, isApiSource } from '@/lib/cms-api';
import { CmsRevalidate, CmsTags } from '@/lib/cms-tags';
import type { PublicContact } from './types';

/**
 * 员工联系方式数据访问层（Phase 4.7）
 *
 * 数据源：
 *   · demo（默认）—— 返回空数组，页面回退站点级联系方式配置（config/site）
 *   · api —— bailing-backend /api/v1/public/contacts（仅公开展示中的员工）
 *
 * 缓存（Phase 4.8）：员工联系方式属**实时 / 敏感**内容（人员变动、隐私），
 * 采用 no-store —— 每次请求取新，不进入任何长期缓存；即使后台停用员工，
 * 前台也立即不再展示（同时后端强制 showOnSite + 账号启用双重条件）。
 *
 * 公开接口返回数组（非分页包裹）。
 */
export async function getPublicContacts(): Promise<PublicContact[]> {
  if (!isApiSource()) return [];

  const items = await apiGet<PublicContact[]>('/public/contacts', {
    tags: [CmsTags.contacts],
    revalidate: CmsRevalidate.REALTIME,
  });
  return [...items].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.displayName.localeCompare(b.displayName);
  });
}
