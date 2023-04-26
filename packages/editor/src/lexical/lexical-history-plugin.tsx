import { useLexicalComposerContext } from './lexical-composer-context';
import { useHistory } from './shared/use-history';
import type { HistoryState, HistoryStateEntry } from '@lexical/history';

type Props = Readonly<{ externalHistoryState?: HistoryState }>;

function HistoryPlugin(props: Props) {
  const [editor] = useLexicalComposerContext();
  useHistory(editor, () => props.externalHistoryState);
  return null;
}

export { createEmptyHistoryState } from '@lexical/history';
export { HistoryPlugin };
export type { HistoryStateEntry, HistoryState };
