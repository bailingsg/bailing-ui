'use client';

import * as React from 'react';
import { RfqForm, type RfqRecipient } from '@/components/rfq/rfq-form';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getI18n } from '@/i18n';
import type { Locale } from '@/i18n/config';
import type { PublicContact } from '@/lib/contacts';

/**
 * DirectRfqDialog —— 「发送给某销售」站内信箱弹窗
 *
 * 场景：Sales Contacts 卡片里的销售员邮箱不再是 mailto 外链，而是打开本弹窗，
 * 复用同一套 RFQ 表单提交到 POST /api/v1/rfq（带 directEmail）。
 *
 * 与公共询盘表单的差异只在**收件人**：
 *   · 标题为「Send to <销售姓名>」，表单字段 / 校验 / 回执完全一致；
 *   · 提交后后端直接把询盘归属该销售员并只通知其站内信箱，
 *     **不占用询盘轮转顺位、不计入倾斜计划进度**（见后端 resolveDirectRecipient）。
 */

export interface DirectRfqDialogProps {
  /** 卡片对应的公开联系人（仅 showOnSite 记录会出现在页面） */
  contact: PublicContact;
  locale: Locale;
  /**
   * 触发入口的显示文案。传入时用行动文案（如「通过邮件联系我」）替代邮箱地址，
   * 与卡片里 WhatsApp 行保持一致；不传则回退显示邮箱本身。
   * 无论哪种，邮箱地址都会挂在 title 上，鼠标悬停仍可看到。
   */
  triggerLabel?: React.ReactNode;
}

/**
 * 邮箱文本的软换行点。
 *
 * 员工卡片左侧文字区被头像挤得很窄（约 180px），25 个字符的邮箱必然换行。
 * 浏览器默认会在任意字符处硬断（`bailing12@bailingwood` / `s.com`），
 * 这里在 `@` 之后和域名的 `.` 之后插入 <wbr>（零宽换行机会），
 * 让断行落在语义边界上：`bailing12@` / `bailingwoods.com`。
 *
 * <wbr> 不产生字符、不影响复制与读屏，href 与提交字段仍是完整地址。
 */
function BreakableEmail({ email }: { email: string }) {
  const at = email.lastIndexOf('@');
  if (at <= 0) return <>{email}</>;

  const local = email.slice(0, at);
  const labels = email.slice(at + 1).split('.');

  return (
    <>
      {local}@<wbr />
      {labels.map((label, index) => (
        <React.Fragment key={`${label}-${index}`}>
          {label}
          {index < labels.length - 1 ? (
            <>
              .<wbr />
            </>
          ) : null}
        </React.Fragment>
      ))}
    </>
  );
}

export function DirectRfqDialog({ contact, locale, triggerLabel }: DirectRfqDialogProps) {
  const { m, t } = getI18n(locale);
  const email = contact.displayEmail;

  // 无对外邮箱时退回纯文本（不渲染可点击入口，避免点了没反应）
  if (!email) {
    return <span className="text-small text-text-muted">{t('contact.noPublicEmail')}</span>;
  }

  const recipient: RfqRecipient = {
    displayName: contact.displayName,
    displayEmail: email,
  };

  return (
    <Dialog>
      <DialogTrigger
        // title 保留邮箱原文：入口文案不再暴露地址，但仍可悬停查看
        title={email}
        className={[
          'w-fit text-left text-small text-primary underline underline-offset-4',
          'transition-colors hover:text-primary-hover',
        ].join(' ')}
      >
        {triggerLabel ?? <BreakableEmail email={email} />}
      </DialogTrigger>
      <DialogContent aria-label={t('contact.directSendTitle', { name: contact.displayName })}>
        <DialogHeader>
          <DialogTitle>{t('contact.directSendTitle', { name: contact.displayName })}</DialogTitle>
          <DialogDescription>{m.contact.directRfqDescription}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          {/* 弹窗内不复用 ?product= 关联产品：这是找具体某人的私信，不是针对某个产品的询盘 */}
          <RfqForm locale={locale} recipient={recipient} />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
