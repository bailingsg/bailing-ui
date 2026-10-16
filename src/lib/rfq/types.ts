/**
 * RFQ（Request For Quotation）前端类型。
 *
 * 与后端 `bailing-backend/src/modules/rfq/dto/create-rfq.dto.ts` 的字段一一对应，
 * 后端以 class-validator 强校验（whitelist + forbidNonWhitelisted），
 * 因此**不要**在 payload 中夹带任何未声明字段，否则会被 400 拒绝。
 */

/** 提交给 POST /api/v1/rfq 的请求体 */
export interface RfqSubmitPayload {
  name: string;
  company: string;
  email: string;
  phone?: string;
  country: string;
  productId?: string;
  productName?: string;
  message: string;
  quantity?: string;
  attachmentUrl?: string;
}

/** 创建成功后的最小回执（后端不回声客户隐私字段） */
export interface RfqReceipt {
  id: string;
  status: string;
  createdAt: string;
}

/** 关联产品（来自产品详情页 Request Quote 的 ?product=slug） */
export interface RfqProductRef {
  id: string;
  name: string;
  slug: string;
}

/** 可提交的字段名（用于把后端 400 的错误明细映射到具体控件） */
export type RfqFieldName = keyof RfqSubmitPayload;
