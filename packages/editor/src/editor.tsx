import { useCallback, useEffect, useRef } from 'react';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { TRANSFORMERS } from '@lexical/markdown';
import {
  type InitialConfigType,
  type InitialEditorStateType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer.js';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext.js';
import { ContentEditable } from '@lexical/react/LexicalContentEditable.js';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary.js';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin.js';
import { ListPlugin } from '@lexical/react/LexicalListPlugin.js';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin.js';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin.js';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin.js';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin.js';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import type { EditorState } from 'lexical';

import { t } from '@fxtrot/lib';

import CodeHighlightPlugin from './plugins/code/index.ts';
import { CollapsiblePlugin } from './plugins/collapsible/collapsible.tsx';
import { CollapsibleContainerNode, CollapsibleContentNode, CollapsibleTitleNode } from './plugins/collapsible/index.ts';
import { ImageNode, ImagesPlugin } from './plugins/image/index.ts';
import { LinkPlugin } from './plugins/link/index.tsx';
import { FloatingToolbarPlugin } from './plugins/toolbar/index.ts';
import { theme } from './theme.ts';

import css from './editor.module.css';

interface Props {
  initialEditorState: InitialEditorStateType;
}

export const Editor = ({ initialEditorState }: Props) => {
  // Catch any errors that occur during Lexical updates and log them
  // or throw them as needed. If you don't throw them, Lexical will
  // try to recover gracefully without losing user data.
  function onError(error: Error) {
    console.error(error);
  }
  const initialConfig: InitialConfigType = {
    namespace: 'FxtrotEditor',
    onError,
    editorState: initialEditorState,
    theme,
    nodes: [
      ImageNode,
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      LinkNode,
      AutoLinkNode,
      CollapsibleContainerNode,
      CollapsibleContentNode,
      CollapsibleTitleNode,
    ],
  };

  return (
    <>
      <div className="relative">
        <LexicalComposer initialConfig={initialConfig}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={`relative min-h-[70vh] rounded-sm font-sans text-on-background shadow-2xl outline-none p-6 ${css.editor}`}
              />
            }
            placeholder={
              <div className="pointer-events-none absolute start-0 top-0 text-on-surface-variant p-6">
                {t('Enter some text...')}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary as unknown as typeof LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <ListPlugin />
          <LinkPlugin />
          <ImagesPlugin />
          <CodeHighlightPlugin />
          <TabIndentationPlugin />
          <SaveToLocalStoragePlugin />
          <FloatingToolbarPlugin />
          <CollapsiblePlugin />
        </LexicalComposer>
      </div>
    </>
  );
};

const LOCAL_STORAGE_KEY = 'fxtrot-editor-state';
const SaveToLocalStoragePlugin = () => {
  const [editor] = useLexicalComposerContext();

  const firstRenderRef = useRef(true);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      const serializedEditorState = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (serializedEditorState) {
        const initialEditorState = editor.parseEditorState(serializedEditorState);
        editor.setEditorState(initialEditorState);
      }
    }
  }, [editor]);

  const onChange = useCallback((editorState: EditorState) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(editorState.toJSON()));
  }, []);
  return <OnChangePlugin onChange={onChange} />;
};
