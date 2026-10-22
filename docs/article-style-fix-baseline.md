# 文章样式整改 · 阶段 0 基线报告（2026-10-20）

> 依据：`bailing-ui/docs/article-style-diff-report.md`（审计结论 AUDIT COMPLETE）。
> 本阶段**未执行任何写入**（无代码/DB/内容修改）。

## 1. 仓库与工作区状态

| 仓库 | 分支 | 未提交改动 | 处置 |
|---|---|---|---|
| bailing-ui | 261017 | 36 个文件（含 blog/[slug]/page.tsx、products 路由重构等他人/在途改动） | **只增量、不覆盖**；本次仅改 globals.css、src/lib/blog/*、blog 详情页 |
| bailing-backend | 261017 | 50 个文件 | 仅新增 prisma/scripts 清洗脚本 + sanitizer 受控 class 白名单（不改动他人的在途文件） |
| bailing-admin | 261017 | 24 个文件 | 不修改 |

本地服务：ui(3000) 200 / backend(4000) 在跑（响应正常）。数据库：`127.0.0.1:5432/bailingwooden`（docker 容器 bailing-postgres，**本地开发库**，已确认）。

## 2. 代码架构关键发现（决定修复策略）

- **后端 `rich-text.sanitizer.ts` 写入路径已经是严格的**：属性白名单只放行 `a[href/title/target/rel]`、`img[src/alt/title/width/height]`、`td/th[colspan/rowspan/scope]`；`class/style/data-*/srcset/id` 全部丢弃。**CMS 新写入的内容是干净的，污染全部来自 Phase 5.4 直接入库的存量数据（未过 sanitizer）。**
- 公开 API 读取路径（`public-blog.service`）**不做读取时净化**，直接返回 DB 原文 → 存量污染原样到前台。
- 产品描述（34 篇）此前已被 `sanitize-product-descriptions.ts` 清洗过：**0 污染、0 emoji 图**；产品页 `.product-prose` 无 class/style 残留。
- excerpt 消费点（前端）：`repository.ts#toSummaryFromApi` / `#getBlogPostBySlug`（含 seo.description 兜底）、`blog-card.tsx:82`、详情页 hero `page.tsx:179`、`article-schema.tsx`。
- 媒体 URL：`UPLOADS_BASE_URL`（env，缺省 `http://127.0.0.1:4000`）→ `local-storage.provider` 拼接落库；Next `next.config.ts` 构建期读 `NEXT_PUBLIC_UPLOADS_BASE_URL` / `NEXT_PUBLIC_API_BASE_URL` 生成 remotePatterns（仅 /uploads/**）。

## 3. 数据库基线（本地开发库 bailingwooden）

| 指标 | 数量 |
|---|---|
| blog_posts 总数 | 75 |
| excerpt 含 `hellip`（截断+实体污染） | **75（全部）** |
| contentHtml 含 class/style/srcset/data-attachment | **71** |
| 其中含 Tailwind 工具类（mt-N/text-[]/font-bold/zinc-N 等） | 17 |
| 其中含 s.w.org emoji 图 | 17 |
| 其中含盒式标题内联样式（border-left） | 2 |
| 含 ds-markdown-paragraph | 11 |
| 含 wp-image-* class | 29 |
| products / 描述污染 / 描述含 emoji 图 | 34 / **0** / **0** |
| media_assets 总数 / URL 指向 192.168.1.40 | 239 / **239（全部）** |
| seo_redirects | **0（旧 URL 无任何 301 承接）** |

## 4. 测试样本（修复前后对比用）

| 样本 | 文章/页面 | 覆盖问题 |
|---|---|---|
| S1 emoji | beginner-woodworking-tools-dont-fall-for-these-3-budget-trap-mistakes | emoji 768px、excerpt 截断 |
| S2 Tailwind 类 | how-to-choose-the-best-plywood-for-marine-and-humid-environments | 标题 19.2px/zinc-800/mt16 变异 |
| S3 盒式标题 | top-7-questions-about-melamine-plywood-a-comprehensive-faq-guide-for-professionals | 内联 border-left 盒式 h2 |
| S4 表格 | mdf-vs-plywood-vs-particle-board-bailing-guide | th 样式/移动端 |
| S5 普通 | blockboard-manufacturing-a-complete-overview-of-the-production-process-materials-and-applications | 干净对照组 |
| S6 产品 | /products/cmvetz0pd00fjpuyk51c6ansv、cmvetz0px00fxpuykox33qq4y（+ 第 3 个 Phase 3 补） | .product-prose 回归 |

基线截图：审计阶段 14 张（docs/audit-article-style-evidence/）+ 产品 2 张（baseline-product-*.png）。

## 5. 潜在风险与对策

1. **并行会话在途改动**（36+50+24 文件）：构建可能吸入他人 WIP 代码 → 构建失败先 `git diff` 甄别是否他人文件；本轮构建/重启前确认。
2. **写库清洗**：仅本地开发库；脚本默认 dry-run、落库前 JSON 备份、`--apply` 显式开关、幂等；清洗规则=「语义保留 + 受控属性白名单」，盒式标题先转受控 class 再清属性。
3. **sanitizer 改动影响产品写入路径**：只新增「受控 prose class 白名单」（此前全剥，向后兼容；产品内容本就不含这些 class，零行为变化），并加单测验证。
4. **emoji 转 Unicode 的误判风险**：仅当 `src` 匹配 `s.w.org/images/core/emoji`（或 twemoji）且 `alt` 为 1-2 个 emoji 字符时才替换；其余一律保留 img。
5. **构建/重启**：同仓库单 next 实例；必要时 `UI_DIST_DIR` 独立构建目录验证，避免与并行会话互毁 .next。
