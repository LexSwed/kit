import { $isCodeHighlightNode } from '@lexical/code';
import { $isLinkNode } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent } from '@lexical/utils';
import { $getSelection, $isRangeSelection, ElementNode, TextNode } from 'lexical';
import { useCallback, useEffect, useReducer, useState } from 'react';
import { PopoverBox, useLatest } from '@fxtrot/ui';
import * as RdxPresence from '@radix-ui/react-presence';
import cx from 'clsx';
import { useFloating, offset, flip, shift, inline, type Placement } from '@floating-ui/react';
import { getElementFromDomRange } from '../../utils/getElementFromDomRange';
import { getSelectedNode } from '../../utils/getSelectedNode';
import { isHTMLAnchorElement } from '@lexical/utils';
import { TextFormatFloatingToolbar } from './text-format';
import { LinkEdit, LinkEditPopup } from './link-edit';
import { useToolbarActor } from './state';
import { useSelector } from '@xstate/react';

export function FloatingToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const actor = useToolbarActor();
  const isShown = useSelector(actor, (state) => state.matches('shown'));
  const selectedNode = useSelector(actor, (state) => state.context.selection);
  const isLinkEditingShown = useSelector(actor, (state) => state.matches('linkEditShown')) && selectedNode;

  const { x, y, strategy, refs, context } = useFloating({
    open: isShown,
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
  // const isOpen = useDelayed(state.floatingToolbarOpen, 200);

  const updatePopup = useCallback(() => {
    editor.getEditorState().read(() => {
      // Should not to pop up the floating toolbar when using IME input
      if (editor.isComposing()) {
        return;
      }
      const selection = $getSelection();

      if (!$isRangeSelection(selection) || $isCodeHighlightNode(selection.anchor.getNode())) {
        return actor.send({ type: 'selection change', selection: null });
      }

      const rawTextContent = selection.getTextContent().replace(/\n/g, '');
      const node = getSelectedNode(selection);

      if ((!selection.isCollapsed() && rawTextContent === '') || selection.getTextContent() === '') {
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
            return actor.send({ type: 'selection change', selection: node });
          }
        }
        return actor.send({ type: 'selection change', selection: null });
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
        actor.send({ type: 'selection change', selection: node });
        refs.setReference(element);
      }
      context.update();
    });
  }, [actor, editor, refs, context]);

  /** store state in ref for events only that need access to "latest" value stored in state */
  // const stateRef = useLatest(state);

  useEffect(() => {
    /** Should always listen to document pointer down and up in case selection
     * went outside of the editor - it should still be valid */
    function handlePointerDown() {
      actor.send({ type: 'pointer down' });
    }
    function handlePointerUp() {
      actor.send({ type: 'pointer up' });
      updatePopup();
    }
    /** Avoid applying opacity when pointer down is within the toolbar itself. */
    // function handlePointerMove(e: PointerEvent) {
    //   if (!stateRef.current.floatingToolbarOpen || stateRef.current.pointerMove) return;
    //   if (e.buttons === 1 || e.buttons === 3) {
    //     dispatch({ type: 'pointer-move' });
    //   }
    // }
    const editorElement = editor.getRootElement();

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('pointerup', handlePointerUp);
    // editorElement?.addEventListener('pointermove', handlePointerMove);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('pointerup', handlePointerUp);
      // editorElement?.removeEventListener('pointermove', handlePointerMove);
    };
  }, [actor, editor, refs, updatePopup]);

  // useEffect(() => {
  //   const updatePopupWithKeyboardSelectionOnly = () => {
  //     if (stateRef.current.pointerUp) {
  //       updatePopup();
  //     }
  //   };
  //   document.addEventListener('selectionchange', updatePopupWithKeyboardSelectionOnly);
  //   return () => {
  //     document.removeEventListener('selectionchange', updatePopupWithKeyboardSelectionOnly);
  //   };
  // }, [editor, updatePopup]);

  const updateLink = () => {
    /*  editor.update(() => {
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
        actor.send({
          type: 'link-edit-open',
          linkDetails,
        });
      } else {
        actor.send({
          type: 'link-edit-open',
          linkDetails: {
            link: '',
            text: selection.getTextContent(),
          },
        });
      }
    }); */
  };

  const onClose = () => {
    actor.send({ type: 'cancel link edit' });
  };

  console.log(actor.getSnapshot());

  return (
    <>
      <RdxPresence.Presence present={isShown}>
        <PopoverBox
          data-align={align}
          data-side={side}
          ref={refs.setFloating}
          data-state={isShown ? 'open' : 'closed'}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            width: 'max-content',
          }}
          className={cx(
            'isolate transition-[opacity,width,height] duration-300'
            // state.pointerMove ? 'hover:!opacity-20 hover:duration-200' : ''
          )}
        >
          <div className="flex gap-1">
            <TextFormatFloatingToolbar />
            <div className="w-0.5 bg-outline/10" />
            <LinkEdit onEditLink={updateLink} />
          </div>
        </PopoverBox>
      </RdxPresence.Presence>
      {isLinkEditingShown && (
        <LinkEditPopup
          node={selectedNode}
          onClose={onClose}
          //initialValues={state.linkEditDetails}
        />
      )}
    </>
  );
}
function getSideAndAlignFromPlacement(placement: Placement) {
  const [side, align = 'center'] = placement.split('-');
  return [side, align] as const;
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
