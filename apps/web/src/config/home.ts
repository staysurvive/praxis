export const homeContent = {
  hero: {
    eyebrow: 'Praxis / Personal practice',
    title: '知行合一',
    lead: '把理解变成行动，把行动沉淀为可以持续生长的成果。',
    description:
      'Praxis 是一个长期实践站。这里不只记录已经完成的文章，也保留问题如何经过思考、行动与复盘，逐渐成为真实成果的过程。',
  },
  philosophy: {
    eyebrow: 'Philosophy',
    title: '知不是终点，行动也不是。',
    description:
      '“知而思、思而行、行而成”不是三个栏目，而是一种面对问题、验证认识并形成成果的方法。',
    stages: [
      {
        index: '01',
        title: '知而思',
        subtitle: 'Know · Think',
        description: '从一个真实问题出发，理解信息、辨认假设，并形成值得验证的判断。',
      },
      {
        index: '02',
        title: '思而行',
        subtitle: 'Think · Act',
        description: '把判断转化为足够小、能够开始的行动，让实践为思考提供新的证据。',
      },
      {
        index: '03',
        title: '行而成',
        subtitle: 'Act · Achieve',
        description: '让行动产生结果，通过复盘留下可复用的经验，再进入下一轮认知。',
      },
    ],
  },
  now: {
    eyebrow: 'Now',
    title: '正在为 Praxis v0.1 准备正式部署。',
    description:
      '公开分享所需的首页、内容、实践热力图、SEO、RSS、Sitemap 与质量门禁已经通过本地验收。下一步是确认公开署名和正式域名，再接入现有 Caddy 与 Docker Compose。',
  },
  latest: {
    eyebrow: 'Latest content',
    title: '最近的真实记录',
    description: '只展示已经发生的实践，不使用虚构内容填满页面。',
  },
} as const;
