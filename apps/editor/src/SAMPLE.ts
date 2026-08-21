export const SAMPLE = `## Metrics that matter

Flave is a document that **keeps its workings**. Type on the left, watch this
side render as you go — in *your* styles, not a generic preview theme.

> [!note] Note reads as info
> Slate. Used for note, tip, abstract, question, quote, example.

> [!warning] Warning reads as caution
>
> Amber — and a nested table, which is the load-bearing case:
>
> | Surface | Status  | Milestone |
> |:--------|:-------:|----------:|
> | flow    | building|        M1 |
> | deck    | parked  |        M7 |
> | paged   | parked  |        M8 |

> [!danger] Danger reads as hot
> Vermilion. Used for danger, error, bug, failure, missing.

> [!spaceship-status] Unknown types still work
> lfm accepts any \`[A-Za-z0-9_-]+\` as a callout type, so the vocabulary is
> open. This one has no tone mapping, so it degrades to neutral graphite and
> keeps its type — it never disappears.

\`\`\`js
const flave = 'a bundle of plain web-native files';
\`\`\`

:::metric-card{value="10,179" label="corpus chunks"}
:::

An unregistered directive still shows its content rather than vanishing:

:::not-registered
this prose survives
:::
`;
