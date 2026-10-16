import type { RfqFieldName } from '@/lib/rfq';

/**
 * RFQ 表单的字段元数据与限制。
 *
 * 与后端 `CreateRfqDto` 的校验规则保持一致（长度/必填），
 * 前端做即时反馈，后端做最终裁决（前端校验不替代服务端校验）。
 */

/** 文本域最大长度（与后端 @MaxLength(5000) 一致） */
export const RFQ_MESSAGE_MAX_LENGTH = 5000;

/** 文本域最小长度（与后端 @MinLength(10) 一致） */
export const RFQ_MESSAGE_MIN_LENGTH = 10;

/** 允许的附件类型（本阶段仅登记文件名，不做实际上传） */
export const RFQ_ATTACHMENT_ACCEPT = '.pdf,.jpg,.jpeg,.png,.dwg';

/** 单个附件大小上限（MB） */
export const RFQ_ATTACHMENT_MAX_MB = 20;

export interface RfqFieldMeta {
  name: RfqFieldName;
  /** 控件 id（label 的 htmlFor 使用） */
  id: string;
  label: string;
  required: boolean;
  /** 占位提示 */
  placeholder?: string;
  /** 浏览器自动填充提示 */
  autoComplete?: string;
}

/** 表单控件 id 统一前缀，避免与页面其它元素冲突 */
export const RFQ_FIELD_PREFIX = 'rfq';

export function rfqFieldId(name: RfqFieldName): string {
  return `${RFQ_FIELD_PREFIX}-${name}`;
}

/** 必填字段（对应后端 DTO 的必填项） */
export const RFQ_REQUIRED_FIELDS: RfqFieldMeta[] = [
  {
    name: 'name',
    id: rfqFieldId('name'),
    label: 'Name',
    required: true,
    placeholder: 'Your name',
    autoComplete: 'name',
  },
  {
    name: 'company',
    id: rfqFieldId('company'),
    label: 'Company',
    required: true,
    placeholder: 'Company name',
    autoComplete: 'organization',
  },
  {
    name: 'email',
    id: rfqFieldId('email'),
    label: 'Email',
    required: true,
    placeholder: 'you@company.com',
    autoComplete: 'email',
  },
  {
    name: 'country',
    id: rfqFieldId('country'),
    label: 'Country / Region',
    required: true,
    placeholder: 'Country or region',
    autoComplete: 'country-name',
  },
];

/** 可选字段 */
export const RFQ_OPTIONAL_FIELDS: RfqFieldMeta[] = [
  {
    name: 'phone',
    id: rfqFieldId('phone'),
    label: 'Phone',
    required: false,
    placeholder: 'Phone / WhatsApp',
    autoComplete: 'tel',
  },
  {
    name: 'quantity',
    id: rfqFieldId('quantity'),
    label: 'Estimated quantity',
    required: false,
    placeholder: 'e.g. 1 x 20GP',
  },
];
