# 前台多语言切换功能 — 交付报告

- 范围：**仅 `bailing-ui`**（前台）。未修改 `bailing-backend`、`bailing-admin`、数据库、迁移、后端 API、认证、服务器、Nginx、DNS、CDN、COS 及任何生产配置。
- 语言：**English（默认，无前缀）** + **简体中文（`/zh-CN` 前缀）**。
- 执行顺序：先审计 → 再实施 → 再测试 → 最后本报告。

---

## A. 实际实现内容

### A1. 方案选型（为什么不用第三方 i18n 库）

| 候选 | 结论 |
| --- | --- |
| `next-intl` / `next-i18next` | 需新增依赖 + 改写构建配置；本项目 App Router + ISR + tag 重验证链路较敏感，收益不足以抵消风险 |
| 自建轻量 i18n（**采用**） | 纯数据 + 纯函数，零新依赖；语言来自**路由参数**而非 cookie/header，因此页面仍可静态生成、可被 CDN 缓存、无 hydration mismatch |

核心设计：**as-needed 语言前缀**

- 英文（默认）：`/products` —— 既有 URL 一个都不变，历史收录与外链完全兼容；
- 中文：`/zh-CN/products` —— 真实可抓取、可分享、可 canonical；
- `/en/*`：301 回无前缀地址（避免同页两套 URL）；
- `/zh`、`/zh_CN`、`/en-US` 等别名：301 归一到规范前缀 / 默认语言；
- `/fr/*` 这类伪语言前缀：301 回默认语言路径，不产出会被收录的假语言 URL。

### A2. 语言选择器（UI）

- **桌面端**：导航栏右侧（Request Quote 左侧）—— 地球图标 + 当前语言名（`English` / `简体中文`），点击展开下拉菜单；`≥lg` 显示完整名称，`md` 显示短名（`EN` / `中文`）。
- **移动端**：内嵌在移动菜单底部，用**分段按钮**（`radiogroup`）而非下拉，触控目标 40px，不会把菜单撑出屏幕。
- **体现当前语言**：按钮文案即当前语言；菜单项 `role="menuitemradio"` + `aria-checked` + 勾选图标。
- **无障碍**：
  - 按钮 `aria-haspopup="menu"`、`aria-expanded`、`aria-controls`、`aria-label="当前语言：简体中文"`；
  - 键盘：`Enter`/`Space` 展开、`↑`/`↓` 在按钮上直接展开、菜单内 `↑`/`↓`/`Home`/`End` 循环移动、`Esc` 关闭并把焦点还给按钮、`Tab` 关闭；
  - 点击 / 触摸外部关闭；
  - 每个语言项带 `lang` 属性（`lang="zh-CN"`），屏幕阅读器用对应语言朗读；
  - 切换中显示 Spinner + `aria-live="polite"` 播报「正在切换语言…」。
- **风格一致**：复用既有 token（`text-text-secondary` / `hover:bg-accent` / `focus-visible:ring-ring`），未重做导航布局。

### A3. 切换行为

- **停留当前页**：`switchLocalePath(pathname, search, hash, target)` 保留路径 + 查询串 + 锚点。`/zh-CN/products?category=x#top` → `/products?category=x#top`，反之亦然。
- **不整页闪烁**：`router.push()` + `useTransition()`，切换期间只有按钮上的 Spinner 与 sr-only 播报，无白屏、无 FOUC。
- **无对应翻译时的回退**：路径不翻译（中英文共用同一 slug），因此详情页永远能找到对应页面，不会产生错误 URL / 404 循环 / 无限重定向。

### A4. 持久化

- 切换语言时写 Cookie `NEXT_LOCALE`（`max-age=31536000`，`samesite=lax`，`path=/`）；
- middleware 读取该 Cookie：
  - 访问**无前缀地址**且 Cookie 为中文 → **307** 跳转到对应 `/zh-CN/...`；
  - 爬虫不带 Cookie → 永远拿到英文默认页（用户偏好不会污染收录）；
  - Cookie 值非法（如 `xx-YY`）→ 忽略，按默认语言处理；
- 站内跳转、刷新、关闭浏览器后再次访问均保持（Cookie 一年有效）。

### A5. 路由与页面对应

`src/app/[locale]/` 动态段作为根布局，`generateStaticParams()` 为 `en` / `zh-CN` 各生成一套静态页。URL 前缀与内容语言**永远一致**（语言只从路由参数取，不读 cookie/localStorage）。

