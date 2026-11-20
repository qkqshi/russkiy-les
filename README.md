# Russian Forest / Русский лес

An independent concept website for the Russian Forest food brand: an interactive product carousel, a catalogue of ten flavours, product detail pages and company information.

Demo: [russkiy-les.vercel.app](https://russkiy-les.vercel.app/).

## Requirements

- Node.js 24.x and npm.
- No runtime dependencies, API keys, environment variables or database are required.

## Build and verify

```sh
npm ci
npm run build
npm run check
```

The build generates 45 routes and a 404 page in `dist/`, with an identical copy in `.output/public/`. Both directories are generated and excluded from Git. Build before running the checks.

Serve `dist/` with a static HTTP server to preview the site. Opening an HTML file directly does not resolve the root-relative asset and navigation URLs.

Checks cover generated routes, Russian branding, local links and assets, historical route aliases, and client interactions in a simulated DOM. Browser layout checks are separate from `npm run check`.

## Source layout

| Path | Purpose |
| --- | --- |
| `src/data.mjs` | Products, company details and route aliases |
| `src/render.mjs` | HTML templates |
| `src/logo.mjs` | Brand and navigation markup |
| `public/styles.css` | Responsive layout and styles |
| `public/site.js` | Carousel, menu, filters, galleries and page transitions |
| `public/images/products/` | Local product packshots |
| `scripts/` | Dependency-free build and checks |
| `docs/ASSETS.md` | Asset provenance and usage notes |

All pages use the Russian Forest design and Russian-language content. Historical URLs, including `/en/` and `/dispensa/`, remain aliases of the current pages.

The Prata display font is requested from Google Fonts. Product images and brand artwork are local; the site retains fallback fonts if Google Fonts is unavailable.

## GitHub and Vercel

Use the contents of this directory as the repository root. Local reports, screenshots, historical captures, retired assets, credentials and generated output are excluded from Git.

Import the GitHub repository into Vercel. The included `vercel.json` sets:

- Framework: Other.
- Build command: `npm run build`.
- Output directory: `dist`.
- Trailing slashes: enabled.

No project IDs, account credentials or environment variables need to be committed. To update the existing demo, connect the repository to the existing `russkiy-les` project in the account that owns it.

## Rights and attribution

This is an independent demonstration project, not a claim of affiliation with the manufacturer. Brand names, logos and reference product photography belong to their respective owners. Product packshots include AI-assisted reconstructions; see [asset notes](docs/ASSETS.md).

No open-source licence is granted by this repository. Confirm the necessary permissions before publicly redistributing third-party assets or using them commercially.
