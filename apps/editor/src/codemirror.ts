import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';

/**
 * Svelte action that mounts CodeMirror 6 into a node and reports every change.
 *
 * CodeMirror owns the buffer; Svelte owns the render. The two are joined by
 * `onChange` and nothing else — the rendered pane never writes back here in
 * Phase 0. Compose-pane editing (Phase 1) will land as `block.edit()` calls
 * against the source ranges the renderer stamps, not as a second buffer.
 */
export function codemirror(
  node: HTMLElement,
  { doc, onChange }: { doc: string; onChange: (value: string) => void },
) {
  const view = new EditorView({
    parent: node,
    state: EditorState.create({
      doc,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        markdown(),
        EditorView.lineWrapping,
        EditorView.updateListener.of((u) => {
          if (u.docChanged) onChange(u.state.doc.toString());
        }),
      ],
    }),
  });

  return { destroy: () => view.destroy() };
}
