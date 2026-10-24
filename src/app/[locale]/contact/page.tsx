import type { Metadata } from 'next';
import { Mail, Phone } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';
import { Section, SectionHeader } from '@/components/layout/section';
import { ContentPlaceholder } from '@/components/layout/content-placeholder';
import { CtaBand } from '@/components/layout/cta-band';
import { RfqForm } from '@/components/rfq/rfq-form';
import { DirectRfqDialog } from '@/components/contacts/direct-rfq-dialog';
import { ContactChannel } from '@/components/contacts/contact-channel';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { LocationMap } from '@/components/location-map';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { resolveSeoMetadata } from '@/lib/seo/resolver';
import { toWhatsAppUrl } from '@/lib/format';
import { getProductById, getProductBySlug } from '@/lib/products';
import { getCmsPageSeo, getSiteSections } from '@/lib/site';
import { getPublicContacts } from '@/lib/contacts';
import type { RfqProductRef } from '@/lib/rfq';
import { contactInfo } from '@/config/site';
import { FaqPageSchema } from '@/components/seo/faq-schema';
import { ContentFallbackNotice } from '@/components/common/content-fallback-notice';
import { getI18n } from '@/i18n';
import { defaultLocale, isLocale, type Locale } from '@/i18n/config';
import { localizedPath } from '@/i18n/paths';

/**
 * 联系我们 /contact（中文：/zh-CN/contact）
 *
 * 结构：RFQ Form（#rfq）→ Sales Contacts → FAQ（#faq）→ Location → CTA
 *
 * 询盘表单优先展示（访客进页面即可直接填写）；原顶部的 Email / Phone / Address
 * 三张渠道卡片已移除（取值长期为占位文案，与 Sales Contacts 信息重复）。
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
 * 解析 `/contact?product={id|slug}` 带入的产品。
 *
 * 产品详情页以 **id** 拼接链接；旧链接（slug）仍兼容回落。
 * 必须容错：产品源为 `api` 且后端不可用时不能让整个 Contact 页崩溃，
 * 因此任何异常都降级为「无关联产品」，询盘仍可正常提交。
 */
