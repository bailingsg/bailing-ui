import { cn } from '@/lib/utils';
import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { primaryCta } from '@/config/site';
import { LocaleLink } from '@/i18n/link';
import { getI18n } from '@/i18n';
import type { Locale } from '@/i18n/config';

/**
 * CtaBand —— 页面底部询价引导区
 *
 * 全站复用的转化收口：深色反色底 + 主/次按钮，指向 /contact#rfq。
 * 文案为通用引导语（非虚构业绩数据），业务文案可由调用方覆盖。
 */
export interface CtaBandProps {
  /** 当前语言 */
  locale: Locale;
  title?: string;
  description?: string;
  /** 主按钮文案（默认 Request Quote） */
  primaryLabel?: string;
  /** 次按钮：不传则不渲染 */
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
}

export function CtaBand({
  locale,
  title,
  description,
  primaryLabel,
  secondaryHref = '/products',
  secondaryLabel,
  className,
}: CtaBandProps) {
  const { t } = getI18n(locale);

  return (
    <Section tone="inverse" className={cn(className)}>
      <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex max-w-2xl flex-col gap-3">
          <h2 className="text-heading-lg text-surface-inverse-foreground">
            {title ?? t('common.ctaTitle')}
          </h2>
          <p className="text-body-lg text-neutral-300">{description ?? t('common.ctaDescription')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <LocaleLink locale={locale} href={primaryCta.href}>
              {primaryLabel ?? t('common.requestQuote')}
            </LocaleLink>
          </Button>
          {secondaryHref && secondaryLabel ? (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/25 bg-transparent text-surface-inverse-foreground hover:border-white/50 hover:bg-white/10 hover:text-surface-inverse-foreground"
            >
              <LocaleLink locale={locale} href={secondaryHref}>
                {secondaryLabel ?? t('common.viewProducts')}
              </LocaleLink>
            </Button>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
