import type { EditorState, LexicalEditor } from 'lexical';
import { createEffect, mergeProps, onCleanup } from 'solid-js';
import { useLexicalComposerContext } from './lexical-composer-context';

export function OnChangePlugin(props: {
  ignoreHistoryMergeTagChange?: boolean;
  onChange: (editorState: EditorState, tags: Set<string>, editor: LexicalEditor) => void;
  ignoreSelectionChange?: boolean;
}) {
  const mergedProps = mergeProps(
    {
      ignoreSelectionChange: false,
      ignoreHistoryMergeTagChange: true,
    },
    props
  );
  const [editor] = useLexicalComposerContext();
  createEffect(() => {
    if (mergedProps.onChange) {
      onCleanup(
        editor.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves, prevEditorState, tags }) => {
          if (
            (mergedProps.ignoreSelectionChange && dirtyElements.size === 0 && dirtyLeaves.size === 0) ||
            (mergedProps.ignoreHistoryMergeTagChange && tags.has('history-merge')) ||
            prevEditorState.isEmpty()
          ) {
            return;
          }

          mergedProps.onChange(editorState, tags, editor);
        })
      );
    }
  });
  return null;
}
