import { useEffect, useState } from "react";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { COMMAND_PRIORITY_CRITICAL, SELECTION_CHANGE_COMMAND } from "lexical";

import { t } from "@fxtrot/lib";
import { Button, Icon, Menu, useKeyboardHandles, useMenuRef } from "@fxtrot/ui";

import {
  BulletedList,
  CheckList,
  Code,
  Collapsible,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  NumberedList,
  Paragraph,
  Quote,
} from "../../lib/blocks";

import { useActorRef } from "./state";
import { $getSelectedBlockType } from "./utils";

const blocks = [
  Paragraph,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  NumberedList,
  BulletedList,
  CheckList,
  Quote,
  Code,
  Collapsible,
];
type BlockTitle = (typeof blocks)[number]["title"];

export const BlockTypeSelector = () => {
  const [editor] = useLexicalComposerContext();
  const [blockType, setBlockType] = useState<BlockTitle>(t("Text"));
  const actor = useActorRef();
  const menuRef = useMenuRef();

  useEffect(() => {
    function getSelectedBlockType() {
      const type = $getSelectedBlockType();
      if (type in blocks) {
        setBlockType(type);
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
    <Menu modal={false} ref={menuRef}>
      <Button
        size="sm"
        onClick={() => {
          actor.send({ type: "menu item open" });
        }}
      >
        {blockType}
        <Icon as={ChevronUpDownIcon} size="md" />
      </Button>
      <Menu.List onKeyDown={onKeyDown}>
        {blocks.map(({ title, onSelect, icon }) => (
          <Menu.Item onSelect={() => onSelect(editor)} size="sm" key={title}>
            <Icon as={icon} />
            {title}
          </Menu.Item>
        ))}
      </Menu.List>
    </Menu>
  );
};
