import { Button } from '@/components/ui/button';
import { getI18n } from '@/i18n';
import { defaultLocale, type Locale } from '@/i18n/config';

/**
 * RfqSuccess —— 询盘提交成功的轻量内联提示
 *
 * 设计：按用户要求"去掉弹窗，只保留发送成功的提示"，
 * 由表单组件内联在提交按钮上方展示，不再替换整个表单。
 *
 * 文案随界面语言切换（英文 / 中文）。
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
      className="flex flex-col items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-center"
    >
      <p className="text-body font-medium text-primary">
        {t('rfq.successTitle')} {t('rfq.successText')}
      </p>
      {reference ? (
        <p className="text-caption text-text-secondary">
          {t('rfq.successReference', { reference })}
        </p>
      ) : null}
      {onReset ? (
        <Button type="button" variant="outline" size="sm" onClick={onReset} className="mt-1">
          {t('rfq.sendAnother')}
        </Button>
      ) : null}
    </div>
  );
}