import { type ComponentProps } from "react";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin as LexicalRichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import clsx from "clsx";

import { t } from "@fxtrot/lib";

import css from "./rich-text-plugin.module.css";

export const RichTextPlugin = (props: ComponentProps<"div">) => {
  return (
    <LexicalRichTextPlugin
      contentEditable={
        <ContentEditable
          {...props}
          className={clsx(props.className, css.editor)}
        />
      }
      placeholder={
        <div className="text-on-surface-variant pointer-events-none absolute start-0 top-0 p-6">
          {t("Enter some text...")}
        </div>
      }
      ErrorBoundary={LexicalErrorBoundary}
    />
  );
};
