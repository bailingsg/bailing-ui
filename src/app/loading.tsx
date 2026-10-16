import { Container } from '@/components/layout/container';

/**
 * loading.tsx —— 全局加载骨架
 *
 * 路由切换时由 Next.js 自动展示，使用与页面一致的容器与留白，
 * 避免白屏跳变。骨架不包含任何真实内容。
 */
export default function Loading() {
  return (
    <Container className="py-16 sm:py-20" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="flex animate-pulse flex-col gap-10">
        {/* 标题区 */}
        <div className="flex flex-col gap-4">
          <div className="h-4 w-24 rounded-full bg-muted" />
          <div className="h-9 w-2/3 max-w-md rounded-md bg-muted" />
          <div className="h-4 w-full max-w-xl rounded-md bg-muted" />
          <div className="h-4 w-4/5 max-w-lg rounded-md bg-muted" />
        </div>

        {/* 内容网格 */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="flex flex-col gap-3 rounded-lg border border-border p-6">
              <div className="h-32 w-full rounded-md bg-muted" />
              <div className="h-4 w-3/4 rounded-md bg-muted" />
              <div className="h-4 w-1/2 rounded-md bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
