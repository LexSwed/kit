'use client';
import { LexicalComposer, type InitialConfigType, type InitialEditorStateType } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { TRANSFORMERS } from '@lexical/markdown';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { ImageNode, ImagesPlugin } from './plugins/image';
import { LinkPlugin } from './plugins/link';
import CodeHighlightPlugin from './plugins/code';
import { theme } from './theme';
import { FloatingToolbarPlugin } from './plugins/toolbar';

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
    namespace: 'MyEditor',
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
            <ContentEditable className="outline-none min-h-[70vh] text-on-background font-sans shadow-2xl rounded-sm relative p-6" />
          }
          placeholder={
            <div className="p-6 absolute text-on-surface-variant top-0 start-0 pointer-events-none">
              Enter some text...
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