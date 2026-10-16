/**
 * 质量体系数据层出口
 *
 * 页面统一从 `@/lib/quality` 引入，不直接引用 repository 内部实现。
 */
export type { QualityRecord, QualityRecordType, QualityRecordFile } from './types';
export { getQualityCertificates, getQualityRecords } from './repository';
