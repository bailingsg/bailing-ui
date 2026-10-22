/**
 * 站点配置（Site Config）—— 全站字符串与结构的唯一来源
 *
 * 页面、导航、页脚、SEO、sitemap 均从此处取值，禁止在页面中散落硬编码字符串。
 * 说明：本阶段只建立框架，不含任何虚构企业数据；联系方式与资质证书待业务方
 * 确认后填写，未填写项在界面上显示为"待补充"。
 */

export interface NavItem {
  /** 路由路径 */
  href: string;
  /** 英文导航标签（面向海外采购商） */
  label: string;
  /** 中文标签（辅助展示 / 后台） */
  labelZh: string;
}

/* -------------------------------------------------------------------------- */
/* 基本信息                                                                    */
/* -------------------------------------------------------------------------- */

/** 正式生产域名（canonical / OG / sitemap 的最终基准，不可被本地配置污染） */
const PRODUCTION_SITE_URL = 'https://bailingwooden.com';

const isProductionBuild = process.env.NODE_ENV === 'production';

/** 判定本机 / 私网地址（这些地址绝不能出现在生产 metadata 里） */
function isLocalOrPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1' || host.endsWith('.local')) {
    return true;
  }
  // RFC1918 私网 + 链路本地
  if (/^10\./.test(host)) return true;
  if (/^192\.168\./.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return true;
  if (/^169\.254\./.test(host)) return true;
  return false;
}

/**
 * 站点根地址（部署时通过 NEXT_PUBLIC_SITE_URL 覆盖）。
 *
 * 安全护栏（Phase 4.8）：**生产构建下拒绝本机 / 私网地址**。
 * 若误把 NEXT_PUBLIC_SITE_URL 配成 http://localhost:3000 或
 * http://192.168.1.40:3000，canonical / og:url / sitemap 会写入这些地址，
 * 导致搜索引擎收录错误域名——此处直接回退到正式域名并告警。
 * 开发环境（NODE_ENV !== production）允许本地地址，便于联调。
 */
function resolveSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? '').trim();
  if (!raw) return PRODUCTION_SITE_URL;
  try {
    const url = new URL(raw);
    if (isProductionBuild && isLocalOrPrivateHost(url.hostname)) {
      console.warn(
        `[site] NEXT_PUBLIC_SITE_URL 指向本机/私网地址（${url.hostname}），` +
          `生产构建已回退为 ${PRODUCTION_SITE_URL}（避免 canonical/OG 写入内网地址）`,
      );
      return PRODUCTION_SITE_URL;
    }
    return `${url.protocol}//${url.host}${url.pathname.replace(/\/$/, '')}`;
  } catch {
    return PRODUCTION_SITE_URL;
  }
}

/**
 * 是否允许搜索引擎收录（robots / 全站 metadata 的唯一开关）。
 *
 * 取值优先级：
 *   1. NEXT_PUBLIC_ALLOW_INDEXING=true|false（显式配置，最高优先级）
 *   2. 未配置时：生产构建默认 **允许**（任务要求「生产 Allow: /」），
 *      开发环境默认禁止（避免半成品被误抓）。
 * 如需在内容未就绪前临时封闭整站，显式设置 NEXT_PUBLIC_ALLOW_INDEXING=false 即可。
 */
function resolveAllowIndexing(): boolean {
  const raw = (process.env.NEXT_PUBLIC_ALLOW_INDEXING ?? '').trim().toLowerCase();
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return isProductionBuild;
}

export const siteUrl = resolveSiteUrl();

export const siteConfig = {
  name: 'Bailing Wooden',
  nameZh: '百灵木业',
  /** 站点根地址（无结尾斜杠） */
  url: siteUrl,
  /** 默认 SEO 描述（英文，面向海外采购商） */
  description:
    'Bailing Wooden is a professional wooden products manufacturer and B2B export supplier, serving global buyers with reliable quality, industrial craftsmanship and sustainable sourcing.',
  descriptionZh: '百灵木业：专业木制品制造与 B2B 出口供应商，为全球采购商提供稳定品质与可持续供应。',
  tagline: 'Professional Wooden Products Manufacturer',
  taglineZh: '专业木制品制造 · B2B 出口工厂',
  /** 品牌关键词（用于 keywords 元信息） */
  keywords: [
    'wooden products manufacturer',
    'B2B wood supplier',
    'wood export factory',
    'wooden furniture parts',
    'sustainable timber',
    'OEM wooden products',
  ],
  /** 默认分享图（使用品牌 logo） */
  ogImage: '/logo.webp',
  /**
   * 是否允许搜索引擎收录。
   *
   * Phase 4.8：改为**环境感知**——
   *   · 生产构建默认 true（robots 输出 Allow: /，仅屏蔽内部路径）
   *   · 开发环境默认 false（避免半成品被误抓）
   *   · 可用 NEXT_PUBLIC_ALLOW_INDEXING=true|false 显式覆盖
   * 内容未就绪需要临时封闭整站时，显式设为 false 即可。
   */
  allowIndexing: resolveAllowIndexing(),
  /** 站点语言 */
  locale: 'en_US',
  /** 联系方式未确认前，界面上统一显示的占位文案（英文，面向公开站点） */
  placeholderText: 'To be confirmed',
  /** 占位文案（中文，后台 / 内部视图使用） */
  placeholderTextZh: '待补充',
  /** 版权主体 */
  copyrightHolder: 'Bailing Wooden',
} as const;

