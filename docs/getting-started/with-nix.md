---
site_uuid: 7ba336d2-d428-4d11-bdd0-74046c412b29
title: "Getting started with Nix (and direnv)"
lede: "One flake supplies Rust, Node, pnpm, and every Linux library the desktop shell links against, scoped to this repo. With direnv on top, all of it switches on when you cd into flave and off when you leave."
os: nix
order: 2
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
  - Nix
  - Direnv
  - NixOS
  - Linux
  - Onboarding
---

The repo ships a `flake.nix` that declares a **devshell**: a shell with the exact toolchain flave needs, and nothing installed system-wide. This is how flave was built in the first place, on NixOS. It is the fastest way from zero to a running app, and it can't break anything outside the repo.

The [Ubuntu guide](../linux-ubuntu/) installs the same things by hand. This page replaces its steps 2–5.

## What the devshell gives you

| From the flake | What it's for |
|---|---|
| `rustc`, `cargo` | Compiles the Tauri shell in `src-tauri/` |
| `nodejs` | nixpkgs' newest LTS. Runs Vite, Vitest, the Tauri CLI |
| `pnpm` | nixpkgs' newest release. The package manager |
| `pkg-config` | How the Rust build finds the libraries below |
| `webkitgtk_4_1`, `gtk3`, `libsoup_3` | The WebView the desktop window draws the editor in |
| `glib-networking` | TLS inside the WebView. Without it, `fetch()` fails silently |
| `openssl`, `librsvg` | TLS for the Rust side; icon rasterisation at build time |

The packages are **unversioned on purpose**: `nodejs`, not `nodejs_22`. You get whatever is newest in the nixpkgs snapshot the repo is locked to, and the floors flave actually needs (Node >= 22.12, pnpm >= 10.26, Rust >= 1.77) are comfortably met.

> [!note] Same versions for everyone, until someone moves them
> `flake.lock` pins the exact nixpkgs commit, so everyone who enters the devshell gets byte-identical tools. That's why it "works on my machine" *and* yours. To move everything forward to the newest nixpkgs, run `nix flake update`, check the app still builds, and commit the new `flake.lock`.

## 1. Install Nix

Skip this on NixOS, or if `nix --version` already works.

```bash title="Official multi-user install"
sh <(curl --proto '=https' --tlsv1.2 -L https://nixos.org/nix/install) --daemon
```

Open a new terminal afterwards.

## 2. Turn on flakes

Flakes are still flagged "experimental" in upstream Nix, so they're off by default. Turn them on once, for your user:

```bash
mkdir -p ~/.config/nix
echo 'experimental-features = nix-command flakes' >> ~/.config/nix/nix.conf
```

**Prove it worked:**

```bash
nix flake --help >/dev/null && echo "flakes on"
```

## 3. Clone the repo

```bash
git clone https://github.com/lossless-group/flave.git
cd flave
git switch development
```

> [!warning] Nix only sees files git knows about
> A flake evaluates the repo's **git-tracked** files. If you add a file the flake depends on, `git add` it (no need to commit) or Nix will act as if it doesn't exist.

## 4. Enter the devshell

```bash
nix develop
```

The first run downloads the toolchain and libraries from the Nix binary cache: a few hundred megabytes, a few minutes, once. Later runs are instant. When it's ready it prints a health check:

```text
flave devshell — cargo 1.xx.x, v2x.x.x, pnpm 1x.x.x
  webkit2gtk-4.1     2.x.x
  gtk+-3.0           3.24.x
  libsoup-3.0        3.x.x
```

