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

<article class:list={["content-card", compact && "content-card--compact"]}>
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
- Hydrate only an explicit interaction such as a theme preference control. The Practice Heatmap is static HTML/SVG/CSS
  or a minimal island only if a demonstrated interaction requires it.
- A component that calls a future API must isolate failure and preserve its surrounding article/navigation content.
- Do not introduce React hooks, a global client store, or a component library for the foundation slice.

## Accessibility

- Use landmarks (`header`, `nav`, `main`, `footer`) and one clear page heading.
- Use real links and buttons for navigation/actions; never make a `div` clickable.
- Preserve visible focus, keyboard order, sufficient contrast, and reduced-motion behavior in both themes.
- Heatmap cells need a text alternative or accessible summary; color alone cannot communicate activity intensity.
- Decorative visuals are hidden from assistive technology; Philosophy copy remains real text.

## Avoid

- Parsing frontmatter inside a card, layout, or route component.
- Long opaque Tailwind class strings with recurring arbitrary values.
- Hidden labels, unexplained filler text, or color-only status indicators.
- Network requests in presentational components.
