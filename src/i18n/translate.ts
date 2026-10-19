/**
 * 文案取值器（服务端 / 客户端共用纯函数）
 *
 * · 扁平 key 用点号路径：t('common.previous')
 * · 插值用 `{name}` 占位：t('common.pageOf', { page: 2, total: 5 })
 * · key 由 `Messages` 类型递归推导 —— 写错 key 会在 `tsc` 阶段报错
 */

import type { Messages } from './messages';

type Join<K extends string, P extends string> = P extends '' ? K : `${K}.${P}`;

/** 递归推导所有叶子文案的路径（数组被视为整体，不参与 t() 取值） */
export type MessageKey<T> = T extends string
  ? ''
  : T extends readonly unknown[]
    ? never
    : {
        [K in keyof T & string]: Join<K, MessageKey<T[K]>>;
      }[keyof T & string];

export type MessageParams = Record<string, string | number>;

function resolvePath(source: unknown, key: string): string | undefined {
  let current: unknown = source;
  for (const segment of key.split('.')) {
    if (current === null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return typeof current === 'string' ? current : undefined;
}

function interpolate(template: string, params?: MessageParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}

/**
 * 取文案。缺失时返回 key 本身（可见地暴露问题，而不是渲染空白），
 * 开发环境额外告警，便于在联调阶段发现漏翻。
 */
export function translate(messages: Messages, key: MessageKey<Messages>, params?: MessageParams): string {
  const template = resolvePath(messages, key);
  if (template === undefined) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[i18n] missing message: ${key}`);
    }
    return key;
  }
  return interpolate(template, params);
}

/** 便捷构造：绑定某份字典的 t 函数 */
export function createTranslator(messages: Messages) {
  return (key: MessageKey<Messages>, params?: MessageParams): string =>
    translate(messages, key, params);
}

export type Translator = ReturnType<typeof createTranslator>;
