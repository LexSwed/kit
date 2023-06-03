import { useEffect, useMemo } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext.js";
import { mergeRegister } from "@lexical/utils";
import {
  BLUR_COMMAND,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  FOCUS_COMMAND,
  KEY_ESCAPE_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { createMachine } from "xstate";

import { EditorPopover } from "../../lib/editor-popover.tsx";

import { LinkEdit } from "./link-edit.tsx";
import { LinkPreview } from "./link-preview.tsx";
import {
  toolbarMachine,
  ToolbarStateProvider,
  useActorRef,
  useSelector,
} from "./state.ts";
import { TextFormatFloatingToolbar } from "./text-format.tsx";

export function FloatingToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const machine = useMemo(() => {
    return createMachine(
      {
        ...toolbarMachine.config,
        context: { ...toolbarMachine.getContext(), editor },
      },
      toolbarMachine.options
    );
  }, [editor]);
  return (
    <ToolbarStateProvider machine={machine}>
      <FloatingToolbar />
      <LinkPreview />
    </ToolbarStateProvider>
  );
}

function FloatingToolbar() {
  const [editor] = useLexicalComposerContext();

  const actor = useActorRef();

  const selection = useSelector((state) => state.context.selection);
  const isShown = useSelector((state) =>
    state.matches({ toolbar: { shown: "range" } })
  );

  useEffect(() => {
    /** Should always listen to document pointer down and up in case selection
     * went outside of the editor - it should still be valid */
    function handlePointerDown() {
      actor.send({ type: "pointer down" });
    }
    function handlePointerUp() {
      actor.send({ type: "pointer up" });
    }

    /** Apply to editorElement to void applying opacity when pointer down is within the toolbar itself. */
    // function handlePointerMove(e: PointerEvent) {
    //   if (!stateRef.current.floatingToolbarOpen || stateRef.current.pointerMove) return;
    //   if (e.buttons === 1 || e.buttons === 3) {
    //     dispatch({ type: 'pointer-move' });
    //   }
    // }
    // const editorElement = editor.getRootElement();

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointerup", handlePointerUp);
    // editorElement?.addEventListener('pointermove', handlePointerMove);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointerup", handlePointerUp);
      // editorElement?.removeEventListener('pointermove', handlePointerMove);
    };
  }, [actor, editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        FOCUS_COMMAND,
        () => {
          actor.send({ type: "focus" });
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        BLUR_COMMAND,
        () => {
          actor.send({ type: "blur" });
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          actor.send({ type: "selection change" });
          return false;
        },
        COMMAND_PRIORITY_HIGH
      ),
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
      open={isShown}
      reference={selection}
      offset={offset}
      // className={
      //   state.pointerMove ? 'hover:!opacity-20 hover:duration-200' : ''
      // }
    >
      <div className="flex gap-1">
        <TextFormatFloatingToolbar />
        <LinkEdit />
      </div>
    </EditorPopover>
  );
}

const offset = { mainAxis: 8, crossAxis: -32 };
