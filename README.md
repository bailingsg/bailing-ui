# bailing-ui — Bailing Wooden B2B 主站前端

百灵木业 B2B 独立站的前台站点（面向海外采购商）：Next.js 15 App Router + TypeScript + Tailwind CSS + shadcn/ui。

配套仓库：后端 [`bailing-backend`](../bailing-backend) · 管理后台 [`bailing-admin`](../bailing-admin)。

三仓库本地联调规范（端口、环境变量、启动顺序、排查）见共享工作区文档：[`docs/LOCAL-DEV-SETUP.md`](../docs/LOCAL-DEV-SETUP.md)。

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
│   │   ├── layout.tsx           # 根布局（字体 + Navbar/Footer + Organization JSON-LD）
│   │   ├── page.tsx             # 首页模板（Hero / 能力 / 分类占位 / 应用 / 询价引导）
│   │   ├── products/            # 产品列表页 + [slug] 详情页
│   │   ├── factory|quality|applications|about|blog|contact/  # 其余业务路由
│   │   ├── loading.tsx          # 全局加载骨架
│   │   ├── error.tsx            # 全局错误边界
│   │   ├── not-found.tsx        # 404 页面
│   │   ├── sitemap.ts           # sitemap.xml（由 siteRoutes 生成）
│   │   ├── robots.ts            # robots.txt（与 allowIndexing 联动）
│   │   ├── design-system/       # 设计系统预览页（开发自检用，非业务页面）
│   │   └── globals.css          # Tailwind v4 入口 + 语义令牌映射
│   ├── styles/tokens.css        # ★ 设计令牌唯一来源（颜色/字体/字号/间距/圆角/阴影）
│   ├── tokens/index.ts          # 令牌的 TS 出口（断点、容器宽度、色值等）
│   ├── config/site.ts           # ★ 站点唯一配置源（信息/导航/页脚/路由/收录开关）
│   ├── components/
│   │   ├── layout/              # Container / Section / SectionHeader / Navbar / MobileMenu / Footer / PageHero / ContentPlaceholder / CtaBand
│   │   ├── common/              # Logo / OptimizedImage / ProductCard / ProcessFlow / LinkPagination
│   │   ├── media/               # GalleryGrid（响应式图片画廊，无素材时统一占位）
│   │   ├── seo/                 # OrganizationSchema / WebPageSchema / AboutSchema（JSON-LD）
│   │   ├── products/            # ProductGallery / ProductFilter / ProductPagination / ProductSchema / DemoDataNotice
│   │   ├── blog/                # BlogCard / BlogCategoryFilter / BlogContent / ArticleSchema
│   │   ├── rfq/                 # RfqForm / RfqSuccess（询盘表单，'use client'）
│   │   ├── ui/                  # Button / Card / Badge / Input / Textarea / Select / Label / FileUpload / Spinner
│   │   ├── backend-status-card.tsx  # 后端连接状态卡片（Phase 3.1 开发态，公开页面已不引用）
│   │   ├── site-header.tsx      # @deprecated 兼容出口 → layout/navbar
│   │   └── site-footer.tsx      # @deprecated 兼容出口 → layout/footer
│   └── lib/
│       ├── utils.ts             # cn() 工具
│       ├── format.ts            # 日期格式化（固定 Asia/Shanghai 时区）
│       ├── seo.ts               # buildMetadata() / absoluteUrl()
│       ├── products/            # ★ 产品数据层（types / demo-data / repository）
│       ├── factory/             # ★ 工厂/质量图片数据层（types / demo-data / repository）
│       ├── about/               # ★ 公司/团队图片数据层（types / demo-data / repository）
│       ├── applications/        # ★ 应用场景数据层（types / demo-data / repository）
│       ├── blog/                # ★ 文章数据层（types / demo-data / repository）
│       ├── rfq/                 # 询盘提交与字段契约（客户端）
│       └── site-config.ts       # @deprecated 兼容出口 → @/config/site
├── components.json              # shadcn/ui 配置
└── next.config.ts
```

## 设计系统（Phase 3.2）

设计令牌集中在 `src/styles/tokens.css`，分三层：**原始令牌**（色阶/字体/字号/间距/圆角/阴影）→ **语义别名**（`background` / `primary` / `border` …）→ **Tailwind 映射**（`globals.css` 的 `@theme inline`）。组件只使用语义类（如 `bg-primary`、`text-text-secondary`），页面中禁止硬编码颜色与字号。

| 体系 | 内容 |
| --- | --- |
| 颜色 | Brand 木棕 `brand-*`（主色 #8b5e34）、Secondary 米色 `beige-*`、Accent 森林绿 `forest-*`、暖灰 `neutral-*`、语义色 `success/warning/danger/info`；含深色模式预留（`.dark`） |
| 字体 | Inter（拉丁，构建期自托管）+ 中文回退栈（Noto Sans SC / 苹方 / 微软雅黑） |
| 字号 | `text-display` / `heading-xl` / `heading-lg` / `heading-md` / `heading-sm` / `body-lg` / `body` / `small` / `caption`（流式 clamp） |
| 间距 | 规范阶梯 `--space-xs…3xl`（8/12/16/24/32/48/64px）+ 区块留白 `py-section`（64→120px） |
| 容器 | `Container` 宽度 narrow 768 / page 1280 / wide 1440；内边距 手机 16 → 平板 24 → 桌面 32px |
| 响应式 | Mobile First；手机单列 / 平板 2 列 / 桌面 3–4 列；导航 < 768px 切换汉堡菜单 |
| 组件 | Button（5 变体 + loading）、Card（组合式）、ProductCard、Badge（业务语义变体）、OptimizedImage（比例 + fallback）、Input/Textarea/Select/Label/FileUpload、Navbar/MobileMenu/Footer、Section/SectionHeader/Container |

预览与自检页面：`/design-system`（仅用于组件渲染验证，`noindex`，不含业务数据）。新页面请统一使用 `<Section><SectionHeader/>…</Section>` 结构。

## 站点框架（Phase 3.3）

### 路由

| 路由 | 页面 | 锚点 |
| --- | --- | --- |
| `/` | 首页 | — |
| `/products` | 产品中心 | — |
| `/factory` | 工厂实力 | — |
| `/quality` | 品质管控 | `#certificates` |
| `/applications` | 应用场景 | — |
| `/about` | 关于我们 | — |
| `/blog` | 资讯动态 | — |
| `/contact` | 联系我们 | `#rfq`（询价表单）、`#faq`（常见问题） |