/* -------------------------------------------------------------------------- */
/* 导航结构                                                                    */
/* -------------------------------------------------------------------------- */

/** 主导航（顺序即展示顺序，与 Phase 3.3 路由体系一致） */
export const mainNav: NavItem[] = [
  { href: '/', label: 'Home', labelZh: '首页' },
  { href: '/products', label: 'Products', labelZh: '产品' },
  { href: '/factory', label: 'Factory', labelZh: '工厂' },
  { href: '/quality', label: 'Quality', labelZh: '品质' },
  { href: '/applications', label: 'Applications', labelZh: '应用' },
  { href: '/about', label: 'About', labelZh: '关于我们' },
  { href: '/blog', label: 'Blog', labelZh: '资讯' },
  { href: '/contact', label: 'Contact', labelZh: '联系我们' },
];

/** 主导航 CTA（询价入口） */
export const primaryCta = {
  href: '/contact#rfq',
  label: 'Request Quote',
  labelZh: '获取报价',
} as const;

/* -------------------------------------------------------------------------- */
/* 页脚结构                                                                    */
/* -------------------------------------------------------------------------- */

export interface FooterColumn {
  title: string;
  titleZh: string;
  links: NavItem[];
}

export const footerColumns: FooterColumn[] = [
  {
    title: 'Company',
    titleZh: '公司',
    links: [
      { href: '/about', label: 'About Us', labelZh: '关于我们' },
      { href: '/factory', label: 'Factory', labelZh: '工厂实力' },
      { href: '/quality', label: 'Quality Control', labelZh: '品质管控' },
      { href: '/blog', label: 'Insights & Guides', labelZh: '行业知识' },
    ],
  },
  {
    title: 'Products',
    titleZh: '产品',
    links: [
      { href: '/products', label: 'All Products', labelZh: '全部产品' },
      { href: '/applications', label: 'Applications', labelZh: '应用场景' },
      { href: '/contact#rfq', label: 'Request Quote', labelZh: '获取报价' },
    ],
  },
  {
    title: 'Resources',
    titleZh: '资源',
    links: [
      { href: '/quality#certificates', label: 'Certificates', labelZh: '资质证书' },
      { href: '/contact#faq', label: 'FAQ', labelZh: '常见问题' },
      { href: '/contact', label: 'Shipping & Terms', labelZh: '物流与条款' },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* 占位信息（待业务方确认，界面显示"待补充"）                                    */
/* -------------------------------------------------------------------------- */

export const contactInfo = {
  email: '',
  phone: '',
  /** 地址（中文写法）：寿光文家潍高路与西环路交界处 */
  address: '寿光文家潍高路与西环路交界处',
  /** 地址（英文写法）：供英文界面与 Google 地图检索使用 */
  addressEn: 'The Cross Of Weigao And Xihuan Road, Shouguang City, Shandong Province, China',
  /**
   * 地图检索词：一律用「名称 / 地址文本」而不是自存坐标 ——
   * 国内常见 GCJ-02 / WGS-84 偏差，写死坐标反而容易偏出几百米。
   *
   * 两个通道各用各的策略：
   *   · mapQuery   → Google Maps：公司名 + 地址。Google 认不出这家小厂时
   *                  会忽略公司名、退化成地址检索，仍能落到路口（不会跑空）。
   *   · mapQueryZh → 高德：直接搜公司名 POI，能命中就直接钉在公司上。
   * 若要精确到厂门口，把 mapQuery 换成 `纬度,经度`（WGS-84）、
   * mapQueryZh 换成 GCJ-02 坐标即可（两套坐标系不能混用）。
   */
  mapQuery:
    'Bailing Wooden Co., Ltd., Weigao Road & Xihuan Road, Shouguang City, Shandong Province, China',
  mapQueryZh: '百灵木业有限公司',
  /** Google Maps Embed API Key（可留空：留空走免 Key 的 output=embed 通道，见 location-map.tsx） */
  mapEmbedKey: '',
} as const;

/** 资质证书（名称待业务方确认） */
export const certificates: string[] = [];

/** 社交 / B2B 平台链接 */
export const socialLinks: { label: string; href: string }[] = [];

/* -------------------------------------------------------------------------- */
/* 路由清单（供 sitemap 与站内导航使用）                                        */
/* -------------------------------------------------------------------------- */

export interface SiteRoute {
  path: string;
  /** sitemap 优先级 */
  priority: number;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  /** 是否加入 sitemap（后台/预览页不加入） */
  inSitemap: boolean;
}

/** 全站路由清单（Phase 3.3 框架路由） */
export const siteRoutes: SiteRoute[] = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly', inSitemap: true },
  { path: '/products', priority: 0.9, changeFrequency: 'weekly', inSitemap: true },
  { path: '/factory', priority: 0.8, changeFrequency: 'monthly', inSitemap: true },
  { path: '/quality', priority: 0.8, changeFrequency: 'monthly', inSitemap: true },
  { path: '/applications', priority: 0.8, changeFrequency: 'monthly', inSitemap: true },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly', inSitemap: true },
  { path: '/blog', priority: 0.7, changeFrequency: 'weekly', inSitemap: true },
  { path: '/contact', priority: 0.9, changeFrequency: 'monthly', inSitemap: true },
  // 设计系统预览页仅用于开发自检，不加入 sitemap
  { path: '/design-system', priority: 0.1, changeFrequency: 'yearly', inSitemap: false },
];

/** 需要在 sitemap 中输出的路由 */
export const sitemapRoutes = siteRoutes.filter((route) => route.inSitemap);
