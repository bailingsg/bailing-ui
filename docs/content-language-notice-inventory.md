# 「内容语言」类声明清单（前台）

> 整理范围：`bailing-ui`（前台）。后台 `bailing-admin`、后端 `bailing-backend` 中**没有**同类声明。
> 整理时间：2026-10-22

---

## 1. 结论

系统里这类「本条内容只有英文，界面已中文化，正文保留英文原文」的声明**只有一套**，实现方式统一：

| 层级 | 位置 | 说明 |
| --- | --- | --- |
| 组件 | `src/components/common/content-fallback-notice.tsx` | 唯一实现，两种视觉变体 |
| 文案 | `src/i18n/messages/zh-CN.ts` → `contentFallback.badge` / `contentFallback.notice` | 中文文案（实际渲染用） |
| 文案 | `src/i18n/messages/en.ts` → `contentFallback.badge` / `contentFallback.notice` | 英文文案（**永不渲染**，见 §4-1） |
| 调用 | 10 个页面文件 / 11 处 | 见 §3 |

没有第二份硬编码副本：全库 `grep "原文|机器翻译|仅有英文"` 只命中上述组件、两个 messages 文件与页面注释。

---

## 2. 组件契约

```
ContentFallbackNotice({ locale, variant = 'banner', className })
```

- **渲染条件**：`locale === defaultLocale`（英文）时 `return null` —— 英文界面完全不出提示，只有中文界面出现。
- **variant='banner'**：独立提示条，`rounded-lg border bg-surface`，左侧 `bg-accent` 徽章 + 右侧说明文字。用于详情页/列表页正文前。
- **variant='subtle'**：一行 `text-caption` 小字（`徽章：说明`），用于首屏或已有一堆占位块的地方，避免压过主视觉。
- **无障碍**：均带 `role="note"`。

### 文案原文

中文（实际展示）：

```
内容语言
该条内容目前仅有英文版本。页面界面已切换为中文，下方产品 / 文章正文仍以英文原文展示，未做机器翻译。
```

英文（仅作类型占位，不渲染）：

```
Content language
This record is published in English only. The page interface is in Chinese, while the product / article content below is shown in its original English version.
```

---

## 3. 调用点清单

| # | 页面 | 文件 : 行 | 变体 | 位置 / 覆盖对象 |
| --- | --- | --- | --- | --- |
| 1 | 首页（CMS hero 区） | `app/[locale]/page.tsx:170` | subtle | Hero 文案与配图下方 |
| 2 | 首页（产品分类区） | `app/[locale]/page.tsx:289` | subtle | 分类卡片网格下方（CMS 分类名/描述为英文） |
| 3 | 产品列表 | `app/[locale]/products/(catalog)/page.tsx:127` | banner | 结果网格上方（仅 `items.length > 0`） |
| 4 | 产品详情 | `app/[locale]/products/[slugId]/page.tsx:226` | banner | 标题/摘要区之后、关键属性之前 |
| 5 | 资讯列表 | `app/[locale]/blog/(list)/page.tsx:162` | banner | 文章网格上方（仅 `items.length > 0`） |
| 6 | 文章详情 | `app/[locale]/blog/[slug]/page.tsx:181` | banner | 摘要之后、正文之前（`max-w-3xl`） |
| 7 | 应用列表 | `app/[locale]/applications/page.tsx:213` | subtle | 列表区底部，紧跟图片待补提示 |
| 8 | 应用详情 | `app/[locale]/applications/[slug]/page.tsx:195` | banner | 概述正文之后、侧栏之前 |
| 9 | 关于我们 | `app/[locale]/about/page.tsx:152` | banner | CMS 分区上方独立 `Section`（仅 `hasCmsSections`） |
| 10 | 工厂 | `app/[locale]/factory/page.tsx:106` | banner | 工厂概述正文之后 |
| 11 | 联系我们 | `app/[locale]/contact/page.tsx:231` | subtle | 员工联系人卡片区底部（`mt-6`） |

规律：**详情页用 banner，首屏/列表底部用 subtle**；列表页只在有数据时出现（空列表已有 EmptyNote）。

---

## 4. 同类「内容缺口声明」家族（同一设计意图，另一批组件）

### 4-1. 待补充占位：`ContentPlaceholder`

