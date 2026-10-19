import { siteConfig, siteUrl } from '@/config/site';
import { absoluteUrl } from '@/lib/seo';
import { defaultLocale, type Locale } from '@/i18n/config';

/**
 * AboutSchema —— 关于我们页的组织结构化数据（JSON-LD）
 *
 * 为什么是 Organization 而不是 Product：
 *   /about 是品牌信任页，描述的是"这家公司是谁"，因此输出 Organization 实体；
 *   本阶段明确禁止输出 Product schema。
 *
 * 与根布局的关系（重要）：
 *   根布局已全局输出 Organization 节点（`@id = <siteUrl>/#organization`）。
 *   本组件**复用同一个 `@id`** 并补充关于页特有的属性（slogan / knowsAbout /
 *   mainEntityOfPage）。相同 `@id` 的节点会被搜索引擎**合并**为同一实体，
 *   因此不会产生"两个 Organization"的冲突，属于规范的链接数据做法。
 *
 * 仅输出已确认信息：地址、联系方式、成立年份等未确认字段一律不写入。
 */
export interface AboutSchemaProps {
  /** 页面描述（与 metadata 保持一致） */
  description: string;
  /** 页面路径（已带语言前缀），默认 /about */
  path?: string;
  /** 页面语言（默认 en），决定 slogan 语言 */
  locale?: Locale;
}

/** 公司业务范围（已由业务方确认的产品方向，不含任何编造数据） */
const KNOWS_ABOUT = [
  'MDF (medium-density fibreboard)',
  'Plywood',
  'Particle board',
  'Decorative panels',
  'Furniture board solutions',
  'Wood products export',
];

export function AboutSchema({
  description,
  path = '/about',
  locale = defaultLocale,
}: AboutSchemaProps) {
  const url = absoluteUrl(path);

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    // 与根布局保持同一 @id —— 两个节点会被合并，而非重复声明实体
    '@id': `${siteUrl}/#organization`,
    name: siteConfig.name,
    alternateName: siteConfig.nameZh,
    url: siteUrl,
    logo: `${siteUrl}${siteConfig.ogImage}`,
    description,
    slogan: locale === defaultLocale ? siteConfig.tagline : siteConfig.taglineZh,
    knowsAbout: KNOWS_ABOUT,
    // 指回关于我们页本身，建立"页面 ↔ 实体"关系
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
    },
  };

  return (
    <script
      type="application/ld+json"
      // 数据来自本地配置（非用户输入），并对 < 做转义以防注入
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
      }}
    />
  );
}
