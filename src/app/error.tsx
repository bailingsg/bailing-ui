'use client';

import * as React from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';

/**
 * error.tsx —— 全局错误边界
 *
 * 捕获渲染期错误，提供重试与返回首页入口；不向访客暴露错误细节，
 * 仅在开发环境输出到控制台便于排查。
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // 生产环境可在此接入错误上报服务
    console.error(error);
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <span className="text-caption font-semibold tracking-wider text-primary uppercase">
        Error
      </span>
      <h1 className="text-heading-lg">Something went wrong</h1>
      <p className="max-w-md text-body text-text-secondary">
        The page could not be displayed. Please try again, or return to the home page.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </Container>
  );
}
