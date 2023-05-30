import { type MouseEvent, useCallback, useState } from "react";
import {
  BsCodeSlash,
  BsTypeBold,
  BsTypeItalic,
  BsTypeUnderline,
} from "react-icons/bs/index.js";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext.js";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  type TextFormatType,
} from "lexical";

import { t } from "@fxtrot/lib";
import { ToggleButton } from "@fxtrot/ui";

import { ToggleGroup } from "./toggle-group.tsx";
import { useEditorStateChange } from "./utils.ts";

export const TextFormatFloatingToolbar = () => {
  const [editor] = useLexicalComposerContext();

  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isCode, setIsCode] = useState(false);

  const updateFormat = useCallback(() => {
    const selection = $getSelection();

    if (!$isRangeSelection(selection)) {
      return;
    }

    // Update text format
    setIsBold(selection.hasFormat("bold"));
    setIsItalic(selection.hasFormat("italic"));
    setIsUnderline(selection.hasFormat("underline"));
    setIsCode(selection.hasFormat("code"));
  }, []);

  /**
   * EditorStateChange to sync selection FORMAT_TEXT_COMMAND
   * with the local state.
   */
  useEditorStateChange(updateFormat);

  const handleToggle = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      editor.dispatchCommand(
        FORMAT_TEXT_COMMAND,
        e.currentTarget.value as TextFormatType
      );
    },
    [editor]
  );

  return (
    <ToggleGroup>
      <ToggleButton
        pressed={isBold}
        onClick={handleToggle}
        value="bold"
        label={t("Format text as bold")}
        size="sm"
        icon={BsTypeBold}
        className="disabled:bg-surface disabled:opacity-80"
      />
      <ToggleButton
        pressed={isItalic}
        value="italic"
        onClick={handleToggle}
        size="sm"
        label={t("Format text as italics")}
        icon={BsTypeItalic}
        className="disabled:bg-surface disabled:opacity-80"
      />
      <ToggleButton
        pressed={isUnderline}
        value="underline"
        onClick={handleToggle}
        size="sm"
        label={t("Format text to underlined")}
        icon={BsTypeUnderline}
        className="disabled:bg-surface disabled:opacity-80"
      />
      <ToggleButton
        pressed={isCode}
        value="code"
        onClick={handleToggle}
        size="sm"
        label={t("Insert code block")}
        icon={BsCodeSlash}
        className="disabled:bg-surface disabled:opacity-80"
      />
    </ToggleGroup>
  );
};
