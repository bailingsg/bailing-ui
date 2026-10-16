import type { BlogCategoryInfo, BlogPost } from './types';

/**
 * 资讯 / 知识库内容
 *
 * ⚠️ 内容边界（与 Phase 3.6 / 3.8 的零虚构原则一致）：
 *   本文件只包含**行业知识**——选材指南、材料对比、应用说明、生产工艺常识。
 *   **不含**企业新闻、客户名称、项目金额、合作品牌、认证编号或业绩数字。
 *   正文中的技术描述均为通用行业常识，不针对任何具体客户的订单。
 *
 * 封面图：来自业务方提供的真实素材（已纳入 `public/blog/`）。
 *
 * 未来接入 CMS 时：把富文本正文转换为 `BlogBlock[]` 即可，页面无需改动。
 */

/** 分类清单（顺序即筛选器展示顺序） */
export const blogCategories: BlogCategoryInfo[] = [
  { slug: 'buying-guide', name: 'Buying Guide', nameZh: '采购指南' },
  { slug: 'material-guide', name: 'Material Guide', nameZh: '材料指南' },
  { slug: 'industry-insight', name: 'Industry Insight', nameZh: '行业洞察' },
  { slug: 'manufacturing', name: 'Manufacturing', nameZh: '生产工艺' },
];