### SEO 与配置

- **配置单一来源**：`src/config/site.ts` —— 站点信息、导航、页脚、联系方式、路由清单与收录开关；页面禁止散落硬编码字符串。
- **统一元信息**：页面通过 `buildMetadata()`（`src/lib/seo.ts`）生成 title / description / keywords / canonical / OpenGraph / Twitter / robots；根布局提供 `%s | Bailing Wooden` 标题模板。
- **结构化数据**：`OrganizationSchema` 输出 Schema.org Organization JSON-LD（仅已确认字段）。
- **sitemap / robots**：`sitemap.ts` 由 `siteRoutes` 生成；`robots.ts` 与 `siteConfig.allowIndexing` 联动。
- **收录开关**：`allowIndexing` 当前为 `false`（框架阶段，全站 `noindex` + `Disallow`）；内容确认后改为 `true` 即全站开放收录。

### 页面骨架组件

二级页统一使用 `<PageHero>` 起头（唯一 H1），区块用 `<Section><SectionHeader/></Section>`，底部用 `<CtaBand/>` 收口；内容未就绪处使用 `<ContentPlaceholder>` 占位，**不伪造任何数据或图片**。

## 产品中心（Phase 3.5）

| 路由 | 说明 |
| --- | --- |
| `/products` | 产品列表：PageHero → 分类筛选（`?category=`）→ ProductCard 网格 → 分页（`?page=`）→ CTA |
| `/products/[slug]` | 产品详情：Product Hero（Gallery + Info + Request Quote）→ 描述 → 规格 → 材质/应用 → CTA → 相关产品 |

### 产品数据层（`src/lib/products/`）

页面只依赖 `@/lib/products`，不关心数据来源，因此从 Mock 切到 API/CMS 无需改动页面：

| 文件 | 作用 |
| --- | --- |
| `types.ts` | 与后端 `product.dto.ts` 一一对应的领域类型 |
| `demo-data.ts` | **Demo / Placeholder** 数据（名称以 `Demo ·` 开头，描述标注 `[DEMO DATA]`，无规格/无图片） |
| `repository.ts` | 数据源切换与查询：`getProducts` / `getProductBySlug` / `getCategories` / `getProductSlugs` |

数据源由 `NEXT_PUBLIC_PRODUCTS_SOURCE` 控制：

- `demo`（默认）—— 使用内置占位数据，**完全离线、可静态构建**；
- `api` —— 调用 `bailing-backend` 的 `/api/v1/products`（ISR 5 分钟）。

