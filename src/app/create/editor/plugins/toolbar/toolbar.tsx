import { $isCodeHighlightNode } from '@lexical/code';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
  TextFormatType,
} from 'lexical';
import { ReactNode, useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { $isAtNodeEnd } from '@lexical/selection';
import { ElementNode, RangeSelection, TextNode } from 'lexical';
import { ActionGroup, PopoverBox, Presence, ToggleButton } from '@fxtrot/ui';
import * as RdxPresence from '@radix-ui/react-presence';
import { useFloating, offset, flip, shift, inline, Placement } from '@floating-ui/react';
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
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const selection = $getSelection();

          if (!$isRangeSelection(selection)) {
            return;
          }

          // Update text format
          setIsBold(selection.hasFormat('bold'));
          setIsItalic(selection.hasFormat('italic'));
          setIsUnderline(selection.hasFormat('underline'));
          setIsStrikethrough(selection.hasFormat('strikethrough'));
          setIsSubscript(selection.hasFormat('subscript'));
          setIsSuperscript(selection.hasFormat('superscript'));
          setIsCode(selection.hasFormat('code'));
        });
      })
    );
  }, [editor]);

  return (
    <>
      <ToggleButton
        onPressedChange={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
        }}
        label="Format text as bold"
        size="sm"
        icon={BsTypeBold}
      />
      <ToggleButton
        pressed={isItalic}
        onPressedChange={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
        }}
        size="sm"
        label="Format text as italics"
        icon={BsTypeItalic}
      />
      <ToggleButton
        pressed={isUnderline}
        onPressedChange={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
        }}
        size="sm"
        label="Format text to underlined"
        icon={BsTypeUnderline}
      />
      <ToggleButton
        pressed={isStrikethrough}
        onPressedChange={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
        }}
        size="sm"
        label="Format text with a strikethrough"
        icon={BsTypeStrikethrough}
      />
      <ToggleButton
        pressed={isSubscript}
        onPressedChange={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript');
        }}
        size="sm"
        label="Format Subscript"
        icon={BsSubscript}
      />
      <ToggleButton
        pressed={isSuperscript}
        onPressedChange={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript');
        }}
        size="sm"
        label="Format Superscript"
        icon={BsSuperscript}
      />
      <ToggleButton
        pressed={isCode}
        onPressedChange={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
        }}
        size="sm"
        label="Insert code block"
        icon={BsCodeSlash}
      />
      <ToggleButton
        onClick={insertLink}
        className={'popup-item spaced ' + (isLink ? 'active' : '')}
        label="Insert link"
        icon={BsLink}
        size="sm"
      />
    </>
  );
}

const FloatingPopup = ({
  editor,
  hasSelection,
  children,
}: {
  editor: LexicalEditor;
  hasSelection: boolean;
  children: ReactNode;
}) => {
  const { x, y, strategy, refs, context } = useFloating({
    open: hasSelection,
    placement: 'top',
    middleware: [offset(10), flip(), shift(), inline()],
  });
  const [side, align] = getSideAndAlignFromPlacement(context.placement);
  const [pointerUp, dispatch] = useReducer(pointerReducer, true);
  const [open, setOpen] = useState(false);

  const setFloatingPosition = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();

      const nativeSelection = window.getSelection();

      const rootElement = editor.getRootElement();
      if (
        selection !== null &&
        nativeSelection !== null &&
        !nativeSelection.isCollapsed &&
        rootElement !== null &&
        rootElement.contains(nativeSelection.anchorNode)
      ) {
        const element = getElementFromDomRange(nativeSelection, rootElement);

        refs.setPositionReference(element);
      }
    });
  }, [editor, refs]);

  useEffect(() => {
    if (open) return;

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
  }, [open]);

  useEffect(() => {
    if (hasSelection && pointerUp) {
      setOpen(true);
      setFloatingPosition();
    }
    if (!hasSelection) {
      setOpen(false);
    }
  }, [hasSelection, pointerUp, setFloatingPosition]);

  return (
    <RdxPresence.Presence present={open}>
      <PopoverBox
        data-align={align}
        data-side={side}
        ref={refs.setFloating}
        data-state={open ? 'open' : 'closed'}
        style={{
          position: strategy,
          top: y ?? 0,
          left: x ?? 0,
          width: 'max-content',
        }}
        onAnimationEnd={() => setOpen((open) => (open ? open : false))}
      >
        {children}
      </PopoverBox>
    </RdxPresence.Presence>
  );
};

interface Props {
  // rootNode?: HTMLElement
}

export function FloatingToolbarPlugin(props: Props) {
  const [editor] = useLexicalComposerContext();

  const [isTextSelected, setIsTextSelected] = useState(false);

  useEffect(() => {
    const updateShouldRenderPopup = () => {
      editor.getEditorState().read(() => {
        // Should not to pop up the floating toolbar when using IME input
        if (editor.isComposing()) {
          return;
        }
        const selection = $getSelection();
        const nativeSelection = window.getSelection();
        const rootElement = editor.getRootElement();

        if (
          nativeSelection !== null &&
          (!$isRangeSelection(selection) || rootElement === null || !rootElement.contains(nativeSelection.anchorNode))
        ) {
          setIsTextSelected(false);
          return;
        }

        if (!$isRangeSelection(selection)) {
          return;
        }

        const node = getSelectedNode(selection);

        if (!$isCodeHighlightNode(selection.anchor.getNode()) && selection.getTextContent() !== '') {
          setIsTextSelected($isTextNode(node));
        } else {
          setIsTextSelected(false);
        }

        const rawTextContent = selection.getTextContent().replace(/\n/g, '');
        if (!selection.isCollapsed() && rawTextContent === '') {
          setIsTextSelected(false);
          return;
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
    <FloatingPopup editor={editor} hasSelection={isTextSelected}>
      <TextFormatFloatingToolbar editor={editor} />
    </FloatingPopup>
  );
}

export function getSelectedNode(selection: RangeSelection): TextNode | ElementNode {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  } else {
    return $isAtNodeEnd(anchor) ? anchorNode : focusNode;
  }
}

/**
 * set to true when the pointer is up, false when the selection is still in progress
 */
type SelectionState =
  | {
      isOpen: true;
    }
  | {
      isOpen: false;
      pointerDown: false;
    };

type Action =
  | {
      type: 'pointer-down';
    }
  | {
      type: 'pointer-up';
    };

function pointerReducer(state: SelectionState, action: Action) {
  switch (action.type) {
    case 'pointer-down': {
      return false;
    }
    case 'pointer-up': {
      return true;
    }
  }
}

function getSideAndAlignFromPlacement(placement: Placement) {
  const [side, align = 'center'] = placement.split('-');
  return [side, align] as const;
}
