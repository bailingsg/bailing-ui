import type { AboutImage } from './types';

/**
 * 关于我们页素材登记表
 *
 * 素材来源：业务方提供的旧站真实素材（厂区航拍、员工照片），
 * 已按用途重命名后纳入 `public/about/`。**不含 AI 生成图或图库素材**。
 *
 * 登记规则：
 *   1. 原图放入 `public/about/`（未来接入 COS/CDN 后改用其 URL）；
 *   2. 每条记录：id 唯一、category 从 AboutImageCategory 中选取、sortOrder 决定顺序；
 *   3. alt 必须描述画面真实内容（SEO 与无障碍都需要）；
 *   4. 未提供素材的分类**不要**登记任何占位条目 —— 由组件渲染统一占位。
 *
 * ⚠️ 已确认事实的边界：
 *   · 员工照片只登记为"团队成员"，**不编造姓名、职位、人数**；
 *   · 未确认的分类（exhibition / office）保持为空。
 */
export const aboutImages: AboutImage[] = [
  /* -------------------------------- 公司 / 厂区 -------------------------------- */
  {
    id: 'about-company-campus-01',
    url: '/about/company-campus-aerial-01.webp',
    alt: 'Aerial view of the Bailing Wooden factory campus with production halls and the timber storage yard',
    category: 'company',
    sortOrder: 10,
    caption: 'Manufacturing campus',
  },
  {
    id: 'about-company-campus-02',
    url: '/about/company-campus-aerial-02.webp',
    alt: 'Wide aerial view of the Bailing Wooden plant, warehouse and loading area',
    category: 'company',
    sortOrder: 20,
    caption: 'Plant and loading area',
  },

  /* ---------------------------------- 团队 ---------------------------------- */
  {
    id: 'about-team-01',
    url: '/about/team-01.webp',
    alt: 'Portrait of a Bailing Wooden team member',
    category: 'team',
    sortOrder: 10,
  },
  {
    id: 'about-team-02',
    url: '/about/team-02.webp',
    alt: 'Portrait of a Bailing Wooden team member',
    category: 'team',
    sortOrder: 20,
  },
  {
    id: 'about-team-03',
    url: '/about/team-03.webp',
    alt: 'Portrait of a Bailing Wooden team member',
    category: 'team',
    sortOrder: 30,
  },
  {
    id: 'about-team-04',
    url: '/about/team-04.webp',
    alt: 'Portrait of a Bailing Wooden team member',
    category: 'team',
    sortOrder: 40,
  },
  {
    id: 'about-team-05',
    url: '/about/team-05.webp',
    alt: 'Portrait of a Bailing Wooden team member',
    category: 'team',
    sortOrder: 50,
  },
  {
    id: 'about-team-06',
    url: '/about/team-06.webp',
    alt: 'Portrait of a Bailing Wooden team member',
    category: 'team',
    sortOrder: 60,
  },
  {
    id: 'about-team-07',
    url: '/about/team-07.webp',
    alt: 'Portrait of a Bailing Wooden team member',
    category: 'team',
    sortOrder: 70,
  },
  {
    id: 'about-team-08',
    url: '/about/team-08.webp',
    alt: 'Portrait of a Bailing Wooden team member',
    category: 'team',
    sortOrder: 80,
  },
  {
    id: 'about-team-09',
    url: '/about/team-09.webp',
    alt: 'Portrait of a Bailing Wooden team member',
    category: 'team',
    sortOrder: 90,
  },
  {
    id: 'about-team-10',
    url: '/about/team-10.webp',
    alt: 'Portrait of a Bailing Wooden team member',
    category: 'team',
    sortOrder: 100,
  },
  {
    id: 'about-team-11',
    url: '/about/team-11.webp',
    alt: 'Portrait of a Bailing Wooden team member',
    category: 'team',
    sortOrder: 110,
  },
  {
    id: 'about-team-12',
    url: '/about/team-12.webp',
    alt: 'Portrait of a Bailing Wooden team member',
    category: 'team',
    sortOrder: 120,
  },
];

/** 全部素材（供统一排序与检索） */
export const allAboutImages: AboutImage[] = [...aboutImages];
