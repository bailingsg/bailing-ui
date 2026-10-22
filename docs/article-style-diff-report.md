# Bailing Wooden 文章页面新旧网站差异审计报告（只读审计）

- 审计对象：旧站 https://bailingwooden.com/（WordPress + hello-elementor + Elementor）与新站 http://localhost:3000/（Next.js 15 + Tailwind v4 + `.blog-prose` 排版）
- 审计方式：浏览器实测（Playwright + 系统 Chrome，桌面 1440×900 / 移动 390×844）、DOM 与计算样式提取、网络与控制台检查、数据库只读查询、代码只读阅读
- 审计时间：2026-10-20
- 审计范围声明：**未修改任何源代码、CSS、数据库、文章内容、DNS 或服务器配置**；报告与截图证据新增于 `bailing-ui/docs/` 下，不影响业务文件
- 最终状态：**AUDIT COMPLETE**（详见 G 节）

---

## A. 执行摘要

### A.1 检查了哪些页面

| 站点 | 页面 | URL | 结果 |
|---|---|---|---|
| 旧站 | 首页 | https://bailingwooden.com/ | 200（约 15s，响应慢） |
| 旧站 | 文章列表 /blog | https://bailingwooden.com/blog | **404**（旧站真实文章列表在 /news-2/，200） |
| 旧站 | 文章列表（真实） | https://bailingwooden.com/news-2/ | 200 |
| 旧站 | 5 篇文章详情 | 见 B 节对照表 | 5/5 可访问 |
| 新站 | 首页 | http://localhost:3000/ | 200 |
| 新站 | 文章列表 | http://localhost:3000/blog | 200（4 页 ×6 篇 + "Uncategorized 75"，共 75 篇，sitemap 76 条 blog URL） |
| 新站 | 5 篇文章详情 | 见 B 节对照表 | 5/5 可访问 |

文章匹配方式：通过旧站 WP REST API（`/wp-json/wp/v2/posts`）导出 slug，与新站 sitemap/列表 slug 逐一比对，**5 组均为同一篇文章、同一 slug**，非按 URL 猜测。

### A.2 差异规模

- 桌面端 + 移动端双视口截图 14 张（见 `docs/audit-article-style-evidence/`）
- 共确认 **11 项差异**：1 项 P0、4 项 P1、6 项 P2
- 证据等级分布：已确认 11 项；高度疑似 0 项；待确认 2 项（见 D.7、D.8）

### A.3 已确认的核心问题

1. **【P0】文章导语渲染出字面量 `[&hellip;]`，且导语是半截句子**：全部 75 篇文章的 hero 导语均以 `[…]` 截断（数据源自 WP 自动摘要），且 HTML 实体 `&hellip;` 未解码，页面上直接显示 `[&hellip;]`。
2. **【P1】正文中的 emoji 图片被放大到 768×768**：旧站依赖 WordPress 内联 CSS 约束 `img.emoji` 尺寸，该 CSS 未迁移，新站 `.blog-prose img` 未设宽度兜底。
3. **【P1】部分文章的正文 HTML 内携带 Tailwind 工具类，迁到新站后被"激活"**：旧站没有 Tailwind 时这些 class 是死类；新站中 utilities 层优先级高于 `.blog-prose` 组件层，导致同类文章之间标题字号、粗细、间距互相不一致。
4. **【P1】旧站内联样式与新站排版规则叠加断层**：旧站部分 h2 自带盒式标题内联样式，新站保留内联样式但间距/字号被 `.blog-prose` 与 utilities 双重改造，与旧站观感不符。

### A.4 最可能的根本原因（总体判断）

**不是"内容没迁过来"——正文 HTML 结构、文本、图片、表格均完整迁移；问题在于"样式系统整体换代 + 迁移数据里混杂了三代样式约定"：**

