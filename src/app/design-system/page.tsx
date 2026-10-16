import type { Metadata } from 'next';
import { Section, SectionHeader } from '@/components/layout/section';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardMedia,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/components/ui/file-upload';
import { ProductCard } from '@/components/common/product-card';
import { OptimizedImage } from '@/components/common/optimized-image';
import { brandPalette, spacingScale, typeScale } from '@/tokens';

export const metadata: Metadata = {
  title: 'Design System 预览',
  description: 'Phase 3.2 UI 设计系统组件与令牌自检页面（开发用，非业务页面）。',
  robots: { index: false, follow: false },
};

/** 色板：仅展示令牌名称与色阶，不涉及业务数据 */
const colorGroups: { title: string; note: string; tokens: string[] }[] = [
  {
    title: 'Brand · Wood Brown',
    note: '主色：主按钮、品牌强调',
    tokens: ['brand-50', 'brand-100', 'brand-200', 'brand-300', 'brand-400', 'brand-500', 'brand-600', 'brand-700', 'brand-800', 'brand-900'],
  },
  {
    title: 'Secondary · Natural Beige',
    note: '辅助色：次要按钮、柔和背景',
    tokens: ['beige-50', 'beige-100', 'beige-200', 'beige-300', 'beige-400', 'beige-500', 'beige-600', 'beige-700', 'beige-800'],
  },
  {
    title: 'Accent · Forest Green',
    note: '强调色：环保、木材溯源',
    tokens: ['forest-50', 'forest-100', 'forest-200', 'forest-300', 'forest-400', 'forest-500', 'forest-600', 'forest-700', 'forest-800'],
  },
  {
    title: 'Neutral · 暖灰',
    note: '中性色：文本、边框、表面',
    tokens: ['neutral-50', 'neutral-100', 'neutral-200', 'neutral-300', 'neutral-400', 'neutral-500', 'neutral-600', 'neutral-700', 'neutral-800', 'neutral-900'],
  },
  {
    title: 'Semantic · 语义色',
    note: '状态反馈：成功 / 警告 / 危险 / 信息',
    tokens: ['success-600', 'warning-600', 'danger-600', 'info-600'],
  },
];

const semanticTokens: { name: string; className: string; usage: string }[] = [
  { name: 'background', className: 'bg-background border', usage: '页面底色' },
  { name: 'surface', className: 'bg-surface border', usage: '交替区块底色' },
  { name: 'surface-inverse', className: 'bg-surface-inverse', usage: '深色区块 / 页脚' },
  { name: 'primary', className: 'bg-primary', usage: '主按钮 / 品牌强调' },
  { name: 'secondary', className: 'bg-secondary border', usage: '次要按钮' },
  { name: 'accent', className: 'bg-accent border', usage: '悬浮 / 选中底色' },
  { name: 'forest', className: 'bg-forest', usage: '环保主题强调' },
  { name: 'destructive', className: 'bg-destructive', usage: '危险操作' },
];

