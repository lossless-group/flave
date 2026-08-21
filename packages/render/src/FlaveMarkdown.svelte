<!--
  FlaveMarkdown — the single recursive dispatcher.

  A port of `AstroMarkdown.astro`, not an invention (spec §12.1). Same dispatch
  table, Svelte syntax around it: the component imports itself in place of
  `Astro.self`, `$props()` replaces `Astro.props`, and `{#if}` branches replace
  the `{type === "…" && (…)}` idiom. An opaque `data` bag is threaded unchanged
  to every child.

  Two rules carried over verbatim, both named failure modes rather than taste:

  1. Heading ids come from lfm's `remarkHeadingIds` and are NEVER recomputed
     here. One place decides what a fragment URL says; a second implementation
     in the render layer is exactly how the fleet's anchors drifted apart.
  2. Every container recurses through this component. Never stringify children.

  The final branch is the whole extensibility story: an unrecognized directive
  looks up the trigger-pack registry. One branch, not a system.
-->
<script lang="ts">
  import Self from './FlaveMarkdown.svelte';
  import Callout from './components/Callout.svelte';
  import CodeBlock from './components/CodeBlock.svelte';
  import Table from './components/Table.svelte';
  import { srcAttrs } from './position';
  import type { Component } from 'svelte';

  let {
    node,
    packs = {},
    data = {},
  }: { node: any; packs?: Record<string, Component<any>>; data?: unknown } = $props();

  const type: string = $derived(node?.type);
  const kids: any[] = $derived(node?.children ?? []);

  // lfm stamps the id; we read it, we never compute it.
  const headingId: string | undefined = $derived(node?.data?.id ?? node?.data?.hProperties?.id);

  const isDirective = $derived(
    type === 'containerDirective' || type === 'leafDirective' || type === 'textDirective',
  );
  const isCallout = $derived(type === 'containerDirective' && node?.name === 'callout');
  const Pack: Component<any> | undefined = $derived(
    isDirective && !isCallout ? packs[node?.name as string] : undefined,
  );

</script>

{#if type === 'root'}
  {#each kids as child}<Self node={child} {packs} {data} />{/each}

{:else if type === 'text'}{node.value}

{:else if type === 'paragraph'}
  <p {...srcAttrs(node)}>{#each kids as child}<Self node={child} {packs} {data} />{/each}</p>

{:else if type === 'heading'}
  {#if node.depth === 1}
    <h1 id={headingId} {...srcAttrs(node)}>{#each kids as c}<Self node={c} {packs} {data} />{/each}</h1>
  {:else if node.depth === 2}
    <h2 id={headingId} {...srcAttrs(node)}>{#each kids as c}<Self node={c} {packs} {data} />{/each}</h2>
  {:else if node.depth === 3}
    <h3 id={headingId} {...srcAttrs(node)}>{#each kids as c}<Self node={c} {packs} {data} />{/each}</h3>
  {:else if node.depth === 4}
    <h4 id={headingId} {...srcAttrs(node)}>{#each kids as c}<Self node={c} {packs} {data} />{/each}</h4>
  {:else if node.depth === 5}
    <h5 id={headingId} {...srcAttrs(node)}>{#each kids as c}<Self node={c} {packs} {data} />{/each}</h5>
  {:else}
    <h6 id={headingId} {...srcAttrs(node)}>{#each kids as c}<Self node={c} {packs} {data} />{/each}</h6>
  {/if}

{:else if type === 'strong'}
  <strong>{#each kids as child}<Self node={child} {packs} {data} />{/each}</strong>

{:else if type === 'emphasis'}
  <em>{#each kids as child}<Self node={child} {packs} {data} />{/each}</em>

{:else if type === 'delete'}
  <del>{#each kids as child}<Self node={child} {packs} {data} />{/each}</del>

{:else if type === 'inlineCode'}<code>{node.value}</code>

{:else if type === 'code'}
  <CodeBlock {node} />

{:else if type === 'blockquote'}
  <blockquote {...srcAttrs(node)}>{#each kids as child}<Self node={child} {packs} {data} />{/each}</blockquote>

{:else if type === 'list'}
  {#if node.ordered}
    <ol {...srcAttrs(node)}>{#each kids as child}<Self node={child} {packs} {data} />{/each}</ol>
  {:else}
    <ul {...srcAttrs(node)}>{#each kids as child}<Self node={child} {packs} {data} />{/each}</ul>
  {/if}

{:else if type === 'listItem'}
  <li {...srcAttrs(node)}>{#each kids as child}<Self node={child} {packs} {data} />{/each}</li>

{:else if type === 'link'}
  <a href={node.url} title={node.title ?? undefined}>{#each kids as c}<Self node={c} {packs} {data} />{/each}</a>

{:else if type === 'image'}
  <img src={node.url} alt={node.alt ?? ''} title={node.title ?? undefined} />

{:else if type === 'thematicBreak'}
  <hr />

{:else if type === 'break'}
  <br />

{:else if type === 'table'}
  <Table {node} {packs} {data} />

{:else if type === 'html'}
  {@html node.value}

{:else if isCallout}
  <Callout {node} {packs} {data} />

{:else if isDirective}
  <!--
    The extensibility branch. A registered trigger-pack renders with the
    directive's attributes as props. An unregistered one still renders its
    children, so unknown syntax degrades to its content instead of vanishing.
  -->
  {#if Pack}
    <Pack {...(node.attributes ?? {})} {node} {packs} {data} />
  {:else}
    {#each kids as child}<Self node={child} {packs} {data} />{/each}
  {/if}

{:else if kids.length}
  {#each kids as child}<Self node={child} {packs} {data} />{/each}

{:else if node?.value != null}{node.value}{/if}
