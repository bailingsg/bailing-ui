import { RouteSkeleton } from '@/components/layout/route-skeleton';

/** 博客列表加载态（分类筛选 / 翻页时） */
export default function BlogLoading() {
  return <RouteSkeleton variant="list" columns={3} />;
}
