'use client';
import { LexicalComposer, type InitialConfigType, type InitialEditorStateType } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { TRANSFORMERS } from '@lexical/markdown';
import { ImageNode, ImagesPlugin } from './plugins/image';
import { LinkPlugin } from './plugins/link';
import CodeHighlightPlugin from './plugins/code';
import { theme } from './theme';
import { FloatingToolbarPlugin } from './plugins/toolbar';
import { t } from 'shared';

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
    ],
  };

  return (
    <div className="relative">
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="relative min-h-[70vh] rounded-sm p-6 font-sans text-on-background shadow-2xl outline-none" />
          }
          placeholder={
            <div className="pointer-events-none absolute start-0 top-0 p-6 text-on-surface-variant">
              {t('Enter some text...')}
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <ListPlugin />
        <LinkPlugin />
        <ImagesPlugin />
        <CodeHighlightPlugin />
        <TabIndentationPlugin />
        <FloatingToolbarPlugin />
      </LexicalComposer>
    </div>
  );
};
