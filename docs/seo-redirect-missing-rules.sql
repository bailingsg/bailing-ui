-- SEO 重定向缺失规则（Phase 4 审计产物，生成未应用）
-- 依据：旧站 Yoast sitemap（post 76 / product 35 / page 6 / product_cat 14）× 新站 DB slug 1:1 核对
-- 目标路径去语言前缀（英文默认无前缀），middleware 按当前语言补前缀
-- 幂等：ON CONFLICT (sourcePath) DO NOTHING

BEGIN;

-- ① 文章列表页：旧 /news/、/news-2/ → 新 /blog
INSERT INTO seo_redirects (id, "createdAt", "updatedAt", "sourcePath", "targetPath", "statusCode", note) VALUES
  (gen_random_uuid()::text, now(), now(), '/news', '/blog', 301, '旧 WP 文章列表页'),
  (gen_random_uuid()::text, now(), now(), '/news-2', '/blog', 301, '旧 WP 文章列表页（首页导航入口）')
ON CONFLICT ("sourcePath") DO NOTHING;

-- ② 文章详情：根级 /<slug>/ → /blog/<slug>/（75 条，slug 与旧站 1:1）
INSERT INTO seo_redirects (id, "createdAt", "updatedAt", "sourcePath", "targetPath", "statusCode", note) VALUES
  (gen_random_uuid()::text, now(), now(), '/2026-home-decor-trends-the-rise-of-natural-wood-textures-and-wpc-panels', '/blog/2026-home-decor-trends-the-rise-of-natural-wood-textures-and-wpc-panels', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/advantages-and-disadvantages-of-uv-marble-sheet', '/blog/advantages-and-disadvantages-of-uv-marble-sheet', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/advantages-of-wpc-fluted-wall-panels-a-modern-solution-for-stylish-and-durable-interiors', '/blog/advantages-of-wpc-fluted-wall-panels-a-modern-solution-for-stylish-and-durable-interiors', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/beginner-woodworking-tools-dont-fall-for-these-3-budget-trap-mistakes', '/blog/beginner-woodworking-tools-dont-fall-for-these-3-budget-trap-mistakes', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/best-plywood-for-furniture-in-2025-7-types-ranked-by-expert', '/blog/best-plywood-for-furniture-in-2025-7-types-ranked-by-expert', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/best-spc-plank-visuals-for-a-living-room', '/blog/best-spc-plank-visuals-for-a-living-room', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/best-uses-of-hardboard-in-furniture-and-cabinetry', '/blog/best-uses-of-hardboard-in-furniture-and-cabinetry', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/birch-plywood-vs-regular-plywood-what-you-need-to-know', '/blog/birch-plywood-vs-regular-plywood-what-you-need-to-know', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/blockboard-manufacturing-a-complete-overview-of-the-production-process-materials-and-applications', '/blog/blockboard-manufacturing-a-complete-overview-of-the-production-process-materials-and-applications', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/can-plywood-be-used-outdoors-a-guide-for-homeowners-builders', '/blog/can-plywood-be-used-outdoors-a-guide-for-homeowners-builders', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/cement-board-a-durable-and-versatile-building-material', '/blog/cement-board-a-durable-and-versatile-building-material', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/commercial-space-case-studies-bailing-fireproof-decorative-panels-in-hotels-offices-showrooms', '/blog/commercial-space-case-studies-bailing-fireproof-decorative-panels-in-hotels-offices-showrooms', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/compare-spc-vs-wpc-flooring-pros-and-cons', '/blog/compare-spc-vs-wpc-flooring-pros-and-cons', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/comprehensive-guide-to-wall-panels-materials-styles-and-applications', '/blog/comprehensive-guide-to-wall-panels-materials-styles-and-applications', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/difference-between-partical-board-and-mdf', '/blog/difference-between-partical-board-and-mdf', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/differences-and-advantages-between-oriented-strand-board-osb-and-ordinary-strand-board', '/blog/differences-and-advantages-between-oriented-strand-board-osb-and-ordinary-strand-board', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/does-fsc-certification-really-matter-why-we-commit-to-sustainable-wood', '/blog/does-fsc-certification-really-matter-why-we-commit-to-sustainable-wood', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/edge-banding-an-essential-component-of-high-quality-furniture-and-panels', '/blog/edge-banding-an-essential-component-of-high-quality-furniture-and-panels', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/enhance-your-interior-projects-with-melamine-block-board', '/blog/enhance-your-interior-projects-with-melamine-block-board', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/from-forest-to-home-the-craftsmanship-behind-wooden-products', '/blog/from-forest-to-home-the-craftsmanship-behind-wooden-products', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/from-log-to-finished-board-how-bailings-26-years-of-experience-ensures-every-panels-stability', '/blog/from-log-to-finished-board-how-bailings-26-years-of-experience-ensures-every-panels-stability', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/from-vision-to-reality-how-bailing-wood-controls-formaldehyde-and-achieves-green-certification', '/blog/from-vision-to-reality-how-bailing-wood-controls-formaldehyde-and-achieves-green-certification', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/gypsum-board-ceiling-types-advantages-and-disadvantages', '/blog/gypsum-board-ceiling-types-advantages-and-disadvantages', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/gypsum-board-ceilings-types-pros-cons', '/blog/gypsum-board-ceilings-types-pros-cons', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/gypsum-board-office-partitions-interior-design', '/blog/gypsum-board-office-partitions-interior-design', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/gypsum-board-or-cement-board-which-should-you-use', '/blog/gypsum-board-or-cement-board-which-should-you-use', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/gypsum-board-uses-and-benefits', '/blog/gypsum-board-uses-and-benefits', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/hardboard-information-and-applications', '/blog/hardboard-information-and-applications', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/high-performance-melamine-block-board-for-flawless-interiors', '/blog/high-performance-melamine-block-board-for-flawless-interiors', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/home-renovation-which-bailing-board-for-bedroom-living-room-and-kitchen', '/blog/home-renovation-which-bailing-board-for-bedroom-living-room-and-kitchen', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/how-can-flat-lamination-perfect-pvc-film-on-wpc-panels', '/blog/how-can-flat-lamination-perfect-pvc-film-on-wpc-panels', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/how-can-pvc-edge-banding-improve-wpc-door-production', '/blog/how-can-pvc-edge-banding-improve-wpc-door-production', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/how-gypsum-board-is-used-in-ceiling-and-partition-systems', '/blog/how-gypsum-board-is-used-in-ceiling-and-partition-systems', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/how-to-check-plywood-quality-before-buying-a-practical-no-nonsense-guide', '/blog/how-to-check-plywood-quality-before-buying-a-practical-no-nonsense-guide', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/how-to-choose-high-quality-veneer-faced-block-board', '/blog/how-to-choose-high-quality-veneer-faced-block-board', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/how-to-choose-the-best-plywood-for-marine-and-humid-environments', '/blog/how-to-choose-the-best-plywood-for-marine-and-humid-environments', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/how-to-identify-high-quality-mdf-a-26-year-experts-perspective', '/blog/how-to-identify-high-quality-mdf-a-26-year-experts-perspective', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/how-to-identify-high-quality-veneer-faced-blockboard-key-standards', '/blog/how-to-identify-high-quality-veneer-faced-blockboard-key-standards', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/how-to-identify-the-quality-of-the-pvc-edge-banding-tape', '/blog/how-to-identify-the-quality-of-the-pvc-edge-banding-tape', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/how-to-install-a-door-skin-on-an-interior-door-a-complete-step-by-step-guide', '/blog/how-to-install-a-door-skin-on-an-interior-door-a-complete-step-by-step-guide', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/how-to-pick-durable-and-stylish-plywood-for-your-wardrobe', '/blog/how-to-pick-durable-and-stylish-plywood-for-your-wardrobe', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/how-to-properly-finish-melamine-plywood-for-moisture-prone-areas', '/blog/how-to-properly-finish-melamine-plywood-for-moisture-prone-areas', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/indoor-decoration-osb-or-plywood', '/blog/indoor-decoration-osb-or-plywood', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/inside-our-quality-inspection-process-how-bailing-wood-ensures-zero-defect-shipments', '/blog/inside-our-quality-inspection-process-how-bailing-wood-ensures-zero-defect-shipments', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/kiln-drying-vs-air-drying-how-much-do-stability-and-cost-really-differ', '/blog/kiln-drying-vs-air-drying-how-much-do-stability-and-cost-really-differ', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/mdf-vs-plywood-vs-particle-board-bailing-guide', '/blog/mdf-vs-plywood-vs-particle-board-bailing-guide', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/melamine-vs-plywood-cabinets-which-is-best-for-your-kitchen-remodel', '/blog/melamine-vs-plywood-cabinets-which-is-best-for-your-kitchen-remodel', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/minimalist-vs-log-style-veneer-finishes-guide', '/blog/minimalist-vs-log-style-veneer-finishes-guide', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/osb-vs-ordinary-strand-board-a-comprehensive-comparison', '/blog/osb-vs-ordinary-strand-board-a-comprehensive-comparison', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/osb-vs-particle-board-whats-the-difference-and-which-one-should-you-choose', '/blog/osb-vs-particle-board-whats-the-difference-and-which-one-should-you-choose', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/plywood-dining-table-design-modern-durable', '/blog/plywood-dining-table-design-modern-durable', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/plywood-maintenance-tips-prevent-moisture-cracks-and-warping', '/blog/plywood-maintenance-tips-prevent-moisture-cracks-and-warping', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/premium-block-boards-for-durable-interiors', '/blog/premium-block-boards-for-durable-interiors', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/premium-hard-boards-for-industrial-interior-use', '/blog/premium-hard-boards-for-industrial-interior-use', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/strength-and-durability-in-blockboard-the-manufacturing-process', '/blog/strength-and-durability-in-blockboard-the-manufacturing-process', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/the-advantages-and-maintenance-of-panel-office-furniture', '/blog/the-advantages-and-maintenance-of-panel-office-furniture', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/the-beauty-of-natural-living-why-wooden-home-products-are-becoming-popular-again', '/blog/the-beauty-of-natural-living-why-wooden-home-products-are-becoming-popular-again', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/the-comprehensive-guide-to-blockboard-manufacturing-process', '/blog/the-comprehensive-guide-to-blockboard-manufacturing-process', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/the-hidden-costs-of-cheap-plywood', '/blog/the-hidden-costs-of-cheap-plywood', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/the-pros-and-cons-of-solid-wood-and-panel-furniture', '/blog/the-pros-and-cons-of-solid-wood-and-panel-furniture', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/the-role-of-film-faced-plywood-in-reducing-concrete-construction-costs', '/blog/the-role-of-film-faced-plywood-in-reducing-concrete-construction-costs', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/the-versatile-uses-of-film-faced-plywood-strength-durability-and-performance', '/blog/the-versatile-uses-of-film-faced-plywood-strength-durability-and-performance', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/top-7-questions-about-melamine-plywood-a-comprehensive-faq-guide-for-professionals', '/blog/top-7-questions-about-melamine-plywood-a-comprehensive-faq-guide-for-professionals', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/top-diy-furniture-projects-using-blockboard', '/blog/top-diy-furniture-projects-using-blockboard', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/trends-in-eco-friendly-plywood-formaldehyde-emission-standards-and-green-certifications', '/blog/trends-in-eco-friendly-plywood-formaldehyde-emission-standards-and-green-certifications', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/understanding-the-different-grades-of-plywood', '/blog/understanding-the-different-grades-of-plywood', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/welcome-to-bailing-wood-industry-co-ltd', '/blog/welcome-to-bailing-wood-industry-co-ltd', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/what-are-the-advantages-of-melamine-block-boards-over-other-core-materials', '/blog/what-are-the-advantages-of-melamine-block-boards-over-other-core-materials', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/what-defines-a-premium-woodgrain-print-on-cabinet-edge-tape', '/blog/what-defines-a-premium-woodgrain-print-on-cabinet-edge-tape', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/what-is-plywood-texture', '/blog/what-is-plywood-texture', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/why-choose-self-adhesive-pvc-film-for-hotel-renovation', '/blog/why-choose-self-adhesive-pvc-film-for-hotel-renovation', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/why-choose-wood-acoustic-wall-panels-for-interior-soundproofing', '/blog/why-choose-wood-acoustic-wall-panels-for-interior-soundproofing', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/why-high-quality-shuttering-plywood-is-crucial-for-safe-and-strong-concrete-structures', '/blog/why-high-quality-shuttering-plywood-is-crucial-for-safe-and-strong-concrete-structures', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/why-wooden-kitchenware-is-a-healthier-and-more-sustainable-choice', '/blog/why-wooden-kitchenware-is-a-healthier-and-more-sustainable-choice', 301, 'WP permalink → 新博客'),
  (gen_random_uuid()::text, now(), now(), '/wpc-wall-panels-in-high-humidity-environments-beyond-aesthetics', '/blog/wpc-wall-panels-in-high-humidity-environments-beyond-aesthetics', 301, 'WP permalink → 新博客')
ON CONFLICT ("sourcePath") DO NOTHING;

-- ③ 产品详情：/product/<slug> → /products/<id>（仅 PUBLISHED 19 条；DRAFT 15 条另见报告）
INSERT INTO seo_redirects (id, "createdAt", "updatedAt", "sourcePath", "targetPath", "statusCode", note) VALUES
  (gen_random_uuid()::text, now(), now(), '/product/best-selling-4x8-e1-poplar-modern-black-film-faced-plywood-with-1-year-warranty-for-construction', '/products/cmvetz097006xpuykq876folg', 301, '旧产品 slug → 新 id 路由'),
  (gen_random_uuid()::text, now(), now(), '/product/commercial-plywood', '/products/cmvetz0kz00cspuyk5r97lyu9', 301, '旧产品 slug → 新 id 路由'),
  (gen_random_uuid()::text, now(), now(), '/product/film-faced-plywood', '/products/cmvetz0in00bipuykdm0mk0di', 301, '旧产品 slug → 新 id 路由'),
  (gen_random_uuid()::text, now(), now(), '/product/fireproof-mdf', '/products/cmvetz0pd00fjpuyk51c6ansv', 301, '旧产品 slug → 新 id 路由'),
  (gen_random_uuid()::text, now(), now(), '/product/gypsum-board', '/products/cmvetz0h400anpuyk9kxiyo4m', 301, '旧产品 slug → 新 id 路由'),
  (gen_random_uuid()::text, now(), now(), '/product/hmr-mdf', '/products/cmvetz0px00fxpuykox33qq4y', 301, '旧产品 slug → 新 id 路由'),
  (gen_random_uuid()::text, now(), now(), '/product/hollow-particle-board', '/products/cmvetz0m300dipuyk79jfcrrk', 301, '旧产品 slug → 新 id 路由'),
  (gen_random_uuid()::text, now(), now(), '/product/melamine-mdf', '/products/cmvetz0oq00f7puykuwdghv6d', 301, '旧产品 slug → 新 id 路由'),
  (gen_random_uuid()::text, now(), now(), '/product/melamine-particle-board', '/products/cmvetz0lk00d6puykuplsbfcq', 301, '旧产品 slug → 新 id 路由'),
  (gen_random_uuid()::text, now(), now(), '/product/melamine-plywood', '/products/cmvetz0b9007ypuykdppbx7mc', 301, '旧产品 slug → 新 id 路由'),
  (gen_random_uuid()::text, now(), now(), '/product/oriented-strand-board', '/products/cmvetz0i300b6puykty2lmcaq', 301, '旧产品 slug → 新 id 路由'),
  (gen_random_uuid()::text, now(), now(), '/product/oriented-strand-board-structural-strength-meets-versatility', '/products/cmvetz0ae007fpuykzsuega40', 301, '旧产品 slug → 新 id 路由'),
  (gen_random_uuid()::text, now(), now(), '/product/pet-mdf', '/products/cmvetz0o300enpuykxbw6e0mt', 301, '旧产品 slug → 新 id 路由'),
  (gen_random_uuid()::text, now(), now(), '/product/plain-mdf', '/products/cmvetz0nf00e9puykllbqy6wl', 301, '旧产品 slug → 新 id 路由'),
  (gen_random_uuid()::text, now(), now(), '/product/spc-flooring', '/products/cmvetz0jd00bvpuykrnq3v41j', 301, '旧产品 slug → 新 id 路由'),
  (gen_random_uuid()::text, now(), now(), '/product/uv-marble-sheet', '/products/cmvetz0c50089puyksqfue8x3', 301, '旧产品 slug → 新 id 路由'),
  (gen_random_uuid()::text, now(), now(), '/product/uv-mdf', '/products/cmvetz0ms00dvpuykafxri1tz', 301, '旧产品 slug → 新 id 路由'),
  (gen_random_uuid()::text, now(), now(), '/product/white-melamine-block-board-falcata-block-board-4x8-melamine-block-board-for-furniture', '/products/cmvetz085006opuykz5xu3csl', 301, '旧产品 slug → 新 id 路由'),
  (gen_random_uuid()::text, now(), now(), '/product/wpc-wall-panel', '/products/cmvetz0kd00cgpuyksauc8rs8', 301, '旧产品 slug → 新 id 路由')
ON CONFLICT ("sourcePath") DO NOTHING;

-- ④ 列表/分类：/shop、/product-category/<cat> → /products（新站无分类筛选）
INSERT INTO seo_redirects (id, "createdAt", "updatedAt", "sourcePath", "targetPath", "statusCode", note) VALUES
  (gen_random_uuid()::text, now(), now(), '/shop', '/products', 301, '旧 WooCommerce 商店页'),
  (gen_random_uuid()::text, now(), now(), '/product-category/block-board', '/products', 301, '旧分类页（新站无分类路由）'),
  (gen_random_uuid()::text, now(), now(), '/product-category/cement-board', '/products', 301, '旧分类页（新站无分类路由）'),
  (gen_random_uuid()::text, now(), now(), '/product-category/door', '/products', 301, '旧分类页（新站无分类路由）'),
  (gen_random_uuid()::text, now(), now(), '/product-category/door-skin', '/products', 301, '旧分类页（新站无分类路由）'),
  (gen_random_uuid()::text, now(), now(), '/product-category/edge-banding', '/products', 301, '旧分类页（新站无分类路由）'),
  (gen_random_uuid()::text, now(), now(), '/product-category/film-faced-plywood', '/products', 301, '旧分类页（新站无分类路由）'),
  (gen_random_uuid()::text, now(), now(), '/product-category/gypsum-board', '/products', 301, '旧分类页（新站无分类路由）'),
  (gen_random_uuid()::text, now(), now(), '/product-category/hard-board', '/products', 301, '旧分类页（新站无分类路由）'),
  (gen_random_uuid()::text, now(), now(), '/product-category/mdf', '/products', 301, '旧分类页（新站无分类路由）'),
  (gen_random_uuid()::text, now(), now(), '/product-category/particle-board', '/products', 301, '旧分类页（新站无分类路由）'),
  (gen_random_uuid()::text, now(), now(), '/product-category/plywood', '/products', 301, '旧分类页（新站无分类路由）'),
  (gen_random_uuid()::text, now(), now(), '/product-category/spc-flooring', '/products', 301, '旧分类页（新站无分类路由）'),
  (gen_random_uuid()::text, now(), now(), '/product-category/wall-panel', '/products', 301, '旧分类页（新站无分类路由）'),
  (gen_random_uuid()::text, now(), now(), '/product-category/wpc-wall-panels', '/products', 301, '旧分类页（新站无分类路由）')
ON CONFLICT ("sourcePath") DO NOTHING;

-- ⑤ 静态页
INSERT INTO seo_redirects (id, "createdAt", "updatedAt", "sourcePath", "targetPath", "statusCode", note) VALUES
  (gen_random_uuid()::text, now(), now(), '/about-us', '/about', 301, '旧关于页'),
  (gen_random_uuid()::text, now(), now(), '/contact-us', '/contact', 301, '旧联系页'),
  (gen_random_uuid()::text, now(), now(), '/video', '/factory', 302, '旧视频页无对应（建议先人工确认去向）')
ON CONFLICT ("sourcePath") DO NOTHING;

COMMIT;
