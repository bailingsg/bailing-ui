'use client';

import * as React from 'react';
import { defaultLocale, localeMeta, type Locale } from '@/i18n/config';
import { getI18n } from '@/i18n';
import { detectLocaleFromPath, localizedPath } from '@/i18n/paths';

/**
 * global-error.tsx —— 根级错误边界（Phase 4.8）
 *
 * 与 error.tsx 的区别：本文件捕获**根布局自身**抛出的错误
 * （此时 root layout 已被替换），因此必须自行输出 <html> / <body>，
 * 且**不能**依赖任何需要 layout 上下文的组件（Container / Button / next/link）。
 *
 * 安全约束（任务书第三十三节）：绝不向访客暴露 Prisma 错误、SQL、
 * 堆栈、内部 URL 或任何密钥。生产环境只展示统一友好文案；
 * 仅开发环境把错误打到控制台，便于本地排查。
 *
 * 多语言：根级错误边界拿不到路由参数，因此从 `window.location.pathname`
 * 判断语言。首帧统一用默认语言（英文）以保证 SSR / 客户端一致，
 * 挂载后再切到实际语言并同步 `<html lang>` —— 不会产生 hydration mismatch。
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [locale, setLocale] = React.useState<Locale>(defaultLocale);

  React.useEffect(() => {
    // 生产环境可在此接入错误上报服务（仅上报 digest，不上报完整堆栈）
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
  }, [error]);

  React.useEffect(() => {
    const detected = detectLocaleFromPath(window.location.pathname) ?? defaultLocale;
    setLocale(detected);
    document.documentElement.lang = localeMeta[detected].htmlLang;
  }, []);

  const { t, m } = getI18n(locale);

  return (
    <html lang={localeMeta[locale].htmlLang}>
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", sans-serif',
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
            {m.error.eyebrow}
          </p>
          <h1 style={{ fontSize: '1.5rem', margin: '0 0 12px' }}>{m.error.title}</h1>
          <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#5c4b3c', margin: '0 0 24px' }}>
            {m.error.description}
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
              {t('common.tryAgain')}
            </button>
            {/* 根级错误边界已脱离路由上下文，使用原生 a 标签以避免依赖 next/link */}
            <a
              href={localizedPath('/', locale)}
              style={{
                borderRadius: '6px',
                padding: '10px 18px',
                border: '1px solid #d8cbbd',
                color: '#2b2118',
                fontSize: '0.9rem',
                textDecoration: 'none',
              }}
            >
              {t('common.backToHome')}
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