`src/components/layout/content-placeholder.tsx` —— 虚线框 + 图标 + 标题 + 说明，默认说明取 `placeholder.contentNote`：

```
内容待业务方确认后补充。   /   Content will be added once confirmed by the business.
```

共 **13 处**调用，覆盖 11 个页面：about、factory、quality、contact、applications（列表/详情）、blog（列表/详情）、products（列表/详情）、首页。

配套的「待业务方提供 / 待补充 / 后续更新」文案键（全部在 `zh-CN.ts`，约 20 条）：

- `common.photoPending` 图片待补充 / `common.productImagePending` 产品图片待补充 / `common.toBeConfirmed` 待确认
- `about.teamEmptyNotice`、`factory.galleryEmptyNotice|equipmentEmptyNotice|loadingEmptyNotice|exhibitionEmptyNotice|overviewPending`
- `quality.inspectionEmptyNotice|certificatePlaceholderNote|packagingEmptyNotice|certificateNote`（「在业务方核实之前，页面不展示任何证书名称、编号或发证机构。」）
- `blog.emptyNote`、`products.emptyNote`、`productDetail.specificationsEmptyNote|relatedEmptyNote`、`applications.relatedEmptyNote`、`contact.locationPlaceholderNote`

### 4-2. 演示数据声明：`DemoDataNotice`

`src/components/products/demo-data-notice.tsx`，文案 `products.demoBadge` / `products.demoText`：

```
演示数据
以下产品记录为用于验证页面模板的占位数据，后续将由 CMS 内容替换。
```

调用 2 处：产品列表 `:105`（`showDemoNotice`）、产品详情 `:264`（`isDemoSource()`）。仅 demo 数据源触发，生产 api 模式不出现。

### 4-3. 表单类声明（语义不同，附列备查）

- `contact.privacyNote`：您的信息仅用于回复本次询盘。
- `contact.locationMapHint`：点击后才会加载地图，此前不会写入 Google Cookie。
- `rfq.directNote`：本询盘将直接送达 {name}，不进入公共询盘分配队列。
- `rfq.attachmentSelectedNote`：在线附件上传尚未启用，请在需求描述中一并说明。

---

## 5. 发现的问题

1. **`variant="subtle"` 的 `lang="en"` 是错的**（`content-fallback-notice.tsx:33`）。该 `<p>` 内是**中文**文案，却标了 `lang="en"`，屏幕阅读器会用英文语音念中文。banner 变体没有这个属性，两者不一致。应为 `lang="zh-CN"`，或干脆不加（由页面 `<html lang>` 继承）。
2. **文案与所在页面不匹配**。声明写「下方**产品 / 文章**正文仍以英文原文展示」，但同样的 key 也用在关于我们、工厂、联系我们、应用列表、首页分类区 —— 这些位置下方是公司介绍、工厂介绍、员工卡片、分类名，不是「产品/文章正文」。建议拆成两个 key（`contentFallback.notice`（产品/文章专用）+ `contentFallback.noticeGeneric`（通用「下方内容」）），或统一改成中性措辞。
3. **品质页漏了这条声明**。`app/[locale]/quality/page.tsx` 的 `PublishedRecords` 会渲染 CMS 里的证书名称、发证机构、检测报告标题（同为单语言英文），中文界面下无任何语言提示，只靠 `certificateNote`（讲的是「不展示证书编号」，语义不同）。
4. **英文版文案缺「未做机器翻译」一句**，与中文不同步。当前英文界面不渲染所以无影响，但 `defaultLocale` 一旦变化就会暴露。
5. **徽章的冒号硬编码在组件里**（`{badge}：`，全角），未进 i18n。同样受 §5-4 影响。

---

## 6. 建议的收敛动作

| 优先级 | 动作 | 影响面 |
| --- | --- | --- |
| P2 | 修 `subtle` 变体的 `lang` 属性 | 1 行，纯无障碍 |
| P2 | 品质页补 `<ContentFallbackNotice>`（banner，放在认证记录区上方） | 1 文件 |
| P3 | 拆 `notice` / `noticeGeneric` 两个 key，按页面语义选用 | 2 个 messages + 5 处调用 |
| P3 | 中英文案对齐，冒号移入 i18n | 2 个 messages + 1 组件 |

> 改动只涉及 `bailing-ui`，不触碰后端契约；改完需 `npm run build` + 重启 `next start`（`.next` 需先清）。
