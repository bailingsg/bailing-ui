'use client';

import * as React from 'react';
import { MediaLightbox } from '@/components/media/media-lightbox';
import type { QualityRecordFile } from '@/lib/quality';
import type { Locale } from '@/i18n/config';

/**
 * RecordFileLink —— 质量记录卡片里的「查看文件」入口
 *
 * 修复（2026-10-27）：此前无论文件是图片还是 PDF，都用裸 `<a href>` 直接指向文件地址。
 * 图片类证书点击后会在**当前标签页**打开图片（浏览器原生查看器没有关闭按钮，
 * 用户只能后退），于是表现为「点开图片后关不掉」。
 *
 * 现在的行为按文件类型分流：
 *   · 图片（JPEG / PNG / WebP / AVIF 等）—— 站内灯箱展示，X / Esc / 点遮罩三种方式关闭；
 *   · 文档（PDF 等）—— 新标签页打开，关掉该标签即可，绝不覆盖当前页面。
 *
 * 之所以不给图片加 `download`：业务方的诉求是「在站内看一眼证书」，
 * 而不是把文件存到本地；要下载可在灯箱里右键另存。
 */

/** 图片判定：优先看 MIME，MIME 缺失（历史数据）时退回扩展名 */
function isImageFile(file: QualityRecordFile): boolean {
  const mime = (file.mimeType ?? '').toLowerCase();
  if (mime.startsWith('image/')) return true;
  if (mime) return false;
  return /\.(jpe?g|png|webp|avif|gif)$/i.test(file.url.split('?')[0] ?? '');
}

export interface RecordFileLinkProps {
  file: QualityRecordFile;
  /** 入口文案（中英文由调用方按当前语言传入） */
  label: string;
  /** 灯箱 alt 的兜底文案（媒体未填 altText 时使用记录标题） */
  title: string;
  locale: Locale;
}

export function RecordFileLink({ file, label, title, locale }: RecordFileLinkProps) {
  const [open, setOpen] = React.useState(false);

  const linkClassName =
    'w-fit text-left text-primary underline underline-offset-4 transition-colors hover:text-primary-hover';

  if (!isImageFile(file)) {
    return (
      <a
        href={file.url}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName}
      >
        {label}
      </a>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={linkClassName}>
        {label}
      </button>
      <MediaLightbox
        images={[{ id: file.url, url: file.url, alt: file.altText ?? title }]}
        index={open ? 0 : null}
        onIndexChange={(next) => setOpen(next !== null)}
        locale={locale}
      />
    </>
  );
}
