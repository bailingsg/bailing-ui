import { Badge } from '@/components/ui/badge';

export interface BackendCheckResult {
  reachable: boolean;
  httpStatus: number | null;
  latencyMs: number;
  databaseUp: boolean | null;
  message: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';

/** 后端连接状态卡片：展示首页对 API 的真实探测结果 */
export function BackendStatusCard({ backend }: { backend: BackendCheckResult }) {
  return (
    <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium">API 地址</span>
        <code className="rounded bg-muted px-2 py-1 text-sm">{API_BASE}</code>
        {backend.reachable ? (
          <Badge variant="default">已连接</Badge>
        ) : (
          <Badge variant="destructive">未连接</Badge>
        )}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-muted-foreground">状态</dt>
          <dd className="mt-1 font-medium">{backend.message}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">HTTP 状态码</dt>
          <dd className="mt-1 font-medium">{backend.httpStatus ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">响应耗时</dt>
          <dd className="mt-1 font-medium">{backend.latencyMs} ms</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">数据库</dt>
          <dd className="mt-1 font-medium">
            {backend.databaseUp === null ? '未知' : backend.databaseUp ? '正常' : '离线'}
          </dd>
        </div>
      </dl>

      <div className="mt-4 text-xs text-muted-foreground">
        <p className="font-medium">健康检查端点</p>
        <ul className="mt-1 space-y-0.5">
          <li>
            <code>GET /api/v1/health</code> — 服务存活检查
          </li>
          <li>
            <code>GET /api/v1/health/ready</code> — 就绪检查（含数据库状态）
          </li>
        </ul>
      </div>

      {!backend.reachable && (
        <p className="mt-4 rounded-md bg-muted p-3 text-xs text-muted-foreground">
          后端或数据库未启动。请先运行数据库（bailing-backend：npm run db:up）与后端（npm run
          start:dev），详见后端仓库 README。
        </p>
      )}
    </div>
  );
}
