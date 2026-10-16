import { siteConfig } from '@/config/site';
import { absoluteUrl } from '@/lib/seo';
import type { ProductDetail } from '@/lib/products';

/**
 * ProductSchema —— Schema.org Product 结构化数据（JSON-LD）
 *
 * 仅输出产品客观信息：name / description / image / brand / category /
 * material / additionalProperty（规格）。
 *
 * 明确**不输出**（百灵木业为 B2B 制造商，非电商，且不得编造）：
 *   · offers / price          —— 无在线报价
 *   · aggregateRating / review —— 无评价体系
 *   · sku / gtin               —— 非零售商品
 */
export function ProductSchema({ product }: { product: ProductDetail }) {
  const imageUrls = product.images.map((image) => absoluteUrl(image.url));

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    url: absoluteUrl(`/products/${product.slug}`),
    brand: {
      '@type': 'Brand',
      name: siteConfig.name,
    },
  };

  // 仅在确有图片素材时输出，避免提交无效 URL
  if (imageUrls.length > 0) {
    schema.image = imageUrls;
  }

  if (product.category) {
    schema.category = product.category.name;
  }

  if (product.material) {
    schema.material = product.material;
  }

  if (product.specifications && Object.keys(product.specifications).length > 0) {
    schema.additionalProperty = Object.entries(product.specifications).map(([name, value]) => ({
      '@type': 'PropertyValue',
      name,
      value,
    }));
  }

  return (
    <script
      type="application/ld+json"
      // 数据来自数据库（非用户输入），并对 < 做转义以防注入
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
      }}
    />
  );
}
