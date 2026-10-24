/**
 * 媒体地址类型判别（图片 / 视频）
 *
 * 后台媒体库当前只开放图片与 PDF 上传，但工厂分区的 gallery / 展会照片
 * 以及未来的媒体库扩展都可能引入视频地址（.mp4 / .webm / .mov ...）。
 * 公开接口只回传 URL（不带 mimeType），因此按扩展名判别，
 * 查询串（?v=xxx）与 hash 不参与匹配。
 */

/** 常见视频扩展名（小写，含点） */
const VIDEO_EXTENSIONS = ['.mp4', '.m4v', '.webm', '.mov', '.ogv', '.ogg'] as const;

/** 取路径部分（小写），解析失败时退回原始字符串 */
function pathOf(url: string): string {
  try {
    return new URL(url, 'http://placeholder.invalid').pathname.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

/** 该地址是否为视频（按扩展名判别，查询串忽略） */
export function isVideoUrl(url: string): boolean {
  const path = pathOf(url);
  return VIDEO_EXTENSIONS.some((extension) => path.endsWith(extension));
}
