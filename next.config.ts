import type { NextConfig } from 'next';

/**
 * Next.js 配置（Phase 4.8）
 *
 * 关键点：**远程图片域名白名单**
 *
 * CMS 上传的图片（MediaAsset）由 bailing-backend 以绝对 URL 提供
 * （如 http://192.168.1.40:4000/uploads/media/2026/10/xxx.png）。
 * `next/image` 默认拒绝未登记的远程主机（会直接抛错、页面 500），
 * 因此这里把后端地址推导为 remotePatterns。
 *
 * 地址来源（构建期读取）：
 *   · NEXT_PUBLIC_API_BASE_URL      —— 后端 API 基地址（含 host/port）
 *   · NEXT_PUBLIC_UPLOADS_BASE_URL  —— 媒体 URL 基地址（后端 UPLOADS_BASE_URL 的对应值）
 *   · NEXT_PUBLIC_CDN_BASE_URL      —— 腾讯云 CDN 域名（Phase 6.0 起新图走 /media/**）
 * 另始终放行本机开发地址（localhost / 127.0.0.1）。
 *
 * ⚠️ 这些变量**运行期也必须存在**：生产镜像不是 standalone 构建，`next start`
 * 会在容器启动时重新加载本文件。只有 build-arg 是不够的——客户端包内联正确，
 * 但 remotePatterns 会是空数组，`/_next/image` 对每个远程 URL 都返回 400
 * `"url" parameter is not allowed`。生产在 compose 的 frontend.environment
 * 里注入了同样的变量，见 Dockerfile 顶部的事故说明。
 *
 * 安全取舍：这里**不**使用 `hostname: '**'`。放开任意主机等于把 Next 图片
 * 优化器变成开放代理；只登记本项目自己的后端 / 媒体域名。
 */

interface RemotePattern {
  protocol: 'http' | 'https';
  hostname: string;
  port?: string;
  pathname: string;
}

/** 把基地址转换为 next/image 的 remotePattern（默认 /uploads/** 路径） */
function toRemotePattern(
  rawUrl: string | undefined,
  pathname = '/uploads/**',
): RemotePattern | null {
  if (!rawUrl) return null;
  try {
    const url = new URL(rawUrl);
    return {
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
      pathname,
    };
  } catch {
    return null;
  }
}

const remotePatterns: RemotePattern[] = [];
const seen = new Set<string>();

function addPattern(pattern: RemotePattern | null): void {
  if (!pattern) return;
  // 去重键包含 pathname：同一主机可能既放行 /uploads/**（历史图）又放行 /media/**（COS 图）
  const key = `${pattern.protocol}://${pattern.hostname}:${pattern.port ?? ''}${pattern.pathname}`;
  if (seen.has(key)) return;
  seen.add(key);
  remotePatterns.push(pattern);
}

addPattern(toRemotePattern(process.env.NEXT_PUBLIC_API_BASE_URL));
addPattern(toRemotePattern(process.env.NEXT_PUBLIC_UPLOADS_BASE_URL));

/**
 * Phase 6.0：腾讯云 COS + CDN。
 * 新上传的媒体落库 URL 形如 https://cdn.bailingwooden.com/media/2026/10/xxx.webp，
 * 路径前缀是 /media/（glob 为 /media/**，不是 /uploads/**），必须单独登记，否则 next/image 会拒绝该主机。
 * 历史本地图（/uploads/**）保持原样放行——旧内容不受影响。
 */
addPattern(toRemotePattern(process.env.NEXT_PUBLIC_CDN_BASE_URL, '/media/**'));

// 本机开发地址：始终放行（生产构建时这些域名不会出现在内容里，无副作用）
for (const hostname of ['localhost', '127.0.0.1']) {
  addPattern({ protocol: 'http', hostname, pathname: '/uploads/**' });
}

/**
 * 并行会话隔离：另一会话可能正在操作 .next（build / start 互相 EPERM）。
 * 通过 UI_DIST_DIR 环境变量支持临时切换构建目录（验收时用独立目录，用后即弃）。
 */
const distDir = process.env.UI_DIST_DIR ?? '.next';

const nextConfig: NextConfig = {
  distDir,
  images: {
    // 未登记的远程图片会直接报错——这正是我们想要的：宁可显式登记，也不静默降级
    remotePatterns,
    dangerouslyAllowSVG: false,
    formats: ['image/webp'],
  },
};

export default nextConfig;
