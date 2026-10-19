import { cn } from '@/lib/utils';
import { getI18n } from '@/i18n';
import { defaultLocale, type Locale } from '@/i18n/config';

/**
 * ProcessFlow —— 流程展示
 *
 * 用于工厂「生产流程」与质量「检验流程」。展示的是**体系框架**
 * （流程顺序），不声明任何真实生产参数、产能或检测数值。
 *
 * 响应式：手机纵向堆叠（向下箭头）→ 桌面横向排列（向右箭头）。
 */
export interface ProcessStep {
  title: string;
  description?: string;
}

export interface ProcessFlowProps {
  steps: ProcessStep[];
  /** 步骤编号前缀文案 */
  stepLabel?: string;
  className?: string;
  /** 当前语言（决定默认步骤编号前缀） */
  locale?: Locale;
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4">
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4">
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ProcessFlow({
  steps,
  stepLabel,
  className,
  locale = defaultLocale,
}: ProcessFlowProps) {
  const { t } = getI18n(locale);
  const label = stepLabel ?? t('factory.stepLabel');

  return (
    <ol className={cn('flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-0', className)}>
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="flex flex-1 flex-col items-stretch gap-3 lg:flex-row lg:items-center"
        >
          <div className="flex-1 rounded-lg border border-border bg-surface-elevated p-5">
            <span className="text-caption font-semibold tracking-wider text-primary uppercase">
              {label} {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="mt-2 text-heading-sm">{step.title}</h3>
            {step.description ? (
              <p className="mt-1.5 text-small text-text-secondary">{step.description}</p>
            ) : null}
          </div>

          {index < steps.length - 1 ? (
            <span aria-hidden="true" className="flex justify-center text-border-strong lg:px-3">
              <span className="lg:hidden">
                <ChevronDown />
              </span>
              <span className="hidden lg:block">
                <ChevronRight />
              </span>
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
