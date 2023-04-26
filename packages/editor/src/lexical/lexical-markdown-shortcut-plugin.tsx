import { type ElementTransformer, registerMarkdownShortcuts, type Transformer, TRANSFORMERS } from '@lexical/markdown';
import type { LexicalNode } from 'lexical';

import { useLexicalComposerContext } from './lexical-composer-context';

import { $createHorizontalRuleNode, $isHorizontalRuleNode, HorizontalRuleNode } from './lexical-horizontal-rule-node';
import { createEffect, mergeProps, onCleanup } from 'solid-js';

const HR: ElementTransformer = {
  dependencies: [HorizontalRuleNode],
  export: (node: LexicalNode) => {
    return $isHorizontalRuleNode(node) ? '***' : null;
  },
  regExp: /^(---|\*\*\*|___)\s?$/,
  replace: (parentNode, _1, _2, isImport) => {
    const line = $createHorizontalRuleNode();

    // TODO: Get rid of isImport flag
    if (isImport || parentNode.getNextSibling() != null) {
      parentNode.replace(line);
    } else {
      parentNode.insertBefore(line);
    }

    line.selectNext();
  },
  type: 'element',
};

export const DEFAULT_TRANSFORMERS = [HR, ...TRANSFORMERS];

export function LexicalMarkdownShortcutPlugin(props: Readonly<{ transformers?: Transformer[] }>): null {
  const mergedProps = mergeProps(props, { transformers: DEFAULT_TRANSFORMERS });
  const [editor] = useLexicalComposerContext();
  createEffect(() => {
    const cleanup = registerMarkdownShortcuts(editor, mergedProps.transformers);
    onCleanup(cleanup);
  });
  return null;
}
