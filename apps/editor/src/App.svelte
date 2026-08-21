<script lang="ts">
  import { parseMarkdown } from '@lossless-group/lfm';
  import { FlaveMarkdown } from '@flave/render';
  import { codemirror } from './codemirror';
  import MetricCard from './MetricCard.svelte';
  import { SAMPLE } from './SAMPLE';

  // The trigger-pack registry. Adding syntax is this line plus a component.
  const packs = { 'metric-card': MetricCard };

  let source = $state(SAMPLE);
  let tree = $state<any>(null);
  let showSource = $state(true);

  // Re-parse on every keystroke. lfm's parse is async, so a stale reply can
  // land after a newer one — the token guard keeps the newest render winning.
  let token = 0;
  $effect(() => {
    const src = source;
    const mine = ++token;
    parseMarkdown(src).then((t) => {
      if (mine === token) tree = t;
    });
  });
</script>

<div class="shell">
  <header class="menubar">
    <span class="brand">flave</span>
    <nav class="menus" aria-label="Main">
      <!-- Phase 1: every one of these becomes a named capability invocation. -->
      <button type="button" disabled>File</button>
      <button type="button" disabled>Edit</button>
      <button type="button" disabled>Insert</button>
      <button type="button" disabled>Format</button>
    </nav>
    <label class="toggle">
      <input type="checkbox" bind:checked={showSource} />
      Source
    </label>
  </header>

  <main class="panes" class:panes--two={!showSource}>
    <section class="pane pane--chat" aria-label="Agent chat">
      <p class="pane__label">Chat</p>
      <p class="placeholder">
        Phase 1. At v0 the agent is Claude Code in a terminal beside the editor —
        it writes trigger-packs into the project and this pane hot-reloads them.
      </p>
    </section>

    {#if showSource}
      <section class="pane pane--source" aria-label="Markdown source">
        <p class="pane__label">Source</p>
        <div
          class="cm-host"
          use:codemirror={{ doc: SAMPLE, onChange: (v) => (source = v) }}
        ></div>
      </section>
    {/if}

    <section class="pane pane--rendered" aria-label="Rendered document">
      <p class="pane__label">Document</p>
      <article class="rendered">
        {#if tree}
          <FlaveMarkdown node={tree} {packs} />
        {/if}
      </article>
    </section>
  </main>
</div>
