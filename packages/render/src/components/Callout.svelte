<!--
  Callout.

  MUST recurse via the renderer for every child. Never `toString(node)`, never a
  plain-text fallback — that path silently disables nesting and is, per lfm's
  changelog, the most common reason a freshly-copied Callout looks "fine" until
  an author tries to embed something inside it. The nesting fixtures exist to
  keep this honest.
-->
<script lang="ts">
  import FlaveMarkdown from '../FlaveMarkdown.svelte';

  let { node, packs, data }: { node: any; packs: any; data: any } = $props();

  const cls: string = $derived(node?.data?.hProperties?.class ?? 'callout');
  const title: string | undefined = $derived(node?.attributes?.title);
</script>

<aside class={cls}>
  {#if title}
    <p class="callout__title">{title}</p>
  {/if}
  <div class="callout__body">
    {#each node.children ?? [] as child}
      <FlaveMarkdown node={child} {packs} {data} />
    {/each}
  </div>
</aside>
