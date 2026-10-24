/**
 * 产品图册（BL-CATALOG.pdf）静态资产配置
 *
 * 对象托管在腾讯云 COS（key: `media/catalog/2026/10/`），经 CDN
 * `cdn.bailingwooden.com` 分发，与 MediaService 管理的业务素材同一套
 * 基础设施，但**不挂媒体库记录**——图册是全站共用的固定资产，
 * 不随产品记录增删，也不需要在后台管理。
 *
 * 更换图册的流程：
 *   1. 上传新 PDF 与逐页图片到 COS `media/catalog/<年>/<月>/`（可用
 *      `.deploy-tmp/catalog-upload.mjs` 改造，或后台媒体上传后改 key）；
 *   2. 更新本文件的路径清单；
 *   3. 发版（CDN 缓存 7 天，紧急更新可在腾讯云 CDN 控制台刷新目录）。
 *
 * 页面消费方：
 *   · `/catalog`（独立图册浏览页，新窗口打开）—— 展示 CATALOG_PAGES；
 *   · `/api/catalog/download`（下载代理）—— 吐 CATALOG_PDF_URL 为附件。
 */

const CATALOG_CDN_BASE = (
  process.env.NEXT_PUBLIC_CDN_BASE_URL ?? 'https://cdn.bailingwooden.com'
).replace(/\/+$/, '');

const CATALOG_KEY_PREFIX = `${CATALOG_CDN_BASE}/media/catalog/2026/10`;

/** 图册页数（PDF 逐页导出的 JPG，命名 bailing-catalog-01.jpg …） */
export const CATALOG_PAGE_COUNT = 8;

/** 图册单页原始像素尺寸（导出时实测，用于占位防 CLS） */
const CATALOG_PAGE_WIDTH = 1394;
const CATALOG_PAGE_HEIGHT = 952;

export interface CatalogPage {
  src: string;
  width: number;
  height: number;
}

export const CATALOG_PAGES: CatalogPage[] = Array.from(
  { length: CATALOG_PAGE_COUNT },
  (_, index) => ({
    src: `${CATALOG_KEY_PREFIX}/bailing-catalog-${String(index + 1).padStart(2, '0')}.jpg`,
    width: CATALOG_PAGE_WIDTH,
    height: CATALOG_PAGE_HEIGHT,
  }),
);

/** 图册 PDF 的 CDN 直链（服务端代理下载用） */
export const CATALOG_PDF_URL = `${CATALOG_KEY_PREFIX}/bailing-catalog.pdf`;

/** 下载时展示给用户的文件名 */
export const CATALOG_PDF_FILENAME = 'BL-CATALOG.pdf';

/**
 * 下载入口（站内代理路由）。
 *
 * 为什么不直接链 CDN：桶为私有、CDN 未开 CORS，且跨域 `<a download>`
 * 会被浏览器忽略（download 属性仅同源生效），直链只会在新标签页里
 * 打开 PDF 查看器。代理路由以 `Content-Disposition: attachment` 吐流，
 * 才能保证「点击即下载文件」。
 */
export const CATALOG_DOWNLOAD_PATH = '/api/catalog/download';

/**
 * 图册浏览页地址（独立根布局，**不加语言前缀**——middleware 已对该路径
 * 豁免语言重写，页面按 NEXT_LOCALE Cookie 自选语言）。
 */
export const CATALOG_VIEWER_PATH = '/catalog';
