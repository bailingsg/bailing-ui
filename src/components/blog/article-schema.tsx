import { siteConfig, siteUrl } from '@/config/site';
import { absoluteUrl } from '@/lib/seo';
import type { BlogPost } from '@/lib/blog';

/**
 * ArticleSchema —— 文章结构化数据（JSON-LD）
 *
 * 类型：Article（本阶段明确禁止输出 Product schema）。
 *
 * 作者与发布者：
 *   文章由公司内容团队撰写，因此 `author` 与 `publisher` 均指向根布局声明的
 *   Organization 实体（`@id = <siteUrl>/#organization`）——**不编造个人作者姓名**，
 *   也不输出任何无法验证的署名信息。
 *
 * 仅输出已确认信息：`datePublished` / `dateModified` 来自内容数据层，
 * 封面图缺失时不输出 `image` 字段（不指向不存在的资源）。
 */
export interface ArticleSchemaProps {
  post: BlogPost;
  /** 分类英文名（作为 articleSection） */
  section?: string;
}

export function ArticleSchema({ post, section }: ArticleSchemaProps) {
  const url = absoluteUrl(`/blog/${post.slug}`);

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: post.seo.title,
    description: post.seo.description,
    url,
    inLanguage: 'en',
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
    },
    author: {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: siteConfig.name,
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}${siteConfig.ogImage}`,
      },
    },
  };

  if (post.coverImage) {
    schema.image = absoluteUrl(post.coverImage);
  }

  if (section) {
    schema.articleSection = section;
  }

  if (post.tags.length > 0) {
    schema.keywords = post.tags.join(', ');
  }

  return (
    <script
      type="application/ld+json"
      // 数据来自本地内容层（非用户输入），并对 < 做转义以防注入
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
      }}
    />
  );
}
