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

/** 联系页 metadata：CMS 的 contact.hero 优先，缺失时回退程序默认值 */
export async function generateMetadata(): Promise<Metadata> {
  const seo = await getCmsPageSeo('CONTACT', 'contact.hero');
  return resolveSeoMetadata({
    title: seo.title ?? 'Contact',
    description:
      seo.description ??
      'Contact Bailing Wooden for quotations and product enquiries. Send your specification or drawing and our export team will respond.',
    path: '/contact',
    ...(seo.ogImage ? { ogImage: seo.ogImage, ogImageAlt: seo.ogImageAlt } : {}),
  });
}

/** 联系渠道（未确认前显示占位文案） */
const channels: { title: string; value: string; hint: string }[] = [
  { title: 'Email', value: contactInfo.email, hint: 'Sales & general enquiries' },
  { title: 'Phone', value: contactInfo.phone, hint: 'Business hours only' },
  { title: 'Address', value: contactInfo.address, hint: 'Factory & office' },
];

/** FAQ（流程性问答，不涉及虚构的商务条款） */
const faqs: { question: string; answer: string }[] = [
  {
    question: 'How do I request a quotation?',
    answer:
      'Send your specification or drawing through the form on this page. Our export team will review it and reply with a quotation.',
  },
  {
    question: 'Can you manufacture to my drawing?',
    answer:
      'OEM and ODM projects are supported. Share your drawing or sample so the specification can be evaluated.',
  },
  {
    question: 'What are your shipping terms?',
    answer:
      'Shipping terms are confirmed per order. Please include your destination port in your enquiry so we can advise accordingly.',
  },
  {
    question: 'Do you provide samples?',
    answer:
      'Sample arrangements are confirmed case by case. Mention your requirement in the enquiry and we will advise on the available options.',
  },
];

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

/**
 * 联系我们 —— Contact Information → RFQ Form（#rfq）→ FAQ（#faq）→ Location → CTA
 *
 * 询盘表单为真实提交（POST /api/v1/rfq）；产品详情页的 Request Quote 会带上
 * `?product={slug}#rfq`，此处自动识别并显示 "Interested Product"。
 */
export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawSlug = params.product;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
  const [product, sections, publicContacts] = await Promise.all([
    resolveProductRef(slug),
    // demo 模式返回空数组（不发请求）
    getSiteSections('CONTACT'),
    getPublicContacts(),
  ]);
  const heroSection = sections.find((section) => section.sectionKey === 'contact.hero') ?? null;

  return (
    <>
      {/* FAQPage 结构化数据（与页面可见 FAQ 一致，不编造问答） */}
      <FaqPageSchema items={faqs} path="/contact" />
      <PageHero
        eyebrow={heroSection?.eyebrow ?? 'Contact'}
        title={heroSection?.title ?? 'Contact Us'}
        titleZh="联系我们"
        description={
          heroSection?.subtitle ??
          heroSection?.body ??
          'Send us your specification or drawing and our export team will get back to you. Verified contact details will be published here.'
        }
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
                    {channel.value || siteConfig.placeholderText}
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
              eyebrow="Sales Contacts"
              title="Who you will be talking to"
              description="Published sales contacts for quotations and order follow-up."
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
          </div>
        ) : null}
      </Section>

      {/* 2. RFQ Form */}
      <Section id="rfq" tone="surface">
        <SectionHeader
          eyebrow="Request for Quotation"
          title="Send an enquiry"
          description="Fill in the form below with your requirement. Our export team reviews every enquiry and replies with a quotation."
        />
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RfqForm product={product} />
          </div>
          <aside className="flex flex-col gap-4">
            <h3 className="text-heading-sm">What happens next</h3>
            <ol className="flex flex-col gap-3">
              {[
                'We review your specification or drawing.',
                'Our team confirms feasibility and lead time.',
                'You receive a formal quotation for review.',
              ].map((step, index) => (
                <li key={step} className="flex gap-3 text-small text-text-secondary">
                  <span className="font-semibold text-primary">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <p className="rounded-md border border-border bg-surface-elevated px-4 py-3 text-caption text-text-muted">
              Your information is used only to respond to this enquiry.
            </p>
          </aside>
        </div>
      </Section>

      {/* 3. FAQ */}
      <Section id="faq">
        <SectionHeader
          eyebrow="FAQ"
          title="Frequently asked questions"
          description="Answers to common questions about enquiries, production and shipping."
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
          eyebrow="Location"
          title="Find us"
          description="An interactive map will be embedded here once the address is confirmed."
        />
        <div className="mt-8">
          <ContentPlaceholder
            title="Map placeholder"
            note="Address pending confirmation"
            minHeightClass="min-h-64"
          />
        </div>
      </Section>

      {/* 5. CTA */}
      <CtaBand
        title="Ready to discuss your project?"
        description="Send your specification or drawing — our export team will review it and respond with a quotation."
        secondaryHref="/products"
        secondaryLabel="View Products"
      />
    </>
  );
}
