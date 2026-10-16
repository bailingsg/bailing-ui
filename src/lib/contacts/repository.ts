import { apiGet, isApiSource } from '@/lib/cms-api';
import type { PublicContact } from './types';

/**
 * 员工联系方式数据访问层（Phase 4.7）
 *
 * 数据源：
 *   · demo（默认）—— 返回空数组，页面回退站点级联系方式配置（config/site）
 *   · api —— bailing-backend /api/v1/public/contacts（仅公开展示中的员工）
 *
 * 公开接口返回数组（非分页包裹）。
 */
export async function getPublicContacts(): Promise<PublicContact[]> {
  if (!isApiSource()) return [];

  const items = await apiGet<PublicContact[]>('/public/contacts');
  return [...items].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.displayName.localeCompare(b.displayName);
  });
}
