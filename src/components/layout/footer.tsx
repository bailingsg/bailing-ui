import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Container } from '@/components/layout/container';
import { Logo } from '@/components/common/logo';
import { certificates, contactInfo, siteConfig, socialLinks } from '@/config/site';
import type { PublicNavItem } from '@/lib/site';

/**
 * Footer —— 站点页脚
 *
 * 结构：品牌栏 + 站点导航栏（CMS 驱动，Phase 4.7）+ 联系信息栏。
 *
 * 导航链接来自后端公开 API（/public/navigation?location=FOOTER），
 * 由服务端获取后经 props 传入；链接在 CMS 写入时已做安全校验
 * （仅站内相对路径 / https / mailto / tel），新窗口项自动补 rel。
 *
 * 联系信息与证书在业务方确认前显示"待补充"，不伪造任何企业数据。
 */
function ContactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-caption tracking-wider text-neutral-400 uppercase">{label}</dt>
      <dd className={cn('text-small', value ? 'text-surface-inverse-foreground' : 'text-neutral-500')}>
        {value || siteConfig.placeholderText}
      </dd>
    </div>
  );
}

export function Footer({ items }: { items: PublicNavItem[] }) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface-inverse text-surface-inverse-foreground">
      <Container>
        <div className="grid grid-cols-1 gap-10 py-section-sm sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* 品牌栏 */}
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-4">
            <Logo tone="inverse" withTagline />
            <p className="max-w-sm text-small text-neutral-400">{siteConfig.description}</p>
            <p className="text-caption text-neutral-500">
              {siteConfig.tagline} · {siteConfig.taglineZh}
            </p>
          </div>

          {/* 站点导航栏（CMS 驱动，双列排布保持信息密度） */}
          <nav
            aria-label="站点导航"
            className="flex flex-col gap-3 sm:col-span-2 lg:col-span-4"
          >
            <h2 className="text-small font-semibold text-surface-inverse-foreground">
              Sitemap
              <span className="ml-1.5 text-caption font-normal text-neutral-500">站点导航</span>
            </h2>
            {items.length > 0 ? (
              <ul className="columns-1 gap-6 sm:columns-2">
                {items.map((item) => (
                  <li key={item.id} className="break-inside-avoid">
                    <Link
                      href={item.url}
                      target={item.openInNewTab ? '_blank' : undefined}
                      rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                      className="text-small text-neutral-400 transition-colors duration-[var(--duration-fast)] hover:text-surface-inverse-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-small text-neutral-500">{siteConfig.placeholderText}</span>
            )}
          </nav>

          {/* 联系信息栏 */}
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-4">
            <h2 className="text-small font-semibold text-surface-inverse-foreground">
              Contact
              <span className="ml-1.5 text-caption font-normal text-neutral-500">联系</span>
            </h2>
            <dl className="flex flex-col gap-3">
              <ContactRow label="Email" value={contactInfo.email} />
              <ContactRow label="Phone" value={contactInfo.phone} />
              <ContactRow label="Address" value={contactInfo.address} />
            </dl>

            <div className="flex flex-col gap-1.5">
              <span className="text-caption tracking-wider text-neutral-400 uppercase">
                Certificates
              </span>
              {certificates.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {certificates.map((item) => (
                    <li key={item} className="text-small text-surface-inverse-foreground">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-small text-neutral-500">{siteConfig.placeholderText}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-caption tracking-wider text-neutral-400 uppercase">Social</span>
              {socialLinks.length > 0 ? (
                <ul className="flex flex-wrap gap-3">
                  {socialLinks.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className="text-small text-neutral-400 transition-colors hover:text-surface-inverse-foreground"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-small text-neutral-500">{siteConfig.placeholderText}</span>
              )}
            </div>
          </div>
        </div>

        {/* 版权栏 */}
        <div className="flex flex-col gap-2 border-t border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-caption text-neutral-500">
            © {year} {siteConfig.name} ({siteConfig.nameZh}). All rights reserved.
          </p>
          <p className="text-caption text-neutral-500">
            B2B Export Supplier · {siteConfig.tagline}
          </p>
        </div>
      </Container>
    </footer>
  );
}
