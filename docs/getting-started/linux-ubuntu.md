---
site_uuid: fcfff9cd-48ee-487b-8264-9cfe63e95ca4
title: "Getting started on Linux (Ubuntu)"
lede: "From a clean Ubuntu install to the flave desktop app open on your screen: the system libraries, the three toolchains, and the commands that prove each step worked before you take the next one."
os: linux
order: 1
status: Draft
date_authored_initial_draft: 2026-10-03
date_authored_current_draft: 2026-10-03
date_created: 2026-10-03
date_modified: 2026-10-03
publish: true
authors:
  - Michael Staton
augmented_with:
  - Claude Code on Claude Opus 5.5
tags:
  - Getting-Started
  - Linux
  - Ubuntu
  - Tauri
  - Onboarding
---

flave is a desktop app with two halves. The **editor** is a web app (Svelte, Vite, CodeMirror) and the **shell** around it is [Tauri v2](https://v2.tauri.app), a small Rust program that opens a native window and draws the editor in the system's WebView. So you need a JavaScript toolchain, a Rust toolchain, and the Linux libraries that provide that WebView.

That's the whole list. Nothing else is required: no Docker, no database, no API keys, no `.env` file.

> [!tip] Have Nix? There is a shorter way
> If Nix is installed, or you're willing to install it, the [Nix guide](../with-nix/) replaces every install step below with one command. It also leaves your system's packages alone. Use this guide if you'd rather install things the normal Ubuntu way.

## What you're installing

Each version below is a **floor**, not a pin. Every command in this guide installs the newest release, which is what we want.

| Tool | Needs | Why |
|---|---|---|
| Ubuntu | 22.04 or newer | Older releases don't ship `webkit2gtk-4.1`, which Tauri v2 needs |
| WebKitGTK + GTK libs | via apt | The WebView the desktop window draws the editor in |
| Rust (`rustc`, `cargo`) | >= 1.77, stable | Compiles the Tauri shell in `src-tauri/` |
| Node.js | >= 22.12, even-numbered | Runs Vite, Vitest, and the Tauri CLI |
| pnpm | >= 10.26 | The package manager. `pnpm-workspace.yaml` uses `allowBuilds`, added in 10.26 |
| git | any recent version | Cloning, branching |

> [!note] No bun, no npm, no yarn
> The repo is a **pnpm** workspace (`pnpm-workspace.yaml`, `pnpm-lock.yaml`). Installing with another package manager produces a different dependency tree from the one that is known to work. Use pnpm for everything in this repo.

> [!note] Node: newest LTS, not newest Current
> Node's odd-numbered releases (23, 25, …) are short-lived "Current" lines. The splash site is built with Astro, which supports **even-numbered** Node only. Installing the newest LTS keeps everything working while staying as current as Astro allows.

## 1. Check your Ubuntu version

```bash
lsb_release -ds
```

You want `Ubuntu 22.04` or higher. On 20.04 or older, stop here: the WebView library Tauri needs isn't packaged for it. Upgrade the OS or use the Nix route.

Debian 12+, Pop!\_OS 22.04+, Linux Mint 21+, and other Debian-family distros use the same commands below.

## 2. Install the system libraries

These are Tauri's own published Linux prerequisites, plus `git` and `pkg-config`, so nothing comes as a surprise later:

```bash title="Ubuntu / Debian"
sudo apt update
sudo apt install -y \
  build-essential \
  curl \
  wget \
  file \
  git \
  pkg-config \
  libwebkit2gtk-4.1-dev \
  libssl-dev \
  libxdo-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

What the less obvious ones do:

- **`libwebkit2gtk-4.1-dev`** pulls in GTK 3 and libsoup 3 too. This is the WebView, and the big one.
- **`libssl-dev`**: TLS, for the Rust side.
- **`librsvg2-dev`**: renders the app icons at build time.
- **`libxdo-dev`, `libayatana-appindicator3-dev`**: Tauri's keyboard and tray integrations. flave doesn't use a tray yet, but Tauri's build expects them on Linux.

**Prove it worked:**

```bash
pkg-config --modversion webkit2gtk-4.1 gtk+-3.0 libsoup-3.0
```

You should see three version numbers. If any line says `not found`, the apt step didn't finish. Re-run it and read the error.

## 3. Install Rust

Use **rustup**, the official installer, not Ubuntu's `rustc` package. apt's Rust lags well behind, and rustup keeps you on the latest stable release.

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Accept the default install (press <kbd>Enter</kbd>). Then load it into your current shell; new terminals pick it up automatically:

```bash
source "$HOME/.cargo/env"
```

**Prove it worked:**

```bash
rustc --version && cargo --version
```

Any version 1.77 or newer is fine.

## 4. Install Node.js (newest LTS)

Ubuntu's own `nodejs` package is too old. NodeSource publishes an apt repository that tracks the newest LTS line and upgrades with `apt upgrade` like everything else:

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
```

**Prove it worked:**

```bash
node --version
```

You need **v22.12 or higher**, on an even-numbered major version.

> [!tip] Already use a Node version manager?
> fnm, nvm, mise, and Volta all work. Install the newest LTS with whichever you already have and skip the NodeSource step. Don't install a second manager just for this.

## 5. Install pnpm

pnpm's standalone installer needs no `sudo`, installs the newest release, and can update itself later:

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

It adds pnpm to your `~/.bashrc` (or your shell's equivalent). Open a **new terminal**, or `source ~/.bashrc`, so the change takes effect.

**Prove it worked:**

```bash
pnpm --version
```

You need **10.26 or higher**.

## 6. Clone the repo

```bash
git clone https://github.com/lossless-group/flave.git
cd flave
git switch development
```

Work happens on **`development`**. `main` and `master` are promotion tiers, so branch from `development` and open PRs back into it.

> [!warning] If git asks for a username and password
> The repo may not be public yet. Ask to be added as a collaborator on `lossless-group/flave`, then authenticate with the GitHub CLI (`sudo apt install gh && gh auth login`) or an SSH key. GitHub stopped accepting account passwords over HTTPS.

## 7. Install dependencies

From the repo root:

```bash
pnpm install
```

This installs the whole workspace in one pass: the root tooling, `apps/editor`, and `packages/render`. It takes under a minute on a decent connection.

> [!note] Where `@lossless-group/lfm` comes from
> flave's markdown parser is [Lossless Flavored Markdown](https://jsr.io/@lossless-group/lfm), published on **JSR** rather than npm. The repo's `.npmrc` points the `@jsr` scope at JSR's npm mirror, so this works without any setup or tokens. If you ever see a 404 for a `@jsr/…` package, you're running pnpm from somewhere other than the repo root.

## 8. Checkpoint: run the checks

Before involving Rust at all, prove the JavaScript half is healthy:

```bash
pnpm test     # the renderer's unit tests — expect them all to pass
pnpm prove    # style + frontmatter gates, then a real build of the editor
```

`pnpm prove` ends with **`floor is green`** and an honest list of what it *doesn't* cover. That's expected.

**Optional:** see the editor in a plain browser, still with no Rust:

```bash
pnpm --filter @flave/editor dev
```

Open <http://localhost:5273>. Type markdown on the left and watch it render on the right. In this mode files live **in memory only**, and the status bar says so. Nothing you type here is saved. Stop it with <kbd>Ctrl</kbd>+<kbd>C</kbd>.

## 9. Run the desktop app

```bash
pnpm app:dev
```

This starts the editor's dev server, compiles the Rust shell, and opens a native window titled **flave**.

> [!note] The first run is slow, later runs aren't
> The first `pnpm app:dev` compiles Tauri and its dependencies from source: a few hundred Rust crates, typically **1–5 minutes** depending on your CPU. After that, Cargo caches everything in `src-tauri/target/` and later starts take seconds.

When the window opens you should see the document in the middle and a **Files** rail listing the repo's `workspace/` folder. Open `themes/lossless.css`, change a colour value, and the document restyles as you type. Edits are saved to disk, so that file really changed. Run `git diff` to see it, and `git checkout workspace/` to put it back.

Changes to the Svelte code hot-reload in the open window. Changes to the Rust in `src-tauri/` rebuild and relaunch automatically.

## When something goes wrong

> [!danger] `pkg-config` … `webkit2gtk-4.1` was not found
> The system libraries from step 2 are missing, or you're on Ubuntu 20.04 or older. Re-run step 2 and check the `pkg-config` proof line.

> [!warning] The window opens but is blank, white, or flickers
> A known WebKitGTK problem with some GPU drivers (NVIDIA especially) and some Wayland setups. Turn off WebKit's DMA-BUF renderer:
>
> ```bash
> WEBKIT_DISABLE_DMABUF_RENDERER=1 pnpm app:dev
> ```
>
> If that fixes it, add `export WEBKIT_DISABLE_DMABUF_RENDERER=1` to your `~/.bashrc`.

> [!warning] `workspace/ not found`
> The app finds its workspace relative to where it was launched. Run `pnpm app:dev` from the **repo root**, not from inside `src-tauri/` or `apps/editor/`. (A real folder picker is on the roadmap.)

> [!warning] Port 5273 is already in use
> A previous dev server is still running. Find it with `lsof -i :5273` and stop it, or close the terminal it's running in.

> [!warning] `Ignored build scripts: esbuild` or Vite fails to start
> Usually pnpm is older than 10.26 and doesn't understand the repo's `allowBuilds` setting. Check `pnpm --version`, run `pnpm self-update`, then `pnpm install` again.

## Keeping current

Everything above installs the newest release at the time you run it. To move forward later:

```bash
sudo apt update && sudo apt upgrade   # system libs + Node (via NodeSource)
rustup update                         # Rust
pnpm self-update                      # pnpm
```

## Where to go next

- **[README](https://github.com/lossless-group/flave#readme)**: what flave is, in five minutes.
- **The master spec** in [Context](../../../context-v/): the whole design, including the parts deliberately parked for later.
- **The phase plans**, also in Context: what's being built now, and in what order.
- **Bring an agent.** The repo is built to be co-authored. Run Claude Code (or your agent of choice) in a terminal beside the app. It can read `context-v/` for the reasoning behind every decision.