新增 `src/app/[locale]/[...rest]/page.tsx` 兜底路由：未匹配路径进入 `[locale]` 段后 `notFound()`，使 404 也能按 URL 前缀输出对应语言（`/abc` → 英文 404，`/zh-CN/abc` → 中文 404），HTTP 状态为真实 404。

### A6. 覆盖范围（逐项）

| 区域 | 覆盖内容 |
| --- | --- |
| Header / 导航 | 导航项（CMS 驱动，已知路由按语言覆盖）、Request Quote CTA、汉堡按钮 aria-label、语言选择器 |
| Footer | 品牌描述 / 标语、站点导航（含锚点项 获取报价 / 资质证书 / 常见问题）、邮箱/电话/地址标签、社交媒体、版权行 |
| 首页 | Hero、能力卡片、产品/应用分区、CTA |
| Products 列表 | 标题、筛选器、排序、分页、空状态、Demo 数据提示 |
| Product 详情 | 面包屑、图集、规格表、Related、询盘 CTA、库存/交期等字段标签 |
| 分类筛选 / 搜索 / 排序 / 分页 | 全部经 `LocaleLink` 保持语言前缀 |
| Factory | 概述、图集、生产流程、设备、装柜发运、展会、CTA |
| Quality | 检验流程、控制点、理念、包装、证书区块、记录（签发/编号/日期/有效期） |
| Applications 列表 + 详情 | 锚点索引、5 个应用区块、Related、CTA、面包屑 |
| RFQ 表单 | 全部标签 / 占位符 / 提示 / 前端校验文案 / 成功与失败反馈 / 「再提交」 |
| About | Hero、公司简介分区、理念、优势、解决方案、CTA |
| Blog 列表 + 详情 | 分类筛选、卡片、日期格式（`Intl.DateTimeFormat`）、阅读时长、标签、Related、CTA |
| 404 | 标题 / 描述 / 返回首页 / 联系 / 栏目导航（服务端按语言输出） |
| Error / Global Error | 文案本地化（Global Error 因脱离路由上下文，首帧英文、挂载后按 `location.pathname` 切中文并同步 `<html lang>`） |
| 加载态 / 空状态 | 骨架屏 sr-only 提示、列表空状态、占位图提示 |
| 结构化数据 | `WebSite` / `WebPage` / `Article` / `Product` / `About` / `FAQPage` / `BreadcrumbList` 全部带 `inLanguage` 与本地化 `url` |

### A7. CMS 文案的两层处理原则（重要）

CMS 里其实混着**两类**内容，必须区别对待，否则中文页会出现「导航是中文、正文全是英文」：

| 类型 | 例子 | 中文页处理 |
| --- | --- | --- |
| **页面营销文案**（`SiteSection` 的眉题 / 标题 / 副标题 / 正文 / 卡片 / CTA 标签） | 首页 hero、Capabilities、Products、Applications 分区；关于页 5 个分区；联系页 hero；工厂概述 | **不使用 CMS**，改用 `messages/zh-CN.ts` 里同一批中文文案（英文页仍由 CMS 驱动，后台照旧可编辑） |
| **业务数据**（产品 / 分类 / 文章 / 应用场景记录 / 员工联系人） | 产品名、分类名、文章标题与正文、应用场景标题 | **按原文展示**（不机翻、不伪造），并在区块内给出 `ContentFallbackNotice` 提示 |

实现方式：页面里一个开关 `const useCmsCopy = isDefaultLocale;`，中文页把 `heroSection` / `*Section` / `getFactoryOverview()` 置空，自然落到代码里既有的中文版式分支 —— 不新增文案、不复制版式。

- **不伪造翻译**：产品名、规格、材质、认证、文章正文等业务数据只有单语言版本，中文界面下按原文展示，绝不机翻、绝不用英文占位替换中文。
- **明确提示**：`ContentFallbackNotice` 仅在非默认语言且确实展示了单语言数据时渲染。
- **不覆盖**：UI 文案来自 `messages/*.ts`，业务数据来自 API，两者物理隔离；静态文案字典永远不会覆盖 CMS 的业务数据。
- **零后端改动**：未新增任何接口参数，未改 DTO，未改数据库。
- **后续升级路径**：后端为 `SiteSection` / `Product` / `BlogPost` 增加语言字段（或翻译表）后，把 `useCmsCopy` 换成「按语言取 CMS」，中文页即可恢复由后台编辑。

