import { type ComponentProps } from "react";
import {
  type InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer.js";
import { ContentEditable } from "@lexical/react/LexicalContentEditable.js";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary.js";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin.js";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin.js";

import { TextArea } from "@fxtrot/ui";

import { theme } from "../theme.ts";

type TextAreaProps = ComponentProps<typeof TextArea>;

interface Props {
  placeholder?: TextAreaProps["placeholder"];
  size?: TextAreaProps["size"];
  label?: TextAreaProps["label"];
  hint?: TextAreaProps["hint"];
  name?: TextAreaProps["name"];
  autoFocus?: TextAreaProps["autoFocus"];
  initialEditorState?: string;
}

export const MinimalEditor = ({
  label,
  hint,
  size,
  placeholder,
  name,
  initialEditorState,
}: Props) => {
  // Catch any errors that occur during Lexical updates and log them
  // or throw them as needed. If you don't throw them, Lexical will
  // try to recover gracefully without losing user data.
  function onError(error: Error) {
    console.error(error);
  }
  const initialConfig: InitialConfigType = {
    namespace: "FxtrotMinimalEditor",
    onError,
    editorState: initialEditorState
      ? JSON.stringify({
          root: {
            children: [
              {
                children: JSON.parse(initialEditorState),
                direction: null,
                format: "",
                indent: 0,
                type: "paragraph",
                version: 1,
              },
            ],
            direction: null,
            format: "",
            indent: 0,
            type: "root",
            version: 1,
          },
        })
      : undefined,
    theme,
  };

  return (
    <>
      <div className="relative">
        <LexicalComposer initialConfig={initialConfig}>
          <RichTextPlugin
            placeholder={null}
            contentEditable={
              <TextArea
                size={size}
                name={name}
                placeholder={placeholder}
                label={label}
                hint={hint}
                as={ContentEditable}
              />
            }
            ErrorBoundary={
              LexicalErrorBoundary as unknown as typeof LexicalErrorBoundary.default
            }
          />
          <HistoryPlugin />
        </LexicalComposer>
      </div>
    </>
  );
};
