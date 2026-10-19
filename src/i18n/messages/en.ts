/**
 * English messages（默认语言，同时是消息结构的类型事实源）
 *
 * 约定：
 *   · 只放**前端固定 UI 文案**；产品 / 文章等业务内容永远来自 API，不在此处翻译。
 *   · 插值占位符统一使用 `{name}` 形式。
 *   · 新增 key 必须同步写入 `zh-CN.ts`（类型会强制要求，缺一个都编译不过）。
 */

export const en = {
  common: {
    requestQuote: 'Request Quote',
    viewProducts: 'View Products',
    viewAll: 'View All',
    viewDetails: 'View Details',
    viewApplications: 'View Applications',
    viewFactory: 'View Factory',
    viewQuality: 'View Quality Control',
    browseProducts: 'Browse Products',
    backToHome: 'Back to Home',
    contactUs: 'Contact Us',
    home: 'Home',
    breadcrumb: 'Breadcrumb',
    previous: 'Previous',
    next: 'Next',
    pageOf: 'Page {page} of {total}',
    pagination: 'Pagination',
    minRead: '{minutes} min read',
    readArticle: 'Read article →',
    published: 'Published {date}',
    updated: 'Updated {date}',
    tags: 'Tags',
    loading: 'Loading…',
    photoPending: 'Photo to be added',
    productImagePending: 'Product image pending',
    imageLoadFailed: 'Image failed to load',
    toBeConfirmed: 'To be confirmed',
    showImage: 'Show image {index} of {total}',
    imageAltSuffix: '{alt} — image {n}',
    countProducts: '{count} products',
    countProductOne: '{count} product',
    countArticles: '{count} articles',
    countArticleOne: '{count} article',
    category: 'Category',
    all: 'All',
    materials: 'Materials',
    material: 'Material',
    application: 'Application',
    related: 'Related',
    overview: 'Overview',
    atAGlance: 'At a glance',
    noValue: '—',
    tryAgain: 'Try again',
    learnMore: 'Learn more',
    ctaTitle: 'Ready to source wooden products?',
    ctaDescription:
      'Send us your specification or drawing — our team will review it and respond with a quotation.',
  },

  nav: {
    home: 'Home',
    products: 'Products',
    factory: 'Factory',
    quality: 'Quality',
    applications: 'Applications',
    about: 'About',
    blog: 'Blog',
    contact: 'Contact',
    requestQuote: 'Request Quote',
    mainNav: 'Main navigation',
    mobileNav: 'Mobile navigation',
    footerNav: 'Footer navigation',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    sitemap: 'Sitemap',
    sitemapZh: '站点导航',
    contactHeading: 'Contact',
    contactHeadingZh: '联系',
    company: 'Company',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    certificates: 'Certificates',
    faq: 'FAQ',
    social: 'Social',
    salesContacts: 'Sales & general enquiries',
    copyright: '© {year} {name} ({nameZh}). All rights reserved.',
    exportLine: 'B2B Export Supplier · {tagline}',
    skipToContent: 'Skip to content',
  },

  language: {
    label: 'Language',
    switcher: 'Select language',
    current: 'Current language: {name}',
    changeTo: 'Switch to {name}',
    updating: 'Switching language…',
    menuLabel: 'Language options',
  },

  home: {
    metaTitle: 'Bailing Wooden | Wooden Products Manufacturer & B2B Export Supplier',
    metaDescription:
      'Bailing Wooden manufactures wooden products for B2B buyers — OEM & ODM production to your drawings, export documentation and shipment support.',
    heroBadge: 'B2B Wooden Products Manufacturer',
    exploreProducts: 'Explore Products',
    capabilitiesEyebrow: 'Capabilities',
    capabilitiesTitle: 'What we do',
    capabilitiesDescription:
      'A complete manufacturing and export workflow, from custom production to documentation and shipment.',
    capabilities: {
      oem: {
        title: 'OEM & ODM',
        description:
          'Custom wooden products manufactured to your drawings, samples and specifications.',
      },
      quality: {
        title: 'Quality Control',
        description:
          'Incoming material inspection, in-process checks and pre-shipment inspection before loading.',
      },
      logistics: {
        title: 'Export Logistics',
        description:
          'FOB / CIF terms with full export documentation support for international shipping.',
      },
      sourcing: {
        title: 'Sustainable Sourcing',
        description: 'Responsibly sourced timber supported by traceability documentation.',
      },
    },
    productsEyebrow: 'Products',
    productsTitle: 'Product categories',
    productsDescription:
      'Product categories and specifications will be published from the product catalog.',
    productsPlaceholderTitle: 'Product Category {index}',
    productsPlaceholderNote: 'Populated from the product catalog in the next phase',
    applicationsEyebrow: 'Applications',
    applicationsTitle: 'Where our products are used',
    applicationsDescription:
      'Typical application areas served by wooden product manufacturers. Detailed case studies are pending confirmation.',
    applications: {
      furniture: {
        title: 'Furniture Manufacturing',
        description: 'Components and panels supplied to furniture producers.',
      },
      construction: {
        title: 'Building & Construction',
        description: 'Wood-based materials for interior and structural applications.',
      },
      packaging: {
        title: 'Packaging & Logistics',
        description: 'Wooden packaging solutions for industrial shipping.',
      },
      diy: {
        title: 'DIY & Home Improvement',
        description: 'Retail-ready wooden products for consumer markets.',
      },
    },
  },

  products: {
    metaTitle: 'Products',
    metaDescription:
      'Explore the wooden product range from Bailing Wooden — panels, components, packaging and custom OEM products for B2B buyers worldwide.',
    eyebrow: 'Products',
    title: 'Wooden Products',
    titleZh: '产品中心',
    description:
      'Product categories, specifications and datasheets will be published here. Filtering and search are available below.',
    badgeOem: 'OEM / ODM',
    badgeSourcing: 'Sustainable Sourcing',
    filterLabel: 'Category',
    catalogEyebrow: 'Catalog',
    allProducts: 'All products',
    allProductsDescription:
      'Each product page presents a gallery, description, specifications, material and application details.',
    emptyCategoryTitle: 'No products in this category yet',
    emptyTitle: 'No products published yet',
    emptyNote: 'Product data will be published from the CMS once available.',
    ctaTitle: 'Cannot find the product you need?',
    ctaDescription:
      'Send us your specification or drawing — custom production is available for OEM and ODM projects.',
    demoBadge: 'Demo / Placeholder',
    demoText:
      'Product records below are placeholder data used to validate the page template. They will be replaced by CMS-managed content.',
  },

  productDetail: {
    notFoundTitle: 'Product Not Found',
    notFoundDescription: 'The requested product could not be found.',
    requestQuote: 'Request Quote',
    backToProducts: 'Back to Products',
    descriptionTitle: 'Product description',
    specificationsEyebrow: 'Specifications',
    specificationsTitle: 'Technical specifications',
    specificationsDescription:
      'Specification values are maintained in the product catalog. Unconfirmed values are intentionally left blank.',
    specificationsEmptyTitle: 'Specifications to be confirmed',
    specificationsEmptyNote: 'No specification data has been provided for this product yet.',
    materialTitle: 'Material',
    materialMissing: 'Material information will be published once confirmed.',
    applicationsTitle: 'Applications',
    applicationMissing: 'Application information will be published once confirmed.',
    relatedEyebrow: 'Related',
    relatedTitle: 'Related products',
    relatedDescription: 'Other products from the catalog you may be interested in.',
    relatedEmptyTitle: 'No related products yet',
    relatedEmptyNote: 'Related products appear once more catalog items are published.',
    ctaTitle: 'Request a quotation for this product',
    ctaDescription:
      'Send your specification, quantity and destination port — our export team will respond with a quotation.',
  },

  blog: {
    metaTitle: 'Wood Industry Insights | Bailing Wooden',
    metaDescription:
      'Wood industry insights from Bailing Wooden — buying guides, material comparisons and manufacturing know-how for B2B buyers of MDF, plywood and wood-based panels.',
    eyebrow: 'Blog',
    title: 'Wood Industry Insights',
    titleZh: '行业知识与采购指南',
    description:
      'Practical guides on choosing, specifying and checking wood-based panels — written for buyers, not for search engines.',
    badgeKnowledge: 'Industry Knowledge',
    badgeGuide: 'Buying Guide',
    filterLabel: 'Category',
    articlesEyebrow: 'Articles',
    latestArticles: 'Latest articles',
    articlesDescription:
      'Buying guides, material comparisons and manufacturing know-how. New articles are added as the library grows.',
    categorySummary: '{count} articles in this category.',
    emptyCategoryTitle: 'No articles in this category yet',
    emptyTitle: 'No articles published yet',
    emptyNote: 'Articles are added from the content system once available.',
    paginationLabel: 'Blog pagination',
    ctaTitle: 'Need a material recommendation?',
    ctaDescription:
      'Tell us the application and the performance it needs — we will suggest a suitable panel specification.',
  },

  blogDetail: {
    notFoundTitle: 'Article Not Found',
    notFoundDescription: 'The requested article could not be found.',
    asideTitle: 'Sourcing this material?',
    asideText:
      'Send your specification, quantity and destination port — our export team will review it and respond with a quotation.',
    relatedProductsEyebrow: 'Related',
    relatedProductsTitle: 'Products mentioned in this article',
    relatedProductsDescription: 'The panel materials discussed above are part of the product catalogue.',
    relatedProductsEmptyTitle: 'Related products pending publication',
    relatedProductsEmptyNote: 'Product records linked to this article are not published yet.',
    keepReadingEyebrow: 'Keep Reading',
    relatedArticlesTitle: 'Related articles',
    relatedArticlesDescription: 'More guides on the same and adjacent topics.',
    allArticles: 'All Articles',
    ctaTitle: 'Have a specification to check?',
    ctaDescription:
      'Send us the board you are considering and how it will be used — we will tell you what will work and what will not.',
  },

  about: {
    metaTitle: 'About Bailing Wooden | Wood Manufacturer',
    metaDescription:
      'Bailing Wooden is a wood panel manufacturer and B2B export supplier based in Shouguang, Shandong, China — producing MDF, plywood, particle board and decorative panels for furniture, interior and construction applications.',
    eyebrow: 'About',
    title: 'About Bailing Wooden',
    titleZh: '关于百灵木业',
    description:
      'Reliable Wood Solutions for Global Partners — a wood panel manufacturer and export supplier working with furniture makers, importers and distributors.',
    profileEyebrow: 'Company Profile',
    profileTitle: 'A wood panel manufacturer built around process',
    profileLead:
      '{name} ({nameZh}) manufactures and exports wood-based panels from Shouguang, Shandong, China.',
    profileBody1:
      'Our product range covers MDF, plywood, particle board and decorative panels, supplied to furniture manufacturers, interior contractors, distributors and importers. We handle product development, production control and export supply as one continuous process — from confirming the specification to loading the container.',
    profileBody2:
      'Because we produce rather than only trade, questions about material behaviour, tolerance and surface finish are answered by the people who make the boards. That is what makes a specification realistic instead of optimistic.',
    badgeMdf: 'MDF',
    badgePlywood: 'Plywood',
    badgeParticleBoard: 'Particle Board',
    badgeDecorative: 'Decorative Panels',
    badgeSourcing: 'Responsible Sourcing',
    storyEyebrow: 'Our Story',
    storyTitle: 'From panel production to export supply',
    storyBody1:
      'Bailing Wooden started in panel manufacturing — pressing, sanding and finishing boards for domestic furniture producers. As buyers from overseas began asking for the same products to their own specifications, the business grew into a direct export supplier with its own quality and documentation process.',
    storyBody2:
      'That path shaped how we work today. Instead of pushing a fixed catalogue, we start from the application: what the board has to do, how it will be machined, what surface it needs, and where it is going. The specification follows from there.',
    storyBody3:
      'Our team combines production, quality and export coordination under one roof, so an enquiry does not have to travel between three companies before you get an answer.',
    glanceBusiness: 'Business',
    glanceBusinessValue: 'Wood panel manufacturing & export',
    glanceLocation: 'Location',
    glanceLocationValue: 'Shouguang, Shandong, China',
    glanceMaterials: 'Main materials',
    glanceMaterialsValue: 'MDF · Plywood · Particle board · Decorative panels',
    glanceBuyers: 'Buyers served',
    glanceBuyersValue: 'Furniture makers, interior contractors, importers, distributors',
    glanceFounded: 'Founding year',
    glanceCapacity: 'Plant area & capacity',
    teamEyebrow: 'Our Team',
    teamTitle: 'The people behind the orders',
    teamDescription:
      'Production, quality and export coordination are handled in-house. Individual names and roles will be published once confirmed.',
    teamEmptyNotice: 'Team photography will be added here once supplied.',
    philosophyEyebrow: 'Philosophy',
    philosophyTitle: 'How we approach the work',
    philosophyDescription:
      'Four principles that decide how a specification is agreed, produced and shipped.',
    philosophy: {
      quality: {
        title: 'Consistent Quality',
        description:
          'Every order is produced against an agreed specification, so the boards you receive match the samples you approved.',
      },
      craft: {
        title: 'Practical Craftsmanship',
        description:
          'Panels are judged by how they perform on the production line — machining, edge quality, surface finish and stability.',
      },
      sourcing: {
        title: 'Responsible Sourcing',
        description:
          'Raw materials are sourced with traceability in mind, and offcuts are recovered back into production wherever possible.',
      },
      partnership: {
        title: 'Long-term Partnership',
        description:
          'We work as a supply partner rather than a one-off seller: clear communication before the order and support after it ships.',
      },
    },
    whyEyebrow: 'Why Bailing',
    whyTitle: 'What you get when you work with us',
    whyDescription: 'Capability and process — not unverifiable claims about scale.',
    reasons: {
      knowHow: {
        title: 'Material know-how',
        description:
          'MDF, plywood, particle board and decorative panels each behave differently. We help you match the board to the application.',
      },
      clarity: {
        title: 'Specification clarity',
        description:
          'Thickness, density, glue type, surface treatment and tolerances are confirmed in writing before production starts.',
      },
      control: {
        title: 'Production control',
        description:
          'Incoming material, in-process panels and finished boards are checked at defined stages of the production flow.',
      },
      documentation: {
        title: 'Export documentation',
        description:
          'Commercial invoice, packing list and the shipping documents your forwarder needs are prepared as part of the order.',
      },
      oem: {
        title: 'OEM & custom sizes',
        description:
          'Custom dimensions, cut-to-size panels and private-label surface finishes can be produced against your drawing.',
      },
      communication: {
        title: 'Responsive communication',
        description:
          'Enquiries are reviewed by a person, not a queue — you get a straight answer on what is feasible and what is not.',
      },
    },
    solutionsEyebrow: 'Products & Solutions',
    solutionsTitle: 'What we manufacture',
    solutionsDescription:
      'Five product directions covering the panels and components our buyers order most often.',
    viewCatalogue: 'View Full Catalogue',
    solutions: {
      mdf: {
        title: 'MDF & HMR MDF',
        description:
          'Standard, moisture-resistant and special-surface fibreboard for furniture and interiors.',
      },
      plywood: {
        title: 'Plywood',
        description:
          'Commercial, film-faced and structural plywood for furniture, formwork and transport.',
      },
      particle: {
        title: 'Particle Board',
        description:
          'Raw and melamine-faced particle board for cabinets, shelving and flat-pack furniture.',
      },
      decorative: {
        title: 'Decorative Panels',
        description:
          'Melamine, veneer, PET, UV and WPC surfaces for visible, design-facing applications.',
      },
      furniture: {
        title: 'Furniture Solutions',
        description:
          'Door skins, edge banding, block board and cut-to-size components for furniture makers.',
      },
    },
    browseRange: 'Browse range →',
    marketEyebrow: 'Global Market',
    marketTitle: 'Built to ship, not just to produce',
    marketDescription: 'Export supply means the order is not finished when the board is made.',
    marketBody1:
      'Orders are packed for container loading, labelled to your instruction and documented for customs and your forwarder. Where a buyer needs consistency across repeat shipments, we hold the agreed specification so the second container matches the first.',
    marketBody2:
      'We work with importers, distributors and manufacturers who value a supplier that can explain what a board will do before it is bought — and stand behind it afterwards.',
    badgeLoading: 'Container loading',
    badgeDocumentation: 'Export documentation',
    badgeRepeat: 'Repeat-order consistency',
    badgeOem: 'OEM / ODM',
    deeperEyebrow: 'Go Deeper',
    deeperTitle: 'See how we make and check the boards',
    deeperDescription: 'Manufacturing capability and quality control each have their own page.',
    capabilityTitle: 'Manufacturing Capability',
    capabilityText:
      'Factory structure, production flow, equipment categories and loading — the operational side of the business.',
    qualityTitle: 'Quality Control',
    qualityText:
      'Inspection stages, quality control approach, certificates framework and packaging checks.',
    tradeFairTitle: 'Trade fair gallery',
    officeTitle: 'Office & showroom',
    noteFactory: 'Production-floor photography will be added here once supplied.',
    noteExhibition: 'Trade fair photography will be added here once supplied.',
    noteOffice: 'Office and showroom photography will be added here once supplied.',
    ctaTitle: "Let's talk about your next order",
    ctaDescription:
      'Send your specification, quantity and destination port — our export team will review it and respond with a quotation.',
  },

  factory: {
    metaTitle: 'Factory',
    metaDescription: 'Manufacturing capability and production information of Bailing Wooden.',
    eyebrow: 'Factory',
    title: 'Wood Manufacturing Capability',
    titleZh: '工厂实力',
    description:
      'Production workflow, workshop and shipment records for wooden product manufacturing. Factory information is published once verified by the business.',
    overviewEyebrow: 'Overview',
    overviewTitle: 'Manufacturing capability',
    overviewDescription:
      'A verified factory profile — production base, workshop layout and manufacturing scope — will be published in this section.',
    overviewPending: 'Factory information will be updated.',
    overviewNote:
      'No figures (floor area, output, headcount or equipment count) are displayed until they are confirmed by the business, so that overseas buyers always see accurate information.',
    contactTeam: 'Contact Our Team',
    overviewPhotoTitle: 'Factory overview photo',
    galleryEyebrow: 'Gallery',
    galleryTitle: 'Factory & workshop',
    galleryDescription:
      'Photographs of the production base, workshops and production lines will be displayed here.',
    galleryEmptyNotice: 'Factory photographs will be updated once provided by the business.',
    processEyebrow: 'Process',
    processTitle: 'Production process',
    processDescription:
      'The production workflow from raw material to shipment. This outlines the process framework and does not state production parameters.',
    stepLabel: 'Step',
    steps: {
      raw: {
        title: 'Raw Material',
        description: 'Timber and components received against the agreed specification.',
      },
      processing: { title: 'Processing', description: 'Cutting, machining and surface preparation.' },
      inspection: {
        title: 'Quality Inspection',
        description: 'In-process checks before the goods move to packing.',
      },
      packaging: {
        title: 'Packaging',
        description: 'Export packing, labelling and moisture protection.',
      },
      shipment: {
        title: 'Shipment',
        description: 'Loading, container stowage and export documentation.',
      },
    },
    equipmentEyebrow: 'Equipment',
    equipmentTitle: 'Production equipment',
    equipmentDescription: 'Photographs of the machinery and production lines will be displayed here.',
    equipmentPlaceholder: 'Equipment photo to be added',
    equipmentEmptyNotice: 'Equipment details will be updated.',
    loadingEyebrow: 'Loading & Shipment',
    loadingTitle: 'Loading and shipment',
    loadingDescription:
      'Loading, packaging and shipment preparation records — evidence of how each order is handled before departure.',
    loadingPlaceholder: 'Loading photo to be added',
    loadingEmptyNotice:
      'Loading and shipment photographs will be updated once provided by the business.',
    shipment: {
      loading: {
        title: 'Loading',
        description:
          'Goods loaded under supervision, with loading photos recorded for each shipment.',
      },
      packaging: {
        title: 'Packaging',
        description: 'Export-grade packing and marking applied according to the shipping plan.',
      },
      preparation: {
        title: 'Shipment Preparation',
        description:
          'Container stowage, sealing and export documentation prepared before departure.',
      },
    },
    exhibitionEyebrow: 'Exhibition',
    exhibitionTitle: 'Exhibition gallery',
    exhibitionDescription: 'Photographs from trade fairs and exhibitions will be displayed here.',
    exhibitionPlaceholder: 'Exhibition photo to be added',
    exhibitionEmptyNotice:
      'Exhibition photographs will be updated once provided by the business.',
    ctaTitle: 'Planning a factory visit or audit?',
    ctaDescription: 'Contact our export team to arrange a video tour or an on-site visit.',
  },

  quality: {
    metaTitle: 'Quality Control',
    metaDescription:
      'Quality control at Bailing Wooden — incoming material inspection, in-process checks, final inspection and packaging protection for wooden products.',
    eyebrow: 'Quality',
    title: 'Quality Control System',
    titleZh: '品质管控',
    description:
      'Quality is managed at every stage of production — from incoming material to pre-shipment inspection. Certificates and test reports are published once verified by the business.',
    philosophyEyebrow: 'Philosophy',
    philosophyTitle: 'How we approach quality',
    philosophyDescription:
      'The principles behind our quality management — process discipline, staged inspection and traceable records.',
    philosophy: {
      spec: {
        title: 'Specification First',
        description:
          'Every order is produced against a confirmed specification and approved sample, so buyer and factory work from the same standard.',
      },
      stages: {
        title: 'Inspect at Every Stage',
        description:
          'Checks are applied from incoming material through production to pre-shipment, rather than only at the end of the line.',
      },
      records: {
        title: 'Records for Traceability',
        description:
          'Inspection and loading records are kept for each shipment, so the handling of an order can be traced afterwards.',
      },
      improvement: {
        title: 'Continuous Improvement',
        description:
          'Findings from inspections are fed back into the process to reduce repeat issues on following orders.',
      },
    },
    inspectionEyebrow: 'Inspection',
    inspectionTitle: 'Inspection process',
    inspectionDescription:
      'A staged inspection process designed to keep every shipment consistent with the approved sample.',
    stepLabel: 'Stage',
    steps: {
      incoming: {
        title: 'Incoming Material Check',
        description: 'Timber and components checked against the agreed specification.',
      },
      production: {
        title: 'Production Inspection',
        description: 'Dimensional and visual checks carried out during production.',
      },
      final: { title: 'Final Inspection', description: 'Finished goods inspected before packing.' },
      packaging: {
        title: 'Packaging Check',
        description: 'Export packing, labelling and moisture protection verified.',
      },
    },
    inspectionPlaceholder: 'Inspection photo to be added',
    inspectionEmptyNotice:
      'Inspection photographs will be updated once provided by the business.',
    controlEyebrow: 'Control',
    controlTitle: 'Quality control',
    controlDescription:
      'The control points applied across material, production, final goods and packaging.',
    control: {
      material: {
        title: 'Material Inspection',
        description:
          'Incoming timber and components are checked against the agreed specification before use.',
      },
      production: {
        title: 'Production Monitoring',
        description:
          'In-process checks monitor dimensions and appearance while the order is being produced.',
      },
      final: {
        title: 'Final Check',
        description: 'Finished goods are inspected before they are released to packing.',
      },
      packaging: {
        title: 'Packaging Protection',
        description:
          'Export packing and moisture protection are verified to keep goods in condition during transit.',
      },
    },
    certificatesEyebrow: 'Certificates',
    certificatesTitle: 'Certifications & compliance',
    certificatesDescription: 'Certificates and compliance information will be updated.',
    certificateStatus: 'Status: To be confirmed',
    certificateNote:
      'No certificate names, numbers or issuing bodies are displayed until they are verified by the business.',
    certificatePlaceholderTitle: 'Certificate {index}',
    certificatePlaceholderNote: 'Certificate information will be updated',
    recordTestReport: 'Test report',
    recordCertification: 'Certification',
    recordExpired: 'Expired',
    recordIssuer: 'Issuer: {issuer}',
    recordNumber: 'No.: {number}',
    recordIssued: 'Issued: {date}',
    recordValidUntil: 'Valid until: {date}',
    recordViewDocument: 'View document',
    packagingEyebrow: 'Packaging',
    packagingTitle: 'Packaging quality',
    packagingDescription:
      'Export packing is checked to protect the goods through handling, stowage and transit.',
    packaging: {
      protection: {
        title: 'Packing & Protection',
        description:
          'Export-grade packing and moisture protection applied according to the shipping plan.',
      },
      labelling: {
        title: 'Labelling & Marking',
        description:
          'Shipping marks and labelling checked against the order documents before loading.',
      },
      loading: {
        title: 'Loading Check',
        description:
          'Condition of packed goods verified at loading, with loading photos recorded per shipment.',
      },
    },
    packagingPlaceholder: 'Packaging photo to be added',
    packagingEmptyNotice:
      'Packaging photographs will be updated once provided by the business.',
    viewFactoryShipment: 'View Factory & Shipment',
    ctaTitle: 'Need specific test reports?',
    ctaDescription:
      'Tell us the standard or test you require and we will confirm the applicable documentation.',
  },

  applications: {
    metaTitle: 'Wood Applications | Furniture & Interior Solutions',
    metaDescription:
      'Wood panel applications explained — furniture manufacturing, interior decoration, commercial fit-outs, door and cabinet production, packaging and custom solutions.',
    eyebrow: 'Applications',
    title: 'Where Our Panels Are Used',
    titleZh: '应用场景',
    description:
      'From furniture lines to commercial fit-outs and export packaging — how wood-based panels are selected and used in each application.',
    discuss: 'Discuss Your Application',
    badgeKnowledge: 'Industry Knowledge',
    badgeSelection: 'Material Selection',
    categoriesLabel: 'Application Categories',
    categoriesAria: 'Application categories',
    imagesPending:
      'Some application photography is still being collected. Placeholders are shown instead of stock images.',
    blockEyebrow: 'Application {index}',
    blockHighlights: 'Typical material & specification directions',
    relatedProducts: 'Related Products',
    relatedEyebrow: 'Related',
    relatedTitle: 'Products used in these applications',
    relatedDescription: 'The panel materials referenced above are part of the product catalogue.',
    relatedEmptyTitle: 'Related products pending publication',
    relatedEmptyNote: 'Product records linked to these applications are not published yet.',
    ctaTitle: 'Tell us how the panel will be used',
    ctaDescription:
      'Share the application, the performance it needs and your destination — we will recommend a suitable specification.',
    ctaSecondary: 'Read FAQ',
  },

  applicationDetail: {
    notFoundTitle: 'Application Not Found',
    notFoundDescription: 'The requested application could not be found.',
    badge: 'Application',
    allApplications: 'All Applications',
    overviewTitle: '{title} explained',
    categoryLabel: 'Category',
    categoryValue: 'Panel application',
    materialsLabel: 'Materials',
    materialsValue: '{count} specification directions',
    highlightsEyebrow: 'Specification',
    highlightsTitle: 'Typical material & specification directions',
    highlightsDescription:
      'General technical directions for this application — not customer project data.',
    relatedTitle: 'Products used in this application',
    relatedDescription: 'Panel materials from the catalogue that fit this application.',
    relatedEmptyTitle: 'Related products pending publication',
    relatedEmptyNote: 'Product records linked to this application are not published yet.',
    ctaTitle: 'Discuss your application',
    ctaDescription:
      'Tell us how the panel will be used and what it needs to withstand — our export team will advise on the right specification.',
  },

  contact: {
    metaTitle: 'Contact',
    metaDescription:
      'Contact Bailing Wooden for quotations and product enquiries. Send your specification or drawing and our export team will respond.',
    eyebrow: 'Contact',
    title: 'Contact Us',
    titleZh: '联系我们',
    description:
      'Send us your specification or drawing and our export team will get back to you. Verified contact details will be published here.',
    channelEmail: 'Email',
    channelPhone: 'Phone',
    channelAddress: 'Address',
    channelEmailHint: 'Sales & general enquiries',
    channelPhoneHint: 'Business hours only',
    channelAddressHint: 'Factory & office',
    contactsEyebrow: 'Sales Contacts',
    contactsTitle: 'Who you will be talking to',
    contactsDescription: 'Published sales contacts for quotations and order follow-up.',
    rfqEyebrow: 'Request for Quotation',
    rfqTitle: 'Send an enquiry',
    rfqDescription:
      'Fill in the form below with your requirement. Our export team reviews every enquiry and replies with a quotation.',
    nextTitle: 'What happens next',
    nextSteps: {
      review: 'We review your specification or drawing.',
      confirm: 'Our team confirms feasibility and lead time.',
      quote: 'You receive a formal quotation for review.',
    },
    privacyNote: 'Your information is used only to respond to this enquiry.',
    faqEyebrow: 'FAQ',
    faqTitle: 'Frequently asked questions',
    faqDescription: 'Answers to common questions about enquiries, production and shipping.',
    faq: {
      quote: {
        question: 'How do I request a quotation?',
        answer:
          'Send your specification or drawing through the form on this page. Our export team will review it and reply with a quotation.',
      },
      oem: {
        question: 'Can you manufacture to my drawing?',
        answer:
          'OEM and ODM projects are supported. Share your drawing or sample so the specification can be evaluated.',
      },
      shipping: {
        question: 'What are your shipping terms?',
        answer:
          'Shipping terms are confirmed per order. Please include your destination port in your enquiry so we can advise accordingly.',
      },
      samples: {
        question: 'Do you provide samples?',
        answer:
          'Sample arrangements are confirmed case by case. Mention your requirement in the enquiry and we will advise on the available options.',
      },
    },
    locationEyebrow: 'Location',
    locationTitle: 'Find us',
    locationDescription: 'An interactive map will be embedded here once the address is confirmed.',
    locationPlaceholderTitle: 'Map placeholder',
    locationPlaceholderNote: 'Address pending confirmation',
    ctaTitle: 'Ready to discuss your project?',
    ctaDescription:
      'Send your specification or drawing — our export team will review it and respond with a quotation.',
  },

  rfq: {
    name: 'Name',
    namePlaceholder: 'Your name',
    company: 'Company',
    companyPlaceholder: 'Company name',
    email: 'Email',
    emailPlaceholder: 'you@company.com',
    country: 'Country / Region',
    countryPlaceholder: 'Country or region',
    phone: 'Phone',
    phonePlaceholder: 'Phone / WhatsApp',
    quantity: 'Estimated quantity',
    quantityPlaceholder: 'e.g. 1 x 20GP',
    productOfInterest: 'Product of interest',
    interestedProduct: 'Interested Product',
    productPlaceholder: 'Product name or model (optional)',
    requirements: 'Requirements',
    requirementsPlaceholder:
      'Specification, size, material, surface finish, target port and any other details.',
    requirementsHint: 'Minimum {min} characters, up to {max}.',
    attachment: 'Attachment (optional)',
    attachmentLabel: 'Upload drawing or specification',
    attachmentHint: 'Supported: PDF / JPG / PNG / DWG, up to {max}MB per file',
    attachmentNotEnabled: '(Online file upload is not enabled yet)',
    attachmentSelected: 'Selected: {name}',
    attachmentTooLarge: '"{name}" exceeds {max}MB and will not be sent.',
    attachmentSelectedNote:
      '"{name}" selected — online file upload is not enabled yet, so please also describe it in your requirements.',
    privacy: 'We only use your details to respond to this enquiry.',
    submit: 'Submit Request',
    submitting: 'Submitting…',
    successTitle: 'Thank you for your inquiry.',
    successText: 'Our team will contact you soon.',
    successReference: 'Reference: {reference}',
    sendAnother: 'Send another enquiry',
    failure: 'Submission failed. Please try again.',
    errorRequired: '{field} is required.',
    errorEmail: 'Please enter a valid email address.',
    errorMessageMin: 'Please provide at least {min} characters.',
    errorInvalidField: '{field} is invalid. Please check the value.',
  },

  notFound: {
    metaTitle: 'Page Not Found',
    metaDescription: 'The page you are looking for could not be found.',
    title: 'Page not found',
    description: 'The page you are looking for does not exist or has been moved.',
    sectionsAria: 'Main sections',
  },

  error: {
    eyebrow: 'Error',
    title: 'Something went wrong',
    description: 'The page could not be displayed. Please try again, or return to the home page.',
  },

  contentFallback: {
    badge: 'Content language',
    notice:
      'This record is published in English only. The page interface is in Chinese, while the product / article content below is shown in its original English version.',
  },

  placeholder: {
    contentNote: 'Content will be added once confirmed by the business.',
  },
};

export type Messages = typeof en;
