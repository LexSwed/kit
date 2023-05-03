import { Show, batch, createEffect, createMemo, createSignal, on, onCleanup } from 'solid-js';

import { $getSelection, $isRangeSelection, ElementNode, TextNode, type RangeSelection } from 'lexical';
import { RiEditorBold } from 'solid-icons/ri';

import { createFloating } from '../../lib/floating';
import { useReducer } from '../../lib/use-reducer';
import { type Placement, inline, offset, flip, shift, type ReferenceElement } from '@floating-ui/dom';
import { $findMatchingParent, isHTMLAnchorElement } from '@lexical/utils';
import { useLexicalComposerContext } from '../../lexical';
import { $isCodeHighlightNode } from '@lexical/code';
import { $isLinkNode } from '@lexical/link';
import { getElementFromDomRange, getSelectedNode } from '../utils';
import { Popover, ToggleButton } from '../../ui';
import { TextFormatting } from './text-formating';

export const FloatingToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [reference, setReference] = createSignal<ReferenceElement | null>(null);
  const [floating, setFloating] = createSignal<HTMLElement | null>(null);
  const [state, dispatch] = useFloatingToolbar();

  // `position` is a reactive object.
  const position = createFloating(reference, floating, {
    open: () => state.floatingToolbarOpen,
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

  const updatePopup = () => {
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
      const node = getSelectedNode(selection);

      if ((!selection.isCollapsed() && rawTextContent === '') || selection.getTextContent() === '') {
        const linkParent = $findMatchingParent(node, $isLinkNode);

        if (linkParent !== null) {
          const link = editor.getElementByKey(linkParent.getKey());
          if (link && isHTMLAnchorElement(link)) {
            batch(() => {
              setReference(link);
              dispatch({ type: 'selected', selectedNode: node });
            });
            return;
          }
        }
        dispatch({ type: 'deselected' });
        return;
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
        batch(() => {
          dispatch({ type: 'selected', selectedNode: node });
          setReference(element);
        });
      }
      position.update();
    });
  };

  createEffect(
    on([], () => {
      /** Should always listen to document pointer down and up in case selection
       * went outside of the editor - it should still be valid */
      function handlePointerDown() {
        dispatch({ type: 'pointer-down' });
      }
      function handlePointerUp() {
        dispatch({ type: 'pointer-up' });
        updatePopup();
      }
      /** Avoid applying opacity when pointer down is within the toolbar itself. */
      function handlePointerMove(e: PointerEvent) {
        if (!state.floatingToolbarOpen || state.pointerMove) return;
        if (e.buttons === 1 || e.buttons === 3) {
          dispatch({ type: 'pointer-move' });
        }
      }
      const editorElement = editor.getRootElement();

      document.addEventListener('pointerdown', handlePointerDown);
      document.addEventListener('pointerup', handlePointerUp);
      editorElement?.addEventListener('pointermove', handlePointerMove);

      onCleanup(() => {
        document.removeEventListener('pointerdown', handlePointerDown);
        document.removeEventListener('pointerup', handlePointerUp);
        editorElement?.removeEventListener('pointermove', handlePointerMove);
      });
    })
  );

  createEffect(
    on([], () => {
      const updatePopupWithKeyboardSelectionOnly = () => {
        if (state.pointerUp) {
          updatePopup();
        }
      };
      document.addEventListener('selectionchange', updatePopupWithKeyboardSelectionOnly);
      onCleanup(() => {
        document.removeEventListener('selectionchange', updatePopupWithKeyboardSelectionOnly);
      });
    })
  );

  const updateLink = () => {
    editor.update(() => {
      if (state.linkEditOpen) {
        return dispatch({ type: 'link-edit-closed' });
      }
      const selection = $getSelection();

      if (!$isRangeSelection(selection)) {
        return;
      }

      const node = getSelectedNode(selection);
      const parent = node.getParent();
      const linkNode = $isLinkNode(node) ? node : $isLinkNode(parent) ? parent : null;

      if (linkNode) {
        const textNodes = linkNode.getAllTextNodes();

        const firstTextNode = textNodes[0];
        const lastTextNode = textNodes[textNodes.length - 1];

        selection.setTextNodeRange(firstTextNode, 0, lastTextNode, lastTextNode.getTextContentSize());
        const linkDetails = {
          link: linkNode.getURL(),
          text: linkNode.getTextContent(),
        };
        dispatch({
          type: 'link-edit-open',
          linkDetails,
        });
      } else {
        dispatch({
          type: 'link-edit-open',
          linkDetails: {
            link: '',
            text: selection.getTextContent(),
          },
        });
      }
    });
  };

  return (
    <Show when={state.floatingToolbarOpen}>
      <Popover
        ref={setFloating}
        data-align={split().align}
        data-side={split().side}
        data-state={state.floatingToolbarOpen ? 'open' : 'closed'}
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
};

function getSideAndAlignFromPlacement(placement: Placement) {
  const [side, align = 'center'] = placement.split('-');
  return { side, align };
}

type Action =
  | {
      type: 'selected';
      selectedNode: TextNode | ElementNode;
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
    }
  | {
      type: 'link-edit-open';
      linkDetails: {
        text: string;
        link: string;
      };
    }
  | {
      type: 'link-edit-closed';
    };

type State = {
  pointerUp: boolean;
  pointerMove: boolean;
} & (
  | {
      floatingToolbarOpen: boolean;
      linkEditOpen: false;
      linkEditDetails: null;
      lastSelectedNode: null | TextNode | ElementNode;
    }
  | {
      floatingToolbarOpen: true;
      linkEditOpen: true;
      lastSelectedNode: TextNode | ElementNode;
      linkEditDetails: {
        text: string;
        link: string;
      };
    }
);

const floatingInitialState = {
  pointerUp: true,
  pointerMove: false,
  floatingToolbarOpen: false,
  linkEditOpen: false,
  linkEditDetails: null,
  lastSelectedNode: null,
} as const;
function useFloatingToolbar() {
  return useReducer(floatingToolbarReducer, floatingInitialState);
}
function floatingToolbarReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'selected': {
      if (action.selectedNode === state.lastSelectedNode) {
        return state;
      }
      return {
        ...state,
        lastSelectedNode: action.selectedNode,
        floatingToolbarOpen: true,
        linkEditOpen: false,
        linkEditDetails: null,
      };
    }
    case 'deselected': {
      /** Keep showing toolbar when no selected text, but the pointer is down */
      if (!state.pointerUp && state.floatingToolbarOpen) {
        return state;
      }
      return {
        ...state,
        lastSelectedNode: null,
        floatingToolbarOpen: false,
        linkEditOpen: false,
        linkEditDetails: null,
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
    case 'link-edit-closed': {
      return {
        ...state,
        linkEditOpen: false,
        linkEditDetails: null,
      };
    }
    case 'link-edit-open': {
      const { floatingToolbarOpen, lastSelectedNode } = state;
      if (!floatingToolbarOpen || !lastSelectedNode) return state;
      return {
        ...state,
        lastSelectedNode,
        floatingToolbarOpen: true,
        linkEditOpen: true,
        linkEditDetails: action.linkDetails,
      };
    }
    default: {
      return state;
    }
  }
}
