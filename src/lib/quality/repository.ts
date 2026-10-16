import { apiGet, isApiSource } from '@/lib/cms-api';
import { CmsRevalidate, CmsTags } from '@/lib/cms-tags';
import type { QualityRecord } from './types';

/**
 * 质量体系数据访问层（Repository，Phase 4.7）
 *
 * 数据源：
 *   · demo（默认）—— 无登记数据（返回空数组），页面展示"待补充"框架
 *   · api —— bailing-backend 公开只读接口 /api/v1/public/quality（仅 PUBLISHED）
 *
 * 该接口**只有列表**：质量记录的类型归属由后台决定，内部类记录不进入公开列表；
 * 前台不推断、不补全任何证书信息。
 */

/** 已发布质量记录（按发布时间倒序，新的在前） */
export async function getQualityRecords(): Promise<QualityRecord[]> {
  if (!isApiSource()) return [];

  const result = await apiGet<{ items: QualityRecord[]; total: number }>('/public/quality', {
    tags: [CmsTags.quality],
    revalidate: CmsRevalidate.STABLE,
  });
  return [...result.items].sort((a, b) => {
    const diff = Date.parse(b.publishedAt ?? '') - Date.parse(a.publishedAt ?? '');
    if (diff !== 0) return diff;
    return a.title.localeCompare(b.title);
  });
}

/** 仅证书 / 报告类记录（页面"认证与报告"区使用） */
export async function getQualityCertificates(): Promise<QualityRecord[]> {
  const records = await getQualityRecords();
  return records.filter(
    (record) => record.recordType === 'CERTIFICATION' || record.recordType === 'TEST_REPORT',
  );
}