1. 旧站视觉由 WordPress 主题（hello-elementor）+ Elementor 全局样式（post-5.css）+ WP 运行时内联 CSS（emoji 尺寸）三层提供，这三层**没有任何一层随迁移带入新站**，新站用自建 `.blog-prose` 组件层替代——这是所有"排版观感差异"的总根源（P2 类）。
2. 旧站文章内容本身并非干净的标准 HTML：部分文章正文**自带 Tailwind 工具类与内联样式**（疑似原始内容由某个 Tailwind 化的 Markdown 渲染管线生成）。这些类在旧站无效、在新站有效，且优先级压过 `.blog-prose`，造成篇与篇之间样式不一致（P1 类）。
3. WP 自动摘要 `[&hellip;]` 被原样入库，前端按纯文本渲染，实体双重转义（P0 类）。

### A.5 对产品页/全站的潜在风险

- `.product-prose` 与 `.blog-prose` 同源同患：若产品正文 contentHtml 同样携带 Tailwind 类/无尺寸 emoji 图，**产品详情页存在同类问题（待确认，未在本次审计范围内逐篇验证）**。
- 数据库 `media_assets.url` 全部落库为 `http://192.168.1.40:4000/uploads/...`（`UPLOADS_BASE_URL` 开发配置），**生产部署时必须用正式域名重写，否则全站图片 404**——这是全站级配置风险，不限于文章页。
- 修复 `.blog-prose` 属全局 CSS，任何改动都会同时影响博客与依赖同款规则的产品页，须回归测试。

---

## B. 新旧页面对照

截图均位于 `docs/audit-article-style-evidence/`，视口统一为 1440×900（移动端另附 390×844 一对）。

| # | 文章标题 | 旧站 URL | 新站 URL | 同一篇 | 访问 |
|---|---|---|---|---|---|
| 1 | How to Choose the Best Plywood for Marine and Humid Environments | https://bailingwooden.com/how-to-choose-the-best-plywood-for-marine-and-humid-environments/ | http://localhost:3000/blog/how-to-choose-the-best-plywood-for-mumid…（同 slug） | 是 | 双 200 |
| 2 | MDF vs Plywood vs Particle Board Bailing Guide | https://bailingwooden.com/mdf-vs-plywood-vs-particle-board-bailing-guide/ | http://localhost:3000/blog/mdf-vs-plywood-vs-particle-board-bailing-guide | 是 | 双 200 |
| 3 | Blockboard Manufacturing: A Complete Overview… | https://bailingwooden.com/blockboard-manufacturing-a-complete-overview-of-the-production-process-materials-and-applications/ | http://localhost:3000/blog/blockboard-manufacturing-…（同 slug） | 是 | 双 200 |
| 4 | Top 7 Questions About Melamine Plywood… | https://bailingwooden.com/top-7-questions-about-melamine-plywood-a-comprehensive-faq-guide-for-professionals/ | http://localhost:3000/blog/top-7-questions-…（同 slug） | 是 | 双 200 |
| 5 | Beginner Woodworking Tools: Don't Fall for These 3 "Budget Trap" Mistakes | https://bailingwooden.com/beginner-woodworking-tools-dont-fall-for-these-3-budget-trap-mistakes/ | http://localhost:3000/blog/beginner-woodworking-tools-…（同 slug） | 是 | 双 200 |

> 注：新站 URL 前缀为 `https://bailingwooden.com/blog/<slug>`（sitemap 声明域名），本地为 `http://localhost:3000/blog/<slug>`。旧站文章 URL 无 `/blog/` 前缀。

### B.1 每篇关键差异与 DOM / 计算样式证据

以下"旧→新"均为 1440×900 桌面视口下浏览器计算样式实测值。

**通用差异（5 篇全部命中）**

