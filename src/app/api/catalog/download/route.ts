import { NextResponse } from 'next/server';
import { CATALOG_PDF_FILENAME, CATALOG_PDF_URL } from '@/lib/catalog';

/**
 * 图册 PDF 下载代理（GET /api/catalog/download）
 *
 * 为什么需要代理而不能直链 CDN：
 *   · `<a download>` 仅对**同源** URL 生效，直链 cdn.bailingwooden.com
 *     会被浏览器忽略该属性、改为在内置查看器打开；
 *   · CDN 未配置 CORS，前端 fetch + Blob 下载同样不可行。
 * 代理在服务端取 CDN 对象，以 `Content-Disposition: attachment` 吐流，
 * 点击即落盘。文件 2.4MB 左右，直接管道回传，不落临时文件。
 *
 * 该路径已被 middleware matcher 排除（`api` 段），不受语言重写影响。
 */

// 每次请求实时回源：图册更新后无需重新发版即可生效（CDN 侧仍有缓存层）
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const upstream = await fetch(CATALOG_PDF_URL, { cache: 'no-store' });

    if (!upstream.ok || !upstream.body) {
      return new NextResponse('Catalog file unavailable', {
        status: 502,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': `attachment; filename="${CATALOG_PDF_FILENAME}"`,
        // 代理响应不进共享缓存；CDN 直链自身有 7 天缓存
        'cache-control': 'private, max-age=0, no-cache',
      },
    });
  } catch {
    return new NextResponse('Catalog download failed', {
      status: 502,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }
}