async function resolveProductRef(ref: string | undefined): Promise<RfqProductRef | null> {
  if (!ref) return null;
  try {
    const product = (await getProductById(ref)) ?? (await getProductBySlug(ref));
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

  /** FAQ（流程性问答，不涉及虚构的商务条款）；与 FAQPage 结构化数据一致 */
  const faqs = Object.values(m.contact.faq);
  const nextSteps = Object.values(m.contact.nextSteps);

  /**
   * 地图与地址文案：中文写法与英文写法**并列展示**（不是翻译，是同一地点的两种写法）。
   * 当前语言写法在前，另一种语言作为次要说明在后 —— 国内外访客都能核对，
   * 也方便司机/货代直接用自己熟悉的语言导航。
   */
  const primaryAddress = isDefaultLocale ? contactInfo.addressEn : contactInfo.address;

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

      {/* 1. RFQ Form（询盘表单前置：访客进页面即可直接填写） */}
      <Section id="rfq">
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

      {/* 2. Sales Contacts（CMS 已公开展示的记录；未配置时不渲染） */}
      {publicContacts.length > 0 ? (
        <Section tone="surface">
          <SectionHeader
            eyebrow={m.contact.contactsEyebrow}
            title={m.contact.contactsTitle}
            description={m.contact.contactsDescription}
          />
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {publicContacts.map((contact) => {
              // 号码统一规范化为 https://wa.me/<国际号码>；无法规范化时回退纯文本
              // （绝不产出非法 wa.me 链接），且只有号码存在时才渲染这一行
              const whatsappHref = toWhatsAppUrl(contact.whatsapp);
              return (
                <Card
                  key={`${contact.displayName}-${contact.sortOrder}`}
                  className="relative overflow-hidden p-5 sm:p-6"
                >
                  {/* 左：姓名 + 职位 + 联系方式。右侧留出 pr 给头像占位：
                      手机单列时头像收窄到 w-32，让长邮箱仍能一行放下 */}
                  <div className="flex min-w-0 flex-1 flex-col gap-4 pr-32 sm:pr-40">
                    <div className="flex flex-col gap-1">
                      <CardTitle>{contact.displayName}</CardTitle>
                      {contact.jobTitle ? (
                        <CardDescription>{contact.jobTitle}</CardDescription>
                      ) : null}
                    </div>
                    {/* 每行统一「图标 + 内容」，图标弱化，正文保持卡片正文色 */}
                    <ul className="flex flex-col gap-2.5">
                      {/* 销售邮箱不走 mailto：改为打开「发送给某销售」站内信箱弹窗
                          （表单提交带 directEmail，直达本人且不占用询盘轮转顺位）。
                          入口文案与 WhatsApp 行对齐，不暴露邮箱地址（悬停 title 可看） */}
                      <ContactChannel icon={<Mail className="size-4" strokeWidth={1.75} />}>
                        <DirectRfqDialog
                          contact={contact}
                          locale={locale}
                          triggerLabel={m.contact.emailMe}
                        />
                      </ContactChannel>
                      {/* WhatsApp 不展示号码本身，只给「通过 WhatsApp 联系我」入口；
                          号码无法规范化（脏数据）时才回退展示原始号码，避免丢信息 */}
                      {whatsappHref ? (
                        <ContactChannel icon={<WhatsAppIcon className="size-4" />}>
                          <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline underline-offset-4 transition-colors hover:text-primary-hover"
                          >
                            {m.contact.chatOnWhatsApp}
                          </a>
                        </ContactChannel>
                      ) : contact.whatsapp ? (
                        <ContactChannel icon={<WhatsAppIcon className="size-4" />}>
                          <span className="text-text-secondary">
                            WhatsApp: {contact.whatsapp}
                          </span>
                        </ContactChannel>
                      ) : null}
                      {contact.phone ? (
                        <ContactChannel icon={<Phone className="size-4" strokeWidth={1.75} />}>
                          <a
                            href={`tel:${contact.phone}`}
                            className="text-primary underline underline-offset-4 transition-colors hover:text-primary-hover"
                          >
                            {contact.phone}
                          </a>
                        </ContactChannel>
                      ) : null}
                    </ul>
                  </div>

                  {/* 右：头像。纵向贴满整张卡片（inset-y-0），右侧与卡片右边界齐平，
                      由 Card 自带 overflow-hidden 保证不溢出。
                      不再加羽化遮罩——头像自然延伸至卡片右半区，与左侧文字互不干扰。
                      头像区左侧为卡片内部接缝，四角必须保持直角（不加 rounded-l-*），
                      否则会在卡片内壁露出一圈圆角，与卡片外框错位。 */}
                  {contact.avatarUrl ? (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 right-0 w-32 overflow-hidden border border-r-0 border-border bg-surface sm:w-36"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- 前台员工头像走动态图床 URL，无需 next/image 优化 */}
                      <img
                        src={contact.avatarUrl}
                        alt={contact.displayName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}
                </Card>
              );
            })}
          </div>
          <ContentFallbackNotice locale={locale} variant="subtle" className="mt-6" />
        </Section>
      ) : null}

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

      {/* 4. Company Location */}
      <Section tone="surface">
        <SectionHeader
          eyebrow={m.contact.locationEyebrow}
          title={m.contact.locationTitle}
          description={m.contact.locationDescription}
        />
        <div className="mt-8">
          {contactInfo.mapQuery ? (
            /* Google Maps Embed（免费无限量）+ 高德备用链接；见 location-map.tsx 头部说明 */
            <LocationMap
              query={contactInfo.mapQuery}
              embedKey={contactInfo.mapEmbedKey || undefined}
              address={primaryAddress}
              loadLabel={m.contact.locationMapLoad}
              hintLabel={m.contact.locationMapHint}
              amapHref={`https://uri.amap.com/search?keyword=${encodeURIComponent(contactInfo.mapQueryZh)}&city=370700`}
              amapLabel={m.contact.locationMapAmap}
              largerMapHref={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactInfo.mapQuery)}`}
              largerMapLabel={m.contact.locationMapLarger}
            />
          ) : (
            <ContentPlaceholder
              locale={locale}
              title={m.contact.locationPlaceholderTitle}
              note={m.contact.locationPlaceholderNote}
              minHeightClass="min-h-64"
            />
          )}
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
