/**
 * i18n 统一入口（服务端与客户端共用）
 *
 * 本模块只包含纯数据与纯函数，不含任何 Node / 浏览器专属 API，
 * 因此服务端组件与客户端组件都可以直接引用。
 *
 * 语言来源是**路由参数**（`[locale]`），不读 cookie / header，
 * 因此页面可静态生成、可被 CDN 缓存，且同一 URL 永远渲染同一语言
 * （不会出现「URL 是英文、内容却是中文」的状态冲突）。
 */

import { defaultLocale, localeMeta, resolveLocale, type Locale } from './config';
import { getMessages, type Messages } from './messages';
import { createTranslator, type MessageKey, type Translator } from './translate';

export interface I18n {
  locale: Locale;
  /** 是否为默认语言（英文） */
  isDefaultLocale: boolean;
  /** 完整消息字典（数组型文案直接取用，如首页能力卡片） */
  m: Messages;
  /** 点号路径取值器（带插值） */
  t: Translator;
  /** Intl 日期区域 */
  dateLocale: string;
  /** <html lang> 值 */
  htmlLang: string;
  /** Open Graph locale */
  ogLocale: string;
}

/** 由路由参数构造 i18n 上下文（非法值回退英文，绝不抛错） */
export function getI18n(locale: Locale | string | undefined): I18n {
  const resolved = resolveLocale(locale);
  const messages = getMessages(resolved);

  return {
    locale: resolved,
    isDefaultLocale: resolved === defaultLocale,
    m: messages,
    t: createTranslator(messages),
    dateLocale: localeMeta[resolved].dateLocale,
    htmlLang: localeMeta[resolved].htmlLang,
    ogLocale: localeMeta[resolved].ogLocale,
  };
}

/**
 * 导航标签本地化。
 *
 * 导航项来自后端 CMS，只有一个 `label` 字段（单语言）。为避免后台改文案后
 * 前台中文界面仍显示英文菜单，这里对**已知站内路由**用 UI 文案覆盖，
 * 未知路由 / 外链仍使用 CMS 原始标签（不伪造翻译）。
 */
const NAV_LABEL_KEYS: Record<string, MessageKey<Messages>> = {
  '/': 'nav.home',
  '/products': 'nav.products',
  '/factory': 'nav.factory',
  '/quality': 'nav.quality',
  '/applications': 'nav.applications',
  '/about': 'nav.about',
  '/blog': 'nav.blog',
  '/contact': 'nav.contact',
  // 带锚点的导航项单独映射：CMS 里它们是独立菜单项（如 Certificates / FAQ），
  // 不能只按去锚点后的路径匹配，否则会被覆盖成"品质""联系我们"。
  '/contact#rfq': 'nav.requestQuote',
  '/contact#faq': 'nav.faq',
  '/quality#certificates': 'nav.certificates',
};

export function localizeNavLabel(url: string, t: Translator, fallback: string): string {
  const path = (url.split('#')[0] ?? '').split('?')[0] || '/';
  // 先按完整 URL（含锚点）匹配，再退回语言无关路径
  const key = NAV_LABEL_KEYS[url] ?? NAV_LABEL_KEYS[path];
  return key ? t(key) : fallback;
}
