import { useEffect, useState } from "react";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { COMMAND_PRIORITY_CRITICAL, SELECTION_CHANGE_COMMAND } from "lexical";

import { t } from "@fxtrot/lib";
import { Button, Icon, Menu, useKeyboardHandles, useMenuRef } from "@fxtrot/ui";

import { useActorRef } from "./state";
import { $getSelectedBlockType } from "./utils";

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
          <Menu.Item size="sm" key={key}>
            {key}
          </Menu.Item>
        ))}
      </Menu.List>
    </Menu>
  );
};
