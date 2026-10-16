import { absoluteUrl } from '@/lib/seo';

/**
 * FaqPageSchema —— Schema.org FAQPage 结构化数据（JSON-LD，Phase 5.0）
 *
 * 仅当页面**真实存在** FAQ 内容时输出（当前用于联系页 FAQ）。
 * 问题 / 答案必须与页面可见内容一致；不编造问答（任务书四十六节红线）。
 */
export interface FaqItem {
  question: string;
  answer: string;
}

export function FaqPageSchema({ items, path }: { items: FaqItem[]; path: string }) {
  if (items.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${absoluteUrl(path)}#faq`,
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
