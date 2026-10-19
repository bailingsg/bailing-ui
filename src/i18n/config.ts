/**
 * 国际化配置（唯一事实源）
 *
 * 语言范围：English（默认）+ 简体中文。
 * 路由策略：**as-needed 前缀** —— 英文保持无前缀（完整保留既有 URL 与 SEO 收录），
 * 中文使用 `/zh-CN` 前缀。任何页面都不得自行硬编码语言判断，一律从此处取值。
 */

export const locales = ['en', 'zh-CN'] as const;

export type Locale = (typeof locales)[number];

/** 默认语言（面向海外 B2B 客户，英文为默认展示语言） */
export const defaultLocale: Locale = 'en';

/** 语言选择持久化 Cookie（middleware 与客户端共享同一常量） */
export const localeCookieName = 'NEXT_LOCALE';

/** Cookie 有效期：一年（关闭浏览器后再次访问仍能保持选择） */
export const localeCookieMaxAge = 60 * 60 * 24 * 365;

/**
 * 请求头名称：middleware 把「本次请求实际使用的语言」写进请求头，
 * 供无法读取路由参数的场景使用（典型：`not-found.tsx`、`error.tsx` 之外的
 * 服务端 404 边界）。这样 404 页面也能在**服务端**输出正确语言的正文，
 * 而不是等客户端 hydrate 后才出现。
 */
export const localeHeaderName = 'x-bailing-locale';

/** 语言元信息（语言名称用各自母语书写，不随界面语言变化） */
export const localeMeta: Record<
  Locale,
  {
    /** 母语名称（语言选择器展示） */
    nativeName: string;
    /** 窄屏用的极简标识（2 字符左右） */
    shortName: string;
    /** 英文名称（无障碍描述 / 日志） */
    englishName: string;
    /** <html lang> 与 hreflang 使用的 BCP 47 标记 */
    htmlLang: string;
    /** Open Graph locale */
    ogLocale: string;
    /** Intl 日期格式化区域 */
    dateLocale: string;
  }
> = {
  en: {
    nativeName: 'English',
    shortName: 'EN',
    englishName: 'English',
    htmlLang: 'en',
    ogLocale: 'en_US',
    dateLocale: 'en-GB',
  },
  'zh-CN': {
    nativeName: '简体中文',
    shortName: '中文',
    englishName: 'Chinese (Simplified)',
    htmlLang: 'zh-CN',
    ogLocale: 'zh_CN',
    dateLocale: 'zh-CN',
  },
};

/** 类型守卫：判断任意字符串是否为受支持的语言 */
export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

/** 宽松解析（非法值回退默认语言，绝不抛错） */
export function resolveLocale(value: unknown): Locale {
  return isLocale(value) ? value : defaultLocale;
}

/**
 * 常见语言别名 → 受支持语言。
 *
 * 仅用于 URL 前缀归一化（例如访客手输 `/zh/products`），
 * 不做 Accept-Language 协商：首次访问一律英文默认。
 */
export const localeAliases: Record<string, Locale> = {
  en: 'en',
  'en-us': 'en',
  'en-gb': 'en',
  zh: 'zh-CN',
  'zh-cn': 'zh-CN',
  'zh-hans': 'zh-CN',
  'zh-sg': 'zh-CN',
  'zh-tw': 'zh-CN',
  'zh-hk': 'zh-CN',
};
