import Link from 'next/link';
import type { ComponentProps } from 'react';
import { localizedPath } from './paths';
import type { Locale } from './config';

/**
 * LocaleLink —— 语言感知的站内链接
 *
 * 在 next/link 基础上自动补语言前缀（英文无前缀），
 * 外链 / mailto / tel / 纯锚点原样透传。
 *
 * 本组件不依赖 hooks，因此服务端组件与客户端组件都能直接使用；
 * `locale` 必须由调用方显式传入（服务端来自路由参数，客户端来自 props）。
 */
export interface LocaleLinkProps extends Omit<ComponentProps<typeof Link>, 'href'> {
  locale: Locale;
  href: string;
}

export function LocaleLink({ locale, href, ...rest }: LocaleLinkProps) {
  return <Link href={localizedPath(href, locale)} {...rest} />;
}
