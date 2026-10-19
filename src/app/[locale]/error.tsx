'use client';

import * as React from 'react';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/link';
import { useLocale } from '@/i18n/client';
import { getI18n } from '@/i18n';

/**
 * error.tsx —— 全局错误边界
 *
 * 捕获渲染期错误，提供重试与返回首页入口；不向访客暴露错误细节，
 * 仅在开发环境输出到控制台便于排查。
 *
 * 多语言：错误边界不接收 `params`，语言从 `useParams()` 取得
 * （与页面同源，不读 localStorage，不会产生 hydration mismatch）。
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();
  const { t, m } = getI18n(locale);

  React.useEffect(() => {
    // 生产环境可在此接入错误上报服务
    console.error(error);
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <span className="text-caption font-semibold tracking-wider text-primary uppercase">
        {m.error.eyebrow}
      </span>
      <h1 className="text-heading-lg">{m.error.title}</h1>
      <p className="max-w-md text-body text-text-secondary">{m.error.description}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button type="button" onClick={reset}>
          {t('common.tryAgain')}
        </Button>
        <Button asChild variant="outline">
          <LocaleLink locale={locale} href="/">
            {t('common.backToHome')}
          </LocaleLink>
        </Button>
      </div>
    </Container>
  );
}
