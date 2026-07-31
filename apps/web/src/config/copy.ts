import type { ContentType, JourneyKey, PracticeKind, Stage, Status } from '../lib/content/domain';

export const uiCopy = {
  locale: 'zh-CN',
  navigation: {
    home: '首页',
    blog: '博客',
    notes: '笔记',
    journal: '日志',
    projects: '项目',
  },
  contentTypes: {
    blog: '博客',
    note: '笔记',
    journal: '日志',
    project: '项目',
  } satisfies Record<ContentType, string>,
  stages: {
    'know-think': '知而思',
    'think-act': '思而行',
    'act-achieve': '行而成',
  } satisfies Record<Stage, string>,
  statuses: {
    draft: '草稿',
    ongoing: '进行中',
    completed: '已完成',
    reflected: '已复盘',
  } satisfies Record<Status, string>,
  practiceKinds: {
    publish: '发布',
    learn: '学习',
    practice: '实践',
    reflect: '复盘',
    milestone: '里程碑',
  } satisfies Record<PracticeKind, string>,
  actions: {
    readMore: '继续阅读',
    viewProject: '查看项目',
    backHome: '返回首页',
    switchTheme: '切换明暗主题',
    switchToLight: '切换到浅色主题',
    switchToDark: '切换到深色主题',
  },
  accessibility: {
    skipToContent: '跳到主要内容',
    primaryNavigation: '主要导航',
    themeControl: '主题设置',
    heatmapSummary: '实践热力图摘要',
  },
  footer: {
    builtFromPractice: 'Built from real practice.',
    rss: 'RSS',
    sitemap: 'Sitemap',
  },
  journey: {
    question: '问题',
    thinking: '思考',
    action: '行动',
    outcome: '成果',
    reflection: '复盘',
    nextStep: '下一步',
  } satisfies Record<JourneyKey, string>,
  journeyPanel: {
    eyebrow: 'Journey',
    title: '长期沉淀',
    description: '这些内容会随着项目成熟不断补充，而不会因为阶段变化被替换。',
  },
  timeline: {
    eyebrow: 'Practice log',
    title: '真实实践时间轴',
    description: '只有明确记录的重要学习、行动、复盘和成果会出现在这里。',
  },
  listing: {
    eyebrow: 'Content library',
    descriptions: {
      blog: '围绕一个问题展开的完整思考、论证与复盘。',
      note: '正在形成中的学习记录、概念理解与方法摘记。',
      journal: '与当下经验相关的短记录，保留实践发生时的语境。',
      project: '从问题、行动到成果持续演进的长期项目。',
    } satisfies Record<ContentType, string>,
    countUnit: '条真实内容',
  },
  detail: {
    contentId: 'Content ID',
    tags: '标签',
    updatedAt: '最后更新',
  },
  heatmap: {
    eyebrow: 'Practice record',
    title: '实践不是提交次数，而是重要行动留下的痕迹。',
    description: '这里只统计 Praxis 内容中明确记录的学习、实践、复盘和阶段成果。',
    totalEvents: '实践事件',
    activeDays: '活跃日期',
    contentCount: '关联内容',
    details: '查看最近的实践记录',
    calendarLabel: '过去 53 周的 Praxis 实践热力图',
    annualTotal: (count: number) => `过去一年共 ${count} 次实践`,
    dayLabel: (date: string, count: number) => `${date}：${count} 次实践`,
    eventCount: (count: number) => `${count} 次实践`,
    less: '少',
    more: '多',
    weekdayLabels: ['周一', '周三', '周五'],
    summary: (events: number, days: number) =>
      `过去 53 周共记录 ${events} 次实践，分布在 ${days} 个日期。`,
  },
  empty: {
    title: '这里还没有正式内容',
    description: 'Praxis 不使用虚构文章填充页面。真实的学习与实践发生后，内容会自然出现在这里。',
    practice: '实践记录会在明确写入 practiceLog 后出现在这里。',
  },
  errors: {
    notFoundTitle: '这一页尚未抵达',
    notFoundDescription: '链接可能已经变化，或者这项实践还没有公开。可以回到首页继续浏览。',
  },
} as const;

export type UiCopy = typeof uiCopy;
