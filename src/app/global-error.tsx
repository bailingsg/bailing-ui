'use client';

import * as React from 'react';
import Link from 'next/link';

/**
 * global-error.tsx —— 根级错误边界（Phase 4.8）
 *
 * 与 error.tsx 的区别：本文件捕获**根布局自身**抛出的错误
 * （此时 root layout 已被替换），因此必须自行输出 <html> / <body>。
 *
 * 安全约束（任务书第三十三节）：绝不向访客暴露 Prisma 错误、SQL、
 * 堆栈、内部 URL 或任何密钥。生产环境只展示统一友好文案；
 * 仅开发环境把错误打到控制台，便于本地排查。
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // 生产环境可在此接入错误上报服务（仅上报 digest，不上报完整堆栈）
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          background: '#faf8f5',
          color: '#2b2118',
          padding: '24px',
        }}
      >
        <main style={{ maxWidth: '32rem', textAlign: 'center' }}>
          <p
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#8a6a4f',
              margin: '0 0 12px',
            }}
          >
            Error
          </p>
          <h1 style={{ fontSize: '1.5rem', margin: '0 0 12px' }}>Something went wrong</h1>
          <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#5c4b3c', margin: '0 0 24px' }}>
            The page could not be displayed. Please try again, or return to the home page.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={reset}
              style={{
                cursor: 'pointer',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 18px',
                background: '#8a5a2b',
                color: '#fff',
                fontSize: '0.9rem',
              }}
            >
              Try again
            </button>
            <Link
              href="/"
              style={{
                borderRadius: '6px',
                padding: '10px 18px',
                border: '1px solid #d8cbbd',
                color: '#2b2118',
                fontSize: '0.9rem',
                textDecoration: 'none',
              }}
            >
              Back to Home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
