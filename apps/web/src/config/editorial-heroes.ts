export const editorialHeroArt = {
  knowledge: {
    src: '/art/praxis-knowledge-hero-1536.webp',
    srcset:
      '/art/praxis-knowledge-hero-1536.webp 1536w, /art/praxis-knowledge-hero-2048.webp 2048w',
    width: 1536,
    height: 864,
  },
  projects: {
    src: '/art/praxis-projects-hero-1536.webp',
    srcset: '/art/praxis-projects-hero-1536.webp 1536w, /art/praxis-projects-hero-2048.webp 2048w',
    width: 1536,
    height: 864,
  },
  journey: {
    src: '/art/praxis-journey-hero-1536.webp',
    srcset: '/art/praxis-journey-hero-1536.webp 1536w, /art/praxis-journey-hero-2048.webp 2048w',
    width: 1536,
    height: 864,
  },
  about: {
    src: '/art/praxis-about-hero-1536.webp',
    srcset: '/art/praxis-about-hero-1536.webp 1536w, /art/praxis-about-hero-2048.webp 2048w',
    width: 1536,
    height: 864,
  },
} as const;

export type EditorialHeroVariant = keyof typeof editorialHeroArt;
