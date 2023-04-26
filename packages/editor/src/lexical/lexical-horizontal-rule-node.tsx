import {
  $applyNodeReplacement,
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  type LexicalCommand,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
} from 'lexical';

import { createEffect, type JSX, onCleanup } from 'solid-js';

import { createCommand, DecoratorNode } from 'lexical';
import { useLexicalComposerContext } from './lexical-composer-context';
import { useLexicalNodeSelection } from './use-lexical-node-selection';
import { mergeRegister } from '@lexical/utils';

export type SerializedHorizontalRuleNode = SerializedLexicalNode & {
  type: 'horizontalrule';
  version: 1;
};

export const INSERT_HORIZONTAL_RULE_COMMAND: LexicalCommand<void> = createCommand('INSERT_HORIZONTAL_RULE_COMMAND');

function HorizontalRuleComponent(props: { nodeKey: NodeKey }) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(props.nodeKey);

  const onDelete = (payload: KeyboardEvent) => {
    if (!props.nodeKey) return false;
    if (isSelected() && $isNodeSelection($getSelection())) {
      const event: KeyboardEvent = payload;
      event.preventDefault();
      const node = $getNodeByKey(props.nodeKey);
      if ($isHorizontalRuleNode(node)) {
        node.remove();
      }
      setSelected(false);
    }
    return false;
  };

  createEffect(() => {
    onCleanup(
      mergeRegister(
        editor.registerCommand(
          CLICK_COMMAND,
          (event: MouseEvent) => {
            const hrElem = editor.getElementByKey(props.nodeKey);

            if (event.target === hrElem) {
              if (!event.shiftKey) {
                clearSelection();
              }
              setSelected(!isSelected);
              return true;
            }

            return false;
          },
          COMMAND_PRIORITY_LOW
        ),
        editor.registerCommand(KEY_DELETE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
        editor.registerCommand(KEY_BACKSPACE_COMMAND, onDelete, COMMAND_PRIORITY_LOW)
      )
    );
  });

  createEffect(() => {
    const hrElem = editor.getElementByKey(props.nodeKey);
    if (hrElem !== null) {
      hrElem.className = isSelected() ? 'selected' : '';
    }
  });

  return null;
}

export class HorizontalRuleNode extends DecoratorNode<JSX.Element> {
  static getType(): string {
    return 'horizontalrule';
  }

  static clone(node: HorizontalRuleNode): HorizontalRuleNode {
    return new HorizontalRuleNode(node.__key);
  }

  static importJSON(serializedNode: SerializedHorizontalRuleNode): HorizontalRuleNode {
    return $createHorizontalRuleNode();
  }

  static importDOM(): DOMConversionMap | null {
    return {
      hr: () => ({
        conversion: convertHorizontalRuleElement,
        priority: 0,
      }),
    };
  }

  exportJSON(): SerializedLexicalNode {
    return {
      type: 'horizontalrule',
      version: 1,
    };
  }

  exportDOM(): DOMExportOutput {
    return { element: document.createElement('hr') };
  }

  createDOM(): HTMLElement {
    return document.createElement('hr');
  }

  getTextContent(): string {
    return '\n';
  }

  isInline(): false {
    return false;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(): JSX.Element {
    return <HorizontalRuleComponent nodeKey={this.__key} />;
  }
}

function convertHorizontalRuleElement(): DOMConversionOutput {
  return { node: $createHorizontalRuleNode() };
}

export function $createHorizontalRuleNode(): HorizontalRuleNode {
  return $applyNodeReplacement(new HorizontalRuleNode());
}

export function $isHorizontalRuleNode(node: LexicalNode | undefined | null): node is LexicalNode {
  return node instanceof HorizontalRuleNode;
}
