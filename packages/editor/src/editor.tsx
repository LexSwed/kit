import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { CodeHighlightNode, CodeNode } from '@lexical/code';

import {
  HistoryPlugin,
  ListPlugin,
  type InitialConfigType,
  type InitialEditorStateType,
  LinkPlugin,
  TabIndentationPlugin,
  LexicalComposer,
  RichTextPlugin,
  ContentEditable,
  LexicalErrorBoundary,
  LexicalMarkdownShortcutPlugin,
  HorizontalRuleNode,
} from 'lexical-solid';
import { theme } from './theme';
import { t } from 'shared';
import { FloatingToolbarPlugin } from './lexical/floating-toolbar-plugin';

interface Props {
  initialEditorState?: InitialEditorStateType;
}

export const Editor = (props: Props) => {
  // Catch any errors that occur during Lexical updates and log them
  // or throw them as needed. If you don't throw them, Lexical will
  // try to recover gracefully without losing user data.
  function onError(error: Error) {
    console.error(error);
  }
  const initialConfig: InitialConfigType = {
    namespace: 'MyEditor',
    onError,
    editorState: props.initialEditorState,
    theme,
    nodes: [
      HeadingNode,
      HorizontalRuleNode,
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
    <div class="relative">
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable class="relative min-h-[70vh] rounded-sm p-6 font-sans text-on-background shadow-2xl outline-none" />
          }
          placeholder={
            <div class="pointer-events-none absolute start-0 top-0 p-6 text-on-surface-variant">
              {t('Enter some text...')}
            </div>
          }
          errorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <LexicalMarkdownShortcutPlugin />
        <ListPlugin />
        <LinkPlugin />
        <TabIndentationPlugin />
        <FloatingToolbarPlugin />
      </LexicalComposer>
    </div>
  );
};
