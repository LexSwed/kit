import { useEffect, useState } from "react";
import { $isCodeHighlightNode } from "@lexical/code";
import {
  $isAutoLinkNode,
  $isLinkNode,
  AutoLinkNode,
  LinkNode,
  TOGGLE_LINK_COMMAND,
} from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext.js";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_HIGH,
  type CommandListenerPriority,
  type LexicalEditor,
  SELECTION_CHANGE_COMMAND,
  TextNode,
} from "lexical";

import { useLatest } from "@fxtrot/ui";

import { getSelectedNode } from "../../utils/getSelectedNode.tsx";

export async function getSelection(editor: LexicalEditor) {
  // copied from Lexical Playground code
  if (editor.isComposing()) {
    return null;
  }
  return new Promise<null | { range: Range; collapsed: boolean }>((resolve) => {
    editor.update(() => {
      const selection = $getSelection();

      if (
        !$isRangeSelection(selection) ||
        $isCodeHighlightNode(selection.anchor.getNode())
      ) {
        return resolve(null);
      }

      const nativeSelection = window.getSelection();
      const rootElement = editor.getRootElement();
      if (
        nativeSelection === null ||
        rootElement === null ||
        !rootElement.contains(nativeSelection.anchorNode)
      ) {
        return resolve(null);
      }

      const linkNode = $getLinkSelection();
      const isCollapsed = selection.isCollapsed();

      if (linkNode) {
        const link = editor.getElementByKey(linkNode.getKey());
        if (link) {
          const range = new Range();
          range.setStartBefore(link);
          range.setEndAfter(link);
          return resolve({ range: range, collapsed: isCollapsed });
        }
      }

      const range = nativeSelection.getRangeAt(0);
      if (isCollapsed) {
        return resolve(null);
      } else {
        return resolve({ range: range, collapsed: false });
      }
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
      // enforce focusing for and waiting for selection change event to be emitted
      // lexical ignores selection change if the editor is not focused
      // editor.focus(() => {
      //   requestAnimationFrame(resolve);
      // });
    });
  });
}

export async function getLinkDetails(editor: LexicalEditor) {
  return new Promise<{ link: string; text: string }>((resolve) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      const linkNode = $getLinkSelection();
      if (!linkNode) return resolve({ link: "", text: "" });
      let text = "";
      const textNodes = linkNode.getAllTextNodes();

      const textNode: TextNode | null =
        textNodes.length === 1 ? textNodes.at(0) : null;
      if (textNode) {
        text = textNode.getTextContent();
      }

      resolve({
        link: linkNode ? linkNode.getURL() : "",
        text,
        // text: JSON.stringify(
        //   selection.getNodes().map((node) => node..exportJSON())
        // ),
      });
    });
  });
}

export function updateSelectedLink(
  editor: LexicalEditor,
  { text, link }: { text: string; link: string }
) {
  if (text) {
    editor.update(() => {
      const linkNode = $getLinkSelection();
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

export function $getLinkSelection(): LinkNode | AutoLinkNode | null {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) {
    return null;
  }
  const selectedNode = selection.getNodes().at(0);
  if (!selectedNode) return null;

  const linkNode =
    $findMatchingParent(selectedNode, $isLinkNode) ||
    $findMatchingParent(selectedNode, $isAutoLinkNode);

  return linkNode ? (linkNode as any) : null;
}

export function isSelectionCollapsed() {
  const nativeSelection = window.getSelection();
  if (!nativeSelection) return false;
  return nativeSelection.isCollapsed;
}

export function useIsLinkSelected() {
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
    const isLink = [$isLinkNode, $isAutoLinkNode].some((check) =>
      $findMatchingParent(node, check)
    );
    if (isLink) {
      setIsLink(true);
    } else {
      setIsLink(false);
    }
  });

  return [isLink, isDisabled] as const;
}

export function useSelectionChange(
  handler: () => void,
  priority: CommandListenerPriority = COMMAND_PRIORITY_HIGH
) {
  const [editor] = useLexicalComposerContext();
  const handlerRef = useLatest(handler);

  useEffect(() => {
    editor.getEditorState().read(handlerRef.current);
    return mergeRegister(
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          handlerRef.current?.();
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
