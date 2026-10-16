import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/config/site';

/**
 * Logo —— 品牌标识（品牌图 + 中英文名称）
 *
 * 品牌图使用 public/logo.webp（红环绿松 + 百灵/BL），
 * 图片自带白色底，统一置于圆形容器中，使浅底 / 深底（页脚）呈现一致。
 * 深浅底通过 tone 控制文字色，图片本身不变形、不裁切。
 */
export interface LogoProps {
  className?: string;
  /** 展示色调：default 用于浅底，inverse 用于深底（如页脚） */
  tone?: 'default' | 'inverse';
  /** 是否显示副标题（中文名） */
  withTagline?: boolean;
  href?: string;
}

export function Logo({ className, tone = 'default', withTagline = false, href = '/' }: LogoProps) {
  const textTone = tone === 'inverse' ? 'text-surface-inverse-foreground' : 'text-foreground';
  const subTone = tone === 'inverse' ? 'text-neutral-400' : 'text-text-muted';

  return (
    <Link
      href={href}
      className={cn('flex items-center gap-2.5 rounded-sm outline-none', className)}
      aria-label={`${siteConfig.name} — ${siteConfig.nameZh}`}
    >
      <span className="inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-black/5">
        <Image
          src="/logo.webp"
          alt={`${siteConfig.name} logo`}
          width={36}
          height={36}
          priority
          className="size-9 object-contain"
        />
      </span>
      <span className="flex flex-col leading-none">
        <span className={cn('text-heading-sm font-semibold tracking-tight', textTone)}>
          {siteConfig.name}
        </span>
        {withTagline ? (
          <span className={cn('mt-1 text-caption', subTone)}>{siteConfig.nameZh}</span>
        ) : null}
      </span>
    </Link>
  );
}
