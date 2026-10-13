import { Button } from '@/components/ui/button';
import { BackendStatusCard } from '@/components/backend-status-card';

export const dynamic = 'force-dynamic';

interface BackendCheck {
  reachable: boolean;
  httpStatus: number | null;
  latencyMs: number;
  databaseUp: boolean | null;
  message: string;
}

/**
 * 首页服务端直连后端 /api/v1/health/ready，展示真实连接状态。
 * 后端未启动时不会让页面崩溃，而是展示离线提示。
 */
async function checkBackend(): Promise<BackendCheck> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';
  const started = Date.now();
  try {
    const res = await fetch(`${base}/health/ready`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
    const latencyMs = Date.now() - started;
    const json = (await res.json().catch(() => null)) as {
      data?: { checks?: { database?: boolean } };
    } | null;
    const databaseUp = json?.data?.checks?.database ?? null;
    return {
      reachable: res.ok,
      httpStatus: res.status,
      latencyMs,
      databaseUp,
      message: res.ok ? '后端服务就绪' : '后端在线但未就绪',
    };
  } catch {
    return {
      reachable: false,
      httpStatus: null,
      latencyMs: Date.now() - started,
      databaseUp: null,
      message: '无法连接后端服务',
    };
  }
}

export default async function HomePage() {
  const backend = await checkBackend();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
      {/* 首页 Hero */}
      <section id="home" className="py-16 sm:py-24">
        <p className="mb-3 text-sm font-medium text-muted-foreground">Phase 1 · 项目初始化</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Bailing Wooden</h1>
        <p className="mt-2 text-lg text-muted-foreground">百灵木业 B2B 外贸独立站</p>
        <p className="mt-6 leading-7 text-muted-foreground">
          本阶段完成项目基础架构：Next.js 15 前端骨架、NestJS 后端 API、PostgreSQL 数据库与
          Prisma 数据模型。本页面为初始化状态页，不含任何虚构产品、客户或企业数据；
          完整产品展示、分类与询盘功能将在后续阶段开发。
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <a
              href="https://github.com/bailingsg/bailing-ui"
              target="_blank"
              rel="noreferrer noopener"
            >
              查看源码仓库
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href="#contact">联系入口（Phase 2 开放）</a>
          </Button>
        </div>
      </section>

      {/* 后端连接状态 */}
      <section className="pb-16">
        <h2 className="mb-4 text-2xl font-semibold">后端连接状态</h2>
        <BackendStatusCard backend={backend} />
      </section>

      {/* 关于 / 联系占位 */}
      <section id="about" className="border-t py-12">
        <h2 className="mb-3 text-2xl font-semibold">关于</h2>
        <p className="leading-7 text-muted-foreground">
          面向海外采购商的木制品 B2B 外贸独立站。技术栈、目录结构与开发规范详见
          docs/ 下项目文档（架构与 API 规范记录在后端仓库）。
        </p>
      </section>
      <section id="contact" className="border-t py-12">
        <h2 className="mb-3 text-2xl font-semibold">联系</h2>
        <p className="leading-7 text-muted-foreground">
          询盘收集与邮件通知将在 Phase 2 接入（使用现有企业邮箱）。本阶段不收集任何访客信息。
        </p>
      </section>
    </div>
  );
}