| 项目 | 旧站实测 | 新站实测 | 证据 |
|---|---|---|---|
| 正文容器宽度 | 978px（1140px 白卡片 − 左右 80px padding） | 768px（`article.max-w-narrow`） | 浏览器 DOM 链测量 |
| 正文字体 | Roboto 16px / 行高 24px / #666666 | Inter 16px / 行高 26.4px / #57534e | computed style |
| H2 样式 | 32px / 500 / #666666 / margin 8px-16px | 24px / 600 / #1c1917 / margin 32px-8px（无 Tailwind 类文章） | computed style + `.blog-prose h2` 规则 |
| 段落间距 | margin-bottom 14.4px | `> * + *` margin-top 16px，本身无 mb | computed style + globals.css:146 |
| 链接颜色 | #cc3366（elementor 默认）无下划线 | #8b5e34 带下划线 | computed style |
| ul 缩进 | padding-left 40px | padding-left 24px（pl-6） | computed style |
| 正文图片 | 直角、无边框、无圆角 | 12px 圆角 + 1px 边框（`.blog-prose img`） | computed style |
| 表格 th | 透明底 / 居中 / padding 15px / 边框 rgba(128,128,128,.5) | #fafaf9 底 / 左对齐 / padding 8px 12px / 边框 #e7e5e4 | computed style |
| 页面容器 | 白色卡片 + `box-shadow: 0 0 8px rgba(0,0,0,.15)` + 顶部 NEWS 横幅 hero | 无卡片无阴影；hero 区改为"分类徽章+日期+阅读时长+48px H1+导语"，下方新增 16:9 封面大图 | DOM 链 + 截图 |
| H1 | 40px / 600 / "Barlow Condensed" / #272727 | 48px / 700 / Inter / #1c1917 | computed style |

**逐篇附加差异**

1. **marine（图多、含盒式标题）**
   - 旧站 5 张正文图全部加载（Jetpack CDN `i0.wp.com` 真实 resize）；新站同图 5 张、滚动后全部加载成功（首次探测显示 1 张未加载，实为 `loading=lazy` 未进入视口，非文件缺失——已验证）。
   - 旧站 h2 为盒式标题（teal 左边框 + 浅灰底，来自正文 HTML 内联样式）；新站该内联样式保留，但 h2 被自身携带的 Tailwind 类改为 19.2px/700/zinc-800、margin-top 16px——**与同篇文章其它标题、与其他文章的标题都不一致**。
   - 截图：`how-to-choose-the-best-plywood-for-marin-{old,new}-1440.png`
2. **mdf（长文+表格）**
   - 表格两边都渲染（border-collapse:collapse），但 th 底色/对齐/padding 全面不同（见通用表）。
   - 正文含 23 处 `ds-markdown-paragraph`（WPBakery/Markdown 渲染残留），`<span class="">` 空类名 span 包裹每个文本片段——纯结构噪声，不影响渲染但使 HTML 膨胀。
   - 截图：`mdf-vs-plywood-vs-particle-board-bailing-{old,new}-1440.png`
3. **blockboard（长文、结构简单）**
   - 排版差异同通用表；无表格/盒式标题，是最"干净"的对照组——证明即使最干净的文章也存在宽度/字体/间距/颜色系统性差异。
   - 截图：`blockboard-manufacturing-a-complete-over-{old,new}-1440.png`
4. **top7（FAQ、含盒式标题）**
   - 与 marine 同病：正文携带 Tailwind 工具类（47 处）被激活。
   - 截图：`top-7-questions-about-melamine-plywood-a-{old,new}-1440.png`
5. **beginner（emoji 联系卡片）**
   - **emoji 爆炸实锤**：`<img class="emoji" src="…/1f4e7.svg">` 等 3 个 emoji，旧站 16×16（WP 内联 CSS 约束），新站 **768×768 + 12px 圆角 + 1px 边框**，把正文撑出巨大空白。
   - hero 导语显示 `similar [&hellip;]` 字面量（P0 问题最直观样例）。
   - 截图：`beginner-woodworking-tools-dont-fall-for-{old,new}-1440.png`

### B.2 移动端（390×844）

- 新站：正文 358px、`scrollWidth=390`，无横向溢出，排版正常（`marine-new-390.png`、`beginner-new-390.png`）。
- 旧站：正文 228px 但 `scrollWidth=494 > 390`，**旧站自身存在横向溢出**（元素超出视口），属旧站问题，不构成新站缺陷。
- P0（`[&hellip;]`）与 P1（emoji）在移动端同样复现。

### B.3 列表页对比

