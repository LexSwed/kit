import { type LexicalEditor } from 'lexical';
import { onCleanup } from 'solid-js';
import { registerDragonSupport } from '@lexical/dragon';
import plainText from '@lexical/plain-text';
import { mergeRegister } from '@lexical/utils';
import { isServer } from 'solid-js/web';

export function usePlainTextSetup(editor: LexicalEditor) {
  if (!isServer) {
    onCleanup(
      mergeRegister(plainText.registerPlainText(editor), registerDragonSupport(editor)) // We only do this for init
    );
  }
}
