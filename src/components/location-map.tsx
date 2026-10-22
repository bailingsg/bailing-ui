'use client';

import * as React from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * LocationMap —— 公司位置地图（Google Maps Embed，免费无限量）
 *
 * 为什么用 Google Maps Embed：官方文档明确 "free to use with unlimited requests"，
 * 无每日 / 每秒限额，且不需要升级付费；访客以海外买家为主，Google 地图覆盖率最好。
 *
 * 两个工程决策：
 * 1) **点击后加载（facade）**：iframe 需联网且会写 Google 第三方 Cookie。
 *    先渲染封面按钮，用户点了才插入 iframe —— 既符合欧盟 Cookie 合规预期，
 *    也给国内访客一个"打不开也不难看"的降级形态。
 * 2) **高德备用链接**：uri.amap.com/search 免费且不需要 Key，一条文字链接
 *    解决「海外用 Google、国内用高德」；不引第三方 JS、不加载瓦片。
 *
 * 坐标口径：Google 用 WGS-84，高德/百度用 GCJ-02，两者直接互换会偏几百米，
 * 因此检索一律走「地址文本」（query 参数），不硬编码坐标；需要精确到楼宇时
 * 再换成 WGS-84 坐标字符串，格式见 contactInfo.mapQuery 注释。
 *
 * 配置来源：`@/config/site` 的 contactInfo.mapQuery / mapEmbedKey。
 */

export interface LocationMapProps {
  /** Google Maps 检索词：地址文本（推荐）或 `lng,lat` 坐标 */
  query: string;
  /** Google Maps Embed API Key；留空走免 Key 的 output=embed 通道 */
  embedKey?: string;
  /** 地址展示文本（按语言取本地化写法；业务事实本身只有一种） */
  address: string;
  /** 封面按钮文案 */
  loadLabel: string;
  /** 底部提示（说明为何要点击加载） */
  hintLabel: string;
  /** 高德网页版链接（uri.amap.com/search，免费无 Key） */
  amapHref: string;
  amapLabel: string;
  /** Google 地图大图链接（新窗口打开） */
  largerMapHref: string;
  largerMapLabel: string;
  className?: string;
}

function buildEmbedSrc(query: string, embedKey: string | undefined): string {
  const encoded = encodeURIComponent(query);
  if (embedKey) {
    // 官方通道：需在 Google Cloud 限制 HTTP referrer，Embed 本身不收费
    return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(embedKey)}&q=${encoded}`;
  }
  // 免 Key 通道：Google 地图「分享 → 嵌入地图」导出的同款地址
  return `https://www.google.com/maps?q=${encoded}&output=embed`;
}

export function LocationMap({
  query,
  embedKey,
  address,
  loadLabel,
  hintLabel,
  amapHref,
  amapLabel,
  largerMapHref,
  largerMapLabel,
  className,
}: LocationMapProps) {
  const [loaded, setLoaded] = React.useState(false);
  const src = React.useMemo(() => buildEmbedSrc(query, embedKey), [query, embedKey]);

  return (
    <div
      data-slot="location-map"
      className={cn(
        'overflow-hidden rounded-lg border border-border bg-surface-elevated',
        className,
      )}
    >
      {loaded ? (
        <iframe
          title={`${loadLabel} — ${address}`}
          src={src}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="block h-64 w-full border-0 sm:h-80 lg:h-96"
        />
      ) : (
        <button
          type="button"
          aria-label={loadLabel}
          onClick={() => setLoaded(true)}
          className="group flex h-64 w-full flex-col items-center justify-center gap-3 px-6 text-center transition-colors hover:bg-accent sm:h-80 lg:h-96"
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-[var(--duration-fast)] ease-[var(--ease-standard)] group-hover:scale-105">
            <MapPin className="size-5" aria-hidden="true" />
          </span>
          <span className="text-body font-medium text-foreground">{loadLabel}</span>
          <span className="max-w-sm text-caption text-text-muted">{address}</span>
        </button>
      )}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-border px-4 py-3">
        <span className="text-caption text-text-muted">{hintLabel}</span>
        <a
          href={amapHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-caption text-primary underline underline-offset-4 transition-colors hover:text-primary-hover"
        >
          {amapLabel}
        </a>
        {largerMapHref ? (
          <a
            href={largerMapHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-caption text-primary underline underline-offset-4 transition-colors hover:text-primary-hover"
          >
            {largerMapLabel}
          </a>
        ) : null}
      </div>
    </div>
  );
}
