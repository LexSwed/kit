import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext.js";
import { mergeRegister } from "@lexical/utils";
import { COMMAND_PRIORITY_HIGH, KEY_ESCAPE_COMMAND } from "lexical";

import { EditorPopover } from "../../lib/editor-popover.tsx";

import { SelectionLink } from "./selection-link.tsx";
import { useActorRef, useSelector } from "./state.ts";
import { TextFormatFloatingToolbar } from "./text-format.tsx";

export const RangeSelection = () => {
  const [editor] = useLexicalComposerContext();

  const actor = useActorRef();

  const open = useSelector((state) =>
    state.matches({ toolbar: { shown: "range" } })
  );
  const selection = useSelector((state) => state.context.selection);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          actor.send({ type: "close" });
          return true;
        },
        COMMAND_PRIORITY_HIGH
      )
    );
  }, [editor, actor]);

  return (
    <EditorPopover
      open={open}
      reference={selection}
      offset={offset}
      // className={
      //   state.pointerMove ? 'hover:!opacity-20 hover:duration-200' : ''
      // }
    >
      <div className="flex gap-1">
        <TextFormatFloatingToolbar />
        <SelectionLink />
      </div>
    </EditorPopover>
  );
};

const offset = { mainAxis: 8, crossAxis: -32 };
