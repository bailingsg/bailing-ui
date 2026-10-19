'use client';

/**
 * LocalizedRouteSkeleton —— 带语言感知的加载骨架
 *
 * `loading.tsx` 不接收 `params`，因此无法在服务端得知当前语言。
 * 本组件在客户端用 `useParams()` 读取语言，把本地化后的
 * 「正在加载」提示传给纯展示的 `RouteSkeleton`。
 *
 * 骨架本身不含业务内容，语言差异只有一句 sr-only 文案，
 * 因此不存在视觉闪烁或 hydration mismatch。
 */

import { useLocale } from '@/i18n/client';
import { getI18n } from '@/i18n';
import { RouteSkeleton, type SkeletonVariant } from './route-skeleton';

export interface LocalizedRouteSkeletonProps {
  variant?: SkeletonVariant;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function LocalizedRouteSkeleton(props: LocalizedRouteSkeletonProps) {
  const locale = useLocale();
  const { t } = getI18n(locale);
  return <RouteSkeleton {...props} loadingLabel={t('common.loading')} />;
}
