/**
 * 员工联系方式（公开契约，Phase 4.7）
 *
 * 与后端 /api/v1/public/contacts 对齐（PublicContactDto）。
 *
 * 数据诚实与隐私约束（后端强制）：
 *   · 只包含 showOnSite=true 且员工账号启用中的记录
 *   · 绝不含内部备注（internalNote）、账号登录邮箱（loginEmail）、adminUserId、avatarKey
 *   · 前台按 sortOrder 展示；未配置时页面回退站点级联系方式配置
 */
export interface PublicContact {
  displayName: string;
  jobTitle: string | null;
  displayEmail: string | null;
  whatsapp: string | null;
  /** 对外展示手机号（可直接拨打；与 whatsapp 相互独立） */
  phone: string | null;
  /** 头像访问地址；无头像时 null，前台回退姓名首字母 */
  avatarUrl: string | null;
  sortOrder: number;
}
