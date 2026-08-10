# Astro component guidelines

## Default component shape

Use `.astro` components as the default. Keep data loading in the frontmatter section and markup in the template; keep
the component responsible for presentation, not content querying or API calls.

```astro
---
import type { ContentSummary } from '../lib/content';

interface Props {
  entry: ContentSummary;
  compact?: boolean;
}

const { entry, compact = false } = Astro.props satisfies Props;
---

<article class:list={['content-card', compact && 'content-card--compact']}>
  <a href={entry.url}>
    <span>{entry.typeLabel}</span>
    <h2>{entry.title}</h2>
  </a>
</article>
```

The implemented local pattern is typed props, semantic markup, and a typed entry supplied by the content access layer.
For example, `ContentCard.astro` receives a `ContentSummary` and links through its precomputed `url`; it does not
query the collection or inspect raw frontmatter. `PracticeHeatmap.astro` receives a `PracticeDataset` and renders a
static accessible summary plus a scrollable grid.

```astro
---
import type { ContentSummary } from '../lib/content';

interface Props {
  entry: ContentSummary;
}

const { entry } = Astro.props satisfies Props;
---

<a href={entry.url}>
  <span>{entry.typeLabel}</span>
  <h2>{entry.title}</h2>
</a>
```

## Props and composition

- Define a local `Props` interface for every non-trivial component and use `satisfies` when reading `Astro.props`.
- Pass typed data down; do not pass raw frontmatter records or untyped dictionaries.
- Prefer composition and slots over boolean-prop combinations that create many visual modes.
- Keep page-specific composition in the page/layout; keep reusable components free of route assumptions.
- Labels, status names, and accessibility text come from the centralized copy configuration or explicit props.

## Client behavior

- Static Astro markup is the default and must work without JavaScript.
- Navigation disclosures use native `details/summary` with real nested links; a small progressive-enhancement script may
  improve hover and dismissal behavior, but it must never be required to reveal or follow the links.
- When a primary navigation group pairs a direct overview link with a `summary` trigger, keep them as sibling controls:
  the link owns the canonical href and `aria-current`, while the icon-only `summary` owns only disclosure and has its own
  accessible name. Do not nest a link inside `summary` or repeat the overview in the flyout. Its shared navigation class
  owns the outer `display`, vertical alignment, and typography metrics; keep an E2E assertion for matching direct-label
  metrics, independent keyboard order, and non-overlapping hit targets.
- Hydrate only an explicit interaction such as a theme preference control. The Practice Heatmap is static HTML/SVG/CSS
  or a minimal island only if a demonstrated interaction requires it.
- A component that calls a future API must isolate failure and preserve its surrounding article/navigation content.
- Do not introduce React hooks, a global client store, or a component library for the foundation slice.

## Root-page exhibition heroes

`EditorialHero.astro` is the root-page-only visual shell for `/projects`, `/journey`, and `/about`.
It receives `eyebrow`, `title`, `description`, and a typed art `variant`; the associated local image source and dimensions
live in `src/config/editorial-heroes.ts`. It must preserve one real H1 and expose imagery only as `alt=""` decoration.

- Keep `PageHero.astro` for quiet single-page introductions outside the knowledge namespace. Every
  `knowledge/index.astro` overview, `knowledge/[key].astro` section, and article uses the shared
  `KnowledgeDocsLayout.astro` document shell with typed sidebar and table-of-contents view models; those presentational
  components do not query content or infer section membership.
- The wide knowledge shell caps at `108rem` and uses an `18rem` product-navigation rail, flexible reading column, and
  page TOC. The rail adapts CC Switch's verified 44px search and 40px row geometry with library icons, 12px scoped
  navigation radii, a light brand-tint current state, and 4px row rhythm while retaining Praxis tokens and typography.
  Chapter numbers stay in the reading header; real counts remain accessible but are not repeated visually in the rail.
  Descriptions remain filter data and reappear in narrow disclosures. Rails use document scrolling; if the viewport is
  too short for safe sticky positioning, return them to normal flow instead of adding nested scroll containers.
- Root Hero art is local, text-free, eager with explicit width/height, and layered inside the Hero only. Do not put a
  background URL in inline styles, introduce remote art, or add a browser script merely for reveal/parallax.
- Use `--section-min-block-size` on desktop; at narrow widths, place semantic copy above the image rather than relying on
  contrast over a crop. Keep `overflow: clip` scoped to the Hero so project anchors and main content remain unaffected.
- Any entrance animation is a one-time `transform`/`opacity` CSS enhancement inside `prefers-reduced-motion: no-preference`.
  Reduced motion must leave copy immediately visible; reduced transparency needs an opaque veil and forced-colors can hide
  decorative imagery.
- Extend browser coverage whenever a root Hero variant changes: one H1, exact local source, first-viewport geometry,
  narrow-screen overflow, reduced-motion static state, and a regression that knowledge interiors remain in the shared
  document shell without root-page artwork.

## Accessibility

- Use landmarks (`header`, `nav`, `main`, `footer`) and one clear page heading.
- Use real links and buttons for navigation/actions; never make a `div` clickable.
- Preserve visible focus, keyboard order, sufficient contrast, and reduced-motion behavior in both themes.
- Heatmap cells need a text alternative or accessible summary; color alone cannot communicate activity intensity.
- Heatmap cells expose a localized native `title` fallback in addition to any CSS tooltip. A tooltip inside `.heatmap-scroll` must reserve enough top gutter to remain within the scroll container's clipping rectangle; cover the top-row geometry with E2E assertions.
- Decorative visuals are hidden from assistive technology; Philosophy copy remains real text.

## Avoid

- Parsing frontmatter inside a card, layout, or route component.
- Long opaque Tailwind class strings with recurring arbitrary values.
- Hidden labels, unexplained filler text, or color-only status indicators.
- Network requests in presentational components.
