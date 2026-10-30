import { ArrowRight } from 'lucide-react';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LocaleLink } from '@/i18n/link';
import { trimToCompleteSentence } from '@/lib/format';
import type { Locale } from '@/i18n/config';
import type { ProductCategory } from '@/lib/products/types';

/**
 * CategoryCard —— 首页「产品分类」卡片
 *
 * 描述来自 CMS（单语言英文，各分类长短不一），所以 CTA 用 `mt-auto` 贴卡片底部：
 * 同一行卡片等高时按钮自然对齐，不会随描述行数上下浮动。
 *
 * CTA 是右下角的下划线文字链（无边框、无底色），文案随界面语言切换：
 * 中文「点此查看相关产品」/ 英文 "View related products"，不混排双语。
 *
 * 2026-10-30：从首页页面文件抽出（/dashboard2 复用同一张卡片，避免两套样式漂移）。
 */
export interface CategoryCardProps {
  category: ProductCategory;
  locale: Locale;
  /** 卡片右下角 CTA 文案（由调用方按语言传入） */
  cta: string;
}

export function CategoryCard({ category, locale, cta }: CategoryCardProps) {
  const href = `/products?category=${encodeURIComponent(category.slug)}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <LocaleLink locale={locale} href={href} className="transition-colors hover:text-primary">
            {category.name}
          </LocaleLink>
        </CardTitle>
        {/*
          描述来自 CMS，个别分类的正文在导入时被截断在 500 字（末句不完整）。
          先按 trimToCompleteSentence 收到完整句，再用 line-clamp-3 保证卡片高度一致 ——
          读者看到的是「摘要」，而不是「说到一半断掉的句子」。
        */}
        {category.description ? (
          <CardDescription className="line-clamp-3">
            {trimToCompleteSentence(category.description)}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardFooter className="mt-auto justify-end">
        <LocaleLink
          locale={locale}
          href={href}
          className="group inline-flex items-center gap-1.5 text-small font-medium text-primary underline decoration-1 underline-offset-4 transition-colors hover:text-primary-hover"
        >
          {cta}
          <ArrowRight
            aria-hidden="true"
            className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
          />
        </LocaleLink>
      </CardFooter>
    </Card>
  );
}
