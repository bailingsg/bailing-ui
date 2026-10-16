import { Button } from '@/components/ui/button';

/**
 * RfqSuccess —— 询盘提交成功状态
 *
 * 文案按需求固定为：
 *   "Thank you for your inquiry. Our team will contact you soon."
 */
export interface RfqSuccessProps {
  /** 询盘编号（后端返回的 id），便于客户后续邮件引用 */
  reference?: string;
  /** 再次提交（重置表单） */
  onReset?: () => void;
}

export function RfqSuccess({ reference, onReset }: RfqSuccessProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-start gap-4 rounded-lg border border-border-brand bg-surface-brand px-6 py-8"
    >
      <span
        aria-hidden="true"
        className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground"
      >
        <svg viewBox="0 0 24 24" fill="none" className="size-5">
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <div className="flex flex-col gap-1">
        <h3 className="text-heading-sm">Thank you for your inquiry.</h3>
        <p className="text-body text-text-secondary">Our team will contact you soon.</p>
      </div>

      {reference ? (
        <p className="text-caption text-text-muted">
          Reference: <span className="font-medium text-text-secondary">{reference}</span>
        </p>
      ) : null}

      {onReset ? (
        <Button type="button" variant="outline" onClick={onReset}>
          Send another enquiry
        </Button>
      ) : null}
    </div>
  );
}
