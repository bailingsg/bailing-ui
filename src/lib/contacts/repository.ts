import { apiGet, isApiSource, qs } from '@/lib/cms-api';
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
export interface GetPublicContactsOptions {
  /**
   * 只取「可接单」的人（2026-10-27 追加）。
   *
   * 后端判定与询盘轮转准入逐条一致：账号启用 && 勾选「询盘联系人」（isLeadContact），
   * 并叠加「公开展示」开关 —— 可接单但没勾公开展示的员工，前台不得露出。
   *
   * 关于页「订单背后的人」用这个开关；联系页仍取全量公开展示员工。
   */
  leadOnly?: boolean;
}

export async function getPublicContacts(
  options: GetPublicContactsOptions = {},
): Promise<PublicContact[]> {
  if (!isApiSource()) return [];

  const query = options.leadOnly ? qs({ leadOnly: true }) : '';
  const items = await apiGet<PublicContact[]>(`/public/contacts${query}`, {
    tags: [CmsTags.contacts],
    revalidate: CmsRevalidate.REALTIME,
  });
  return [...items].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.displayName.localeCompare(b.displayName);
  });
}

/**
 * 「订单背后的人」——可接单人员的公开档案（头像 / 姓名 / 职位）。
 * 与联系页共用同一份公开契约，因此后台改头像后两边同时生效。
 */
export async function getPublicTeam(): Promise<PublicContact[]> {
  return getPublicContacts({ leadOnly: true });
}