export const blogPosts: BlogPost[] = [
  {
    slug: 'how-to-choose-the-right-mdf-supplier',
    title: 'How to Choose the Right MDF Supplier',
    excerpt:
      'Most MDF problems are decided before the first container ships — in how the specification was written and how the supplier was qualified. A practical checklist for B2B buyers.',
    coverImage: '/blog/mdf-supplier-guide.webp',
    coverImageAlt:
      'Comparison chart of low density fibreboard, standard MDF and high density fibreboard with density, texture and typical uses',
    category: 'buying-guide',
    publishedAt: '2026-09-18T08:00:00.000Z',
    readingMinutes: 8,
    tags: ['MDF', 'Supplier Selection', 'Sourcing', 'Quality'],
    relatedProducts: ['demo-wood-panel'],
    seo: {
      title: 'How to Choose the Right MDF Supplier',
      description:
        'A practical B2B checklist for qualifying an MDF supplier: specification items, sample approval, factory versus trader, and the questions worth asking before you order.',
    },
    content: [
      {
        type: 'paragraph',
        text: 'MDF looks like a commodity. It is not. Two boards that both read "18mm MDF E1" on a quotation can behave very differently once they reach a production line — one machines cleanly and stays flat, the other fuzzes at the edges, telegraphs when painted, or swells where the humidity is high. The difference is rarely visible on a price sheet, which is why supplier qualification matters more for MDF than for most bought-in materials.',
      },
      { type: 'heading', text: 'Start from the application, not the material' },
      {
        type: 'paragraph',
        text: 'Before comparing suppliers, write down what the board actually has to do. The same nominal product is specified very differently depending on the answer.',
      },
      {
        type: 'list',
        items: [
          'Will the panel be machined, routed or profiled? Routed edges expose core quality that a square-cut edge hides.',
          'Will it be painted or laminated? Painted surfaces show density variation and sanding marks.',
          'Will it be exposed to moisture — kitchens, bathrooms, exterior-adjacent spaces? A standard board is the wrong choice there.',
          'Does it carry load, or is it a visible non-structural panel?',
          'Will it be edge banded, and to what thickness? Thin banding on a rough edge fails early.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Only once those answers exist does the specification become meaningful. A supplier who asks these questions before quoting is already a better candidate than one who quotes instantly.',
      },
      { type: 'heading', text: 'The specification items that actually matter' },
      {
        type: 'paragraph',
        text: 'A usable MDF specification is more than a thickness and a formaldehyde class. Ask for these in writing:',
      },
      {
        type: 'list',
        items: [
          'Nominal size and thickness tolerance — plus the acceptable range, not just the target',
          'Density, and how it is measured',
          'Glue type and formaldehyde emission class, with the test method referenced',
          'Sanding quality and the panel faces (both sides, or one calibrated face)',
          'Moisture content at dispatch',
          'Edge quality expectation for machining and banding',
          'Whether the board is homogeneous or has a density gradient through the thickness',
        ],
      },
      {
        type: 'note',
        text: 'If a supplier cannot state the tolerance range on thickness, that is the answer you need. A target without a range is not a specification.',
      },
      { type: 'heading', text: 'Factory or trader?' },
      {
        type: 'paragraph',
        text: 'Both models exist and both can work. The question is whether the party you are buying from controls the things that decide quality.',
      },
      {
        type: 'paragraph',
        text: 'A manufacturer controls the press, the sanding line and the grade sorting, so a technical question gets a technical answer and a non-conformance can be traced to a process. A trader can offer wider range, better consolidation and easier multi-product orders, but is only as good as the factory behind it — and you usually cannot see that factory.',
      },
      {
        type: 'paragraph',
        text: 'The practical test: ask what happens if the delivered density is below specification. A manufacturer describes a corrective process. A trader describes a credit note. Neither answer is wrong, but they tell you what you are buying.',
      },
      { type: 'heading', text: 'Insist on a sealed sample' },
      {
        type: 'paragraph',
        text: 'For any repeat programme, approve a physical sample and keep a sealed reference. Agree in writing what the sample represents — core, face, edge, thickness — and make it the acceptance benchmark. This single step prevents most disputes, because it converts "the boards feel different" into a measurable comparison.',
      },
      {
        type: 'paragraph',
        text: 'Where appearance matters, ask for samples from the same production batch the order will be drawn from, not from a marketing sample set.',
      },
      { type: 'heading', text: 'Questions worth asking before you commit' },
      {
        type: 'list',
        items: [
          'Which mill produces the board, and is it the same mill for repeat orders?',
          'What is the minimum order quantity per specification, and what changes if the specification is non-standard?',
          'What is the realistic lead time, and what typically causes slippage?',
          'How is the panel packed, and how is it protected during container loading?',
          'Which documents are issued with the shipment?',
          'Who do I contact if a problem appears after delivery, and what is the response window?',
        ],
      },
      {
        type: 'paragraph',
        text: 'A supplier that answers these plainly, including the parts where the answer is "that depends", is worth more than one that answers everything with yes.',
      },
      { type: 'heading', text: 'Red flags' },
      {
        type: 'list',
        items: [
          'A price that is well below the market with no explanation of what was removed',
          'Specifications that shift between the quotation, the sample and the shipping documents',
          'No tolerance range on thickness or density',
          'Reluctance to state the producing mill',
          'Documents issued only after the goods are loaded',
        ],
      },
      {
        type: 'paragraph',
        text: 'None of these is fatal on its own. Together they describe a supply relationship that will cost you more in rework and delay than the price difference saved.',
      },
      { type: 'heading', text: 'The short version' },
      {
        type: 'paragraph',
        text: 'Define the application, write a specification with ranges rather than targets, approve a sealed sample, and qualify the party who controls the process. Do those four things and the supplier conversation becomes straightforward — because you are comparing like with like instead of comparing prices for unspecified material.',
      },
    ],
  },

  {
    slug: 'plywood-vs-mdf-which-material-fits-your-project',
    title: 'Plywood vs MDF: Which Material Fits Your Project?',
    excerpt:
      'Plywood and MDF solve different problems. A side-by-side comparison across strength, moisture behaviour, machining, finishing and cost — with guidance on where each one wins.',
    coverImage: '/blog/plywood-vs-mdf.webp',
    coverImageAlt:
      'Plywood, MDF and particle board panels stacked side by side with a caliper for thickness measurement',
    category: 'material-guide',
    publishedAt: '2026-09-30T08:00:00.000Z',
    readingMinutes: 9,
    tags: ['Plywood', 'MDF', 'Material Comparison', 'Selection'],
    relatedProducts: ['demo-wood-panel'],
    seo: {
      title: 'Plywood vs MDF: Which Material Fits Your Project?',
      description:
        'Plywood versus MDF compared across strength, moisture resistance, machining, finishing, weight and cost — with practical guidance on which material suits which application.',
    },
    content: [
      {
        type: 'paragraph',
        text: 'Plywood and MDF are both engineered wood panels, and both are sold in the same nominal thicknesses, which makes them look interchangeable on a quotation. They are not. The difference comes down to structure: plywood is built from layers of veneer with the grain rotated between plies, while MDF is a homogeneous mat of wood fibre bonded with resin. Almost every practical difference follows from that.',
      },
      { type: 'heading', text: 'How each material is built' },
      {
        type: 'paragraph',
        text: 'Plywood is assembled from an odd number of veneer plies, glued and pressed with the grain direction alternating. That cross-lamination is what gives plywood its strength and its dimensional stability — the layers restrain each other, so the panel resists warping and holds together under load.',
      },
      {
        type: 'paragraph',
        text: 'MDF is made by breaking wood down into fibre, mixing it with resin and wax, then pressing it into a uniform mat. Because there is no grain direction, the panel is isotropic — it behaves the same in every direction, which is exactly what you want when routing a complex profile.',
      },
      { type: 'heading', text: 'Strength and structural behaviour' },
      {
        type: 'paragraph',
        text: 'Plywood wins clearly here. The cross-laminated veneers carry load along the face grain, so a plywood shelf or span is far stronger than the same thickness of MDF. Where a panel has to span a gap, take a fixing, or resist impact, plywood is the correct choice.',
      },
      {
        type: 'paragraph',
        text: 'MDF has reasonable internal bond strength but low bending strength. It is not a structural material. Used as a shelf over a long span without support, it will sag — and the sag is permanent.',
      },
      { type: 'heading', text: 'Moisture behaviour' },
      {
        type: 'paragraph',
        text: 'Standard MDF swells noticeably when water reaches the core, and it does not fully recover when it dries. Moisture-resistant grades (often sold as HMR MDF) use a modified resin system and perform much better in humid conditions, but they are still not waterproof.',
      },
      {
        type: 'paragraph',
        text: 'Plywood handles moisture better by construction, and marine or exterior grades use water-resistant adhesives that allow it to tolerate wetting and drying cycles. This is why film-faced and marine plywood are used for formwork, transport and exterior-adjacent applications where MDF would fail quickly.',
      },
      {
        type: 'note',
        text: 'Both materials need the right grade for the environment. Putting standard MDF in a wet area is a specification error, not a material defect.',
      },
      { type: 'heading', text: 'Machining and edge quality' },
      {
        type: 'paragraph',
        text: 'MDF machines beautifully. It has no grain to tear out, so it routes into crisp profiles, mouldings and curved shapes with a clean, paintable surface. This is why MDF dominates for profiled doors, decorative panels and painted furniture parts.',
      },
      {
        type: 'paragraph',
        text: 'Plywood machines well across the face but shows its layered edge. That edge is visually distinctive — sometimes a feature, often not — and it needs filling or banding if it will be seen. Splintering at cut edges is also more likely than with MDF.',
      },
      { type: 'heading', text: 'Finishing' },
      {
        type: 'paragraph',
        text: 'MDF takes paint superbly. Its uniform, fine surface sands to a smooth finish and accepts lacquer without the grain print-through that shows through paint on plywood. For a painted, high-quality face, MDF is usually the simpler route.',
      },
      {
        type: 'paragraph',
        text: 'Plywood is typically finished with a clear coat, laminate, veneer or film face — treatments that work with its appearance rather than hiding it. Both materials laminate and veneer well, provided the substrate is flat and properly sanded.',
      },
      { type: 'heading', text: 'Weight' },
      {
        type: 'paragraph',
        text: 'For the same thickness, MDF is generally heavier than plywood because of its higher density. In furniture this affects handling, hardware loading and shipping weight. In a large cabinet programme the difference is measurable across a container, so it is worth checking rather than assuming.',
      },
      { type: 'heading', text: 'Cost' },
      {
        type: 'paragraph',
        text: 'MDF is usually the cheaper option per panel for interior, non-structural work, and it is easier to source in a wide range of surface treatments. Plywood costs more because of the veneer content and the pressing process, and the gap widens sharply for marine and exterior grades.',
      },
      {
        type: 'paragraph',
        text: 'The right comparison is not cost per panel but cost per finished part. A cheaper panel that needs extra filling, or that fails in service, is not cheaper.',
      },
      { type: 'heading', text: 'Where each material wins' },
      {
        type: 'list',
        items: [
          'Choose MDF for: painted and profiled parts, routed decorative panels, painted doors, furniture fronts, and any interior application where a flawless painted surface matters.',
          'Choose moisture-resistant MDF for: kitchen and bathroom cabinetry, utility areas, and humid interior environments.',
          'Choose plywood for: structural panels, load-bearing shelves and spans, drawer boxes, moisture-exposed parts, and applications needing fixings that hold.',
          'Choose film-faced or marine plywood for: formwork, transport bodies, exterior-adjacent structures and wet environments.',
        ],
      },
      { type: 'heading', text: 'A quick decision path' },
      {
        type: 'list',
        items: [
          'Does the panel carry load or span a gap? If yes, plywood.',
          'Will it be regularly wet, or is it semi-exterior? If yes, exterior-grade plywood.',
          'Is the finished face painted to a high standard? If yes, MDF.',
          'Does it need complex routing or a curved profile? If yes, MDF.',
          'Is it an interior cabinet in a normally dry room? MDF or particle board will usually do the job.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Most furniture programmes end up using both. That is normal and correct: the material should follow the part, not the other way round.',
      },
    ],
  },

  {
    slug: 'wood-panel-applications-in-modern-furniture-manufacturing',
    title: 'Wood Panel Applications in Modern Furniture Manufacturing',
    excerpt:
      'Not every part of a piece of furniture needs the same board. How carcasses, fronts, structural members and internal fittings each call for a different panel specification.',
    coverImage: '/blog/wood-panel-applications.webp',
    coverImageAlt: 'Wooden dining table and chairs made from engineered wood panels in a bright interior',
    category: 'industry-insight',
    publishedAt: '2026-10-06T08:00:00.000Z',
    readingMinutes: 7,
    tags: ['Furniture', 'Panel Selection', 'Applications', 'Manufacturing'],
    relatedProducts: ['demo-wood-panel', 'demo-custom-component'],
    seo: {
      title: 'Wood Panel Applications in Modern Furniture Manufacturing',
      description:
        'How engineered wood panels are used across furniture production — carcasses, fronts, structural members and internal fittings — and why each part needs a different specification.',
    },
    content: [
      {
        type: 'paragraph',
        text: 'A single piece of furniture can contain four or five different panel specifications. The carcass carries the load, the front is judged by eye, the internal shelves have to stay flat, and the drawer boxes have to survive being opened thousands of times. Treating them all as "the same board" is one of the most common and most expensive specification shortcuts in furniture production.',
      },
      { type: 'heading', text: 'Carcasses and shelving' },
      {
        type: 'paragraph',
        text: 'The carcass is the structure: side panels, tops, bottoms and fixed shelves. It is usually the least visible part and the most heavily loaded. Particle board remains the default here because it offers good stiffness and screw-holding at a competitive cost, and it takes melamine facing well for the surfaces that are visible inside.',
      },
      {
        type: 'paragraph',
        text: 'Where the carcass is deep, or where shelves span a wide opening, deflection becomes the limiting factor. The options are a thicker panel, a stiffer material, or an added support — and the cheapest of those three is usually the support.',
      },
      { type: 'heading', text: 'Fronts and visible faces' },
      {
        type: 'paragraph',
        text: 'Fronts are what the customer actually sees and touches, so surface quality drives the material choice. Flat melamine fronts are efficient and hard-wearing. Where the design calls for a profile, a curve or a painted finish, MDF takes over — it routes cleanly, has no grain to fight, and paints to a smooth surface.',
      },
      {
        type: 'paragraph',
        text: 'For visible wood grain, veneered or faced panels are used over a stable substrate. The substrate matters more than buyers expect: an uneven core telegraphs through a thin veneer, and the flaw only appears after finishing.',
      },
      { type: 'heading', text: 'Structural members and spans' },
      {
        type: 'paragraph',
        text: 'Anywhere a panel has to carry load across a gap, plywood or block board is the appropriate choice. Plywood brings cross-laminated strength and holds fixings firmly. Block board — a core of softwood strips faced with veneer — offers stiffness along its length with lower weight than a solid panel.',
      },
      {
        type: 'paragraph',
        text: 'These are the parts where substituting a cheaper panel is most likely to fail in service, and the failure is usually structural rather than cosmetic.',
      },
      { type: 'heading', text: 'Drawer boxes and moving parts' },
      {
        type: 'paragraph',
        text: 'Drawers are a mechanical assembly, not a decorative panel. Sides and bottoms take repeated load and constant movement, so the material has to hold a joint and resist abrasion. Plywood is common for drawer sides and bottoms for exactly this reason, while MDF can work for a painted drawer front that carries no structural load.',
      },
      { type: 'heading', text: 'Internal fittings and partitions' },
      {
        type: 'paragraph',
        text: 'Dividers, back panels and internal partitions are usually thin, lightly loaded and mostly unseen. Thin MDF or hardboard is often sufficient, and specifying a heavy panel here adds weight and cost without adding performance. Back panels do double duty, though: they resist racking, so a flimsy back makes a wobbly cabinet.',
      },
      { type: 'heading', text: 'Why the material has to follow the part' },
      {
        type: 'list',
        items: [
          'Load path — structural parts need plywood or block board, not fibreboard',
          'Visibility — visible faces justify a better surface, hidden ones do not',
          'Machining — profiles and curves favour MDF, straight structural cuts favour plywood',
          'Moisture exposure — kitchen and bathroom parts need a moisture-resistant grade',
          'Fastener demand — hinges, runners and fixings need a core that holds screws',
          'Weight budget — heavier panels raise handling and shipping cost across a whole programme',
        ],
      },
      { type: 'heading', text: 'Where the specification usually goes wrong' },
      {
        type: 'list',
        items: [
          'One board specified for the whole product, so structural parts are under-specified and hidden parts are over-specified',
          'Moisture-resistant grade omitted from kitchen and bathroom components',
          'Panel thickness reduced to save cost on spans that then deflect',
          'Surface grade downgraded on faces that remain visible in use',
          'Edge banding thickness not matched to the panel and its expected handling',
        ],
      },
      {
        type: 'paragraph',
        text: 'None of these are manufacturing defects. They are specification decisions made early and paid for later.',
      },
      { type: 'heading', text: 'A practical approach' },
      {
        type: 'paragraph',
        text: 'Break the product into parts and assign each one a role: structural, visible, internal or moving. Then choose the panel against that role, and confirm the tolerance that the part actually needs rather than the tightest tolerance available. That process usually reduces cost as often as it raises it — because it stops over-specifying the parts nobody will ever inspect.',
      },
    ],
  },

  {
    slug: 'quality-control-process-for-wood-panel-production',
    title: 'Quality Control Process for Wood Panel Production',
    excerpt:
      'Where quality is actually decided in panel production — incoming material, in-process checks, finishing and final inspection — and what a buyer should expect to be able to verify.',
    coverImage: '/blog/quality-control-process.webp',
    coverImageAlt:
      'Craftsman checking the square and dimensions of a wooden frame during production',
    category: 'manufacturing',
    publishedAt: '2026-10-12T08:00:00.000Z',
    readingMinutes: 8,
    tags: ['Quality Control', 'Inspection', 'Production', 'Process'],
    relatedProducts: ['demo-wood-panel'],
    seo: {
      title: 'Quality Control Process for Wood Panel Production',
      description:
        'How quality control works across wood panel production: incoming material inspection, in-process checks, finishing, final inspection and packing — and what buyers can verify.',
    },
    content: [
      {
        type: 'paragraph',
        text: 'Quality in panel production is not created at final inspection. By the time a finished board is on the inspection table, the density, the glue spread and the press cycle have already fixed most of what the board will be. Inspection confirms; the process decides. That distinction is what separates a real quality system from a final check before loading.',
      },
      { type: 'heading', text: 'Stage 1 — Incoming material' },
      {
        type: 'paragraph',
        text: 'Everything downstream inherits the quality of what comes in. Incoming checks typically cover the raw material itself, the resin and additives, and any bought-in faces or films.',
      },
      {
        type: 'list',
        items: [
          'Raw material — species, moisture content, chip or fibre quality, and freedom from contamination',
          'Resin and additives — batch identity, storage condition and shelf life',
          'Face materials — film, melamine paper or veneer checked for colour, thickness and defects',
          'Consumables — sanding belts and tooling condition, which affect surface quality directly',
        ],
      },
      {
        type: 'note',
        text: 'Contamination in the raw material is one of the few defects that cannot be corrected later. It has to be caught at intake.',
      },
      { type: 'heading', text: 'Stage 2 — In-process control' },
      {
        type: 'paragraph',
        text: 'This is where the board is actually made, and where the critical parameters live.',
      },
      {
        type: 'list',
        items: [
          'Moisture content of the mat before pressing',
          'Resin and wax dosing accuracy',
          'Press temperature, pressure and cycle time',
          'Panel thickness and density profile through the thickness',
          'Forming consistency, which shows up later as density variation across the panel',
        ],
      },
      {
        type: 'paragraph',
        text: 'These are process parameters rather than product measurements, and that is the point: a supplier that monitors them is controlling the outcome instead of sorting rejects after the fact.',
      },
      { type: 'heading', text: 'Stage 3 — Finishing and calibration' },
      {
        type: 'paragraph',
        text: 'After pressing, the panel is cooled, calibrated and sanded. Checks at this stage determine whether the surface will accept paint, laminate or veneer without telegraphing the core.',
      },
      {
        type: 'list',
        items: [
          'Thickness after calibration, measured against the tolerance range rather than a single target',
          'Sanding quality and surface flatness',
          'Edge condition and freedom from chipping',
          'Presence of surface defects — blisters, spots, resin marks or indentations',
        ],
      },
      { type: 'heading', text: 'Stage 4 — Final inspection' },
      {
        type: 'paragraph',
        text: 'Final inspection is the verification step, and it should be defined before production starts so that acceptance is not a matter of opinion.',
      },
      {
        type: 'list',
        items: [
          'Dimensions — length, width and thickness measured at defined points',
          'Squareness and edge straightness',
          'Surface inspection across both faces under consistent lighting',
          'Moisture content at dispatch',
          'Colour and surface matching against the approved sample where appearance matters',
        ],
      },
      {
        type: 'paragraph',
        text: 'Where a sealed sample was approved, this is the stage where it earns its keep — the board is compared against a physical reference, not a verbal description.',
      },
      { type: 'heading', text: 'Stage 5 — Packing and loading' },
      {
        type: 'paragraph',
        text: 'A board that passed inspection can still arrive damaged. Packing and loading are part of quality control, not logistics.',
      },
      {
        type: 'list',
        items: [
          'Edge protection and corner protection in place',
          'Moisture barrier used where the shipment will cross humid or wet conditions',
          'Banding tension and pallet stability checked',
          'Container loading inspected for gaps, movement and contact with the container walls',
        ],
      },
      { type: 'heading', text: 'What a buyer should be able to verify' },
      {
        type: 'list',
        items: [
          'The specification, in writing, with tolerances as ranges',
          'The inspection stages and what is measured at each one',
          'The approved reference sample, retained and identifiable',
          'Records showing that the parameters were monitored during production',
          'A named contact for non-conformance, and a described corrective process',
        ],
      },
      {
        type: 'paragraph',
        text: 'A supplier who can produce these without hesitation is running a process. A supplier who can only show a final inspection photo is running a check — and a check only catches what it happens to look at.',
      },
      { type: 'heading', text: 'The honest limitation' },
      {
        type: 'paragraph',
        text: 'No inspection regime catches everything, and wood is a variable material. The realistic goal is not zero defects; it is a process where variation is measured, understood and kept inside an agreed range — and where the occasional out-of-range result is found before shipment rather than after arrival.',
      },
    ],
  },
];
