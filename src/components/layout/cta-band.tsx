import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { primaryCta } from '@/config/site';

/**
 * CtaBand —— 页面底部询价引导区
 *
 * 全站复用的转化收口：深色反色底 + 主/次按钮，指向 /contact#rfq。
 * 文案为通用引导语（非虚构业绩数据），业务文案可由调用方覆盖。
 */
export interface CtaBandProps {
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
  title = 'Ready to source wooden products?',
  description = 'Send us your specification or drawing — our team will review it and respond with a quotation.',
  primaryLabel = primaryCta.label,
  secondaryHref = '/products',
  secondaryLabel = 'View Products',
  className,
}: CtaBandProps) {
  return (
    <Section tone="inverse" className={cn(className)}>
      <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex max-w-2xl flex-col gap-3">
          <h2 className="text-heading-lg text-surface-inverse-foreground">{title}</h2>
          <p className="text-body-lg text-neutral-300">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link href={primaryCta.href}>{primaryLabel}</Link>
          </Button>
          {secondaryHref && secondaryLabel ? (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/25 bg-transparent text-surface-inverse-foreground hover:border-white/50 hover:bg-white/10 hover:text-surface-inverse-foreground"
            >
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