### A8. SEO

- `<html lang="en">` / `<html lang="zh-CN">`（按路由参数，服务端确定）。
- **canonical 各自指向自己**：`/products` → `https://bailingwooden.com/products`；`/zh-CN/products` → `https://bailingwooden.com/zh-CN/products`。中英文**绝不共用 canonical**。
- **hreflang 三向互链**：`en` / `zh-CN` / `x-default`（`x-default` → 英文）。
- 中文页**不套用**后端单语言 SEO 档案（否则会把英文标题/描述写到中文 URL 上），改用中文 UI 文案作为 title/description。
- `sitemap.xml`：按语言展开规范 URL（`/products` 与 `/zh-CN/products` 各一条），每条带 `<xhtml:link rel="alternate" hreflang="…">`；**不输出**会被 301 的 `/en/*`。
- `robots.txt`：新增屏蔽 `/zh-CN/design-system`。
- 404 响应带 `<meta name="robots" content="noindex">`。
- OG：`og:locale` 按语言输出（`en_US` / `zh_CN`），`og:url` 指向本语言 URL。
- 结构化数据 `inLanguage` 与 `url` 按语言输出，未破坏既有 schema 结构。

### A9. 类型安全

`Messages = typeof en`，`zh-CN` 用 `satisfies Messages` 强约束 —— **漏翻一个 key 就编译失败**；`t('common.previous')` 走递归点号路径类型，写错 key 编译期即报错。

---

## B. 文件变更清单

### B1. 新增（15 个）

**i18n 内核**

- `src/i18n/config.ts` — locales / defaultLocale / localeMeta / cookie 与请求头常量 / 别名
- `src/i18n/paths.ts` — `localizedPath` / `stripLocaleFromPath` / `detectLocaleFromPath` / `switchLocalePath`
- `src/i18n/translate.ts` — `MessageKey<T>` 递归类型、`translate`（含 `{name}` 插值）、`createTranslator`
- `src/i18n/index.ts` — `getI18n(locale)`、`localizeNavLabel`
- `src/i18n/client.ts` — `useLocale()` / `useLocalePathname()`
- `src/i18n/link.tsx` — `LocaleLink`
- `src/i18n/messages/en.ts`（消息结构事实源，823+ 行）
- `src/i18n/messages/zh-CN.ts`（`satisfies Messages`）
- `src/i18n/messages/index.ts` — `getMessages(locale)`

**组件**

- `src/components/layout/language-switcher.tsx` — 桌面下拉 + 移动分段
- `src/components/layout/localized-route-skeleton.tsx` — 语言感知骨架
- `src/components/common/content-fallback-notice.tsx` — 单语言内容提示
- `src/components/common/not-found-content.tsx` — 404 正文（服务端组件）

**路由 / 工具**

- `src/app/[locale]/[...rest]/page.tsx` — 兜底 404 路由
- `scripts/verify-i18n.mjs` — 116 项 HTTP 回归验证脚本

### B2. 移动（17 个，`git mv` 到 `src/app/[locale]/`）

`layout.tsx`、`page.tsx`、`not-found.tsx`、`error.tsx`、`about/page.tsx`、`applications/page.tsx`、`applications/[slug]/page.tsx`、`blog/(list)/page.tsx`、`blog/(list)/loading.tsx`、`blog/[slug]/page.tsx`、`contact/page.tsx`、`design-system/page.tsx`、`factory/page.tsx`、`products/(catalog)/page.tsx`、`products/(catalog)/loading.tsx`、`products/[slug]/page.tsx`、`quality/page.tsx`

### B3. 修改（36 个）

- **路由层**：`src/middleware.ts`（语言路由 + 语言请求头 + 保留原 SEO 重定向）、`src/app/global-error.tsx`、`src/app/robots.ts`、`src/app/sitemap.ts`
- **布局 / 通用组件**：`navbar`、`mobile-menu`、`footer`、`logo`、`cta-band`、`content-placeholder`、`route-skeleton`、`link-pagination`、`optimized-image`、`process-flow`、`product-card`、`gallery-grid`、`file-upload`
- **业务组件**：`product-filter`、`product-pagination`、`product-gallery`、`demo-data-notice`、`blog-card`、`blog-category-filter`
- **RFQ**：`rfq-fields.ts`（改为 `getRfqRequiredFields(t)` / `getRfqOptionalFields(t)`，**字段名不变**）、`rfq-form.tsx`、`rfq-success.tsx`
- **CMS 区块**：`cms/site-section-block.tsx`（`SiteCtaLink` 改 `LocaleLink`，修掉中文页 CTA 掉回英文的问题）
- **结构化数据**：`website-schema`、`web-page-schema`、`about-schema`、`product-schema`、`article-schema`、`faq-schema`、`organization-schema`
- **工具**：`lib/format.ts`（`formatDate(iso, locale)` + `Intl` 缓存）、`lib/seo/resolver.ts`（locale 感知 canonical / hreflang / 不使用单语言档案）

