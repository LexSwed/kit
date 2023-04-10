'use client';
import { $getRoot, $getSelection, EditorState } from 'lexical';

import { LexicalComposer, type InitialConfigType, type InitialEditorStateType } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { ImageNode, ImagesPlugin } from './plugins/image';

// When the editor changes, you can get notified via the
// LexicalOnChangePlugin!
function onChange(editorState: EditorState) {
  editorState.read(() => {
    // Read the contents of the EditorState here.
    const root = $getRoot();
    const selection = $getSelection();

    console.log(root, selection);
  });
}

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: Error) {
  console.error(error);
}

interface Props {
  initialEditorState: InitialEditorStateType;
}

export const Editor = ({ initialEditorState }: Props) => {
  const initialConfig: InitialConfigType = {
    namespace: 'MyEditor',
    onError,
    editorState: initialEditorState,
    nodes: [ImageNode],
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={
          <ContentEditable className="outline-none text-on-background font-sans focus-within:ring-2 rounded-[inherit] ring-outline p-2" />
        }
        placeholder={
          <div className="p-2 absolute text-on-surface-variant top-0 start-0 pointer-events-none">
            Enter some text...
          </div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <OnChangePlugin onChange={onChange} />
      <HistoryPlugin />
      <ImagesPlugin />
    </LexicalComposer>
  );
};
