import { $isCodeHighlightNode } from '@lexical/code';
import { $isAutoLinkNode, $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $getNodeByKey,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_CRITICAL,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
  TextFormatType,
} from 'lexical';
import { Dispatch, MouseEvent, ReactNode, useCallback, useEffect, useReducer, useState } from 'react';
import { PopoverBox, ToggleButton, useLatest } from '@fxtrot/ui';
import * as RdxPresence from '@radix-ui/react-presence';
import { useFloating, offset, flip, shift, inline, Placement, VirtualElement } from '@floating-ui/react';
import { getElementFromDomRange } from '../../utils/getElementFromDomRange';
import {
  BsTypeItalic,
  BsTypeUnderline,
  BsTypeBold,
  BsTypeStrikethrough,
  BsSubscript,
  BsSuperscript,
  BsCodeSlash,
  BsLink,
} from 'react-icons/bs';
import { ToggleGroup } from './toggle-group';
import { getSelectedNode } from '../../utils/getSelectedNode';
import { isHTMLAnchorElement } from '@lexical/utils';

function TextFormatFloatingToolbar({ editor }: { editor: LexicalEditor }): JSX.Element {
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isCode, setIsCode] = useState(false);

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://www.example.com');
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  const updateFormat = useCallback(() => {
    const selection = $getSelection();

    if (!$isRangeSelection(selection)) {
      return;
    }
    const node = getSelectedNode(selection);
    const parent = node.getParent();
    // console.log({ parent: $isLinkNode(parent), node: $isLinkNode(node) });
    if ($isLinkNode(parent) || $isLinkNode(node)) {
      setIsLink(true);
    } else {
      setIsLink(false);
    }

    // Update text format
    setIsBold(selection.hasFormat('bold'));
    setIsItalic(selection.hasFormat('italic'));
    setIsUnderline(selection.hasFormat('underline'));
    setIsStrikethrough(selection.hasFormat('strikethrough'));
    setIsSubscript(selection.hasFormat('subscript'));
    setIsSuperscript(selection.hasFormat('superscript'));
    setIsCode(selection.hasFormat('code'));
  }, []);

  useEffect(() => {
    // get initial values
    editor.getEditorState().read(updateFormat);
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(updateFormat);
      })
    );
  }, [editor, updateFormat]);

  const handleToggle = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, e.currentTarget.value as TextFormatType);
    },
    [editor]
  );

  return (
    <ToggleGroup>
      <ToggleButton
        pressed={isBold}
        onClick={handleToggle}
        value="bold"
        label="Format text as bold"
        size="sm"
        icon={BsTypeBold}
      />
      <ToggleButton pressed={isItalic} value="italic" size="sm" label="Format text as italics" icon={BsTypeItalic} />
      <ToggleButton
        pressed={isUnderline}
        value="underline"
        size="sm"
        label="Format text to underlined"
        icon={BsTypeUnderline}
      />
      <ToggleButton
        pressed={isStrikethrough}
        value="strikethrough"
        size="sm"
        label="Format text with a strikethrough"
        icon={BsTypeStrikethrough}
      />
      <ToggleButton pressed={isSubscript} value="subscript" size="sm" label="Format Subscript" icon={BsSubscript} />
      <ToggleButton
        pressed={isSuperscript}
        value="superscript"
        size="sm"
        label="Format Superscript"
        icon={BsSuperscript}
      />
      <ToggleButton pressed={isCode} value="code" size="sm" label="Insert code block" icon={BsCodeSlash} />
      <ToggleButton pressed={isLink} onPressedChange={insertLink} size="sm" label="Insert link" icon={BsLink} />
    </ToggleGroup>
  );
}

