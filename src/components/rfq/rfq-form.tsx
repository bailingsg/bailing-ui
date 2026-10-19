'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/file-upload';
import { RfqSubmitError, submitRfq, type RfqFieldName, type RfqProductRef } from '@/lib/rfq';
import { RfqSuccess } from './rfq-success';
import { getI18n } from '@/i18n';
import { defaultLocale, type Locale } from '@/i18n/config';
import {
  RFQ_ATTACHMENT_ACCEPT,
  RFQ_ATTACHMENT_MAX_MB,
  RFQ_MESSAGE_MAX_LENGTH,
  RFQ_MESSAGE_MIN_LENGTH,
  getRfqOptionalFields,
  getRfqRequiredFields,
} from './rfq-fields';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export interface RfqFormProps {
  /** 由 `/contact?product={slug}` 解析出的关联产品 */
  product?: RfqProductRef | null;
  /** 当前语言（仅影响文案，不影响提交字段） */
  locale?: Locale;
}

/**
 * RfqForm —— RFQ 询盘表单（真实提交）
 *
 * 提交链路：浏览器 → POST {NEXT_PUBLIC_API_BASE_URL}/rfq → 后端校验入库。
 * 前端校验仅用于即时反馈，最终以后端 class-validator 的裁决为准。
 *
 * 国际化边界（重要）：
 *   · 标签、占位符、校验提示、成功 / 失败反馈随语言变化；
 *   · **提交字段名与结构恒定不变**（name / company / email / country /
 *     message / phone / quantity / productId / productName），
 *     语言切换不会改变后端契约，也不会导致重复提交。
 */
