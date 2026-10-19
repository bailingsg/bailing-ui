import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/page-hero';
import { Section, SectionHeader } from '@/components/layout/section';
import { ContentPlaceholder } from '@/components/layout/content-placeholder';
import { CtaBand } from '@/components/layout/cta-band';
import { RfqForm } from '@/components/rfq/rfq-form';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { resolveSeoMetadata } from '@/lib/seo/resolver';
import { toWhatsAppUrl } from '@/lib/format';
import { getProductBySlug } from '@/lib/products';
import { getCmsPageSeo, getSiteSections } from '@/lib/site';
import { getPublicContacts } from '@/lib/contacts';
import type { RfqProductRef } from '@/lib/rfq';
import { contactInfo, siteConfig } from '@/config/site';
import { FaqPageSchema } from '@/components/seo/faq-schema';
import { ContentFallbackNotice } from '@/components/common/content-fallback-notice';
import { getI18n } from '@/i18n';
import { defaultLocale, isLocale, type Locale } from '@/i18n/config';
import { localizedPath } from '@/i18n/paths';

/**
 * 联系我们 /contact（中文：/zh-CN/contact）
 *
 * 结构：Contact Information → RFQ Form（#rfq）→ FAQ（#faq）→ Location → CTA
 *
 * 询盘表单为真实提交（POST /api/v1/rfq）；产品详情页的 Request Quote 会带上
 * `?product={slug}#rfq`，此处自动识别并显示 "Interested Product"。
 *
 * 语言边界（重要）：
 *   · 页面文案、FAQ 问答、表单标签 / 占位符 / 校验提示随语言切换；
 *   · **提交字段与 API 契约不变**（语言切换不影响询盘链路）；
 *   · 公司地址 / 电话等联系信息属业务事实，只有一种写法，按原样展示；
 *   · CMS 的 hero 区与员工联系人为单语言内容，中文界面下按原文展示并提示。
 */

interface ContactPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ product?: string | string[] }>;
}

function resolveLocale(rawLocale: string): Locale {
  return isLocale(rawLocale) ? rawLocale : defaultLocale;
}

/** 联系页 metadata：CMS 的 contact.hero 优先，缺失时回退程序默认值 */
export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const { m } = getI18n(locale);

  // 中文页不使用 CMS（单语言）的标题 / 描述作为 SEO 元数据
  if (locale !== defaultLocale) {
    return resolveSeoMetadata({
      title: m.contact.metaTitle,
      description: m.contact.metaDescription,
      path: '/contact',
      locale,
    });
  }

  const seo = await getCmsPageSeo('CONTACT', 'contact.hero');
  return resolveSeoMetadata({
    title: seo.title ?? m.contact.metaTitle,
    description: seo.description ?? m.contact.metaDescription,
    path: '/contact',
    locale,
    ...(seo.ogImage ? { ogImage: seo.ogImage, ogImageAlt: seo.ogImageAlt } : {}),
  });
}

/**
 * 解析 `/contact?product={slug}` 带入的产品。
 *
 * 必须容错：产品源为 `api` 且后端不可用时不能让整个 Contact 页崩溃，
 * 因此任何异常都降级为「无关联产品」，询盘仍可正常提交。
 */
async function resolveProductRef(slug: string | undefined): Promise<RfqProductRef | null> {
  if (!slug) return null;
  try {
    const product = await getProductBySlug(slug);
    if (!product) return null;
    return { id: product.id, name: product.name, slug: product.slug };
  } catch {
    return null;
  }
}

