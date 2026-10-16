'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/file-upload';
import { RfqSubmitError, submitRfq, type RfqFieldName, type RfqProductRef } from '@/lib/rfq';
import { RfqSuccess } from './rfq-success';
import {
  RFQ_ATTACHMENT_ACCEPT,
  RFQ_ATTACHMENT_MAX_MB,
  RFQ_MESSAGE_MAX_LENGTH,
  RFQ_MESSAGE_MIN_LENGTH,
  RFQ_OPTIONAL_FIELDS,
  RFQ_REQUIRED_FIELDS,
} from './rfq-fields';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export interface RfqFormProps {
  /** 由 `/contact?product={slug}` 解析出的关联产品 */
  product?: RfqProductRef | null;
}

/** 成功/失败文案（按需求固定） */
const SUCCESS_TEXT = 'Thank you for your inquiry. Our team will contact you soon.';
const FAILURE_TEXT = 'Submission failed. Please try again.';

/**
 * RfqForm —— RFQ 询盘表单（真实提交）
 *
 * 提交链路：浏览器 → POST {NEXT_PUBLIC_API_BASE_URL}/rfq → 后端校验入库。
 * 前端校验仅用于即时反馈，最终以后端 class-validator 的裁决为准。
 */
export function RfqForm({ product = null }: RfqFormProps) {
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

    for (const field of RFQ_REQUIRED_FIELDS) {
      if (!read(field.name)) errors[field.name] = `${field.label} is required.`;
    }

    const email = read('email');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    const message = read('message');
    if (message && message.length < RFQ_MESSAGE_MIN_LENGTH) {
      errors.message = `Please provide at least ${RFQ_MESSAGE_MIN_LENGTH} characters.`;
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
        setFieldErrors(error.fieldErrors);
      }
      setStatus('error');
    }
  }

  if (status === 'success') {
    return <RfqSuccess reference={reference} onReset={resetForm} />;
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
        {RFQ_REQUIRED_FIELDS.map((field) => (
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
        {RFQ_OPTIONAL_FIELDS.map((field) => (
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
        <Label htmlFor="rfq-productName">Product of interest</Label>
        {product ? (
          <>
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-border-brand bg-surface-brand px-3 py-2.5">
              <span className="text-caption font-semibold tracking-wider text-primary uppercase">
                Interested Product
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
            placeholder="Product name or model (optional)"
            aria-invalid={fieldErrors.productName ? true : undefined}
          />
        )}
      </div>

      {/* 需求描述 */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="rfq-message" required>
          Requirements
        </Label>
        <Textarea
          id="rfq-message"
          name="message"
          rows={5}
          required
          maxLength={RFQ_MESSAGE_MAX_LENGTH}
          placeholder="Specification, size, material, surface finish, target port and any other details."
          aria-invalid={fieldErrors.message ? true : undefined}
        />
        <p className="text-caption text-text-muted">
          Minimum {RFQ_MESSAGE_MIN_LENGTH} characters, up to {RFQ_MESSAGE_MAX_LENGTH}.
        </p>
        {fieldErrors.message ? (
          <p role="alert" className="text-caption text-destructive">
            {fieldErrors.message}
          </p>
        ) : null}
      </div>

      {/* 附件（本阶段仅选择文件，不实际上传） */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="rfq-attachment">Attachment (optional)</Label>
        <FileUpload
          id="rfq-attachment"
          name="attachment"
          accept={RFQ_ATTACHMENT_ACCEPT}
          label="Upload drawing or specification"
          hint={`Supported: PDF / JPG / PNG / DWG, up to ${RFQ_ATTACHMENT_MAX_MB}MB per file`}
          onFilesSelected={(files) => {
            const file = files[0];
            if (!file) {
              setAttachmentNote('');
              return;
            }
            if (file.size > RFQ_ATTACHMENT_MAX_MB * 1024 * 1024) {
              setAttachmentNote(`"${file.name}" exceeds ${RFQ_ATTACHMENT_MAX_MB}MB and will not be sent.`);
              return;
            }
            setAttachmentNote(
              `"${file.name}" selected — online file upload is not enabled yet, so please also describe it in your requirements.`,
            );
          }}
        />
        {attachmentNote ? (
          <p className="text-caption text-text-muted">{attachmentNote}</p>
        ) : null}
      </div>

      {/* 提交区 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-caption text-text-muted">
          We only use your details to respond to this enquiry.
        </p>
        <Button type="submit" size="lg" loading={submitting}>
          {submitting ? 'Submitting…' : 'Submit Request'}
        </Button>
      </div>

      {/* 失败反馈 */}
      {status === 'error' ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-small text-destructive"
        >
          {FAILURE_TEXT}
        </p>
      ) : null}

      {/* 无障碍：提交成功文案（成功态由 RfqSuccess 呈现） */}
      <span className="sr-only">{SUCCESS_TEXT}</span>
    </form>
  );
}
