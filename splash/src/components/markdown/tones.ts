/**
 * Callout tone resolution — a copy of packages/render/src/tones.ts, kept
 * byte-for-byte in behaviour so a callout reads the same in the editor and on
 * the splash. Copy-pattern, not a runtime dep: the splash installs on its own
 * and must not reach into the app's workspace.
 *
 * lfm's callout vocabulary is open (`> [!spaceship-status]` is valid), so known
 * types map onto four tones and everything else degrades to `neutral` while
 * keeping its raw type on the element.
 */
export type Tone = 'neutral' | 'info' | 'warning' | 'danger';

const TONES: Record<string, Tone> = {
  // info
  note: 'info', info: 'info', tip: 'info', hint: 'info', important: 'info',
  abstract: 'info', summary: 'info', tldr: 'info', example: 'info',
  question: 'info', help: 'info', faq: 'info', quote: 'info', cite: 'info',
  success: 'info', check: 'info', done: 'info', todo: 'info',
  // warning
  warning: 'warning', caution: 'warning', attention: 'warning',
  // danger
  danger: 'danger', error: 'danger', bug: 'danger',
  failure: 'danger', fail: 'danger', missing: 'danger',
};

export function toneFor(type: string | undefined): Tone {
  if (!type) return 'neutral';
  return TONES[type.trim().toLowerCase()] ?? 'neutral';
}
