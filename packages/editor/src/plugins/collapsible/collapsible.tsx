import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent, $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils';
import {
  $createParagraphNode,
  $getPreviousSelection,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DELETE_CHARACTER_COMMAND,
  ElementNode,
  INSERT_PARAGRAPH_COMMAND,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_LEFT_COMMAND,
  KEY_ARROW_RIGHT_COMMAND,
  KEY_ARROW_UP_COMMAND,
  type LexicalNode,
  type NodeKey,
  TextNode,
} from 'lexical';

import {
  $createCollapsibleContainerNode,
  $isCollapsibleContainerNode,
  CollapsibleContainerNode,
} from './nodes/container';
import { $createCollapsibleContentNode, $isCollapsibleContentNode, CollapsibleContentNode } from './nodes/content';
import { $createCollapsibleTitleNode, $isCollapsibleTitleNode, CollapsibleTitleNode } from './nodes/title';

export const INSERT_COLLAPSIBLE_COMMAND = createCommand<void>();
export const TOGGLE_COLLAPSIBLE_COMMAND = createCommand<NodeKey>();

export const CollapsiblePlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([CollapsibleContainerNode, CollapsibleTitleNode, CollapsibleContentNode])) {
      throw new Error(
        'CollapsiblePlugin: CollapsibleContainerNode, CollapsibleTitleNode, or CollapsibleContentNode not registered on editor'
      );
    }

    const onArrowNavigationAbove = (): boolean => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) && selection.isCollapsed() && selection.anchor.offset === 0) {
        const container = $findMatchingParent(selection.anchor.getNode(), $isCollapsibleContainerNode);

        if ($isCollapsibleContainerNode(container)) {
          const parent = container.getParent<ElementNode>();
          if (
            parent !== null &&
            parent.getFirstChild<LexicalNode>() === container &&
            selection.anchor.key === container.getFirstDescendant<LexicalNode>()?.getKey()
          ) {
            container.insertBefore($createParagraphNode());
          }
        }
      }

      return false;
    };

    const onArrowNavigationBelow = (): boolean => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) && selection.isCollapsed()) {
        const anchorNode: LexicalNode = selection.anchor.getNode();
        const container = $findMatchingParent(anchorNode, $isCollapsibleContainerNode);

        if (!$isCollapsibleContainerNode(container)) return false;
        const parent = container.getParent<ElementNode>();
        if (parent === null || parent.getLastChild<LexicalNode>() !== container) return false;

        let lastDescendant: null | LexicalNode;
        if (container.getOpen()) {
          lastDescendant = container.getLastDescendant<LexicalNode>();
        } else {
          lastDescendant = container.getFirstChild();
        }
        if (lastDescendant === null) return false;

        if (selection.anchor.offset === lastDescendant.getTextContentSize()) {
          container.insertAfter($createParagraphNode());
        }
      }

      return false;
    };

    return mergeRegister(
      // Structure enforcing transformers for each node type. In case nesting structure is not
      // "Container > Title + Content" it'll unwrap nodes and convert it back
      // to regular content.
      editor.registerNodeTransform(CollapsibleContentNode, (node) => {
        const parent = node.getParent<ElementNode>();
        if (!$isCollapsibleContainerNode(parent)) {
          const children = node.getChildren<LexicalNode>();
          for (const child of children) {
            node.insertBefore(child);
          }
          node.remove();
        }
      }),

      editor.registerNodeTransform(CollapsibleTitleNode, (node) => {
        const parent = node.getParent<ElementNode>();
        if (!$isCollapsibleContainerNode(parent)) {
          node.replace($createParagraphNode().append(...node.getChildren<LexicalNode>()));
          return;
        }
      }),

      editor.registerNodeTransform(CollapsibleContainerNode, (node) => {
        const children = node.getChildren<LexicalNode>();
        if (children.length !== 2 || !$isCollapsibleTitleNode(children[0]) || !$isCollapsibleContentNode(children[1])) {
          for (const child of children) {
            node.insertBefore(child);
          }
          node.remove();
        }
      }),

      // This handles the case when container is collapsed and we delete its previous sibling
      // into it, it would cause collapsed content deleted (since it's display: none, and selection
      // swallows it when deletes single char). Instead, we move the cursor to title node.
      editor.registerCommand(
        DELETE_CHARACTER_COMMAND,
        () => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection) || !selection.isCollapsed() || selection.anchor.offset !== 0) {
            return false;
          }

          // current paragraph or node that gets deleted
          const anchorNode: ElementNode = selection.anchor.getNode();
          const topLevelElement: ElementNode = anchorNode.getTopLevelElement();
          if (topLevelElement === null) {
            return false;
          }

          // collapsible container
          const container = topLevelElement.getPreviousSibling<LexicalNode>();
          if (!$isCollapsibleContainerNode(container) || container.getOpen()) {
            return false;
          }
          container.setOpen(true);
          const lastTextNode: TextNode = container.getAllTextNodes().at(-1);
          const lastTextNodeLength = lastTextNode.getTextContentSize();
          selection.setTextNodeRange(lastTextNode, lastTextNodeLength, lastTextNode, lastTextNodeLength);
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),

      // When collapsible is the last child pressing down/right arrow will insert paragraph
      // below it to allow adding more content. It's similar what $insertBlockNode
      // (mainly for decorators), except it'll always be possible to continue adding
      // new content even if trailing paragraph is accidentally deleted
      editor.registerCommand(KEY_ARROW_DOWN_COMMAND, onArrowNavigationBelow, COMMAND_PRIORITY_LOW),

      editor.registerCommand(KEY_ARROW_RIGHT_COMMAND, onArrowNavigationBelow, COMMAND_PRIORITY_LOW),

      // When collapsible is the first child pressing up/left arrow will insert paragraph
      // above it to allow adding more content. It's similar what $insertBlockNode
      // (mainly for decorators), except it'll always be possible to continue adding
      // new content even if leading paragraph is accidentally deleted
      editor.registerCommand(KEY_ARROW_UP_COMMAND, onArrowNavigationAbove, COMMAND_PRIORITY_LOW),

      editor.registerCommand(KEY_ARROW_LEFT_COMMAND, onArrowNavigationAbove, COMMAND_PRIORITY_LOW),

      // Handling CMD+Enter to toggle collapsible element collapsed state
      editor.registerCommand(
        INSERT_PARAGRAPH_COMMAND,
        () => {
          const selection = $getPreviousSelection();
          if ($isRangeSelection(selection) && selection.isCollapsed()) {
            const parent = $findMatchingParent(
              selection.anchor.getNode(),
              (node) => $isElementNode(node) && !node.isInline()
            );

            if ($isCollapsibleTitleNode(parent)) {
              const container = parent.getParent<ElementNode>();
              if ($isCollapsibleContainerNode(container)) {
                container.toggleOpen();
                $setSelection(selection.clone());
                return true;
              }
            }
          }

          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        INSERT_COLLAPSIBLE_COMMAND,
        () => {
          editor.update(() => {
            const title = $createCollapsibleTitleNode();
            $insertNodeToNearestRoot(
              $createCollapsibleContainerNode(true).append(
                title,
                $createCollapsibleContentNode().append($createParagraphNode())
              )
            );
            title.select();
          });
          return true;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor]);

  return null;
};