> `design-system/page.tsx` 只做了路径迁移，未国际化：它是内部开发自检页（`robots: noindex`，`/design-system` 与 `/zh-CN/design-system` 均被 robots 屏蔽），不属于面向访客的公共页面。

---

## C. 测试结果

环境：Windows 本机，Next.js 15.5.27，`NEXT_PUBLIC_CMS_SOURCE=api`（后端 `127.0.0.1:4000` 在线）。

| 项目 | 命令 | 结果 |
| --- | --- | --- |
| TypeScript 类型检查 | `npx tsc --noEmit` | **通过**（0 error） |
| ESLint | `npm run lint` | **通过**（0 error / 0 warning） |
| 生产构建（api 模式） | `npm run build` | **通过** — 29 个静态页，`/en/*` 与 `/zh-CN/*` 各预渲染一套 |
| 生产构建（demo 模式） | `NEXT_PUBLIC_CMS_SOURCE=demo npm run build` | **通过** — 47 个静态页（含博客 / 应用详情，用于验证深层路由） |
| HTTP 回归脚本 | `node scripts/verify-i18n.mjs` | **通过 126 / 失败 0** |
| 单元测试 | — | **未执行**：项目无测试框架（无 jest / vitest），本次未引入 |
| 浏览器 E2E（Playwright） | — | **未执行**：环境无 playwright 依赖（`require('playwright')` 失败），未安装以避免改动依赖结构 |

### C1. `scripts/verify-i18n.mjs` 覆盖的 126 项

1. **可访问性与 `<html lang>`**：8 条路由 × 2 语言 → 200 且 `lang` 正确、两语言 HTML 确实不同（16 项 + 16 项）
2. **非规范 URL 归一**：`/en/products` → 301 `/products`；`/zh/products` → 301 `/zh-CN/products`；`/fr/products` → 301 `/products`；`/zh` → 301 `/zh-CN`
3. **canonical / hreflang**：8 条路由 × 2 语言，canonical 指向自身、三向 hreflang 齐全且中英一致（32 项）
4. **404**：`/no-such-page`、`/zh-CN/no-such-page`、`/products/no-such-product`、`/zh-CN/products/no-such-product` → 404 + 对应语言文案（8 项）
5. **持久化**：带 `NEXT_LOCALE=zh-CN` 访问 `/` → 307 `/zh-CN`；`/products` → 307 `/zh-CN/products`；无 Cookie → 200 英文；非法 Cookie → 不跳转（5 项）
6. **sitemap**：含中英首页、中文产品列表、hreflang alternates、**不含** `/en` 前缀 URL（6 项）
7. **robots**：屏蔽 `/design-system` 与 `/zh-CN/design-system`、输出 sitemap 地址（4 项）
8. **RFQ 契约**：中英文表单字段名集合**完全一致**，`name/company/email/country/message` 均存在，中文页显示中文标签（9 项）
9. **导航链接语言一致性**：中文页无无前缀栏目链接、英文页无 `/zh-CN` 链接（3 项）
10. **语言选择器存在性**（2 项）
11. **中文页不残留英文 UI 文案**：8 条中文路由逐条检查 15 个英文 UI 词（Request Quote / Capabilities / What we do / Our Story …）均不出现（8 项）+ 反向确认英文页仍保留英文文案（2 项）

### C2. 手工 HTTP 抽查（补充）