`api` 模式下接口不可用会如实抛错（由 `error.tsx` 接管），**不会**回退到 Demo 数据，避免把占位内容当成真实产品展示。

### SEO

- 详情页动态 metadata：`title = {name} | Bailing Wooden`、`description`、`canonical = /products/{slug}`；列表页 canonical 固定为 `/products`（避免筛选组合产生重复内容）。
- **Product JSON-LD**（`components/products/product-schema.tsx`）：输出 `name` / `description` / `image` / `brand` / `category` / `material` / `additionalProperty`；**不输出** `offers`/`price`/`rating`/`review`/`sku`。
- `sitemap.xml` 自动纳入全部产品详情页。

### 已知取舍

- `/products/[slug]` 使用 `dynamicParams = false`：仅 `generateStaticParams` 列出的 slug 可访问，其余返回**真正的 404**（否则 `notFound()` 会被缓存成 200 的"软 404"）。代价是 CMS 新增产品后需触发一次重新构建。
- 产品图片一律经 `OptimizedImage`（next/image + 懒加载 + 固定宽高比 + 无图占位），不使用裸 `<img>`。

## 工厂与质量页面（Phase 3.6）

企业信任核心页面，面向海外采购商展示制造能力与品质管控。**零虚构原则**：不出现工厂面积、年产量、员工/设备数量、客户名称、合作品牌、证书编号或任何检测数据 —— 未确认内容一律显示为 "To be confirmed / will be updated"。

| 路由 | 结构 |
| --- | --- |
| `/factory` | Hero → Factory Introduction → Factory Gallery → Production Process → Equipment → Loading & Shipment → Exhibition → CTA |
| `/quality` | Hero → Quality Philosophy → Inspection Process → Certificates Framework（`#certificates`）→ Quality Control → Packaging Quality → CTA |

### 图片数据层（`src/lib/factory/`）

与产品数据层同构，页面只依赖 `@/lib/factory`：

| 文件 | 作用 |
| --- | --- |
| `types.ts` | `FactoryImage { id, url, alt, category, sortOrder, caption? }`；分类 `factory`/`production`/`equipment`/`loading`/`exhibition`（工厂）与 `inspection`/`certificate`/`packaging`（质量） |
| `demo-data.ts` | 素材登记处，**当前为空数组**（无真实素材时按零虚构原则不登记任何图片） |
| `repository.ts` | `getImages` / `getImagesByCategory` / `hasAnyImage` / `getGallerySummary`（均 async） |

接入真实素材：把 `FactoryImage` 登记进 `demo-data.ts`（或后续改为后端 API）即可，页面与组件无需改动。**禁止**使用 AI 生成图、图库素材或伪造实景照。

### 可复用组件

- `GalleryGrid`（`components/media/`）—— 响应式画廊（1/2/3 列），无素材时渲染统一占位瓦片。图片入参为最小结构契约 `GalleryImage { id, url, alt, caption? }`，因此 `FactoryImage` 与 `AboutImage` 均可直接传入；
- `ProcessFlow`（`components/common/`）—— 流程展示，手机纵向 → 桌面横向；
- `WebPageSchema`（`components/seo/`）—— 页面级 `WebPage` JSON-LD，通过 `@id` 关联全局 Organization / WebSite（工厂/质量页不输出 Product Schema）。

## 内容体系（Phase 3.8）

品牌故事 + 应用搜索入口 + SEO 内容增长。

| 路由 | 结构 |
| --- | --- |
| `/about` | Hero → Company Introduction → Our Story（At a glance + 团队相册）→ Business Philosophy → Why Choose Bailing → Products & Solutions → Global Market → Factory/Quality CTA → RFQ CTA |
| `/applications` | Hero → Application Categories（锚点索引）→ 5 个应用区块（图文交替 + 材料方向清单）→ Related Products → RFQ CTA |
| `/blog` | Hero → Category Filter → Article Cards（移动 1 列 / 桌面 3 列）→ Pagination → CTA |
| `/blog/[slug]` | Breadcrumb → Article Hero → Cover → Content → Tags → Related Products → Related Articles → RFQ CTA |

**博客定位是行业知识体系**（Buying Guide / Material Guide / Industry Insight / Manufacturing），**不是企业新闻**。4 篇初始文章均为选材指南与工艺说明。

### 数据层

三个模块与产品/工厂数据层同构（Repository 模式、全 async，便于未来切 CMS / API 而不改页面）：

