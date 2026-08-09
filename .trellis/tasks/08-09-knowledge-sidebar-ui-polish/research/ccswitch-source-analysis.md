# CC Switch documentation sidebar source analysis

Date: 2026-08-09
Source: `https://ccswitch.io/zh/docs?section=getting-started`

## Runtime and source

- React 18, TypeScript, Tailwind CSS and Lucide icons.
- Docs chunk: `/assets/DocsPage-DOSxDeOY.js`.
- Main stylesheet at capture time: `/assets/index-DVzgKmMw.css`.

## Verified component classes

- Rail: `w-64 lg:w-72 shrink-0`; wide width is `18rem / 288px`.
- Search: `w-full mb-4 flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-muted/50 ... text-sm`.
- Search icon: `w-4 h-4`; shortcut badge: `text-xs px-1.5 py-0.5 rounded bg-background border`.
- Navigation: `sticky top-24 space-y-1`.
- Primary row: `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg ...`.
- Current row: `bg-primary/10 text-primary font-medium`.
- Default row: `text-muted-foreground hover:bg-muted hover:text-foreground`.
- Row icon: `text-primary/70`, `w-4 h-4`.
- `rounded-lg` resolves to `--radius: .75rem` in the active documentation theme.

## Browser measurements at 1280 x 720

- Page background: `rgb(238, 234, 226)`.
- Rail: `288 x 408px` at `x=16`.
- Search: `288 x 43.2px`, padding `10px 12px`, gap `8px`, radius `12px`.
- Current row: `288 x 40px`, padding `10px 12px`, gap `12px`, radius `12px`.
- Default row: `288 x 40px` with the same geometry.

## Praxis adaptation

Praxis keeps its lighter paper `rgb(244, 241, 234)`, copper brand token, serif reading column, native links, direct in-page filter and no-JavaScript disclosure. It adopts the verified rail geometry, icon rhythm, rounded navigation surfaces and state hierarchy without copying CC Switch brand assets or React runtime.
