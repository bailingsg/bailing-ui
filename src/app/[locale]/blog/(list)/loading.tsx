import { LocalizedRouteSkeleton } from '@/components/layout/localized-route-skeleton';

/** 博客列表加载态（分类筛选 / 翻页时）；加载提示随语言切换 */
export default function BlogLoading() {
  return <LocalizedRouteSkeleton variant="list" columns={3} />;
}
