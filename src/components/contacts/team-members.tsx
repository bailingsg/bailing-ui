import Image from 'next/image';
import type { PublicContact } from '@/lib/contacts';

/**
 * TeamMembers —— 「订单背后的人」头像墙（无灯箱）
 *
 * 数据来自 `/api/v1/public/contacts?leadOnly=1`：可接单（账号启用 + 勾选「询盘联系人」）
 * 且勾选了「公开展示」的员工。因此后台改头像 / 改姓名 / 改职位后，本区块立即跟随，
 * 不再依赖关于页那份静态的 team 图片登记表。
 *
 * 刻意**不做**点击放大（2026-10-27 需求）：这里展示的是「人」而不是「可细看的作品图」，
 * 头像本身只有几百像素，放大后只会看到马赛克；同时去掉灯箱后整块区域不再有按钮，
 * 键盘焦点顺序也不会插进一串无意义的「放大」按钮。
 *
 * 无头像时回退姓名首字母 —— 与联系页「无头像不留空洞」的处理保持一致，
 * 但这里用大字重色块而不是灰底占位图，避免整墙出现灰方块。
 */
export interface TeamMembersProps {
  members: PublicContact[];
  /** 无成员时的说明文案（不伪造人名 / 不沿用旧素材） */
  emptyNotice?: string;
}

/** 姓名首字：中文取第一个字，英文取首字母大写（"Mandy Yang" → "M"） */
function initialOf(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  return trimmed.slice(0, 1).toUpperCase();
}

export function TeamMembers({ members, emptyNotice }: TeamMembersProps) {
  if (members.length === 0) {
    return emptyNotice ? <p className="text-small text-text-muted">{emptyNotice}</p> : null;
  }

  return (
    <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {members.map((member, index) => (
        <li
          key={`${member.displayName}-${member.sortOrder}-${index}`}
          className="flex flex-col gap-3"
        >
          {/* 头像槽：1:1 裁切。不加 rounded-full —— 圆头像在 4 列网格里会显得过小，
              与站点其余卡片的直角边框语言也更一致 */}
          <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-surface-elevated">
            {member.avatarUrl ? (
              <Image
                src={member.avatarUrl}
                alt={member.displayName}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                loading={index < 4 ? 'eager' : 'lazy'}
                className="object-cover"
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex size-full items-center justify-center bg-surface text-[clamp(1.75rem,4vw,2.5rem)] font-semibold text-text-muted"
              >
                {initialOf(member.displayName)}
              </span>
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="truncate text-body font-medium text-foreground">{member.displayName}</p>
            {member.jobTitle ? (
              <p className="text-small text-text-secondary [overflow-wrap:anywhere]">
                {member.jobTitle}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
