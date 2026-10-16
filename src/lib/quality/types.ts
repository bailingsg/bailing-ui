/**
 * 质量体系（Quality）领域类型（Phase 4.7）
 *
 * 与后端公开接口 /api/v1/public/quality 对齐（public.entity.ts PublicQualityRecord）。
 *
 * 数据诚实约束：
 *   · 仅已发布记录进入前台（后端强制，前端不再二次过滤）
 *   · issuer / certificateNumber / issueDate / expiryDate 均为可空——
 *     后台未填写即不出示，**前台不做任何推断或补全**
 *   · isExpired 仅在后端依据真实 expiryDate 判定后给出；缺失到期日时为 null
 */

/** 质量记录类型（与后端 QualityRecordType 对齐，字符串承载便于向后兼容） */
export type QualityRecordType = 'CERTIFICATION' | 'TEST_REPORT' | 'QUALITY_CONTROL' | 'STANDARD';

/** 公开媒体引用（证书 PDF 等） */
export interface QualityRecordFile {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
  mimeType: string;
  isDocument: boolean;
}

export interface QualityRecord {
  title: string;
  slug: string;
  recordType: string;
  /** 认证机构 / 发证方（未填写为 null） */
  issuer: string | null;
  /** 证书编号（未填写为 null） */
  certificateNumber: string | null;
  /** 签发日期 ISO（未填写为 null） */
  issueDate: string | null;
  /** 到期日期 ISO（未填写为 null） */
  expiryDate: string | null;
  description: string | null;
  /** 是否已过期；无真实到期日时为 null（不过期推断） */
  isExpired: boolean | null;
  /** 证书 / 报告文件（PDF 等，无文件为 null） */
  file: QualityRecordFile | null;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}