- 旧站快照 `old-list-1440.png`：访问 `https://bailingwooden.com/blog` 返回 **404 "The page can't be found."**；旧站真实文章列表为 `/news-2/`（EAEL 动态帖子网格）。
- 新站 `new-list-1440.png`：/blog 卡片流 + 分类筛选 + 分页，功能完整。
- 结论：列表 URL 结构变化（`/<slug>/`→`/blog/<slug>`，`/news-2/`→`/blog`）属预期的路由换代，但需评估旧 URL 的 SEO 承接（见 D.8）。

---

## C. 差异汇总表

| 编号 | 差异类别 | 具体表现 | 根本原因 | 证据 | 严重程度 | 修复方向 |
|---|---|---|---|---|---|---|
| D-01 | 内容数据 / 摘要 | 全部 75 篇文章 hero 导语以 `[…]` 截断且显示字面量 `[&hellip;]` | WP 自动摘要（`excerpt.rendered` 自带 `[&hellip;]`）迁移原样入库；详情页 `page.tsx:179` 将 excerpt 当纯文本渲染，HTML 实体被双重转义 | ①DB 查询 blog_posts.excerpt 均含 `hellip`；②WP REST API 原文 `looks similar [&hellip;]`；③三站截图可见；④代码位置 | **P0** | 迁移层或 DTO 层解码实体并去掉 `[…]` 尾缀；或改为正文首段自动截取；数据一次性清洗（幂等脚本） |
| D-02 | 图片 / emoji | 正文 emoji `<img class="emoji">` 渲染成 768×768 大方块（带圆角边框） | 旧站靠 WP 内联 CSS `img.wp-smiley, img.emoji { width:1em!important; height:1em!important; display:inline!important }` 约束，该 CSS 未迁移；新站 `.blog-prose img` 只设 height:auto/border-radius，无尺寸兜底；emoji SVG 无 width/height 属性 | ①旧站 HTML 内该 inline `<style>` 全文；②新站 computed width/height=768px×768px；③截图巨大方块 | **P1** | `.blog-prose img.emoji`（及 sanitizer 白名单策略）补 `width:1em;height:1em;display:inline`；长期方案：渲染层把 emoji 还原为 Unicode 字符 |
| D-03 | CSS 优先级 / 内容混杂 | marine、top7 等文章的 h2/p 被正文自带的 Tailwind 类改色改号：h2=19.2px/700/zinc-800/mt16，与其它文章（24px/600/主题色/mt32）不一致 | 正文 contentHtml 含 `class="text-[1.2rem] font-bold mt-4 pt-4 mb-4 text-zinc-800 dark:text-zinc-200 first:mt-0 first:pt-0 tracking-tight"` 等；旧站无 Tailwind 这些类是死类；新站 Tailwind v4 utilities 层优先级高于 `.blog-prose` 所在 components 层 | ①新旧 HTML 该 h2 outerHTML 逐字一致；②两篇文章计算样式实测差；③编译 CSS 证实 utilities 层 | **P1** | 后端 sanitizer 将 class 属性列入剥离/白名单（正文只保留语义标签），或渲染为 iframe/影子 DOM 隔离；见方案 B |
| D-04 | 内联样式叠加 | 旧站盒式 h2（`border-left:6px solid #2b7a8a;background-color:#f5f7fa;padding:15px`）在新站保留但间距/字号被双重改造，与旧站观感不符 | 内联样式保留 + `.blog-prose h2` 间距 + utilities 叠加，三层规则在旧站只有内联一层 | ①HTML style 属性实测；②计算样式差 | **P1** | 与 D-03 同一处理：净化层统一裁决"保留/剥离"，不要半保留 |
| D-05 | 布局宽度 | 正文 978px → 768px | 旧站 1140px 白卡片−80px padding；新站 `article.max-w-narrow`(768px) + 右侧 288px 侧栏 grid | DOM 链计算宽度 | P2 | 设计取舍：若拟保留新站信息架构（侧栏 CTA），维持 768px 并将 `.blog-prose` 字号/间距按 768 视宽重新校准；否则取消侧栏、放宽 max-w |
| D-06 | 字体 | Roboto+Barlow Condensed → Inter；正文 #666 → #57534e | 旧站 Elementor kit（post-5.css）全局字体；新站设计令牌（Inter + 语义色） | computed style；旧站 CSS 文件清单 | P2 | 设计取舍。若拟向旧观感靠拢，可在 `.blog-prose` 范围覆写 font-family/color，但不建议全站回退 |
| D-07 | 标题层级 | H1 40/600 condensed → 48/700 Inter；H2 32/500 → 24/600 | 同上（主题 vs 设计令牌） | computed style | P2 | 同 D-06 |
| D-08 | 链接样式 | #cc3366 无下划线 → #8b5e34 下划线 | 旧站 Elementor 默认链接色；新站 `.blog-prose a` 品牌色+下划线 | computed style | P2 | 可保留新站品牌一致性（建议），或按篇对比后微调 |
| D-09 | 表格 | th：透明/居中/15px → #fafaf9/左对齐/8px 12px；边框灰阶不同 | `.blog-prose table/th/td` 组件层 vs 旧站 Elementor 默认表格样式 | computed style | P2 | 保留新站表格样式即可（更现代），注意移动端表格横向滚动兜底 |
| D-10 | 列表与图片细节 | ul 缩进 40px→24px；正文图新增 12px 圆角+1px 边框；emoji 图无 width/height 属性（CLS） | `.blog-prose ul{pl-6}`/`img` 组件层规则；迁移 HTML 图片属性被剥离 | computed style；HTML 属性比对 | P2 | 圆角/边框建议保留（新站设计语言）；为正文 img 补默认 `max-width:100%` 与 emoji 特判（同 D-02） |
| D-11 | 媒体 URL / 性能 | 正文图 srcset 退化为同一 URL 多宽度（300w/150w/768w 全部指向 800×800 原图）；URL 写死 `http://192.168.1.40:4000/uploads/...`；经 Next Image 的封面图 srcSet 也指向该 LAN IP | 迁移时按 WP 的 srcset 格式改写但未生成真实多尺寸文件；`UPLOADS_BASE_URL=http://192.168.1.40:4000`（后端 .env 开发配置） | ①HTML srcset 实测；②.env 第 35 行；③DB media_assets.url | P2（**生产部署时升为 P0**） | 生产环境改 `UPLOADS_BASE_URL` 为正式域名；净化层剥离失效 srcset 或补真实多尺寸；封面图走 Next Image 时确保远端 host 白名单含该域 |

