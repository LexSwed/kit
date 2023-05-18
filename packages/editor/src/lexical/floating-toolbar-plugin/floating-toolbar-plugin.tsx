import { Show, createEffect, createMemo, createSignal, onCleanup } from 'solid-js';

import {
  BLUR_COMMAND,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  ElementNode,
  FOCUS_COMMAND,
  KEY_ESCAPE_COMMAND,
  SELECTION_CHANGE_COMMAND,
  TextNode,
} from 'lexical';
import { useLexicalComposerContext } from 'lexical-solid';
import { mergeRegister } from '@lexical/utils';
import { type Placement, inline, offset, flip, shift } from '@floating-ui/dom';

import { createFloating } from '../../lib/floating';
import { getSelection } from './utils';
import { Popover } from '../../ui';
import { TextFormatting } from './text-formating';
import { ToolbarStateContextProvider, useToolbarState } from './state';

export function FloatingToolbarPlugin() {
  return (
    <ToolbarStateContextProvider>
      <FloatingToolbar />
    </ToolbarStateContextProvider>
  );
}

function FloatingToolbar() {
  const [editor] = useLexicalComposerContext();
  const [floating, setFloating] = createSignal<HTMLElement | null>(null);
  const [state, send] = useToolbarState();

  // `position` is a reactive object.
  const position = createFloating(() => state().context.reference, floating, {
    open: () => state().matches({ toolbar: 'open' }),
    placement: 'top-start',
    middleware: [
      inline(),
      offset({ mainAxis: 8, crossAxis: -32 }),
      flip({
        crossAxis: false,
      }),
      shift(),
    ],
  });
  const split = createMemo(() => getSideAndAlignFromPlacement(position.placement));

  const isShown = () => state().matches({ toolbar: 'shown' });
  // const $selection = useCurrentSelection();

  // const isCollapsed = $selection?.isCollapsed();

  /** Should always listen to document pointer down and up in case selection
   * went outside of the editor - it should still be valid */
  function handlePointerDown() {
    send({ type: 'pointer down' });
  }
  function handlePointerUp() {
    getSelection(editor, true).then((params) => {
      send({ type: 'pointer up' });
      if (state().matches({ pointer: 'up' })) {
        send({ type: 'selection change', ...params });
      }
    });
  }

  /** Apply to editorElement to void applying opacity when pointer down is within the toolbar itself. */
  // function handlePointerMove(e: PointerEvent) {
  //   if (!stateRef.current.floatingToolbarOpen || stateRef.current.pointerMove) return;
  //   if (e.buttons === 1 || e.buttons === 3) {
  //     dispatch({ type: 'pointer-move' });
  //   }
  // }
  // const editorElement = editor.getRootElement();

  document.addEventListener('pointerdown', handlePointerDown);
  document.addEventListener('pointerup', handlePointerUp);
  // editorElement?.addEventListener('pointermove', handlePointerMove);

  onCleanup(() => {
    document.removeEventListener('pointerdown', handlePointerDown);
    document.removeEventListener('pointerup', handlePointerUp);
    // editorElement?.removeEventListener('pointermove', handlePointerMove);
  });

  onCleanup(
    mergeRegister(
      editor.registerCommand(
        FOCUS_COMMAND,
        () => {
          send({ type: 'focus' });
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        BLUR_COMMAND,
        () => {
          send({ type: 'blur' });
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (payload, editor) => {
          if (state().matches({ pointer: 'up' })) {
            getSelection(editor).then((params) => {
              if (state().matches({ pointer: 'up' })) {
                send({ type: 'selection change', ...params });
              }
            });
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          if (state().matches({ toolbar: 'shown' })) {
            send({
              type: 'selection change',
              selection: null,
            });
            send({ type: 'close' });
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH
      )
    )
  );

  return (
    <Show when={isShown}>
      <Popover
        ref={setFloating}
        data-align={split().align}
        data-side={split().side}
        data-state={isShown() ? 'open' : 'closed'}
        class={'isolate transition-[opacity,width,height] duration-300'}
        style={{
          position: position.strategy,
          top: `${position.y ?? 0}px`,
          left: `${position.x ?? 0}px`,
          width: 'max-content',
        }}
      >
        <TextFormatting />
      </Popover>
    </Show>
  );
}

function getSideAndAlignFromPlacement(placement: Placement) {
  const [side, align = 'center'] = placement.split('-');
  return { side, align };
}
