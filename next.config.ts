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
 * 另始终放行本机开发地址（localhost / 127.0.0.1）。
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

/** 把基地址转换为 next/image 的 remotePattern（仅 /uploads/** 路径） */
function toRemotePattern(rawUrl: string | undefined): RemotePattern | null {
  if (!rawUrl) return null;
  try {
    const url = new URL(rawUrl);
    return {
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
      pathname: '/uploads/**',
    };
  } catch {
    return null;
  }
}

const remotePatterns: RemotePattern[] = [];
const seen = new Set<string>();

function addPattern(pattern: RemotePattern | null): void {
  if (!pattern) return;
  const key = `${pattern.protocol}://${pattern.hostname}:${pattern.port ?? ''}`;
  if (seen.has(key)) return;
  seen.add(key);
  remotePatterns.push(pattern);
}

addPattern(toRemotePattern(process.env.NEXT_PUBLIC_API_BASE_URL));
addPattern(toRemotePattern(process.env.NEXT_PUBLIC_UPLOADS_BASE_URL));

// 本机开发地址：始终放行（生产构建时这些域名不会出现在内容里，无副作用）
for (const hostname of ['localhost', '127.0.0.1']) {
  addPattern({ protocol: 'http', hostname, pathname: '/uploads/**' });
}

const nextConfig: NextConfig = {
  images: {
    // 未登记的远程图片会直接报错——这正是我们想要的：宁可显式登记，也不静默降级
    remotePatterns,
    dangerouslyAllowSVG: false,
    formats: ['image/webp'],
  },
};

export default nextConfig;
