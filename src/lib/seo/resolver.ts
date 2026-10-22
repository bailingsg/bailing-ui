import type { Metadata } from 'next';
import { siteConfig, siteUrl } from '@/config/site';
import { apiGet, isApiSource } from '@/lib/cms-api';
import { CmsRevalidate, CmsTags } from '@/lib/cms-tags';
import { absoluteUrl } from '@/lib/seo';
import { defaultLocale, localeMeta, type Locale } from '@/i18n/config';
import { localizedPath } from '@/i18n/paths';

/**
 * 统一 SEO Resolver（Phase 5.0，任务书十八节）
 *
 * 所有公开页面的 metadata 必须经过本模块生成，禁止每个页面自己拼一套。
 *
 * 取值优先级（从高到低）：
 *   Manual SEO value（后台 SEO 档案，SeoProfile）
 *     ↓
 *   Content Metadata（页面自身内容：产品名 / 文章标题 / 摘要…）
 *     ↓
 *   Global SEO Settings（后台全局设置：标题模板 / 默认 OG 图 / 站点描述…）
 *     ↓
 *   System Default（config/site.ts 内置默认）
 *
 * 数据源：后端 GET /public/seo/resolve?paths=<path>（一次往返同时返回
 * 全局设置与档案）。demo 模式 / 后端不可用时自动降级为本地默认，
 * 保证构建不失败、页面不白屏。
 */

/** 公开设置（与后端 publicSettings 投影逐字对应） */
export interface SeoSettings {
  siteName: string;
  siteTitle: string | null;
  siteDescription: string | null;
  defaultOgImage: string | null;
  defaultTwitterImage: string | null;
  canonicalDomain: string | null;
  pageTitleTemplate: string;
  productTitleTemplate: string;
  blogTitleTemplate: string;
  categoryTitleTemplate: string;
  companyName: string | null;
  companyLogo: string | null;
  companyWebsite: string | null;
  companyEmail: string | null;
  companyPhone: string | null;
  companyAddress: string | null;
  companyCountry: string | null;
  linkedin: string | null;
  facebook: string | null;
  instagram: string | null;
  youtube: string | null;
  whatsapp: string | null;
  googleSiteVerification: string | null;
}

/** 单个路径的生效档案（与后端 toPublicProjection 对应） */
export interface ResolvedSeoProfile {
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
  schemaType: string;
  schemaData: unknown;
  relatedData: unknown;
}

/** 系统默认模板（后端不可用时的兜底） */
const SYSTEM_DEFAULT_TEMPLATE = `%title% | ${siteConfig.name}`;

function systemDefaultSettings(): SeoSettings {
  return {
    siteName: siteConfig.name,
    siteTitle: null,
    siteDescription: siteConfig.description,
    defaultOgImage: siteConfig.ogImage,
    defaultTwitterImage: null,
    canonicalDomain: null,
    pageTitleTemplate: SYSTEM_DEFAULT_TEMPLATE,
    productTitleTemplate: SYSTEM_DEFAULT_TEMPLATE,
    blogTitleTemplate: SYSTEM_DEFAULT_TEMPLATE,
    categoryTitleTemplate: SYSTEM_DEFAULT_TEMPLATE,
    companyName: siteConfig.name,
    companyLogo: null,
    companyWebsite: siteUrl,
    companyEmail: null,
    companyPhone: null,
    companyAddress: null,
    companyCountry: null,
    linkedin: null,
    facebook: null,
    instagram: null,
    youtube: null,
    whatsapp: null,
    googleSiteVerification: null,
  };
}

interface ResolveResponse {
  settings: SeoSettings;
  profiles: { path: string; profile: ResolvedSeoProfile | null }[];
}

/** 拉取全局设置 + 档案（一次往返；带 ISR 与 seo tag，后台保存后即时失效） */
async function fetchResolve(path: string): Promise<ResolveResponse | null> {
  if (!isApiSource()) return null;
  try {
    return await apiGet<ResolveResponse>(
      `/public/seo/resolve?paths=${encodeURIComponent(path)}`,
      { tags: [CmsTags.seo], revalidate: CmsRevalidate.STABLE },
    );
  } catch {
    // 后端不可用不阻断渲染：降级为系统默认（构建期常见路径）
    return null;
  }
}

/** 全局设置（供 layout / schema / robots / 前台组件使用） */
export async function getSeoSettings(): Promise<SeoSettings> {
  if (!isApiSource()) return systemDefaultSettings();
  try {
    return await apiGet<SeoSettings>('/public/seo/settings', {
      tags: [CmsTags.seo],
      revalidate: CmsRevalidate.STABLE,
    });
  } catch {
    return systemDefaultSettings();
  }
}

/** 套用标题模板（%title% 占位符；空模板回退系统默认） */
export function applyTitleTemplate(template: string | null | undefined, title: string): string {
  const tpl = template && template.includes('%title%') ? template : SYSTEM_DEFAULT_TEMPLATE;
  return tpl.replace('%title%', title);
}

