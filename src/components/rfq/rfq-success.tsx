import { Button } from '@/components/ui/button';
import { getI18n } from '@/i18n';
import { defaultLocale, type Locale } from '@/i18n/config';

/**
 * RfqSuccess —— 询盘提交成功状态
 *
 * 文案随界面语言切换（英文 / 中文），语义与需求一致：
 *   "Thank you for your inquiry. Our team will contact you soon."
 */
export interface RfqSuccessProps {
  /** 询盘编号（后端返回的 id），便于客户后续邮件引用 */
  reference?: string;
  /** 再次提交（重置表单） */
  onReset?: () => void;
  /** 当前语言 */
  locale?: Locale;
}

export function RfqSuccess({ reference, onReset, locale = defaultLocale }: RfqSuccessProps) {
  const { t } = getI18n(locale);

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
        <h3 className="text-heading-sm">{t('rfq.successTitle')}</h3>
        <p className="text-body text-text-secondary">{t('rfq.successText')}</p>
      </div>

      {reference ? (
        <p className="text-caption text-text-muted">
          {t('rfq.successReference', { reference })}
        </p>
      ) : null}

      {onReset ? (
        <Button type="button" variant="outline" onClick={onReset}>
          {t('rfq.sendAnother')}
        </Button>
      ) : null}
    </div>
  );
}
