# flave

> **A document that keeps its workings.**
>
> Publish it and people see the conclusion. Send the file itself and they get the evidence, the data and its sources, the reasoning, and the design vocabulary that produced it — written in the languages agents already speak fluently, so a human and an agent can co-author inside it.

`.flave` is a document format. **flave** is the editor over it. Both are built on [Lossless Flavored Markdown](https://jsr.io/@lossless-group/lfm).

**Status: early build — a working desktop app.** flave opens a folder of documents, renders Lossless Flavored Markdown live as you type, lets you invent new syntax without touching the renderer, and restyles the document under your hands as you edit its theme. It runs as a Tauri desktop app on Linux, with getting-started docs for Ubuntu and Nix. The master spec lives at [`context-v/specs/Master-Flave-An-Agent-Native-Document-Format-and-Publisher.md`](./context-v/specs/Master-Flave-An-Agent-Native-Document-Format-and-Publisher.md); the [changelog](./changelog/) has the full story.

---

## Why

Every incumbent document format was designed for a world where the only author was a human with a mouse. The format could be opaque because the only program that ever needed to read it was the program that wrote it.

That assumption is now false, and agents are bad at all of them — OOXML round-trips destroy formatting, `.key` and `.pages` are effectively closed, and a PDF is write-only. Meanwhile the substrate agents are *outstanding* at — HTML, CSS, SVG, JSON, the declarative chart grammars — is exactly what a modern document needs.

But the sharper reason is about labor, not legibility:

> Extensible authoring was always a good idea and always developer-only. Defining a new markdown syntax meant writing a `remark` plugin — an afternoon, plus a mental model most authors will never acquire. **That cost, not the concept, is why every author outside engineering lives inside a fixed set of block types someone else chose.**
>
> Writing a trigger definition and its template and CSS is now a thirty-second agent task. The barrier was labor, and the labor is gone.

Nobody has yet built the editor that assumes this.

## The core: internals vs. publication

The differentiator isn't surgical editing or durable identity. It's that **the document carries more than it shows, and the surplus is the valuable part.**

A `.flave` holds **content, data, and assets** — prose and transcripts, rows with their provenance, images with their licensing. Each carries a **clearance** (`private` → `team` → `lp` → `public`) and a **register** (`verbatim` / `full` / `brief`). An *audience* is a point on both axes, so one document yields your private notes, the team version, the LP version, and a punchy public one-pager — **and they don't drift.**

Clearance is monotonic and machine-checkable, which is what makes the promise provable rather than merely intended: nothing above `public` may appear in the public artifact, and the publish step fails if it does.

## Build order

Most of the master spec is **designed and parked**. The build order is deliberately small:

**v0 — the editor. Largely built.**

- **The live render loop.** CodeMirror 6 on the left, the document on the right, rendered by `@flave/render`: one recursive dispatcher over the AST `lfm` produces, ported from `AstroMarkdown.astro`. Callouts, tables, heading blocks, task lists, and citations with a sources bibliography all render, nested ones included.
- **Syntax you define.** A trigger-pack is a Svelte component plus one line of registration. `:::metric-card{value="42" label="ARR"}` renders as a component the renderer has never heard of, with zero edits to the renderer. You describe what you want, an agent writes the component, and the syntax exists.
- **A desktop app over a workspace.** Tauri v2, brought forward from later in the plan because seeing the product on a real OS mattered more (D-26). It opens a folder, lists its files in a rail that toggles with Chat, and opens `.md`, `.css`, `.yaml`, and `.json` in the same source pane. File access is three narrow commands rooted at that folder, refusing any path that escapes it.
- **The theme is a file you can open.** Click `themes/lossless.css`, change a value, and the document restyles as you type, with no reload. It saves to the workspace, so it is still there tomorrow and shared by every document in it.
- **The demo document is the test.** `workspace/content/welcome.md` is what you see on first launch, and the suite renders that real file and asserts every feature it shows. A feature that stops rendering turns the suite red. `pnpm prove` answers "did we break the floor?" in about ten seconds.

**Next:** one operation set with four callers (a menu, a palette, the rendered page, and an agent all writing through the same named operations), a folder picker, file watching, and CSS diagnostics while you type.

**v1 — clearance and audiences.** Block-level clearance, named audiences, `flave publish --audience`, and the scan that proves nothing leaked. Small once v0 exists.

**Parked:** the layout and frame system, `deck` and `paged` surfaces, the theme registry, Jujutsu integration, DuckDB and `sql` fences, figures, HTMX. All designed in the spec; none scheduled.

## Run it

Getting started guides, per OS, live in [`docs/getting-started/`](./docs/getting-started/) and on the splash under [Collaborate](https://lossless-group.github.io/flave/collaborate/). With Nix installed, `nix develop` (or `direnv allow`) gives you the whole toolchain; then `pnpm install && pnpm app:dev` opens the desktop app. `pnpm test` runs the suite, and `pnpm prove` is the ten-second floor check.

## Repository layout

| Path | Purpose |
|---|---|
| `context-v/` | Living documentation — the master spec, plus plans, blueprints, explorations as they appear |
| `changelog/` | Ship log, per the Lossless changelog conventions |
| `apps/editor/` | `@flave/editor` — the Svelte editor UI: source pane, live document, Files and Chat rail |
| `packages/render/` | `@flave/render` — the renderer over lfm's AST, and the trigger-pack registry |
| `src-tauri/` | The Tauri v2 desktop shell, including the folder-rooted file commands |
| `workspace/` | The seeded workspace the app opens: `content/welcome.md` (the demo, and a test fixture) and `themes/lossless.css` |
| `scripts/` | `prove`, frontmatter, and style checks |
| `flake.nix` | The Nix dev shell: the whole toolchain, including Tauri's system libraries |
| `docs/` | Collaborator docs — getting started per OS. Rendered on the splash under **Collaborate** |
| `splash/` | GitHub Pages splash, live at [lossless-group.github.io/flave](https://lossless-group.github.io/flave/) |

## Relationship to the rest of the tree

- **[`lfm`](https://github.com/lossless-group/lossless-flavored-markdown-package)** — a direct dependency, never forked. LFM owns parsing and trigger normalization; flave is a new renderer over the same AST.
- **`astro-knots/packages/lfm-astro`** — the Astro renderer. `AstroMarkdown.astro` is the reference `@flave/render` is ported from. Two renderers over one AST is LFM's design working as intended.
- **`ai-labs/augment-it`** and **`ai-labs/memopop-ai`** — flave is a *sibling*, not a substrate for either. Their chat surface and Tauri shell are ports of record for later milestones.

## License

TBD.
