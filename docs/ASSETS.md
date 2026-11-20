# Asset provenance

## Product packshots

`public/images/products/*-hd.png` contains ten local transparent PNGs. They are AI-assisted reconstructions and edits based on supplied screenshots and product references, rather than original manufacturer master photographs. Packaging fine print, botanical artwork and reflections may differ from the actual products.

Reference product URLs are retained in `src/data.mjs` as the original `image` values and the derived `sourceImage` property. Sources include the manufacturer, Morganic and Russian Table. These source URLs document provenance and do not grant redistribution rights.

Manufacturer references: [forestrussia.ru](https://www.forestrussia.ru/) and [premium jam range](https://forestrussia.ru/jamopt).

## Brand artwork

`public/forest-wordmark.svg`, `public/forest-logo-light.svg` and `public/favicon.svg` reproduce the supplied Russian Forest tree and wordmark artwork. The vector contours were traced from the supplied reference. The brand marks remain the property of their respective owner.

`public/home-shape.svg` and `public/circle-text.svg` provide the site's decorative composition.

## Fonts

The Prata typeface is loaded through the Google Fonts stylesheet linked in `src/render.mjs`; no font files are bundled in this repository. CSS provides system fallback fonts.

## Publication

This repository does not grant a licence to third-party brand or photographic material. Confirm permission before public redistribution or commercial use. Keep the repository private while permissions remain unconfirmed.
