import { type LexicalSubscription } from './use-lexical-subscription';
import { useLexicalSubscription } from './use-lexical-subscription';
import { type LexicalEditor } from 'lexical';
import { type Accessor } from 'solid-js';

function subscription(editor: LexicalEditor): LexicalSubscription<boolean> {
  return {
    initialValueFn: () => editor.isEditable(),
    subscribe: (callback) => {
      return editor.registerEditableListener(callback);
    },
  };
}

export function useLexicalEditable(): Accessor<boolean> {
  return useLexicalSubscription(subscription);
}
