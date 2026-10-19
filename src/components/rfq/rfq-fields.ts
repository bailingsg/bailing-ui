import type { Translator } from '@/i18n/translate';
import type { RfqFieldName } from '@/lib/rfq';

/**
 * RFQ 表单的字段元数据与限制。
 *
 * 与后端 `CreateRfqDto` 的校验规则保持一致（长度/必填），
 * 前端做即时反馈，后端做最终裁决（前端校验不替代服务端校验）。
 *
 * 语言说明：**只有 label / placeholder 随界面语言变化**，
 * `name` / `id` / `autoComplete` 恒定不变 —— 提交给后端的数据结构、
 * 字段名称与 API 契约不因语言切换而改变。
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

/** 必填字段（对应后端 DTO 的必填项；字段名固定，文案随语言） */
export function getRfqRequiredFields(t: Translator): RfqFieldMeta[] {
  return [
    {
      name: 'name',
      id: rfqFieldId('name'),
      label: t('rfq.name'),
      required: true,
      placeholder: t('rfq.namePlaceholder'),
      autoComplete: 'name',
    },
    {
      name: 'company',
      id: rfqFieldId('company'),
      label: t('rfq.company'),
      required: true,
      placeholder: t('rfq.companyPlaceholder'),
      autoComplete: 'organization',
    },
    {
      name: 'email',
      id: rfqFieldId('email'),
      label: t('rfq.email'),
      required: true,
      placeholder: t('rfq.emailPlaceholder'),
      autoComplete: 'email',
    },
    {
      name: 'country',
      id: rfqFieldId('country'),
      label: t('rfq.country'),
      required: true,
      placeholder: t('rfq.countryPlaceholder'),
      autoComplete: 'country-name',
    },
  ];
}

/** 可选字段 */
export function getRfqOptionalFields(t: Translator): RfqFieldMeta[] {
  return [
    {
      name: 'phone',
      id: rfqFieldId('phone'),
      label: t('rfq.phone'),
      required: false,
      placeholder: t('rfq.phonePlaceholder'),
      autoComplete: 'tel',
    },
    {
      name: 'quantity',
      id: rfqFieldId('quantity'),
      label: t('rfq.quantity'),
      required: false,
      placeholder: t('rfq.quantityPlaceholder'),
    },
  ];
}
