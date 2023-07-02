import { type MouseEvent, useCallback, useState } from "react";
import {
  BsCodeSlash,
  BsTypeBold,
  BsTypeItalic,
  BsTypeUnderline,
} from "react-icons/bs";
import { RxLink2 } from "react-icons/rx";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext.js";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  type TextFormatType,
} from "lexical";

import { t } from "@fxtrot/lib";
import { Icon, ToggleButton } from "@fxtrot/ui";

import { Divider } from "../../lib/divider.tsx";

import type { blocks } from "./block-type.tsx";
import { useActorRef, useSelector } from "./state.ts";
import { ToggleGroup } from "./toggle-group.tsx";
import {
  selectWholeLink,
  useEditorStateChange,
  useIsLinkNodeSelected,
} from "./utils.ts";

export const TextFormat = () => {
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
   * EditorStateChange to sync not just selection change
   * but also selection's FORMAT_TEXT_COMMAND with the local state.
   */
  useEditorStateChange(updateFormat);

  const handleToggle = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      editor.dispatchCommand(
        FORMAT_TEXT_COMMAND,
        e.currentTarget.value as TextFormatType,
      );
    },
    [editor],
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

export const RangeSelectionLink = ({
  selectionBlockType,
}: {
  selectionBlockType: keyof typeof blocks;
}) => {
  const [editor] = useLexicalComposerContext();
  const reference = useSelector((state) => state.context.selection);

  const isLinkEditOpen = useSelector((state) =>
    state.matches({
      toolbar: { shown: { range: "link-edit" } },
    }),
  );
  const actor = useActorRef();
  const [isLink, isDisabled] = useIsLinkNodeSelected();

  if (selectionBlockType === "collapsible-container") {
    return null;
  }

  const toggle = async () => {
    if (isLink && reference instanceof Range) {
      await selectWholeLink(editor, reference);
    }
    actor.send({ type: "toggle edit link" });
  };

  return (
    <>
      <Divider />
      <ToggleGroup disabled={isDisabled}>
        <ToggleButton
          pressed={isLink || isLinkEditOpen}
          onClick={toggle}
          size="sm"
        >
          <Icon size="sm" as={RxLink2} />
          {t("Link")}
        </ToggleButton>
      </ToggleGroup>
    </>
  );
};
