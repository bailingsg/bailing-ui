/**
 * 员工联系方式（公开契约，Phase 4.7）
 *
 * 与后端 /api/v1/public/contacts 对齐（PublicContactDto）。
 *
 * 数据诚实与隐私约束（后端强制）：
 *   · 只包含 showOnSite=true 且员工账号启用中的记录
 *   · 绝不含内部备注（internalNote）、账号登录邮箱（loginEmail）、adminUserId
 *   · 前台按 sortOrder 展示；未配置时页面回退站点级联系方式配置
 */
export interface PublicContact {
  displayName: string;
  jobTitle: string | null;
  displayEmail: string | null;
  whatsapp: string | null;
  sortOrder: number;
}