**证据等级说明**：D-01~D-11 均为**已确认**（浏览器计算样式 / DOM / 网络 / DB / 代码至少两类证据交叉）。本节之外另有 2 项**待确认**（D.7、D.8）。

---

## D. 根本原因分析

### D.1 内容结构问题（已确认，但结论与直觉相反）

- **正文 HTML 结构完整迁移，无丢失**：5 篇文章的新旧正文标签结构逐字一致（含 `ds-markdown-paragraph`、空 `class=""` 的 `<span>`、`hr`、`ul/ol`、`table`、盒式标题内联样式、emoji img）。文本量比对 5 篇结尾均为文章签名段（"…Shandong Province, China (26 years of experience)"），无截断丢失。
- **但内容里混着三代样式约定**：① 纯 Markdown 渲染产物（`ds-markdown-paragraph` + 裸标签）；② Tailwind 化的 HTML（marine/top7 的工具类 + 内联样式）；③ WP 运行时注入物（emoji img、`data-attachment-*`、`wp-image-*` class）。新站渲染管线只按"语义 HTML + `.blog-prose`"一种约定处理，遇到②③ 就失控。
- **摘要数据被污染**：excerpt 不是编辑手写，而是 WP 自动生成的半截句 + `[&hellip;]`，原样入库又被当前 Details 页当作正式导语渲染。

### D.2 CSS 样式缺失问题（已确认）

旧站文章视觉依赖三层，均未迁移：
1. **主题层**：hello-elementor `theme.css`（reset + 基础排版）；
2. **Elementor 全局层**：`post-5.css`（Roboto/Barlow Condensed、16px/#666、H1 40px、链接 #cc3366、表格/列表默认样式——实测计算样式与 Elementor 默认值吻合）；
3. **WP 运行时内联层**：`img.emoji` 1em 约束、smiley 规则。

