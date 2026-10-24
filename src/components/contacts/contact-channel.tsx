import type { ReactNode } from 'react';

/**
 * ContactChannel —— 员工卡片中的单行联系方式（图标 + 内容）
 *
 * 设计约束：
 *   · 图标固定 16px 且不参与换行（shrink-0），保证多行文本时图标始终与首行基线对齐；
 *   · 内容区 min-w-0 + overflow-wrap:anywhere —— 卡片左侧文字区在窄屏下很窄，
 *     长邮箱必须能在任意位置折行，否则会顶出头像区；
 *   · 图标用 text-text-muted 弱化，可点击文案仍由调用方决定颜色（主色链接）。
 *
 * 必须是 <ul> 的直接子元素（渲染为 <li>）。
 */
export function ContactChannel({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <li className="flex items-start gap-2.5">
      <span
        aria-hidden="true"
        className="mt-0.5 flex size-4 shrink-0 items-center justify-center text-text-muted"
      >
        {icon}
      </span>
      {/* text-small 与颜色 token 不经 cn()：tailwind-merge 不识别 @theme 自定义字号 */}
      <span className="min-w-0 flex-1 text-small [overflow-wrap:anywhere]">{children}</span>
    </li>
  );
}
