import { $isCodeHighlightNode } from '@lexical/code';
import { $isLinkNode, LinkNode } from '@lexical/link';
import { $getSelection, $isRangeSelection, type LexicalEditor } from 'lexical';

export async function getSelection(editor: LexicalEditor) {
  // Should not to pop up the floating toolbar when using IME input
  if (editor.isComposing()) {
    return null;
  }
  return new Promise<null | Range>((resolve) => {
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

      const linkNode = $isSelectionOnLinkNodeOnly();

      if (!nativeSelection.isCollapsed || linkNode) {
        const selection = nativeSelection.getRangeAt(0);
        return resolve(selection);
      }
      return resolve(null);
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
      const linkNode = $isSelectionOnLinkNodeOnly();

      if (linkNode) {
        const textNodes = linkNode.getAllTextNodes();
        const firstTextNode = textNodes.at(0);
        const lastTextNode = textNodes.at(-1);

        if (firstTextNode && lastTextNode) {
          selection.setTextNodeRange(firstTextNode, 0, lastTextNode, lastTextNode.getTextContentSize());
        }

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

export function $isSelectionOnLinkNodeOnly() {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) {
    return false;
  }
  const nodes = selection.getNodes();
  const linkNode =
    nodes.length === 1 ? [nodes[0], nodes[0].getParent()].find((node): node is LinkNode => $isLinkNode(node)) : null;

  return linkNode ? linkNode : null;
}

export function isRange(element: HTMLElement | Range | null): element is Range {
  return element instanceof Range;
}

export function isElement(element: HTMLElement | Range | null): element is HTMLElement {
  return element instanceof HTMLElement;
}

export function isSelectionCollapsed() {
  const nativeSelection = window.getSelection();
  if (!nativeSelection) return false;
  return nativeSelection.isCollapsed;
}
