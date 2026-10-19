import { LocalizedRouteSkeleton } from '@/components/layout/localized-route-skeleton';

/** 产品列表加载态（分页 / 筛选切换时不出现白屏）；加载提示随语言切换 */
export default function ProductsLoading() {
  return <LocalizedRouteSkeleton variant="list" columns={4} />;
}
