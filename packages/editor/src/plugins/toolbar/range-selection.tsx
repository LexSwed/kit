import { type MouseEvent, useCallback, useEffect, useState } from "react";
import {
  BsCodeSlash,
  BsTypeBold,
  BsTypeItalic,
  BsTypeUnderline,
} from "react-icons/bs";
import { RxLink2 } from "react-icons/rx";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext.js";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  type TextFormatType,
} from "lexical";

import { t } from "@fxtrot/lib";
import {
  Button,
  Icon,
  Menu,
  ToggleButton,
  useKeyboardHandles,
  useMenuRef,
} from "@fxtrot/ui";

import { useActorRef, useSelector } from "./state.ts";
import { ToggleGroup } from "./toggle-group.tsx";
import {
  $getSelectedBlockType,
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

export const RangeSelectionLink = () => {
  const [editor] = useLexicalComposerContext();
  const reference = useSelector((state) => state.context.selection);

  const isLinkEditOpen = useSelector((state) =>
    state.matches({
      toolbar: { shown: { range: "link-edit" } },
    }),
  );
  const actor = useActorRef();
  const [isLink, isDisabled] = useIsLinkNodeSelected();

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

const Divider = () => {
  return <hr className="bg-outline/10 my-1 block h-auto w-0.5 border-none" />;
};

const blockTypeToBlockName = {
  bullet: "Bulleted List",
  check: "Check List",
  code: "Code Block",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  h4: "Heading 4",
  h5: "Heading 5",
  h6: "Heading 6",
  number: "Numbered List",
  paragraph: "Normal",
  quote: "Quote",
};

export const BlockTypeSelector = () => {
  const [editor] = useLexicalComposerContext();
  const [blockType, setBlockType] =
    useState<keyof typeof blockTypeToBlockName>("paragraph");
  const actor = useActorRef();
  const menuRef = useMenuRef();

  useEffect(() => {
    function getSelectedBlockType() {
      const type = $getSelectedBlockType();
      if (type in blockTypeToBlockName) {
        setBlockType(type as keyof typeof blockTypeToBlockName);
      }
    }
    editor.getEditorState().read(getSelectedBlockType);
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        getSelectedBlockType();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor]);

  const onKeyDown = useKeyboardHandles({
    Escape: (e) => {
      // to not close the toolbar itself
      e.stopPropagation();
      menuRef.current?.close();
    },
  });

  return (
    <>
      <Menu modal={false} ref={menuRef}>
        <Button
          size="sm"
          onClick={() => {
            actor.send({ type: "menu item open" });
          }}
        >
          {t(blockTypeToBlockName[blockType])}
          <Icon as={ChevronUpDownIcon} size="md" />
        </Button>
        <Menu.List onKeyDown={onKeyDown}>
          {Object.keys(blockTypeToBlockName).map((key) => (
            <Menu.Item key={key}>{key}</Menu.Item>
          ))}
        </Menu.List>
      </Menu>
      <Divider />
    </>
  );
};
