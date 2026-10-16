import { RouteSkeleton } from '@/components/layout/route-skeleton';

/** 产品列表加载态（分页 / 筛选切换时不出现白屏） */
export default function ProductsLoading() {
  return <RouteSkeleton variant="list" columns={4} />;
}
