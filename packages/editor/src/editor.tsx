import { lazy, useCallback, useEffect, useRef } from "react";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { TRANSFORMERS } from "@lexical/markdown";
import {
  type InitialConfigType,
  type InitialEditorStateType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import type { EditorState } from "lexical";

import CodeHighlightPlugin from "./plugins/code/index.ts";
import {
  CollapsibleContainerNode,
  CollapsibleContentNode,
  CollapsiblePlugin,
  CollapsibleTitleNode,
} from "./plugins/collapsible/index.ts";
import { ImageNode, ImagesPlugin } from "./plugins/image/index.ts";
import { LinkPlugin } from "./plugins/link/index.tsx";
import { RichTextPlugin } from "./plugins/rich-text-plugin/index.ts";
import { FloatingToolbarPlugin } from "./plugins/toolbar/index.ts";
import { theme } from "./theme.ts";

interface Props {
  initialEditorState: InitialEditorStateType;
}
const ComponentPickerMenuPlugin = lazy(
  () => import("./plugins/component-picker/index.ts")
);

export const Editor = ({ initialEditorState }: Props) => {
  // Catch any errors that occur during Lexical updates and log them
  // or throw them as needed. If you don't throw them, Lexical will
  // try to recover gracefully without losing user data.
  function onError(error: Error) {
    console.error(error);
  }
  const initialConfig: InitialConfigType = {
    namespace: "FxtrotEditor",
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
          <RichTextPlugin className="text-on-background relative min-h-[70vh] rounded-sm p-6 font-sans shadow-2xl outline-none " />
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
          <ComponentPickerMenuPlugin />
        </LexicalComposer>
      </div>
    </>
  );
};

const LOCAL_STORAGE_KEY = "fxtrot-editor-state";
const SaveToLocalStoragePlugin = () => {
  const [editor] = useLexicalComposerContext();

  const firstRenderRef = useRef(true);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      const serializedEditorState = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (serializedEditorState) {
        requestAnimationFrame(() => {
          const initialEditorState = editor.parseEditorState(
            serializedEditorState
          );
          editor.setEditorState(initialEditorState);
        });
      }
    }
  }, [editor]);

  const onChange = useCallback((editorState: EditorState) => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(editorState.toJSON())
    );
  }, []);
  return <OnChangePlugin onChange={onChange} />;
};
