import type { ComponentProps } from "react";
import { LinkNode } from "@lexical/link";
import { NodeEventPlugin as LexicalNodeEventPlugin } from "@lexical/react/LexicalNodeEventPlugin.js";

import { EditorPopover } from "../../lib/editor-popover.tsx";

import { useActorRef, useSelector } from "./state.ts";

type NodeClickHandler = ComponentProps<
  typeof LexicalNodeEventPlugin
>["eventListener"];

export const LinkPreview = () => {
  const open = useSelector((state) =>
    state.matches({ toolbar: { shown: "link" } })
  );
  const link = useSelector((state) => state.context.link);
  const actor = useActorRef();

  const onClick: NodeClickHandler = (event, editor, nodeKey) => {
    const link = editor.getElementByKey(nodeKey);
    if (!link) return;
    actor.send({ type: "link clicked", link });
  };
  return (
    <>
      <LexicalNodeEventPlugin
        nodeType={LinkNode}
        eventType="click"
        eventListener={onClick}
      />
      <EditorPopover open={open} reference={link}>
        Hello world
      </EditorPopover>
    </>
  );
};