export default async function ContactPage({ params, searchParams }: ContactPageProps) {
  const [{ locale: rawLocale }, query] = await Promise.all([params, searchParams]);
  const locale = resolveLocale(rawLocale);
  const { t, m, isDefaultLocale } = getI18n(locale);

  const rawSlug = query.product;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

  const [product, sections, publicContacts] = await Promise.all([
    resolveProductRef(slug),
    // demo 模式返回空数组（不发请求）
    getSiteSections('CONTACT'),
    getPublicContacts(),
  ]);
  // 中文页不使用 CMS 的 hero 文案（CMS 只有英文一套），改用内置中文文案
  const heroSection = isDefaultLocale
    ? sections.find((section) => section.sectionKey === 'contact.hero') ?? null
    : null;

  /** 联系渠道（标题 / 说明本地化，取值来自站点配置，未确认前显示占位文案） */
  const channels: { title: string; value: string; hint: string }[] = [
    { title: m.contact.channelEmail, value: contactInfo.email, hint: m.contact.channelEmailHint },
    { title: m.contact.channelPhone, value: contactInfo.phone, hint: m.contact.channelPhoneHint },
    {
      title: m.contact.channelAddress,
      value: contactInfo.address,
      hint: m.contact.channelAddressHint,
    },
  ];

  /** FAQ（流程性问答，不涉及虚构的商务条款）；与 FAQPage 结构化数据一致 */
  const faqs = Object.values(m.contact.faq);
  const nextSteps = Object.values(m.contact.nextSteps);

  return (
    <>
      {/* FAQPage 结构化数据（与页面可见 FAQ 一致，不编造问答） */}
      <FaqPageSchema
        items={faqs}
        path={localizedPath('/contact', locale)}
        locale={locale}
      />
      <PageHero
        eyebrow={heroSection?.eyebrow ?? m.contact.eyebrow}
        title={heroSection?.title ?? m.contact.title}
        {...(isDefaultLocale ? { titleZh: m.contact.titleZh } : {})}
        description={heroSection?.subtitle ?? heroSection?.body ?? m.contact.description}
      />

      {/* 1. Contact Information */}
      <Section size="sm">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {channels.map((channel) => (
            <Card key={channel.title}>
              <CardHeader>
                <CardTitle>{channel.title}</CardTitle>
                <CardDescription>
                  <span className={channel.value ? 'text-foreground' : 'text-text-muted'}>
                    {channel.value ||
                      (isDefaultLocale ? siteConfig.placeholderText : siteConfig.placeholderTextZh)}
                  </span>
                </CardDescription>
                <p className="text-caption text-text-muted">{channel.hint}</p>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* 员工联系方式（CMS 已公开展示的记录；未配置时不渲染） */}
        {publicContacts.length > 0 ? (
          <div className="mt-10">
            <SectionHeader
              eyebrow={m.contact.contactsEyebrow}
              title={m.contact.contactsTitle}
              description={m.contact.contactsDescription}
            />
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {publicContacts.map((contact) => (
                <Card key={`${contact.displayName}-${contact.sortOrder}`}>
                  <CardHeader>
                    <CardTitle>{contact.displayName}</CardTitle>
                    <CardDescription>{contact.jobTitle}</CardDescription>
                  </CardHeader>
                  <div className="flex flex-col gap-1 px-6 pb-6 text-small text-text-secondary">
                    {contact.displayEmail ? (
                      <a
                        href={`mailto:${contact.displayEmail}`}
                        className="text-primary underline underline-offset-4 transition-colors hover:text-primary-hover"
                      >
                        {contact.displayEmail}
                      </a>
                    ) : null}
                    {(() => {
                      // 号码统一规范化为 https://wa.me/<国际号码>；
                      // 无法规范化时回退纯文本（绝不产出非法 wa.me 链接）
                      const waUrl = toWhatsAppUrl(contact.whatsapp);
                      if (!contact.whatsapp) return null;
                      return waUrl ? (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline underline-offset-4 transition-colors hover:text-primary-hover"
                        >
                          WhatsApp
                        </a>
                      ) : (
                        <span>WhatsApp: {contact.whatsapp}</span>
                      );
                    })()}
                  </div>
                </Card>
              ))}
            </div>
            <ContentFallbackNotice locale={locale} variant="subtle" />
          </div>
        ) : null}
      </Section>

      {/* 2. RFQ Form */}
      <Section id="rfq" tone="surface">
        <SectionHeader
          eyebrow={m.contact.rfqEyebrow}
          title={m.contact.rfqTitle}
          description={m.contact.rfqDescription}
        />
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* locale 只影响文案；提交字段与 API 契约恒定不变 */}
            <RfqForm product={product} locale={locale} />
          </div>
          <aside className="flex flex-col gap-4">
            <h3 className="text-heading-sm">{m.contact.nextTitle}</h3>
            <ol className="flex flex-col gap-3">
              {nextSteps.map((step, index) => (
                <li key={step} className="flex gap-3 text-small text-text-secondary">
                  <span className="font-semibold text-primary">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <p className="rounded-md border border-border bg-surface-elevated px-4 py-3 text-caption text-text-muted">
              {m.contact.privacyNote}
            </p>
          </aside>
        </div>
      </Section>

      {/* 3. FAQ */}
      <Section id="faq">
        <SectionHeader
          eyebrow={m.contact.faqEyebrow}
          title={m.contact.faqTitle}
          description={m.contact.faqDescription}
        />
        <div className="mt-8 flex max-w-3xl flex-col divide-y divide-border rounded-lg border border-border bg-surface-elevated">
          {faqs.map((faq) => (
            <details key={faq.question} className="group px-5 py-4 sm:px-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-body font-medium text-foreground">
                {faq.question}
                <span
                  aria-hidden="true"
                  className="text-text-muted transition-transform duration-[var(--duration-fast)] group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-small text-text-secondary">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* 4. Company Location（占位） */}
      <Section tone="surface">
        <SectionHeader
          eyebrow={m.contact.locationEyebrow}
          title={m.contact.locationTitle}
          description={m.contact.locationDescription}
        />
        <div className="mt-8">
          <ContentPlaceholder
            locale={locale}
            title={m.contact.locationPlaceholderTitle}
            note={m.contact.locationPlaceholderNote}
            minHeightClass="min-h-64"
          />
        </div>
      </Section>

      {/* 5. CTA */}
      <CtaBand
        locale={locale}
        title={m.contact.ctaTitle}
        description={m.contact.ctaDescription}
        primaryLabel={t('common.requestQuote')}
        secondaryHref="/products"
        secondaryLabel={t('common.viewProducts')}
      />
    </>
  );
}
