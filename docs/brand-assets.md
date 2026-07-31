# Praxis Brand Assets

The supplied Praxis logo set lives in `apps/web/public/brand/`. Astro serves these
files at `/brand/<filename>`. Preserve the original filenames and dimensions so
each platform can request its intended asset.

## Asset Inventory

| Asset                        | Public URL                          | Recommended use                                                                                                                                                                                                    |
| ---------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `favicon-mini.svg`           | `/brand/favicon-mini.svg`           | Current primary browser favicon. A true vector mini mark with broad charcoal stems and one green upward stroke, designed to remain clear at tab size.                                                              |
| `favicon-mini-16x16.png`     | `/brand/favicon-mini-16x16.png`     | 16px PNG fallback for the current compact favicon.                                                                                                                                                                 |
| `favicon-mini-32x32.png`     | `/brand/favicon-mini-32x32.png`     | Preferred PNG fallback for the current compact favicon.                                                                                                                                                            |
| `favicon-mini-48x48.png`     | `/brand/favicon-mini-48x48.png`     | 48px PNG fallback for higher-density desktop surfaces.                                                                                                                                                             |
| `favicon-mini.ico`           | `/brand/favicon-mini.ico`           | Legacy browser and Windows shortcut fallback for the current compact favicon.                                                                                                                                      |
| `Logo-Master-1254x1254.png`  | `/brand/Logo-Master-1254x1254.png`  | Master raster logo for high-resolution brand placements, press materials, and source exports. Its square canvas has generous white space, so do not use it directly as a small favicon or a 1200x630 social image. |
| `favicon-svg.svg`            | `/brand/favicon-svg.svg`            | Modern-browser favicon fallback. It is an SVG wrapper around a raster image, not a path-based vector source, so it should not be scaled for a large logo treatment.                                                |
| `favicon-16x16.png`          | `/brand/favicon-16x16.png`          | 1x browser-tab favicon. Declare with `sizes="16x16"`.                                                                                                                                                              |
| `favicon-32x32.png`          | `/brand/favicon-32x32.png`          | Standard and high-density browser-tab favicon. Declare with `sizes="32x32"`; this is the preferred PNG favicon size.                                                                                               |
| `favicon-48x48.png`          | `/brand/favicon-48x48.png`          | Higher-density desktop and shortcut icon. Declare with `sizes="48x48"` when a PNG fallback is needed.                                                                                                              |
| `xhgof-zbtqn-001.ico`        | `/brand/xhgof-zbtqn-001.ico`        | Legacy browser and Windows shortcut fallback. It contains a 48x48 icon.                                                                                                                                            |
| `apple-touch-icon.png`       | `/brand/apple-touch-icon.png`       | iOS and iPadOS home-screen icon. Declare with `rel="apple-touch-icon"` and `sizes="180x180"`.                                                                                                                      |
| `android-chrome-192x192.png` | `/brand/android-chrome-192x192.png` | Standard Android web-app manifest icon. Add as a `192x192` manifest icon with `purpose: "any"`.                                                                                                                    |
| `android-chrome-512x512.png` | `/brand/android-chrome-512x512.png` | High-resolution Android install/splash and store-quality web-app manifest icon. Add as a `512x512` manifest icon with `purpose: "any"`.                                                                            |

## Selection Rules

- Keep the dedicated size variants for small browser and device surfaces; do not rely on browsers to downscale the master logo.
- `favicon-mini.*` is the source set for the compact browser mark. Its production copies are the standard root files: `/favicon.svg`, `/favicon-16x16.png`, `/favicon-32x32.png`, `/favicon-48x48.png`, and `/favicon.ico`.
- `BaseLayout.astro` declares those root entry points. The ICO file includes the 16x16, 32x32, and 48x48 PNG variants for legacy browser and direct `/favicon.ico` requests.
- The Android and Apple assets are ready for a future web-app manifest and touch-icon link. No manifest is added until the site needs installable-app behavior.
- Keep the current page layout and visible brand treatment unchanged until a placement is explicitly requested.
- The original files were copied without recompression or renaming. When a new variant is required, derive it from `Logo-Master-1254x1254.png` rather than from an icon-sized file.
