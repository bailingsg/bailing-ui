import type { BlogBlock } from '@/lib/blog';

/**
 * BlogContent —— 文章正文渲染器
 *
 * 把结构化区块（BlogBlock[]）渲染为语义化 HTML：
 *   heading → h2，paragraph → p，list → ul，note → 强调块
 *
 * 为什么不直接渲染 Markdown 字符串：
 *   正文目前登记在数据层，未来会来自 CMS。结构化区块在渲染层完全可控，
 *   不需要引入 Markdown 解析依赖，也不会因为正文中的特殊字符产生注入风险。
 *   未来接入 CMS 时，把富文本转换为同样的区块数组即可，本组件无需改动。
 *
 * 排版说明：正文限制在 narrow 容器内以保证可读行宽；
 * 标题层级从 h2 开始（h1 由文章 Hero 输出），避免多 H1。
 */
export interface BlogContentProps {
  blocks: BlogBlock[];
  className?: string;
}

export function BlogContent({ blocks, className }: BlogContentProps) {
  return (
    <div className={className}>
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        switch (block.type) {
          case 'heading':
            return (
              <h2 key={key} className="mt-10 mb-4 text-heading-sm first:mt-0">
                {block.text}
              </h2>
            );

          case 'list':
            return (
              <ul key={key} className="my-5 flex flex-col gap-2.5">
                {block.items.map((item) => (
                  <li key={item} className="flex gap-3 text-body text-text-secondary">
                    <span
                      aria-hidden="true"
                      className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary"
                    />
                    <span className="text-pretty">{item}</span>
                  </li>
                ))}
              </ul>
            );

          case 'note':
            return (
              <aside
                key={key}
                className="my-6 rounded-lg border border-border-brand bg-surface-brand px-5 py-4"
              >
                <p className="text-body text-text-secondary text-pretty">{block.text}</p>
              </aside>
            );

          case 'paragraph':
          default:
            return (
              <p key={key} className="my-5 text-body text-text-secondary text-pretty">
                {block.text}
              </p>
            );
        }
      })}
    </div>
  );
}
