import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardMedia,
  CardTitle,
} from '@/components/ui/card';
import { OptimizedImage } from '@/components/common/optimized-image';
import { Badge } from '@/components/ui/badge';
import { formatDate, toDateTimeAttribute } from '@/lib/format';
import { LocaleLink } from '@/i18n/link';
import { getI18n } from '@/i18n';
import { defaultLocale, type Locale } from '@/i18n/config';
import type { BlogPostSummary } from '@/lib/blog';

/**
 * BlogCard —— 文章卡片
 *
 * 结构：Cover Image · Category · Date · Title · Excerpt · Read link
 * 复用设计系统的 Card / Badge / OptimizedImage，不新建基础组件。
 *
 * 分类徽章由调用方传入 `categoryLabel`（从分类清单取显示名，组件不写死映射）；
 * 未传时按 `post.category`（slug）兜底，再缺则整块徽章不渲染。
 *
 * 无封面图时由 OptimizedImage 渲染统一占位（不伪造图片素材）。
 */
export interface BlogCardProps {
  post: BlogPostSummary;
  /** 分类显示名（由调用方从分类清单取，组件不写死分类映射） */
  categoryLabel?: string;
  className?: string;
  /** 当前语言（决定日期格式、链接前缀与文案） */
  locale?: Locale;
}

export function BlogCard({ post, categoryLabel, className, locale = defaultLocale }: BlogCardProps) {
  const { t } = getI18n(locale);
  const published = formatDate(post.publishedAt, locale);
  const badge = categoryLabel ?? post.category;

  return (
    <Card
      className={cn(
        'group relative h-full hover:border-border-strong hover:shadow-md',
        className,
      )}
    >
      <CardMedia>
        <OptimizedImage
          src={post.coverImage}
          alt={post.coverImageAlt}
          locale={locale}
          aspectRatio="16/9"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="transition-transform duration-[var(--duration-slow)] ease-[var(--ease-standard)] group-hover:scale-[1.02]"
        />
      </CardMedia>

      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {badge ? <Badge variant="application">{badge}</Badge> : null}
          {published ? (
            <time
              dateTime={toDateTimeAttribute(post.publishedAt)}
              className="text-caption text-text-muted"
            >
              {published}
            </time>
          ) : null}
        </div>
        <CardTitle className="text-balance">
          <LocaleLink
            locale={locale}
            href={`/blog/${post.slug}`}
            className="outline-none after:absolute after:inset-0 after:content-['']"
          >
            {post.title}
          </LocaleLink>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <CardDescription className="text-pretty">{post.excerpt}</CardDescription>
      </CardContent>

      <CardFooter className="justify-between">
        <span className="text-caption text-text-muted">
          {t('common.minRead', { minutes: post.readingMinutes })}
        </span>
        <span className="text-caption font-semibold tracking-wider text-primary uppercase">
          {t('common.readArticle')}
        </span>
      </CardFooter>
    </Card>
  );
}
