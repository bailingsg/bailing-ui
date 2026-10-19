/**
 * 文案字典入口（按语言取消息对象）
 *
 * 静态 import：构建期即可确定两份字典，服务端与客户端渲染结果一致，
 * 不依赖请求上下文，因此不会产生 hydration mismatch，也不影响 ISR 缓存。
 */

import { defaultLocale, type Locale } from '../config';
import { en, type Messages } from './en';
import { zhCN } from './zh-CN';

export type { Messages } from './en';

const dictionaries: Record<Locale, Messages> = {
  en,
  'zh-CN': zhCN,
};

/** 取指定语言的完整消息字典 */
export function getMessages(locale: Locale): Messages {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

export { en, zhCN };
