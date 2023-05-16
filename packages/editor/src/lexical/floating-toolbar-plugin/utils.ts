import { $isCodeHighlightNode } from '@lexical/code';
import { $isLinkNode, LinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $getSelection, $isRangeSelection, type LexicalEditor, type RangeSelection, type ElementNode } from 'lexical';
import { $getSelectedNode } from '../utils';

export async function getSelection(editor: LexicalEditor, includeCollapsed = false) {
  // Should not to pop up the floating toolbar when using IME input
  if (editor.isComposing()) {
    return { selection: null };
  }
  return new Promise<{ selection: null } | { selection: Range; collapsed: boolean }>((resolve) => {
    editor.update(() => {
      const selection = $getSelection();

      if (!$isRangeSelection(selection) || $isCodeHighlightNode(selection.anchor.getNode())) {
        return resolve({ selection: null });
      }

      const nativeSelection = window.getSelection();
      const rootElement = editor.getRootElement();
      if (nativeSelection === null || rootElement === null || !rootElement.contains(nativeSelection.anchorNode)) {
        return resolve({ selection: null });
      }

      if (nativeSelection.isCollapsed && includeCollapsed) {
        const linkNode = $getLinkSelection();
        if (linkNode) {
          const link = editor.getElementByKey(linkNode.getKey());
          if (link) {
            const range = new Range();
            range.setStartBefore(link);
            range.setEndAfter(link);
            return resolve({ selection: range, collapsed: true });
          }
        } else {
          return resolve({ selection: null });
        }
      }

      const range = nativeSelection.getRangeAt(0);
      return resolve({ selection: range, collapsed: false });
    });
  });
}

export async function selectLinkAndGetTheDetails(editor: LexicalEditor) {
  return new Promise<{ link: string; text: string }>((resolve) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) {
        return resolve({
          link: '',
          text: '',
        });
      }
      const linkNode = $getLinkSelection();

      if (linkNode) {
        $selectLink(selection, linkNode);

        const linkDetails = {
          link: linkNode.getURL(),
          text: linkNode.getTextContent(),
        };
        return resolve(linkDetails);
      } else {
        return resolve({
          link: '',
          text: selection.getTextContent(),
        });
      }
    });
  });
}

export function $selectLink(selection: RangeSelection, node: ElementNode | null) {
  if (!node) {
    return null;
  }

  const textNodes = node.getAllTextNodes();

  const firstTextNode = textNodes.at(0);
  const lastTextNode = textNodes.at(-1);

  if (firstTextNode && lastTextNode) {
    selection.setTextNodeRange(firstTextNode, 0, lastTextNode, lastTextNode.getTextContentSize());
  }
}

export function updateSelectedLink(editor: LexicalEditor, { text, link }: { text: string; link: string }) {
  editor.update(() => {
    const node = $getLinkSelection();

    if (!node) return;

    node.setTextContent(text);
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, link);

    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return null;
    const selectedNode = $getSelectedNode(selection).getParent();
    $selectLink(selection, selectedNode);
  });
}

export function $getLinkSelection(): LinkNode | null {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) {
    return null;
  }
  const nodes = selection.getNodes();
  const linkNode = [nodes[0], nodes[0].getParent()].find($isLinkNode);

  return linkNode ? linkNode : null;
}

export function isSelectionCollapsed() {
  const nativeSelection = window.getSelection();
  if (!nativeSelection) return false;
  return nativeSelection.isCollapsed;
}