export default function DesignSystemPage() {
  return (
    <>
      <Section size="sm">
        <SectionHeader
          eyebrow="Phase 3.2"
          title="UI Design System 预览"
          description="本页用于设计系统自检与组件渲染验证，包含颜色、字体、间距令牌与基础组件。页面中出现的名称/描述均为组件占位示例，不代表真实产品或企业数据；正式业务页面将在 Phase 3.3 及之后开发。"
          as="h1"
        />
      </Section>

      {/* ---------------- 颜色令牌 ---------------- */}
      <Section tone="surface" size="sm">
        <SectionHeader
          eyebrow="Tokens"
          title="Color System"
          description="所有颜色集中在 src/styles/tokens.css 管理；组件只使用语义别名，不硬编码色值。"
        />

        <div className="mt-8 grid gap-8">
          {colorGroups.map((group) => (
            <div key={group.title} className="flex flex-col gap-3">
              <div>
                <h3 className="text-heading-sm">{group.title}</h3>
                <p className="text-small text-text-secondary">{group.note}</p>
              </div>
              <ul className="flex flex-wrap gap-3">
                {group.tokens.map((token) => (
                  <li key={token} className="flex flex-col gap-1.5">
                    <span
                      className="size-14 rounded-md border border-border"
                      style={{ background: `var(--color-${token})` }}
                    />
                    <span className="text-caption text-text-muted">{token}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="flex flex-col gap-3">
            <div>
              <h3 className="text-heading-sm">Semantic Aliases</h3>
              <p className="text-small text-text-secondary">组件实际引用的语义令牌层</p>
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {semanticTokens.map((token) => (
                <li key={token.name} className="flex flex-col gap-1.5">
                  <span className={`h-12 rounded-md ${token.className}`} />
                  <span className="text-caption font-medium">{token.name}</span>
                  <span className="text-caption text-text-muted">{token.usage}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ---------------- 字体与间距 ---------------- */}
      <Section size="sm">
        <SectionHeader
          eyebrow="Tokens"
          title="Typography & Spacing"
          description="字号与间距同样由令牌集中定义，页面无需逐个设置。"
        />

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h3 className="text-heading-sm">字体阶梯（{typeScale.length} 级）</h3>
            <div className="flex flex-col gap-4">
              <p className="text-display">Display 展示标题</p>
              <p className="text-heading-xl">Heading XL 一级标题</p>
              <p className="text-heading-lg">Heading LG 二级标题</p>
              <p className="text-heading-md">Heading MD 三级标题</p>
              <p className="text-heading-sm">Heading SM 四级标题</p>
              <p className="text-body-lg">Body LG 引导文本</p>
              <p className="text-body">Body 正文文本</p>
              <p className="text-small">Small 辅助文本</p>
              <p className="text-caption">CAPTION 说明文本</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-heading-sm">间距阶梯</h3>
            <ul className="flex flex-col gap-3">
              {Object.entries(spacingScale).map(([name, value]) => (
                <li key={name} className="flex items-center gap-4">
                  <span className="w-16 text-caption text-text-muted">space-{name}</span>
                  <span className="h-3 rounded-sm bg-primary" style={{ width: value }} />
                  <span className="text-caption text-text-muted">{value}</span>
                </li>
              ))}
              <li className="flex items-center gap-4">
                <span className="w-16 text-caption text-text-muted">section</span>
                <span className="h-3 rounded-sm bg-forest" style={{ width: '6rem' }} />
                <span className="text-caption text-text-muted">clamp(4rem → 7.5rem)</span>
              </li>
            </ul>
            <p className="text-small text-text-secondary">
              品牌色值（供 theme-color / 图表等非 CSS 场景使用）：
              <code className="ml-1 rounded bg-muted px-1.5 py-0.5 text-caption">
                {brandPalette.woodBrown}
              </code>
            </p>
          </div>
        </div>
      </Section>

      {/* ---------------- Button ---------------- */}
      <Section tone="surface" size="sm">
        <SectionHeader
          eyebrow="Components"
          title="Button"
          description="变体：primary / secondary / outline / ghost / danger / forest；状态：default / hover / active / disabled / loading。"
        />

        <div className="mt-8 flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Request Quote</Button>
            <Button variant="secondary">Contact Us</Button>
            <Button variant="outline">View Products</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="forest">Sustainable</Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra Large</Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
            <Button variant="outline" loading>
              Loading Outline
            </Button>
            <Button variant="danger" disabled>
              Disabled Danger
            </Button>
          </div>
        </div>
      </Section>

      {/* ---------------- Badge / Card ---------------- */}
      <Section size="sm">
        <SectionHeader
          eyebrow="Components"
          title="Badge & Card"
          description="Badge 用于 New / Certificate / Material / Application 等标注；Card 为通用容器，支持 Image / Title / Description / Footer Action。"
        />

        <div className="mt-8 flex flex-col gap-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Default</Badge>
            <Badge variant="new">New</Badge>
            <Badge variant="certificate">Certificate</Badge>
            <Badge variant="material">Material</Badge>
            <Badge variant="application">Application</Badge>
            <Badge variant="eco">Eco-friendly</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardMedia>
                <OptimizedImage alt="Card media placeholder" aspectRatio="4/3" />
              </CardMedia>
              <CardHeader className="pb-3">
                <CardTitle>Card Title</CardTitle>
                <CardDescription>卡片描述文本占位</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-small text-text-secondary">
                  Card 支持图片、标题、描述与底部操作区四段式结构。
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="outline">
                  Footer Action
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Text-only Card</CardTitle>
                <CardDescription>无图片的基础卡片</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-small text-text-secondary">
                  适用于工厂实力、品质说明、博客摘要等内容区块。
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="ghost">
                  Learn More
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-surface-brand">
              <CardHeader>
                <Badge variant="eco">Eco</Badge>
                <CardTitle>Accent Card</CardTitle>
                <CardDescription>品牌柔和底色变体</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-small text-text-secondary">
                  通过语义令牌组合出的品牌色卡片，无需自定义颜色。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>

      {/* ---------------- ProductCard ---------------- */}
      <Section tone="surface" size="sm">
        <SectionHeader
          eyebrow="Components"
          title="ProductCard"
          description="产品卡片组件（结构：图片 · 名称 · 简述 · CTA）。以下为组件占位示例，非真实产品数据；产品页与数据在后续阶段接入。"
        />

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <ProductCard
            name="Product Name"
            description="Short description placeholder for product card layout verification."
            badges={[
              { label: 'Material', variant: 'material' },
              { label: 'New', variant: 'new' },
            ]}
          />
          <ProductCard
            name="Product Name"
            description="Short description placeholder for product card layout verification."
            badges={[{ label: 'Certificate', variant: 'certificate' }]}
            ctaLabel="Request Quote"
          />
          <ProductCard
            name="Product Name"
            description="Short description placeholder for product card layout verification."
            badges={[{ label: 'Application', variant: 'application' }]}
          />
        </div>
      </Section>

      {/* ---------------- 表单组件 ---------------- */}
      <Section size="sm">
        <SectionHeader
          eyebrow="Components"
          title="Form"
          description="Input / Textarea / Select / FileUpload 为未来 RFQ 与 Contact 表单的基础控件；本阶段不含提交逻辑与后端接口。"
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="ds-company" required>
                Company Name
              </Label>
              <Input id="ds-company" placeholder="Your company name" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="ds-email" required>
                Email
              </Label>
              <Input id="ds-email" type="email" placeholder="you@company.com" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="ds-product">Product Interest</Label>
              <Select id="ds-product" defaultValue="">
                <option value="" disabled>
                  Please select
                </option>
                <option value="a">Option A</option>
                <option value="b">Option B</option>
                <option value="c">Option C</option>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="ds-message">Message</Label>
              <Textarea id="ds-message" placeholder="Tell us your requirements" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="ds-invalid">Invalid State</Label>
              <Input id="ds-invalid" aria-invalid defaultValue="invalid@example" />
              <span className="text-caption text-destructive">
                错误态示例：aria-invalid 触发危险色边框
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <FileUpload label="Upload Drawings" />
            <div className="flex flex-wrap items-center gap-3">
              <Button>Submit</Button>
              <Button variant="outline" loading>
                Submitting
              </Button>
              <Button variant="ghost" disabled>
                Disabled
              </Button>
            </div>
            <p className="text-small text-text-secondary">
              表单校验、提交与后端接口（RFQ）将在后续阶段实现；当前仅提供视觉与可访问性基础。
            </p>
          </div>
        </div>
      </Section>

      {/* ---------------- Layout 说明 ---------------- */}
      <Section tone="brand" size="sm">
        <SectionHeader
          eyebrow="Layout"
          title="Container / Section / SectionHeader"
          description="页面统一使用 <Section><SectionHeader/>内容</Section> 结构：区块留白（手机 64px → 桌面 120px）与容器内边距（16 / 24 / 32px）均由令牌控制。"
          align="center"
        />
        <div className="mt-8 flex justify-center">
          <Container width="narrow" className="rounded-lg border border-border-brand bg-background p-6">
            <p className="text-small text-text-secondary">
              这是 <code className="rounded bg-muted px-1.5 py-0.5">Container width=&quot;narrow&quot;</code>{' '}
              （768px，正文阅读宽度）示例。默认宽度为 1280px，大屏展示可用 1440px。
            </p>
          </Container>
        </div>
      </Section>
    </>
  );
}
