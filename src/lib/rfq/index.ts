/**
 * RFQ 数据层出口。
 * 表单组件统一从 `@/lib/rfq` 引入，不直接依赖内部实现。
 */
export type { RfqFieldName, RfqProductRef, RfqReceipt, RfqSubmitPayload } from './types';
export { RfqSubmitError, submitRfq } from './submit';