| 模块 | 内容 |
| --- | --- |
| `@/lib/about` | `AboutImage` + 分类 `company`/`team`/`factory`/`exhibition`/`office`；素材分类规则 `ABOUT_IMAGE_KEYWORDS` / `classifyAboutImageFileName()` |
| `@/lib/applications` | `Application { slug, title, description, overview, highlights, image, imageAlt, relatedProducts }`；已为未来 `/applications/[slug]` 详情路由预埋 `getApplicationBySlug()` / `getApplicationSlugs()` |
| `@/lib/blog` | `BlogPost` + `BlogBlock[]`（结构化正文，无 Markdown 依赖）；分页 / 分类筛选 / 详情 / 相关文章 |
| `@/lib/format` | 固定 `Asia/Shanghai` 时区的日期格式化（避免服务端与访客端日期不一致） |

### SEO

- 三页标题均含品牌名，`buildMetadata()` 增加 `absoluteTitle` 选项避免被根布局模板重复拼接（`About Bailing Wooden | Wood Manufacturer` / `Wood Applications | Furniture & Interior Solutions` / `Wood Industry Insights | Bailing Wooden`）。
- Schema 分工严格：`/about` → **Organization**（复用根布局 `@id` 并补充 `slogan`/`knowsAbout`/`mainEntityOfPage`，不会被当作两个实体）、`/applications` 与 `/blog` → `WebPage`、`/blog/[slug]` → **Article**。**全站零 Product Schema**。
- `sitemap.xml` 已接入文章 slug；`/blog/[slug]` 同样使用 `dynamicParams = false`，未登记 slug 返回**真正的 404**。
- 建站资料为旧站真实素材（厂区航拍、员工照片、应用场景、文章封面共 23 个），经逐张目检后登记。**未编造姓名、职位、成立年份、厂房面积或员工人数**；展会/办公场景因无真实素材而以占位块呈现。

### Blog 组件

`BlogCard` / `BlogCategoryFilter` / `BlogContent` / `ArticleSchema`（`components/blog/`）、`LinkPagination`（`components/common/`）、`AboutSchema`（`components/seo/`）。

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

## 当前状态（Phase 3.8）

- **Phase 3.1（工程底座）**：依赖安装、TypeScript、ESLint、生产构建、开发服务器（3000）与后端健康检查联调均已验证通过。
- **Phase 3.2（UI 设计系统）**：设计令牌体系、基础组件库、Navbar/Footer、响应式规范与后台同步全部完成。
- **Phase 3.3（网站基础框架）**：8 条业务路由 + `loading/error/not-found/sitemap/robots` 框架文件、统一 SEO 体系、Organization JSON-LD、`config/site.ts` 集中配置、页面骨架组件与品牌 logo 接入全部完成。
- **Phase 3.5（产品中心）**：产品数据层、产品列表页 `/products`、产品详情页 `/products/[slug]`、分类筛选、分页、Product JSON-LD 与 Request Quote 入口全部完成。详见 [`docs/PHASE3.5-ACCEPTANCE.md`](../docs/PHASE3.5-ACCEPTANCE.md)。
- **Phase 3.6（工厂 + 质量页面）**：`/factory` 与 `/quality` 页面、工厂/质量图片数据层、`GalleryGrid`/`ProcessFlow`/`WebPageSchema` 可复用组件全部完成；`lint` / `typecheck` / `build` 通过，两页 200、320–1440px 无横向溢出、零虚构数据扫描通过。详见 [`docs/PHASE3.6-ACCEPTANCE.md`](../docs/PHASE3.6-ACCEPTANCE.md)。
- **Phase 3.7（RFQ 询盘系统）**：`Rfq` 模型与迁移、三个 API、`/contact` 真实提交、后台 `/rfq` 列表与状态管理全部完成，端到端跑通并清理测试数据。详见 [`docs/PHASE3.7-ACCEPTANCE.md`](../docs/PHASE3.7-ACCEPTANCE.md)。
- **Phase 3.8（内容体系）**：`/about`、`/applications`、`/blog`、`/blog/[slug]` 四个页面、三个数据层（about / applications / blog）、23 个真实素材登记、4 篇文章全部完成；`lint` / `typecheck` / `build` 通过，4 路由 200、`/blog/demo` 与未知 slug 返回真 404、55 项响应式检查全过、零虚构扫描 0 hits。详见 [`docs/PHASE3.8-ACCEPTANCE.md`](../docs/PHASE3.8-ACCEPTANCE.md)。
- 产品内容当前为 **Demo / Placeholder**；企业真实信息（成立年份、厂房面积、员工数、联系方式、证书编号）仍标记为 **To be confirmed**；事件日志/内容管理（CMS）规划在 Phase 4，本阶段不含任何后台内容管理能力。