新站用 `.blog-prose` 组件层（globals.css:131-253）替代第 1、2 层，设计语言彻底换代；第 3 层无任何替代 → D-02。**这不是 bug，是未做"旧样式→新样式"的显式映射决策。**

### D.3 CSS 优先级或覆盖问题（已确认）

Tailwind v4 cascade layers 顺序：theme < base < components < **utilities**。`.blog-prose h2{margin-top:2rem}` 在 components 层；正文自带的 `mt-4`（utilities 层）**无论特异性都赢**。因此：
- 无 Tailwind 类的文章（beginner/mdf/blockboard）：h2=24px/600/主题色/mt 32px；
- 有 Tailwind 类的文章（marine/top7）：h2=19.2px/700/zinc-800/mt 16px，另有 `first:mt-0 first:pt-0`、`!mt-2 !mb-2 leading-relaxed`（important 工具类）改造段落间距。
- 副产物：`dark:text-zinc-200` 等 dark 变体类随内容进入 DOM，与全站 class 策略暗色模式（`.dark`）耦合，未来开暗色会误伤。

### D.4 图片和媒体问题（部分确认，部分排除）

- **排除**：图片文件不可访问——**未发现证据**。5 张正文图滚动后全部 200 加载（首次"加载失败"为 lazy 未触发）。旧站 Jetpack CDN 图全部 200。
- **确认**：①srcset 退化（多宽度同指一图，D-11）；②媒体 URL 写死 LAN IP（D-11）；③emoji 无尺寸被拉伸（D-02）；④正文图被加圆角边框（D-10，设计差异）；⑤封面图为 16:9 强制裁剪（`aspectRatio="16/9"` + `object-cover`），旧站无封面展示位——原图非 16:9 时会裁切。
- **待确认**：全站 34 个产品 / 239 个媒体的 URL 是否都需要域名重写（DB 已落库 LAN IP，推断需要，未逐条核）。

### D.5 字体和外部资源问题（已确认差异，旧站自身也有故障）

- 新站字体自托管（Inter + Noto Sans SC fallback），加载正常，控制台无字体错误。
- 旧站自身资源故障（非迁移问题，仅备注）：`floating-menu.css/js` 404（相对路径错误）、EAEL CSS 520/525（Cloudflare 回源故障）。说明旧站样式供给本身已不完全可靠。
- **未发现**新站外部字体/图标加载失败。

### D.6 响应式布局问题（已确认，方向与预期相反）

- 新站移动端健康：358px 正文、无横向溢出、`max-w-narrow` + grid 降级正常。
- 旧站移动端 `scrollWidth=494>390` 存在横向溢出（旧站缺陷）。
- 新站隐患：`.blog-prose table` 仅 `w-full`，宽表格在 390px 视口可能溢出（5 篇样本表格窄，未触发，**待确认**）；正文图 768px 大方块在移动端同样出现（D-02 复现）。

### D.7 迁移过程中的 HTML 转换问题（已确认）

- **保留过度**：`class`/`style`/`data-*` 属性原样进入新站 DOM——WP 的时代残留（`wp-image-1240`、`data-attachment-id`）和来路不明的 Tailwind 类都被完整保留，sanitizer 只管安全不管卫生。
- **实体双重转义**：`&hellip;` 在 DB 中是字面字符串（非字符），excerpt 被 JSX 文本渲染时原样显示；这是"迁移数据未做实体归一化"的直接后果。
- **图片属性被剥离后无兜底**：width/height 属性没了，`.blog-prose img` 也没补默认约束 → 无固有尺寸图失控。
- **未发现**：脚本注入、事件属性、危险协议（sanitizer 白名单生效，公开页 console 无相关错误）。

### D.8 其它待确认项