Any line that says `MISSING` means the library isn't on `PKG_CONFIG_PATH`. That shouldn't happen inside `nix develop`. If it does, see [the trap below](#the-trap-nix-shell-is-not-nix-develop).

## 5. Install and run

Inside the devshell, the commands are exactly the same as everywhere else:

```bash
pnpm install    # the whole workspace, one pass
pnpm test       # unit tests — all should pass
pnpm prove      # style + frontmatter gates, then a real editor build
pnpm app:dev    # compile the Rust shell and open the desktop window
```

The first `pnpm app:dev` compiles a few hundred Rust crates, which takes 1–5 minutes. Later runs start in seconds. When the window opens, the Files rail lists `workspace/`. Open `themes/lossless.css`, change a value, and watch the document restyle.

Leave the devshell with `exit`, or <kbd>Ctrl</kbd>+<kbd>D</kbd>.

## 6. Make it automatic with direnv

Typing `nix develop` every time gets old. [direnv](https://direnv.net) watches your current directory and loads the devshell the moment you `cd` into the repo, then unloads it when you leave. The repo already has the `.envrc` it needs:

```bash title=".envrc"
use flake
```

**Install direnv and nix-direnv.** nix-direnv caches the devshell, so re-entering is instant instead of a re-evaluation. It also protects the shell's packages from Nix garbage collection.

```bash
nix profile install nixpkgs#direnv nixpkgs#nix-direnv
```

**Hook direnv into your shell.** Add one line to the end of your shell's rc file:

```bash title="~/.bashrc"
eval "$(direnv hook bash)"
```

(For zsh: `eval "$(direnv hook zsh)"` in `~/.zshrc`. For fish: `direnv hook fish | source` in `~/.config/fish/config.fish`.)

**Tell direnv to use nix-direnv:**

```bash
mkdir -p ~/.config/direnv
echo 'source $HOME/.nix-profile/share/nix-direnv/direnvrc' >> ~/.config/direnv/direnvrc
```

**Allow the repo's `.envrc`, once.** direnv refuses to run an `.envrc` until you've approved it. That's a safety feature, since an `.envrc` can run arbitrary code. Open a new terminal, then:

```bash
cd flave
direnv allow
```

You'll see the devshell's health check print. From now on, `cd flave` puts Rust, Node, pnpm, and the WebKit libraries on your path, and `cd ..` takes them away. If `.envrc` or `flake.nix` changes (after a `git pull`, say), direnv reloads automatically. If either file changes in a way that needs re-approval, it will ask you to run `direnv allow` again.

> [!tip] Editors pick it up too
> VS Code ([direnv extension](https://marketplace.visualstudio.com/items?itemName=mkhl.direnv)), Neovim (`direnv.vim`), Zed, and Helix can all load the direnv environment. rust-analyzer and the TypeScript server then see the same toolchain your terminal does.

## Nix on Ubuntu (not NixOS)

The devshell was proven on **NixOS**. On Ubuntu with Nix installed it should work the same way, but it hasn't been tested there yet. If you're the first, tell us how it went.

One known rough edge: Nix-built graphical apps don't always find the host's GPU drivers on non-NixOS systems. If `pnpm app:dev` compiles fine but the window is blank, or the terminal mentions **EGL** or **MESA**, try these in order:

```bash
WEBKIT_DISABLE_DMABUF_RENDERER=1 pnpm app:dev
WEBKIT_DISABLE_DMABUF_RENDERER=1 LIBGL_ALWAYS_SOFTWARE=1 pnpm app:dev
```

The second is slower to render but sidesteps the GPU entirely. If neither works, use the [Ubuntu guide](../linux-ubuntu/) instead. It links against Ubuntu's own WebKitGTK, which knows where your drivers are.

## The trap: `nix shell` is not `nix develop`

It's tempting to skip the flake and run something like `nix shell nixpkgs#webkitgtk_4_1 nixpkgs#cargo`. **This won't work for flave.** `nix shell` puts *binaries* on your `PATH` and leaves the libraries' `.pc` files behind, so `pkg-config` reports every dependency missing and Tauri refuses to configure.

`nix develop` (and direnv's `use flake`) builds the shell from the flake's `mkShell`, which wires `PKG_CONFIG_PATH` correctly. That wiring is the whole reason the flake exists.
