import { useState } from "react";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { CodeNode } from "@lexical/code";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { QuoteNode } from "@lexical/rich-text";

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
import { Divider } from "../../lib/divider";
import { CollapsibleContainerNode } from "../collapsible";

import { useActorRef } from "./state";

export const blocks = {
  paragraph: Paragraph,
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  h4: Heading4,
  h5: Heading5,
  h6: Heading6,
  // TODO: bind to ListNode types
  number: NumberedList,
  buller: BulletedList,
  check: CheckList,
  [QuoteNode.getType() as "quote"]: Quote,
  [CodeNode.getType() as "code"]: Code,
  [CollapsibleContainerNode.getType()]: Collapsible,
};

interface Props {
  selectionBlockType: keyof typeof blocks;
}

export const BlockTypeSelector = ({ selectionBlockType }: Props) => {
  const [editor] = useLexicalComposerContext();
  const actor = useActorRef();
  const menuRef = useMenuRef();

  const onKeyDown = useKeyboardHandles({
    Escape: (e) => {
      // to not close the toolbar itself
      e.stopPropagation();
      menuRef.current?.close();
    },
  });

  if (selectionBlockType === "collapsible-container") {
    return null;
  }

  return (
    <>
      <Menu modal={false} ref={menuRef}>
        <Button
          size="sm"
          onClick={() => {
            actor.send({ type: "menu item open" });
          }}
        >
          {blocks[selectionBlockType].title}
          <Icon as={ChevronUpDownIcon} size="md" />
        </Button>
        <Menu.List onKeyDown={onKeyDown}>
          {Object.entries(blocks).map(([key, { title, onSelect, icon }]) => (
            <Menu.Item
              aria-selected={key === selectionBlockType}
              onSelect={() => onSelect(editor)}
              size="sm"
              key={key}
            >
              <Icon as={icon} />
              {title}
            </Menu.Item>
          ))}
        </Menu.List>
      </Menu>
      <Divider />
    </>
  );
};
