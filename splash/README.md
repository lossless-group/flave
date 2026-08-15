# flave/splash

**Placeholder.** No site here yet — this directory reserves the slot and records what belongs in it.

## What this will be

A small Astro site at `flave-ai/splash/`, deployed to GitHub Pages on push, following the pattern proven in [`lfm/splash`](https://github.com/lossless-group/lossless-flavored-markdown-package/tree/main/splash), `content-farm/splash`, and `astro-knots/splash` — per the `maintain-splash-pages` skill.

Per that pattern it should:

- Lead with the thesis — *a document that keeps its workings* — and the clearance × register model, which is the part people have to see to understand.
- Render this repo's `changelog/` and `context-v/` as readable, sortable archives.
- Ship full-text search via Pagefind from day one.
- Support the three-mode contract (light / dark / vibrant) with a pre-paint script so there's no FOUC.
- Deploy free off GitHub Pages on every push to `main`.

It is **not** the eventual marketing site. If flave gets one, it lives elsewhere with its own domain; the splash stays put as this repo's own Pages presence. The directory is named `splash/` precisely to keep that linguistic space open.

## Package isolation

If flave ever publishes packages (`@flave/format`, `@flave/render`, …), the splash must stay isolated from them — its own `package.json`, excluded from the publish surface, never a dependency of anything shipped. That discipline is what makes a splash safe to add to a repo that also publishes, and it is the reason `lfm` can carry one.

## When to build it

**Not yet.** Per the master spec's §1.1, v0 is the editor and nothing else. A splash earns its place once there is something to show — realistically after slice 3, when the extensibility loop works end to end and there is a demo worth putting on a page.
