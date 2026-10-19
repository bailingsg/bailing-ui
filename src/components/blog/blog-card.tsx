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
import { Badge } from '@/components/ui/badge';
import { OptimizedImage } from '@/components/common/optimized-image';
import { formatDate, toDateTimeAttribute } from '@/lib/format';
import { LocaleLink } from '@/i18n/link';
import { getI18n } from '@/i18n';
import { defaultLocale, type Locale } from '@/i18n/config';
import type { BlogPostSummary } from '@/lib/blog';

/**
 * BlogCard —— 文章卡片
 *
 * 结构：Cover Image · Category · Title · Excerpt · Date · Read link
 * 复用设计系统的 Card / Badge / OptimizedImage，不新建基础组件。
 *
 * 无封面图时由 OptimizedImage 渲染统一占位（不伪造图片素材）。
 */
export interface BlogCardProps {
  post: BlogPostSummary;
  /** 分类中文名（由调用方从分类清单取，组件不写死分类映射） */
  categoryLabel?: string;
  className?: string;
  /** 当前语言（决定日期格式、链接前缀与文案） */
  locale?: Locale;
}

export function BlogCard({ post, categoryLabel, className, locale = defaultLocale }: BlogCardProps) {
  const { t } = getI18n(locale);
  const published = formatDate(post.publishedAt, locale);

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
          <Badge variant="application">{categoryLabel ?? post.category}</Badge>
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
