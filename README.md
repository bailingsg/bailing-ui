# bailing-ui — Bailing Wooden B2B 主站前端

百灵木业 B2B 独立站的前台站点（面向海外采购商）：Next.js 15 App Router + TypeScript + Tailwind CSS + shadcn/ui。

配套仓库：后端 [`bailing-backend`](../bailing-backend) · 管理后台 [`bailing-admin`](../bailing-admin)（Phase 2 启动）。

## 技术栈

- Next.js 15（App Router，优先 Server Components）
- TypeScript（strict）
- Tailwind CSS v4 + shadcn/ui（new-york 风格）
- ESLint（next/core-web-vitals + next/typescript）

## 目录结构

```
bailing-ui/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # 根布局 + Metadata（SEO 基础）
│   │   ├── page.tsx             # 首页（Phase 1 状态页 + 后端连接状态）
│   │   └── globals.css          # Tailwind v4 + shadcn 主题变量
│   ├── components/
│   │   ├── site-header.tsx      # 站点导航骨架
│   │   ├── site-footer.tsx      # 页脚
│   │   ├── backend-status-card.tsx  # 后端连接状态卡片
│   │   └── ui/                  # shadcn/ui 组件（button、badge）
│   └── lib/utils.ts             # cn() 工具
├── components.json              # shadcn/ui 配置
└── next.config.ts
```

## 快速开始（本地开发）

前置：Node.js ≥ 20；建议先启动后端与数据库（见 `bailing-backend/README.md`）。

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env

# 3. 启动开发服务器
npm run dev
```

访问：<http://localhost:3000>（或 <http://127.0.0.1:3000>）。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 开发模式（热更新） |
| `npm run build` / `npm run start` | 生产构建 / 运行 |
| `npm run lint` / `npm run typecheck` | ESLint / tsc |
| `npx shadcn@latest add <组件>` | 添加 shadcn/ui 组件（已验证可用） |

## 环境变量

见 [.env.example](./.env.example)：

- `NEXT_PUBLIC_API_BASE_URL`：后端 API 基地址，首页在服务端请求它展示真实连接状态。
- 安全要求：`NEXT_PUBLIC_` 前缀的变量会进入浏览器包，**禁止**放置数据库密码、邮箱密码、COS 密钥等敏感信息。

## 当前状态（Phase 1）

首页为项目初始化状态页：展示项目名称、Phase 1 说明、后端连接状态（含数据库状态）。不含虚构产品、客户评价或企业数据；完整产品分类页、详情页与询盘表单在 Phase 2 开发。