export interface ResolveSeoInput {
  /** 前台路径（**不带语言前缀**），如 /products/plywood */
  path: string;
  /** 内容主标题（产品名 / 文章标题 / 页面标题）——模板兜底与 content 层取值 */
  title: string;
  /** 内容描述（excerpt / shortDescription / summary） */
  description?: string | null;
  /** 内容分享图（产品主图 / 文章封面；站内路径或绝对 URL） */
  ogImage?: string | null;
  /** 分享图替代文本 */
  ogImageAlt?: string;
  /** OG 类型 */
  ogType?: 'website' | 'article';
  /** 内容关键词 */
  keywords?: string[];
  /** 内容层收录意图（false = 预览 / 内部页；档案层 noindex 仍然优先） */
  index?: boolean;
  /** 标题模板选择：page（默认）/ product / blog / category；不传则按规则自动选择 */
  titleTemplateKey?: 'page' | 'product' | 'blog' | 'category';
  /** 直接指定标题模板（优先于 titleTemplateKey；内容标题已含品牌名时仍原样输出） */
  titleTemplate?: string | null;
  /**
   * 页面语言（默认 en）。
   *
   * 非默认语言时：
   *   · canonical 指向本语言自己的规范 URL（绝不与英文页共用同一个 canonical）；
   *   · 不套用后端 SEO 档案（档案只有单语言字段，套到中文页会输出英文标题）；
   *   · 输出 hreflang（en / zh-CN / x-default）互链。
   */
  locale?: Locale;
}

/** 内容标题是否已是完整标题（已含品牌名时不再套模板，避免「… | Bailing Wooden | Bailing Wooden」） */
function isBrandCompleteTitle(title: string, siteName: string): boolean {
  return title.toLowerCase().includes(siteName.toLowerCase());
}

/**
 * 统一 metadata 解析（Manual → Content → Global → System）。
 *
 * 页面用法：
 *   const product = await getProductById(id);
 *   return resolveSeoMetadata({ path: productDetailPath(product), title: product.name, ... });
 */
export async function resolveSeoMetadata(input: ResolveSeoInput): Promise<Metadata> {
  const locale = input.locale ?? defaultLocale;
  const isDefault = locale === defaultLocale;

  // 中文页面不套用后端 SEO 档案：档案只有单语言（英文）字段，
  // 套到中文页会把英文标题 / 描述写到中文 URL 上。
  const resolved = isDefault ? await fetchResolve(input.path) : null;
  const settings = resolved?.settings ?? (isDefault ? systemDefaultSettings() : await getSeoSettings());
  const profile = isDefault ? (resolved?.profiles?.[0]?.profile ?? null) : null;

  // 1. 标题：档案手填 > 模板(内容标题)
  // 内容标题已含品牌名（如 CMS hero 标题、既有完整标题）时视为完整标题，不再套模板
  const siteName = settings.siteName || siteConfig.name;
  const contentTitleComplete = isBrandCompleteTitle(input.title, siteName);
  const templateKey = input.titleTemplateKey ?? 'page';
  const settingsTemplate =
    templateKey === 'product'
      ? settings.productTitleTemplate
      : templateKey === 'blog'
        ? settings.blogTitleTemplate
        : templateKey === 'category'
          ? settings.categoryTitleTemplate
          : settings.pageTitleTemplate;
  const template = input.titleTemplate ?? (contentTitleComplete ? '%title%' : settingsTemplate);
  const title = profile?.metaTitle?.trim()
    ? profile.metaTitle
    : applyTitleTemplate(template, input.title);

  // 2. 描述：档案 > 内容 > 全局站点描述 > 系统默认
  const description = isDefault
    ? profile?.metaDescription?.trim() ||
      input.description?.trim() ||
      settings.siteDescription ||
      siteConfig.description
    : input.description?.trim() || siteConfig.descriptionZh;

  // 3. Canonical / 语言互链
  //    中文页永远 canonical 到自己（绝不与英文页共用 canonical）
  const enUrl = absoluteUrl(localizedPath(input.path, defaultLocale));
  const zhUrl = absoluteUrl(localizedPath(input.path, 'zh-CN'));
  const canonical = isDefault
    ? profile?.canonicalUrl?.trim()
      ? absoluteUrl(profile.canonicalUrl)
      : enUrl
    : zhUrl;
  const pageUrl = isDefault ? enUrl : zhUrl;

  // 4. OG：档案 > 内容图 > 全局默认 OG 图 > 系统品牌图
  const ogImage = absoluteUrl(
    profile?.ogImage?.trim() ||
      input.ogImage?.trim() ||
      settings.defaultOgImage ||
      siteConfig.ogImage,
  );
  const ogTitle = profile?.ogTitle?.trim() || title;
  const ogDescription = profile?.ogDescription?.trim() || description;
  const twitterImage = absoluteUrl(profile?.twitterImage?.trim() || settings.defaultTwitterImage || ogImage);

  // 5. Robots：内容层 / 档案层 / 站点总开关串联（任一 noindex 即不收录）
  const indexable =
    (input.index ?? true) && (profile ? profile.robotsIndex : true) && siteConfig.allowIndexing;
  const follow = profile ? profile.robotsFollow : true;

  return {
    title: { absolute: title },
    description,
    keywords: input.keywords && input.keywords.length > 0 ? input.keywords : [...siteConfig.keywords],
    alternates: {
      canonical,
      languages: {
        en: enUrl,
        'zh-CN': zhUrl,
        'x-default': enUrl,
      },
    },
    robots: indexable ? { index: true, follow } : { index: false, follow: false },
    openGraph: {
      type: input.ogType ?? 'website',
      url: pageUrl,
      siteName,
      title: ogTitle,
      description: ogDescription,
      locale: localeMeta[locale].ogLocale,
      alternateLocale: localeMeta[isDefault ? 'zh-CN' : 'en'].ogLocale,
      images: [{ url: ogImage, alt: input.ogImageAlt ?? ogTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: profile?.twitterTitle?.trim() || ogTitle,
      description: profile?.twitterDescription?.trim() || ogDescription,
      images: [twitterImage],
    },
  };
}