1. **旧 URL SEO 承接**：旧站文章 URL 为 `/<slug>/`（无 /blog/ 前缀），新站为 `/blog/<slug>`；旧站 `/blog` 本身是 404，真实列表 `/news-2/`。数据库有 `seo_redirects` 表，**是否已录入这 75 条文章的 301 规则未验证**（本次未查该表内容）。若未录入，旧收录权重断链。
2. **产品页同患**：`.product-prose` 同源规则 + 34 个产品 contentHtml 未逐篇审计，若同样携带 Tailwind 类/emoji，则问题面扩大（高度疑似，未验证）。

---

## E. 修复方案建议（仅分析，本阶段不执行）

### 方案 A：为新站文章正文建立独立排版样式系统（保留新站设计）

**思路**：承認新站设计语言，把 `.blog-prose` 升级为完整的"文章排版系统"，并让它在与内容自带样式冲突时稳赢。

- 实施方式：
  1. globals.css 的 `.blog-prose` 规则整体移入 `@layer utilities`（或对关键规则加 `!` 前缀），压过内容自带 utilities；
  2. 补 `.blog-prose img{max-width:100%}`、`.blog-prose img.emoji{width:1em;height:1em;display:inline-block;vertical-align:-.1em;border:0;border-radius:0}`、`.blog-prose table{display:block;overflow-x:auto}`（移动端表格兜底）；
  3. D-01 数据层修复：幂等脚本清洗 excerpt（去 `[&hellip;]` 尾缀、解码实体），同时改详情页导语为"正文首段安全截断"或干脆移除导语；
  4. 宽度/字体维持新站现状，只做 768px 视宽下的间距微调。
- 修改范围：globals.css（~40 行）+ 1 个详情页 + 1 个数据清洗脚本；不依赖重新迁移。
- 是否重新迁移数据：不需要（excerpt 可脚本清洗）。
- 影响面：博客详情页；`.product-prose` 若同步升级需产品页回归。
- 移动端：天然适配（规则响应式）。
- 维护成本：低；所有文章样式收敛到一处，后续新增文章无论内容怎么来都受控。
- 风险与回滚：CSS 级改动，git 可瞬时回滚；风险点是"压过内容自带类"后 marine/top7 的盒式标题内联样式仍在（内联样式优先级最高，A 方案不动它）——可能仍有少数篇观感特殊，需接受或在数据侧处理。
- 验证方法：5 篇样本 + 随机抽 10 篇前后对比截图；emoji/表格/图片三类 fixture 页；Lighthouse CLS。

### 方案 B：在净化层统一"消毒"内容 HTML，只留语义结构（兼容旧内容）

**思路**：不动 `.blog-prose`，改**后端 sanitizer / 渲染管线**，把迁移民进来的"样式特权"全部剥离，让 `.blog-prose` 成为唯一裁判。

- 实施方式：
  1. `rich-text.sanitizer.ts` 增加属性级白名单：`img` 仅保留 `src/alt/width/height/loading`；`p/h1-h6/ul/ol/li/table` 等剥离 `class`/`style`/`data-*`；`a` 仅保留 `href/rel/target`；
  2. 数据侧一次性清洗脚本（默认 dry-run，`--apply` 落库，幂等）：对 75 篇文章 contentHtml 跑同一消毒规则 + excerpt 去 `[&hellip;]` + 实体归一化 + emoji `<img>` 还原 Unicode（或给 emoji 加 class 后由 CSS 兜底）；
  3. srcset 失效项剥除；`wp-image-*`/`data-attachment-*` 清除；
  4. 消毒在**写入时**（CMS 保存/迁移）与**读取时**（DTO 输出前）双重把关，防止后台再引入新污染。
- 修改范围：sanitizer + 1 个迁移/清洗脚本 + DTO；`.blog-prose` 可维持现状（或叠加方案 A 的第 2 条兜底规则）。
- 是否重新迁移数据：不需要全量重迁，脚本清洗即可；建议与后续任何增量迁移同一管线。
- 影响面：博客 + 产品（同一 sanitizer），**必须同步回归产品详情页**；后台富文本编辑器粘贴带样式内容时也会被消毒（需评估编辑侧体验，给编辑留"允许的有限样式"清单）。
- 移动端：无影响。
- 维护成本：中；换来的是内容数据长期干净，是"治本"。
- 风险与回滚：脚本须默认 dry-run + 备份 + 分批（≤10 篇/批）；sanitizer 收紧可能误伤编辑合法用法（先加观测日志再强制）；回滚 = 还原脚本输出的 contentHtml 新列或 DB 快照。
- 验证方法：清洗前后逐篇 diff（脚本产出报告）；5 篇样本浏览器对比；后台编辑器冒烟。