- 产品详情 `/products/demo-custom-component` 与 `/zh-CN/products/demo-custom-component`：`lang`、canonical、hreflang 正确；中文页出现「内容语言」提示，英文页不出现。
- 博客详情（demo 构建）`/blog/how-to-choose-the-right-mdf-supplier` 与中文版：canonical 各自指向自己，中文版出现「相关文章 / 标签 / 内容语言」，文章标题保持原文（未伪造翻译）。
- 应用详情 `/applications/furniture-manufacturing` 与中文版：同上。
- 中文产品列表带查询串 `/zh-CN/products?sort=name`：canonical 仍为 `/zh-CN/products`（查询串不参与 canonical），筛选/排序 UI 为中文。
- 中文页脚：站点导航 / 获取报价 / 资质证书 / 常见问题 / 联系我们 / 邮箱 / 电话 / 地址 / 待补充 / 版权行全部中文。

### C3. 未覆盖（如实标注）

- **真实浏览器点击**语言选择器（cookie 落盘 → 刷新保持）未自动化验证；已通过「带 Cookie 请求 → 307」验证服务端行为，切换逻辑经代码审阅。
- 桌面 / 移动**响应式视觉**未做截图比对。
- 生产环境（VPS）未部署验证 —— 本次按任务边界不触碰服务器。

---

## D. Git 信息

- 仓库：`bailing-ui`（唯一改动仓库）
- 分支：`261017`（从 `dev` 拉出的当日分支）
- 提交：`c958466` — `feat(i18n): 前台中英文切换（as-needed 前缀 + Cookie 持久化 + 双语 SEO）`
- 工作区：提交后 clean
- 变更规模：60 个文件（17 个路由文件 `git mv` 到 `src/app/[locale]/`、36 个修改、15 个新增）
- `bailing-backend`：**无任何改动**（`git status` 干净）
- `bailing-admin`：存在 2 个**本次任务之前就已存在**的未提交改动（`src/app/(dashboard)/rfq/page.tsx`、`src/lib/rfq.ts`），与本次 i18n 无关，**未触碰、未回退**

---

## E. 已知限制与后续建议

1. **CMS 业务内容仍是单语言**（最大限制）。产品名 / 分类名 / 文章标题与正文 / 应用场景标题只有一份（英文），中文界面下按原文展示并给出提示。真正的双语内容需要**后端新增 i18n 字段或翻译表**——本次按边界未改后端。建议后续：`ProductTranslation` / `BlogPostTranslation` / `SiteSectionTranslation` 关联表 + `?locale=` 查询参数 + 后台翻译录入界面。
   - 由此带来的**内容不一致**：中文页的营销文案来自前端 `messages/zh-CN.ts`，英文页来自 CMS。后台改英文 hero 不会同步到中文页 —— 这是当前唯一可行的取舍，已在 A7 说明升级路径。
2. **404 首屏 HTML 是 Next 的空壳**。`notFound()` 在动态渲染中触发时，Next.js 15 输出 `__next_error__` 外壳，404 正文随 RSC 载荷下发，浏览器渲染完全正常（HTTP 404 + `noindex` 均正确）。这是框架行为，无 JS 环境会看到空白。若必须让首屏就有完整 404 HTML，需要把 `<html>` 移到根布局并用请求头决定语言，代价是全站失去静态化 —— 不建议为此取舍。
3. **未做浏览器 E2E**。环境无 Playwright 依赖；语言切换的点击交互、Cookie 落盘、下拉键盘操作仅经代码审阅 + 服务端行为验证。建议后续在 CI 中补 Playwright（`@playwright/test` + 现有 `verify-i18n.mjs` 的断言可直接复用）。
4. **中文页 `keywords` 仍是英文词表**。Google 已不参考 `<meta keywords>`，未单独维护中文关键词；如需 Bing / 百度等，可补一份中文词表。
5. **中文详情页与英文详情页正文相同**。当前通过 hreflang 声明为「同一页面的两个语言版本」，避免被判重复内容。若后续 CMS 提供多语言正文，需在 sitemap 与页面层按语言过滤，而不是继续输出两份。
6. **带中文 Cookie 访问无前缀地址会 307**。这是「持久化偏好」的必然结果：用户手动输入 `/products` 也会进中文版。符合任务书「刷新 / 再访问保持选择」的要求，但与「URL 即语言」存在一层跳转。若更希望 URL 说了算，把该分支去掉即可（一行）。
7. **`design-system` 页面未国际化**（内部开发自检页，noindex + robots 屏蔽）。
8. **未做语言自动探测**（`Accept-Language`）。任务书要求「首次访问英文默认」，故刻意不按浏览器语言自动跳转，避免爬虫 / 首次访客被意外带到中文。
