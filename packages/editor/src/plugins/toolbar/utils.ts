import { useEffect, useState } from 'react';
import { $isCodeHighlightNode } from '@lexical/code';
import { $isAutoLinkNode, $isLinkNode, AutoLinkNode, LinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext.js';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_HIGH,
  type CommandListenerPriority,
  type LexicalEditor,
  SELECTION_CHANGE_COMMAND,
  TextNode,
} from 'lexical';

import { useLatest } from '@fxtrot/ui';

import { getSelectedNode } from '../../utils/getSelectedNode.tsx';

export async function getSelection(editor: LexicalEditor) {
  // copied from Lexical Playground code
  if (editor.isComposing()) {
    return null;
  }
  return new Promise<null | { range: Range } | { link: HTMLAnchorElement }>((resolve) => {
    editor.update(() => {
      const selection = $getSelection();

      if (!$isRangeSelection(selection) || $isCodeHighlightNode(selection.anchor.getNode())) {
        return resolve(null);
      }

      const nativeSelection = window.getSelection();
      const rootElement = editor.getRootElement();
      if (nativeSelection === null || rootElement === null || !rootElement.contains(nativeSelection.anchorNode)) {
        return resolve(null);
      }
      const isCollapsed = selection.isCollapsed();

      const linkNode = $getSelectedLinkNode();
      const link = linkNode ? editor.getElementByKey(linkNode.getKey()) : null;

      if (isCollapsed && link instanceof HTMLAnchorElement) {
        return resolve({ link });
      }
      if (link) {
        const range = new Range();
        range.setStartBefore(link);
        range.setEndAfter(link);
        return resolve({ range });
      }
      if (!isCollapsed) {
        const nativeRange = nativeSelection.getRangeAt(0);
        return resolve({ range: nativeRange });
      }
      return resolve(null);
    });
  });
}

export async function selectWholeLink(editor: LexicalEditor, newRange: Range) {
  return new Promise((resolve) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      selection.applyDOMRange(newRange);
      resolve(undefined);
    });
  });
}

export async function getLinkDetailsFromSelection(editor: LexicalEditor) {
  return new Promise<{ link: string; text: string }>((resolve) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      const linkNode = $getSelectedLinkNode();
      if (!linkNode) return resolve({ link: '', text: '' });

      const textNodes = linkNode.getAllTextNodes();
      const textNode: TextNode | null = textNodes.length === 1 ? textNodes.at(0) : null;

      resolve({
        link: linkNode ? linkNode.getURL() : '',
        text: textNode ? textNode.getTextContent() : '',
      });
    });
  });
}

export function updateSelectedLink(editor: LexicalEditor, { text, link }: { text: string; link: string }) {
  if (text) {
    editor.update(() => {
      const linkNode = $getSelectedLinkNode();
      if (!linkNode) return;

      const textNodes = linkNode.getAllTextNodes();
      if (textNodes.length === 1) {
        const textNode: TextNode = textNodes.at(0);
        textNode.setTextContent(text);
      }
    });
  }
  editor.dispatchCommand(TOGGLE_LINK_COMMAND, link);
}

export function $getSelectedLinkNode(): LinkNode | AutoLinkNode | null {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) {
    return null;
  }
  const selectedNode = selection.getNodes().at(0);
  if (!selectedNode) return null;

  const linkNode = $findMatchingParent(selectedNode, $isLinkNode) || $findMatchingParent(selectedNode, $isAutoLinkNode);

  return linkNode ? (linkNode as LinkNode | AutoLinkNode) : null;
}

export function highlightSelectedLink(editor: LexicalEditor) {
  // @ts-expect-error Highlights API is not yet in lib/dom
  if (typeof Highlight !== 'undefined') {
    editor.getEditorState().read(() => {
      const linkNode = $getSelectedLinkNode();
      if (!linkNode) return;
      const link = editor.getElementByKey(linkNode.getKey());
      if (!link) return;
      const range = new Range();
      range.setStartBefore(link);
      range.setEndAfter(link);
      // @ts-expect-error Highlights API is not yet in lib/dom
      if (range && typeof Highlight !== 'undefined') {
        // @ts-expect-error Highlights API is not yet in lib/dom
        const highlight = new Highlight(range);
        // @ts-expect-error Highlights API is not yet in lib/dom
        CSS.highlights.set('editor', highlight);
      }
    });
    return () => {
      // @ts-expect-error Highlights API is not yet in lib/dom
      CSS.highlights.delete('editor');
    };
  }
}

export function isSelectionCollapsed() {
  const nativeSelection = window.getSelection();
  if (!nativeSelection) return false;
  return nativeSelection.isCollapsed;
}

export function useIsLinkNodeSelected() {
  const [isLink, setIsLink] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  useSelectionChange(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      setIsDisabled(true);
      return;
    }

    if (!selection.getNodes().every($isTextNode)) {
      setIsDisabled(true);
      return;
    }
    setIsDisabled(false);

    const node = getSelectedNode(selection);
    const isLink = [$isLinkNode, $isAutoLinkNode].some((check) => $findMatchingParent(node, check));
    setIsLink(isLink);
  });

  return [isLink, isDisabled] as const;
}

export function useSelectionChange(
  handler: (selection: ReturnType<typeof $getSelection>) => void,
  priority: CommandListenerPriority = COMMAND_PRIORITY_HIGH
) {
  const [editor] = useLexicalComposerContext();
  const handlerRef = useLatest(handler);

  useEffect(() => {
    const $callback = () => {
      const selection = $getSelection();
      handlerRef.current?.(selection);
    };
    editor.getEditorState().read($callback);
    return mergeRegister(
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $callback();
          return false;
        },
        priority
      )
    );
  }, [editor, priority, handlerRef]);
}

export function useEditorStateChange(onChange: () => void) {
  const [editor] = useLexicalComposerContext();
  const handlerRef = useLatest(onChange);

  useEffect(() => {
    editor.getEditorState().read(handlerRef.current);
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(handlerRef.current);
      })
    );
  }, [editor, handlerRef]);
}