### 方案 C（补充项，与 A/B 正交）：媒体与 URL 治理

- `UPLOADS_BASE_URL` 生产改正式域名；`media_assets.url` 批量 UPDATE 或渲染时按环境拼接；
- 上传管线生成真实多尺寸（300/768/1024），让 srcset 名副其实；
- Next Image `remotePatterns` 加生产域名。

### 方案比较

| 维度 | A（CSS 排版系统） | B（内容消毒） |
|---|---|---|
| 治本程度 | 治标（表象收敛） | 治本（污染源清除） |
| 改动量 | 小（CSS+1 页） | 中（sanitizer+数据脚本） |
| 数据重迁 | 不需要 | 不需要（脚本清洗） |
| 产品页影响 | 同步升级才影响 | 必然影响（须回归） |
| 编辑侧影响 | 无 | 粘贴样式被消毒（需宣导） |
| 遗留风险 | 内联样式/盒式标题仍特殊 | 误伤编辑合法样式 |
| 回滚难度 | 极易 | 中（需快照） |

**建议组合**：短期 A 的兜底规则（emoji/表格/max-width）+ B 的数据清洗与 excerpt 修复先落地止血；中期 B 的 sanitizer 收紧；A/B 都**不建议**为了"像旧站"而回退字体/宽度/颜色——旧站视觉本身已部分故障（自行程资源 404/520），且新站设计语言统一，回退成本高于收益。

---

## F. 后续实施建议（优先级）

- **P0（内容缺失/页面异常/严重影响使用）**
  1. D-01：excerpt 截断 + `[&hellip;]` 字面量——全量文章可见，直接损害专业形象。
  2. D-11 生产化：`UPLOADS_BASE_URL` 改正式域名并重写/按环境拼接媒体 URL——上线前必须解决，否则全站图片 404。
- **P1（正文结构/图片/主要排版错误）**
  3. D-02：emoji 768px 方块（CSS 一行兜底可先止血）。
  4. D-03/D-04：内容自带 Tailwind 类/内联样式导致篇间不一致（sanitizer 消毒 + 数据清洗）。
- **P2（字体、间距、细节、响应式）**
  5. D-05~D-10：宽度、字体、标题、链接、表格、列表、圆角等系统性观差异——按设计决策逐项校准，或明确"保留新站设计"并记录在 DESIGN-SYSTEM。
  6. 移动端表格横向滚动兜底（D.6 待确认项）。
- **待确认转办**：D.8-1 旧文章 URL 的 301 承接（查 `seo_redirects`）；D.8-2 产品页 `.product-prose` 同患排查；D.4 媒体 URL 全量核查。

---

## G. 最终状态

- 实际访问并检查了新旧网站文章页面：**是**（旧站 5/5、新站 5/5，另含双方首页与列表页）。
- 对相同文章进行比较：**是**（slug 级匹配，非同页主观评价）。
- 检查实际 DOM、CSS 和计算样式：**是**（Playwright 实测计算样式 + DOM 链 + 网络/控制台 + DB 只读查询 + 代码阅读）。
- 找到有证据支持的差异及可能原因：**是**（11 项已确认 + 2 项待确认，证据分级标注）。
- 提供截图和差异表：**是**（`docs/audit-article-style-evidence/` 14 张 + C 节汇总表）。
- 形成可供后续修复决策使用的技术方案比较：**是**（方案 A/B/C + 比较表）。
- 未修改任何业务代码、CSS、数据库、文章内容或服务器配置：**是**（仅新增报告与截图目录 `bailing-ui/docs/`）。

** AUDIT COMPLETE**
