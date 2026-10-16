import type { Application } from './types';

/**
 * 应用场景数据（行业知识，非客户案例）
 *
 * ⚠️ 内容边界：
 *   本文件描述的是**板材的典型应用方式**（行业通用知识），
 *   不包含任何客户名称、项目名称、项目金额、合作品牌或"服务过 XX 个国家"之类
 *   无法验证的业绩数据。这类信息必须由业务方提供并授权后才可登记。
 *
 * 封面图：来自业务方提供的真实素材（已纳入 `public/applications/`），
 * 不使用 AI 生成图或图库素材。
 *
 * relatedProducts 只登记 slug；解析失败（产品未发布）时页面会自动跳过，
 * 不会产生死链。
 */
export const applications: Application[] = [
  {
    slug: 'furniture-manufacturing',
    title: 'Furniture Manufacturing',
    titleZh: '家具制造',
    description:
      'Panel materials and components for cabinet, wardrobe, table and flat-pack furniture production.',
    overview:
      'Furniture production puts a board through sawing, drilling, edge banding and surface finishing. The material has to machine cleanly, hold a screw and stay flat after cutting. MDF is chosen for routed and painted parts, particle board for carcasses and shelving, plywood where structural strength or moisture exposure matters, and melamine-faced panels where the surface is the finished face.',
    highlights: [
      'MDF and HMR MDF for routed, painted and profiled parts',
      'Particle board for carcasses, shelves and flat-pack components',
      'Melamine-faced panels for finished visible surfaces',
      'Plywood for structural frames, drawers and moisture-exposed parts',
      'Cut-to-size panels and edge banding to match your cutting list',
    ],
    image: '/applications/furniture-manufacturing.webp',
    imageAlt: 'Wooden kitchen cabinets with panelled doors made from wood-based panels',
    relatedProducts: ['demo-wood-panel', 'demo-custom-component'],
  },
  {
    slug: 'interior-decoration',
    title: 'Interior Decoration',
    titleZh: '室内装饰',
    description:
      'Decorative panels, wall cladding and ceiling features for residential and hospitality interiors.',
    overview:
      'Interior work is where the board is seen, so surface consistency matters as much as the core. Wall panelling, feature walls, ceiling details and fitted joinery all depend on a stable substrate with a decorative face that does not vary between batches. Moisture and humidity in the finished space also decide whether a standard board is enough or a moisture-resistant grade is required.',
    highlights: [
      'Decorative wall panels and slat / fluted wall cladding',
      'Moisture-resistant boards for kitchens, bathrooms and utility areas',
      'Veneer and melamine finishes for fitted joinery',
      'Substrates for painted and laminated feature surfaces',
      'Consistent batch-to-batch surface matching for large projects',
    ],
    image: '/applications/interior-decoration.webp',
    imageAlt: 'Bedroom feature wall finished with dark wood slat wall panels',
    relatedProducts: ['demo-wood-panel'],
  },
  {
    slug: 'commercial-projects',
    title: 'Commercial Projects',
    titleZh: '商业空间',
    description:
      'Contract-grade panel supply for offices, retail, hospitality and public interiors.',
    overview:
      'Commercial interiors are specified once and repeated across many rooms, floors or sites. That makes repeatability the main technical requirement: the second delivery has to match the first. Project work also brings fire-performance, moisture and impact requirements into the specification, so the material is selected against the performance the space must meet rather than appearance alone.',
    highlights: [
      'Repeatable batches for multi-floor and multi-site fit-outs',
      'Fire-retardant and moisture-resistant board options',
      'Wear-resistant surfaces for high-traffic areas',
      'Panel supply for office, retail, hotel and showroom joinery',
      'Specification held across repeat shipments',
    ],
    image: '/applications/commercial-projects.webp',
    imageAlt: 'Office interior with wood-panelled joinery and fitted furniture',
    relatedProducts: ['demo-wood-panel'],
  },
  {
    slug: 'door-cabinet-production',
    title: 'Door & Cabinet Production',
    titleZh: '门板与柜体生产',
    description:
      'Door skins, door cores, cabinet doors and component blanks for door and cabinet makers.',
    overview:
      'Doors and cabinet fronts are flat, visible and handled constantly, so they expose any weakness in the substrate. The board must stay flat after machining, accept the specified face finish without telegraphing the core, and hold its dimensions so hardware lines up. Door skins, profiled MDF doors and melamine or veneer-faced cabinet fronts each call for a different combination of core and surface.',
    highlights: [
      'Door skins and door cores for interior door production',
      'Profiled and routed MDF door designs',
      'Melamine, veneer and PVC-faced cabinet fronts',
      'Dimensionally stable cores that stay flat after machining',
      'Component blanks sized to your production line',
    ],
    image: '/applications/door-cabinet-production.webp',
    imageAlt: 'Interior door panels with wood veneer and lacquered finishes',
    relatedProducts: ['demo-custom-component'],
  },
  {
    slug: 'packaging-custom-solutions',
    title: 'Packaging & Custom Solutions',
    titleZh: '包装与定制方案',
    description:
      'Wooden crating, pallets, protective packing and made-to-drawing components for export orders.',
    overview:
      'Industrial shipments need wood that protects the product rather than the wood that looks best. Crating, pallets, dunnage and protective panels are specified by load, handling method and destination requirements. Alongside this, buyers often need components made to a drawing that does not exist in any catalogue — a specific size, grade or surface that has to be produced rather than selected.',
    highlights: [
      'Wooden crates, pallets and protective packing panels',
      'Dunnage and bracing material for container loading',
      'Components produced to customer drawings and dimensions',
      'Custom sizes, thicknesses and surface treatments',
      'OEM / ODM production for own-brand programmes',
    ],
    image: '/applications/packaging-custom-solutions.webp',
    imageAlt: 'Stacked wood-based panels stored in the production warehouse before shipment',
    relatedProducts: ['demo-wooden-crate', 'demo-custom-component'],
  },
];
