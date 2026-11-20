# Project instructions

## Brand and routes

- Russian Forest / «Русский лес» is the only active design. Preserve its branding, Russian content and products on every page.
- Historical routes such as `/en/`, `/en/dispensa/` and `/dispensa/` are aliases of the current Russian pages, not a separate English-language brand.
- Do not restore the retired Agrumea Farm interface, text, logos or products. Historical reference files are excluded from Git and are not build inputs.

## Source

- Use `src/render.mjs`, `src/data.mjs`, `public/styles.css` and `public/site.js` for changes to the current website.
- Keep product and brand assets local. Read `docs/ASSETS.md` before replacing or redistributing them.
- Preserve unrelated changes and keep edits limited to the requested task.

## Validation

1. Run `npm run build`.
2. Run `npm run check`; it must use `scripts/check.mjs` and validate Russian Forest on every generated route.
3. Check relevant browser layouts and interactions when changing the interface.
4. Run Craft Anything `rebuild_check` when the tool is available. Comparisons with the retired reference do not authorize restoring another brand. Report unavailable checks explicitly.

## GitHub communication

Use English for repository documentation, issues, reviews, pull requests and release notes unless the user requests another language.

At handoff, state what changed, what was actually verified and which relevant checks were not run.