const FloatingPopup = ({
  state,
  dispatch,
  children,
}: {
  editor: LexicalEditor;
  state: State;
  dispatch: Dispatch<Action>;
  children: ReactNode;
}) => {
  const { x, y, strategy, refs, context } = useFloating({
    open: state.floatingToolbarOpen,
    placement: 'top',
    middleware: [inline(), offset(8), flip(), shift()],
  });
  const [side, align] = getSideAndAlignFromPlacement(context.placement);

  useEffect(() => {
    if (state.pointerUp && state.referenceElement) {
      console.log(state);
      refs.setReference(state.referenceElement);
    }
  }, [refs, state.pointerUp, state.referenceElement]);

  useEffect(() => {
    function handlePointerDown() {
      dispatch({ type: 'pointer-down' });
    }
    function handlePointerUp() {
      dispatch({ type: 'pointer-up' });
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dispatch]);

  return (
    <RdxPresence.Presence present={context.open}>
      <PopoverBox
        data-align={align}
        data-side={side}
        ref={refs.setFloating}
        data-state={context.open ? 'open' : 'closed'}
        style={{
          position: strategy,
          top: y ?? 0,
          left: x ?? 0,
          width: 'max-content',
        }}
      >
        {children}
      </PopoverBox>
    </RdxPresence.Presence>
  );
};

export function FloatingToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [state, dispatch] = useFloatingToolbar();

  useEffect(() => {
    const updateShouldRenderPopup = () => {
      editor.getEditorState().read(() => {
        // Should not to pop up the floating toolbar when using IME input
        if (editor.isComposing()) {
          return;
        }
        const selection = $getSelection();

        if (!$isRangeSelection(selection) || $isCodeHighlightNode(selection.anchor.getNode())) {
          return dispatch({ type: 'deselected' });
        }

        const node = getSelectedNode(selection);
        const linkParent = $findMatchingParent(node, $isLinkNode);

        if (linkParent !== null) {
          const link = editor.getElementByKey(linkParent.getKey());
          if (link && isHTMLAnchorElement(link)) {
            return dispatch({ type: 'selected', payload: link });
          }
        }

        const rawTextContent = selection.getTextContent().replace(/\n/g, '');

        if ((!selection.isCollapsed() && rawTextContent === '') || selection.getTextContent() === '') {
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
          dispatch({ type: 'selected', payload: element });
        }
      });
    };

    document.addEventListener('selectionchange', updateShouldRenderPopup);
    return () => {
      document.removeEventListener('selectionchange', updateShouldRenderPopup);
    };
  });

  if (!editor.isEditable()) return null;

  return (
    <FloatingPopup editor={editor} state={state} dispatch={dispatch}>
      <TextFormatFloatingToolbar editor={editor} />
    </FloatingPopup>
  );
}
function getSideAndAlignFromPlacement(placement: Placement) {
  const [side, align = 'center'] = placement.split('-');
  return [side, align] as const;
}

type Action =
  | {
      type: 'selected';
      payload: HTMLElement | VirtualElement;
    }
  | {
      type: 'pointer-up';
    }
  | {
      type: 'pointer-down';
    }
  | {
      type: 'deselected';
    };

type State = {
  pointerUp: boolean;
  floatingToolbarOpen: boolean;
  referenceElement: null | HTMLElement | VirtualElement;
};

function useFloatingToolbar() {
  return useReducer(floatingToolbarReducer, floatingInitialState);
}

const floatingInitialState = { pointerUp: true, floatingToolbarOpen: false, referenceElement: null } as const;
function floatingToolbarReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'selected': {
      return {
        ...state,
        floatingToolbarOpen: true,
        referenceElement: action.payload,
      };
    }
    case 'deselected': {
      if (!state.pointerUp && state.floatingToolbarOpen) {
        return {
          ...state,
          referenceElement: null,
        };
      }
      return {
        ...state,
        floatingToolbarOpen: false,
        referenceElement: null,
      };
    }
    case 'pointer-down': {
      return {
        ...state,
        pointerUp: false,
      };
    }
    case 'pointer-up': {
      if (state.floatingToolbarOpen && !state.referenceElement) {
        return {
          floatingToolbarOpen: false,
          referenceElement: null,
          pointerUp: true,
        };
      }
      return {
        ...state,
        pointerUp: true,
      };
    }
    default: {
      return state;
    }
  }
}
