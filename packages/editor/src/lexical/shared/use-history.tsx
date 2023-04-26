import { type LexicalEditor } from 'lexical';
import { type HistoryState, createEmptyHistoryState, registerHistory } from '@lexical/history';
import { createEffect, type Accessor, onCleanup } from 'solid-js';

export function useHistory(
  editor: LexicalEditor,
  externalHistoryState: Accessor<HistoryState | undefined>,
  delay = 1000
) {
  const historyState = () => externalHistoryState() || createEmptyHistoryState();

  createEffect(() => {
    onCleanup(registerHistory(editor, historyState(), delay));
  });
}
