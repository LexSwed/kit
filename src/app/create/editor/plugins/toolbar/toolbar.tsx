import { $isCodeHighlightNode } from '@lexical/code';
import { $isLinkNode } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent } from '@lexical/utils';
import { $getSelection, $isRangeSelection } from 'lexical';
import { useCallback, useEffect, useReducer, useState } from 'react';
import { PopoverBox, useLatest } from '@fxtrot/ui';
import * as RdxPresence from '@radix-ui/react-presence';
import { useFloating, offset, flip, shift, inline, type Placement } from '@floating-ui/react';
import { getElementFromDomRange } from '../../utils/getElementFromDomRange';
import { getSelectedNode } from '../../utils/getSelectedNode';
import { isHTMLAnchorElement } from '@lexical/utils';
import { TextFormatFloatingToolbar } from './text-format';

export function FloatingToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const [state, dispatch] = useFloatingToolbar();

  const { x, y, strategy, refs, context } = useFloating({
    open: state.floatingToolbarOpen,
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
  const [side, align] = getSideAndAlignFromPlacement(context.placement);
  const isOpen = useDelayed(state.floatingToolbarOpen, 200);

  const updatePopup = useCallback(() => {
    editor.getEditorState().read(() => {
      // Should not to pop up the floating toolbar when using IME input
      if (editor.isComposing()) {
        return;
      }
      const selection = $getSelection();

      if (!$isRangeSelection(selection) || $isCodeHighlightNode(selection.anchor.getNode())) {
        return dispatch({ type: 'deselected' });
      }

      const rawTextContent = selection.getTextContent().replace(/\n/g, '');

      if ((!selection.isCollapsed() && rawTextContent === '') || selection.getTextContent() === '') {
        const node = getSelectedNode(selection);
        const linkParent = $findMatchingParent(node, $isLinkNode);

        if (linkParent !== null) {
          const link = editor.getElementByKey(linkParent.getKey());
          if (link && isHTMLAnchorElement(link)) {
            /**
             * Resetting position reference as we switch between range and real element
             * Range will be assigned to position reference, so when switching to a real element
             * floating will still use old position reference. setPositionReference only cannot be used 🤷‍♂️
             */
            refs.setPositionReference(null);
            refs.setReference(link);
            return dispatch({ type: 'selected' });
          }
        }

        return dispatch({ type: 'deselected' });
      }

      const nativeSelection = window.getSelection();
      const rootElement = editor.getRootElement();
      if (
        nativeSelection !== null &&
        !nativeSelection.isCollapsed &&
        rootElement !== null &&
        rootElement.contains(nativeSelection.anchorNode)
      ) {
        const element = getElementFromDomRange(nativeSelection, rootElement);
        dispatch({ type: 'selected' });
        refs.setReference(element);
      }
    });
  }, [dispatch, editor, refs]);

  /** store state in ref for events only that need access to "latest" value stored in state */
  const stateRef = useLatest(state);
  useEffect(() => {
    /** Should always listen to document pointer down and up in case selection
     * went outside of the editor - it should still be valid */
    function handlePointerDown() {
      dispatch({ type: 'pointer-down' });
    }
    function handlePointerUp(e: PointerEvent) {
      dispatch({ type: 'pointer-up' });

      if (!refs.floating.current?.contains(e.target as HTMLElement)) {
        updatePopup();
      }
    }
    /** Avoid applying opacity when pointer down is within the toolbar itself. */
    function handlePointerMove(e: PointerEvent) {
      if (!stateRef.current.floatingToolbarOpen || stateRef.current.pointerMove) return;
      if (e.buttons === 1 || e.buttons === 3) {
        dispatch({ type: 'pointer-move' });
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointermove', handlePointerMove);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointermove', handlePointerMove);
    };
  }, [dispatch, editor, refs, stateRef, updatePopup]);

  useEffect(() => {
    const updatePopupWithKeyboardSelectionOnly = () => {
      if (stateRef.current.pointerUp) {
        updatePopup();
      }
    };
    document.addEventListener('selectionchange', updatePopupWithKeyboardSelectionOnly);
    return () => {
      document.removeEventListener('selectionchange', updatePopupWithKeyboardSelectionOnly);
    };
  }, [editor, stateRef, updatePopup]);

  return (
    <RdxPresence.Presence present={isOpen}>
      <PopoverBox
        data-align={align}
        data-side={side}
        ref={refs.setFloating}
        data-state={isOpen ? 'open' : 'closed'}
        style={{
          position: strategy,
          top: y ?? 0,
          left: x ?? 0,
          width: 'max-content',
        }}
        className={state.pointerMove ? 'hover:!opacity-20 hover:transition-opacity hover:duration-200' : ''}
      >
        <TextFormatFloatingToolbar />
      </PopoverBox>
    </RdxPresence.Presence>
  );
}
function getSideAndAlignFromPlacement(placement: Placement) {
  const [side, align = 'center'] = placement.split('-');
  return [side, align] as const;
}

type Action =
  | {
      type: 'selected';
    }
  | {
      type: 'pointer-up';
    }
  | {
      type: 'pointer-down';
    }
  | {
      type: 'pointer-move';
    }
  | {
      type: 'deselected';
    };

type State = {
  pointerUp: boolean;
  pointerMove: boolean;
  floatingToolbarOpen: boolean;
};

const floatingInitialState = { pointerUp: true, pointerMove: false, floatingToolbarOpen: false } as const;
function useFloatingToolbar() {
  return useReducer(floatingToolbarReducer, floatingInitialState);
}
function floatingToolbarReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'selected': {
      return {
        ...state,
        floatingToolbarOpen: true,
      };
    }
    case 'deselected': {
      /** Keep showing toolbar when no selected text, but the pointer is down */
      if (!state.pointerUp && state.floatingToolbarOpen) {
        return state;
      }
      return {
        ...state,
        floatingToolbarOpen: false,
      };
    }
    case 'pointer-down': {
      return {
        ...state,
        pointerUp: false,
      };
    }
    case 'pointer-up': {
      return {
        ...state,
        pointerUp: true,
        pointerMove: false,
      };
    }
    case 'pointer-move': {
      return {
        ...state,
        pointerMove: true,
      };
    }
    default: {
      return state;
    }
  }
}

function useDelayed(open: boolean, milliseconds: number) {
  const [isOpen, setOpen] = useState(open);
  useEffect(() => {
    if (!open) {
      const id = setTimeout(() => {
        setOpen(false);
      }, milliseconds);

      return () => clearTimeout(id);
    } else {
      setOpen(open);
    }
  }, [open, milliseconds]);

  return isOpen;
}
