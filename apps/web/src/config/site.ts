import { contentTypes, getContentUrl } from '../lib/content/domain';
import { uiCopy } from './copy';

export const siteConfig = {
  name: 'Praxis',
  theme: '知行合一',
  title: 'Praxis · 知行合一',
  description: '记录认知如何经过思考、行动与复盘，成为可以持续积累的实践。',
  motto: '知而思，思而行，行而成。',
  locale: uiCopy.locale,
  timeZone: 'Asia/Shanghai',
  author: {
    name: 'Praxis',
    bio: '一个关于长期思考、真实行动与持续复盘的个人实践站。',
  },
  navigation: contentTypes.map((type) => ({
    type,
    label: uiCopy.contentTypes[type],
    href: getContentUrl(type),
  })),
} as const;
