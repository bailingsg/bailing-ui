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
}

export function DirectRfqDialog({ contact, locale }: DirectRfqDialogProps) {
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
        className={[
          'w-fit text-left text-small text-primary underline underline-offset-4',
          'transition-colors hover:text-primary-hover',
        ].join(' ')}
      >
        {email}
      </DialogTrigger>
      <DialogContent aria-label={t('contact.directSendTitle', { name: contact.displayName })}>
        <DialogHeader>
          <DialogTitle>{t('contact.directSendTitle', { name: contact.displayName })}</DialogTitle>
          <DialogDescription>{m.contact.rfqDescription}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          {/* 弹窗内不复用 ?product= 关联产品：这是找具体某人的私信，不是针对某个产品的询盘 */}
          <RfqForm locale={locale} recipient={recipient} />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
