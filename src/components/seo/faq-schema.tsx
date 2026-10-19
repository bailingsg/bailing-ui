import { absoluteUrl } from '@/lib/seo';
import { defaultLocale, localeMeta, type Locale } from '@/i18n/config';

/**
 * FaqPageSchema —— Schema.org FAQPage 结构化数据（JSON-LD，Phase 5.0）
 *
 * 仅当页面**真实存在** FAQ 内容时输出（当前用于联系页 FAQ）。
 * 问题 / 答案必须与页面可见内容一致；不编造问答（任务书四十六节红线）。
 *
 * 多语言：`path` 需传入已本地化的路径，`inLanguage` 取当前语言，
 * 使中英文页面的 FAQ 结构化数据各自指向自己的规范 URL。
 */
export interface FaqItem {
  question: string;
  answer: string;
}

export function FaqPageSchema({
  items,
  path,
  locale = defaultLocale,
}: {
  items: FaqItem[];
  path: string;
  locale?: Locale;
}) {
  if (items.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${absoluteUrl(path)}#faq`,
    inLanguage: localeMeta[locale].htmlLang,
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
      }}
    />
  );
}
