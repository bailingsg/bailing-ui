import { Container } from '@/components/layout/container';
import { cn } from '@/lib/utils';

/**
 * RouteSkeleton —— 路由级加载骨架（Phase 4.8）
 *
 * 用于动态路由（产品 / 博客 / 应用场景）的 loading.tsx：
 * 路由切换或数据流式加载时展示与真实版式同构的灰块，
 * 避免用户看到完全空白页面（任务书第三十二节）。
 *
 * 骨架**不含任何真实内容**，也不声明业务语义，仅做布局占位；
 * 对屏幕阅读器以 aria-busy + sr-only 文案说明"正在加载"。
 */

export type SkeletonVariant = 'list' | 'detail';

export interface RouteSkeletonProps {
  /** list：卡片网格；detail：图文详情（大图 + 正文块） */
  variant?: SkeletonVariant;
  /** 列表网格列数（lg 断点），默认 3 */
  columns?: 2 | 3 | 4;
  className?: string;
  /** 屏幕阅读器加载提示（由 loading.tsx 按语言传入） */
  loadingLabel?: string;
}

const columnClass: Record<2 | 3 | 4, string> = {
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
};

export function RouteSkeleton({
  variant = 'list',
  columns = 3,
  className,
  loadingLabel = 'Loading…',
}: RouteSkeletonProps) {
  return (
    <Container className={cn('py-16 sm:py-20', className)} aria-busy="true" aria-live="polite">
      <span className="sr-only">{loadingLabel}</span>

      {variant === 'detail' ? (
        <div className="flex animate-pulse flex-col gap-10">
          {/* 面包屑 */}
          <div className="h-3 w-48 rounded-full bg-muted" />

          {/* 图文首屏 */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col gap-4">
              <div className="h-5 w-24 rounded-full bg-muted" />
              <div className="h-9 w-4/5 rounded-md bg-muted" />
              <div className="h-4 w-full rounded-md bg-muted" />
              <div className="h-4 w-3/4 rounded-md bg-muted" />
              <div className="mt-2 flex gap-3">
                <div className="h-11 w-36 rounded-md bg-muted" />
                <div className="h-11 w-36 rounded-md bg-muted" />
              </div>
            </div>
            <div className="aspect-[4/3] w-full rounded-lg bg-muted" />
          </div>

          {/* 正文块 */}
          <div className="flex flex-col gap-4">
            <div className="h-6 w-56 rounded-md bg-muted" />
            <div className="h-4 w-full rounded-md bg-muted" />
            <div className="h-4 w-full rounded-md bg-muted" />
            <div className="h-4 w-2/3 rounded-md bg-muted" />
          </div>
        </div>
      ) : (
        <div className="flex animate-pulse flex-col gap-10">
          {/* 标题区 */}
          <div className="flex flex-col gap-4">
            <div className="h-4 w-24 rounded-full bg-muted" />
            <div className="h-9 w-2/3 max-w-md rounded-md bg-muted" />
            <div className="h-4 w-full max-w-xl rounded-md bg-muted" />
          </div>

          {/* 卡片网格 */}
          <div className={cn('grid grid-cols-1 gap-6 sm:grid-cols-2', columnClass[columns])}>
            {Array.from({ length: columns * 2 }, (_, index) => (
              <div key={index} className="flex flex-col gap-3 rounded-lg border border-border p-6">
                <div className="aspect-[4/3] w-full rounded-md bg-muted" />
                <div className="h-4 w-3/4 rounded-md bg-muted" />
                <div className="h-4 w-1/2 rounded-md bg-muted" />
              </div>
            ))}
          </div>
        </div>
      )}
    </Container>
  );
}
