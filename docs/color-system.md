# Praxis Color System

Praxis uses the homepage as its visual source of truth. The system is editorial rather
than decorative: warm paper creates room, ink carries reading, and muted copper marks a
deliberate action or a section threshold. The green in the supplied mark belongs to the
brand artwork, not to general interface emphasis.

## Token layers

| Layer                   | Tokens                                                                                         | Purpose                                                                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Background and material | `--color-bg`, `--color-bg-surface`, `--color-bg-raised`, `--color-highlight`, `--color-shadow` | Establish page depth through value, transparency, and material rather than extra hues.                                      |
| Content                 | `--color-fg`, `--color-fg-muted`, `--color-fg-subtle`, `--color-line-*`                        | Preserve reading hierarchy, rules, dividers, and quiet metadata.                                                            |
| Brand                   | `--color-brand`, `--color-brand-strong`, `--color-brand-tint`, `--color-brand-display`         | Copper is reserved for CTA/link hierarchy, active navigation, section signals, and intentional editorial markers.           |
| Brand secondary         | `--color-brand-secondary`                                                                      | Moss remains restricted to supplied brand assets and editorial artwork. It must not become a second general-purpose accent. |
| Feedback                | `--color-success`, `--color-warning`, `--color-error`, `--color-neutral`, `--color-focus-ring` | Communicate state independently from the brand palette.                                                                     |
| Data and overlays       | `--color-data-heat-*`, `--color-overlay-*`                                                     | Keep practice intensity separate from actions, and make shared image, glass, and header materials consistent.               |

All tokens live in `apps/web/src/styles/tokens.css` and use `light-dark()` so light and dark values stay paired in one declaration. Explicit `data-theme` only selects the color scheme; it does not maintain a second drifting palette.

## Usage rules

- Use semantic tokens only. Components and routes do not define raw UI colors.
- Use `--color-brand` for an active or intentional signal, never for passive metadata.
- Use `--color-fg-subtle` for stage labels, dates, indices, event kinds, and other secondary context.
- Use background, line, overlay, and shadow roles to differentiate surfaces before introducing another hue.
- Use `--color-data-heat-*` only for the practice calendar and legend; data intensity is not CTA emphasis.
- Use `--color-overlay-header` and `--color-overlay-glass` for their named material contexts rather than recreating local `color-mix()` values. The header material is intentionally 92% opaque so small navigation text remains readable over artwork.
- Respect reduced transparency by letting the global stylesheet replace glass with the surface token.

## Interaction states

Links and primary interactive signals use the copper brand pair. Hover may increase contrast or reveal a shared surface; active states retain a small, immediate press response. Keyboard focus always uses `--color-focus-ring`, not the brand color, so focus is clear even where copper is already part of the content.

Disabled, neutral, success, warning, and error states must use their corresponding semantic token. No component should infer a state from a page-specific background or an artwork color.