export function RfqForm({ product = null, locale = defaultLocale }: RfqFormProps) {
  const { t, isDefaultLocale } = getI18n(locale);
  const requiredFields = React.useMemo(() => getRfqRequiredFields(t), [t]);
  const optionalFields = React.useMemo(() => getRfqOptionalFields(t), [t]);

  const formRef = React.useRef<HTMLFormElement>(null);
  const [status, setStatus] = React.useState<Status>('idle');
  const [fieldErrors, setFieldErrors] = React.useState<Partial<Record<RfqFieldName, string>>>({});
  const [reference, setReference] = React.useState<string>('');
  const [attachmentNote, setAttachmentNote] = React.useState<string>('');

  function resetForm() {
    formRef.current?.reset();
    setFieldErrors({});
    setReference('');
    setAttachmentNote('');
    setStatus('idle');
  }

  /** 提交前的基础校验（与后端 DTO 规则保持一致） */
  function validate(data: FormData): Partial<Record<RfqFieldName, string>> {
    const errors: Partial<Record<RfqFieldName, string>> = {};
    const read = (key: string) => String(data.get(key) ?? '').trim();

    for (const field of requiredFields) {
      if (!read(field.name)) {
        errors[field.name] = t('rfq.errorRequired', { field: field.label });
      }
    }

    const email = read('email');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = t('rfq.errorEmail');
    }

    const message = read('message');
    if (message && message.length < RFQ_MESSAGE_MIN_LENGTH) {
      errors.message = t('rfq.errorMessageMin', { min: RFQ_MESSAGE_MIN_LENGTH });
    }

    return errors;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'submitting') return;

    const form = event.currentTarget;
    const data = new FormData(form);

    const clientErrors = validate(data);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setStatus('error');
      return;
    }

    setFieldErrors({});
    setStatus('submitting');

    const productNameFromInput = String(data.get('productName') ?? '').trim();

    try {
      const receipt = await submitRfq({
        name: String(data.get('name') ?? '').trim(),
        company: String(data.get('company') ?? '').trim(),
        email: String(data.get('email') ?? '').trim(),
        country: String(data.get('country') ?? '').trim(),
        message: String(data.get('message') ?? '').trim(),
        phone: String(data.get('phone') ?? '').trim() || undefined,
        quantity: String(data.get('quantity') ?? '').trim() || undefined,
        // 关联产品优先取 URL 带入的产品；否则取手填的产品名
        productId: product?.id,
        productName: product?.name ?? (productNameFromInput || undefined),
        // 附件本阶段不实际上传（无对象存储），因此不提交 attachmentUrl
      });

      setReference(receipt.id);
      setStatus('success');
    } catch (error) {
      if (error instanceof RfqSubmitError) {
        // 后端错误文案为单语言（英文）。中文界面下改以本地化通用提示呈现，
        // 避免中文表单里突然冒出英文长句（字段定位仍然准确）。
        const serverErrors = error.fieldErrors ?? {};
        setFieldErrors(
          isDefaultLocale
            ? serverErrors
            : Object.fromEntries(
                Object.keys(serverErrors).map((key) => {
                  const meta = [...requiredFields, ...optionalFields].find(
                    (field) => field.name === key,
                  );
                  return [
                    key,
                    t('rfq.errorInvalidField', { field: meta?.label ?? key }),
                  ];
                }),
              ),
        );
      }
      setStatus('error');
    }
  }

  if (status === 'success') {
    return <RfqSuccess reference={reference} onReset={resetForm} locale={locale} />;
  }

  const submitting = status === 'submitting';

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col gap-5"
      noValidate
      aria-busy={submitting || undefined}
    >
      {/* 必填字段：手机单列 → 桌面双列 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {requiredFields.map((field) => (
          <div key={field.name} className="flex flex-col gap-2">
            <Label htmlFor={field.id} required={field.required}>
              {field.label}
            </Label>
            <Input
              id={field.id}
              name={field.name}
              type={field.name === 'email' ? 'email' : 'text'}
              autoComplete={field.autoComplete}
              placeholder={field.placeholder}
              aria-invalid={fieldErrors[field.name] ? true : undefined}
              required
            />
            {fieldErrors[field.name] ? (
              <p role="alert" className="text-caption text-destructive">
                {fieldErrors[field.name]}
              </p>
            ) : null}
          </div>
        ))}

        {/* 可选字段 */}
        {optionalFields.map((field) => (
          <div key={field.name} className="flex flex-col gap-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              name={field.name}
              type={field.name === 'phone' ? 'tel' : 'text'}
              autoComplete={field.autoComplete}
              placeholder={field.placeholder}
              aria-invalid={fieldErrors[field.name] ? true : undefined}
            />
            {fieldErrors[field.name] ? (
              <p role="alert" className="text-caption text-destructive">
                {fieldErrors[field.name]}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      {/* 关联产品：来自产品详情页 Request Quote，或由客户手填 */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="rfq-productName">{t('rfq.productOfInterest')}</Label>
        {product ? (
          <>
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-border-brand bg-surface-brand px-3 py-2.5">
              <span className="text-caption font-semibold tracking-wider text-primary uppercase">
                {t('rfq.interestedProduct')}
              </span>
              <span className="text-small text-foreground">{product.name}</span>
            </div>
            <input type="hidden" name="productId" value={product.id} />
            <input type="hidden" name="productName" value={product.name} />
          </>
        ) : (
          <Input
            id="rfq-productName"
            name="productName"
            placeholder={t('rfq.productPlaceholder')}
            aria-invalid={fieldErrors.productName ? true : undefined}
          />
        )}
      </div>

      {/* 需求描述 */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="rfq-message" required>
          {t('rfq.requirements')}
        </Label>
        <Textarea
          id="rfq-message"
          name="message"
          rows={5}
          required
          maxLength={RFQ_MESSAGE_MAX_LENGTH}
          placeholder={t('rfq.requirementsPlaceholder')}
          aria-invalid={fieldErrors.message ? true : undefined}
        />
        <p className="text-caption text-text-muted">
          {t('rfq.requirementsHint', {
            min: RFQ_MESSAGE_MIN_LENGTH,
            max: RFQ_MESSAGE_MAX_LENGTH,
          })}
        </p>
        {fieldErrors.message ? (
          <p role="alert" className="text-caption text-destructive">
            {fieldErrors.message}
          </p>
        ) : null}
      </div>

      {/* 附件（本阶段仅选择文件，不实际上传） */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="rfq-attachment">{t('rfq.attachment')}</Label>
        <FileUpload
          id="rfq-attachment"
          name="attachment"
          accept={RFQ_ATTACHMENT_ACCEPT}
          locale={locale}
          label={t('rfq.attachmentLabel')}
          hint={t('rfq.attachmentHint', { max: RFQ_ATTACHMENT_MAX_MB })}
          onFilesSelected={(files) => {
            const file = files[0];
            if (!file) {
              setAttachmentNote('');
              return;
            }
            if (file.size > RFQ_ATTACHMENT_MAX_MB * 1024 * 1024) {
              setAttachmentNote(t('rfq.attachmentTooLarge', { name: file.name, max: RFQ_ATTACHMENT_MAX_MB }));
              return;
            }
            setAttachmentNote(t('rfq.attachmentSelectedNote', { name: file.name }));
          }}
        />
        {attachmentNote ? (
          <p className="text-caption text-text-muted">{attachmentNote}</p>
        ) : null}
      </div>

      {/* 提交区 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-caption text-text-muted">{t('rfq.privacy')}</p>
        <Button type="submit" size="lg" loading={submitting}>
          {submitting ? t('rfq.submitting') : t('rfq.submit')}
        </Button>
      </div>

      {/* 失败反馈 */}
      {status === 'error' ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-small text-destructive"
        >
          {t('rfq.failure')}
        </p>
      ) : null}

      {/* 无障碍：提交成功文案（成功态由 RfqSuccess 呈现） */}
      <span className="sr-only">{t('rfq.successTitle')}</span>
    </form>
  );
}
