import { type ElementType, useCallback, useMemo, useState } from 'react';
import {
  PiCaretUpDownDuotone,
  PiCheckSquareDuotone,
  PiCodeBlockDuotone,
  PiListBulletsDuotone,
  PiListNumbersDuotone,
  PiQuotesDuotone,
  PiTextHOneDuotone,
  PiTextHThreeDuotone,
  PiTextHTwoDuotone,
  PiTextTDuotone,
} from 'react-icons/pi';
import { RxDividerHorizontal } from 'react-icons/rx';
import { $createCodeNode } from '@lexical/code';
import { INSERT_CHECK_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { $createParagraphNode, $getSelection, $isRangeSelection, TextNode } from 'lexical';

import { Icon, ListItem } from '@fxtrot/ui';

import { EditorPopover } from '../../lib/editor-popover';
import { INSERT_COLLAPSIBLE_COMMAND } from '../collapsible/collapsible';

class ComponentPickerOption extends MenuOption {
  // What shows up in the editor
  title: string;
  // Icon for display
  icon?: ElementType;
  // For extra searching.
  keywords: Array<string>;
  // What happens when you select this option?
  onSelect: (queryString: string) => void;

  constructor(
    title: string,
    options: {
      icon?: ElementType;
      keywords?: Array<string>;
      onSelect: (queryString: string) => void;
    }
  ) {
    super(title);
    this.title = title;
    this.keywords = options.keywords || [];
    this.icon = options.icon;
    this.onSelect = options.onSelect.bind(this);
  }
}

const headingIcons = {
  1: PiTextHOneDuotone,
  2: PiTextHTwoDuotone,
  3: PiTextHThreeDuotone,
} as const;

export const ComponentPickerMenuPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch('/', {
    minLength: 0,
  });

  const options = useMemo(() => {
    const baseOptions = [
      new ComponentPickerOption('Paragraph', {
        icon: PiTextTDuotone,
        keywords: ['normal', 'paragraph', 'p', 'text'],
        onSelect: () =>
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createParagraphNode());
            }
          }),
      }),
      ...Array.from({ length: 3 }, (_, i) => i + 1).map(
        (n) =>
          new ComponentPickerOption(`Heading ${n}`, {
            icon: headingIcons[n as keyof typeof headingIcons],
            keywords: ['heading', 'header', `h${n}`],
            onSelect: () =>
              editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                  $setBlocksType(selection, () =>
                    // @ts-expect-error Correct types, but since they're dynamic TS doesn't like it.
                    $createHeadingNode(`h${n}`)
                  );
                }
              }),
          })
      ),
      new ComponentPickerOption('Numbered List', {
        icon: PiListNumbersDuotone,
        keywords: ['numbered list', 'ordered list', 'ol'],
        onSelect: () => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined),
      }),
      new ComponentPickerOption('Bulleted List', {
        icon: PiListBulletsDuotone,
        keywords: ['bulleted list', 'unordered list', 'ul'],
        onSelect: () => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined),
      }),
      new ComponentPickerOption('Check List', {
        icon: PiCheckSquareDuotone,
        keywords: ['check list', 'todo list'],
        onSelect: () => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined),
      }),
      new ComponentPickerOption('Quote', {
        icon: PiQuotesDuotone,
        keywords: ['block quote'],
        onSelect: () =>
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createQuoteNode());
            }
          }),
      }),
      new ComponentPickerOption('Code', {
        icon: PiCodeBlockDuotone,
        keywords: ['javascript', 'python', 'js', 'codeblock'],
        onSelect: () =>
          editor.update(() => {
            const selection = $getSelection();

            if ($isRangeSelection(selection)) {
              if (selection.isCollapsed()) {
                $setBlocksType(selection, () => $createCodeNode());
              } else {
                // Will this ever happen?
                const textContent = selection.getTextContent();
                const codeNode = $createCodeNode();
                selection.insertNodes([codeNode]);
                selection.insertRawText(textContent);
              }
            }
          }),
      }),
      new ComponentPickerOption('Divider', {
        icon: RxDividerHorizontal,
        keywords: ['horizontal rule', 'divider', 'hr'],
        onSelect: () => editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined),
      }),
      new ComponentPickerOption('Collapsible', {
        icon: PiCaretUpDownDuotone,
        keywords: ['collapse', 'collapsible', 'toggle'],
        onSelect: () => editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined),
      }),
    ];

    return queryString
      ? baseOptions.filter((option) => {
          return new RegExp(queryString, 'gi').exec(option.title) || option.keywords != null
            ? option.keywords.some((keyword) => new RegExp(queryString, 'gi').exec(keyword))
            : false;
        })
      : baseOptions;
  }, [editor, queryString]);

  const onSelectOption = useCallback(
    (
      selectedOption: ComponentPickerOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
      matchingString: string
    ) => {
      editor.update(() => {
        if (nodeToRemove) {
          nodeToRemove.remove();
        }
        selectedOption.onSelect(matchingString);
        closeMenu();
      });
    },
    [editor]
  );

  return (
    <>
      <LexicalTypeaheadMenuPlugin<ComponentPickerOption>
        onQueryChange={setQueryString}
        onSelectOption={onSelectOption}
        triggerFn={checkForTriggerMatch}
        options={options}
        menuRenderFn={(anchorElementRef, { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }) =>
          anchorElementRef.current ? (
            <EditorPopover open reference={anchorElementRef.current}>
              <ul className="contents">
                {options.map((option, i: number) => (
                  <ComponentPickerMenuItem
                    index={i}
                    isSelected={selectedIndex === i}
                    onClick={() => {
                      setHighlightedIndex(i);
                      selectOptionAndCleanUp(option);
                    }}
                    onMouseEnter={() => {
                      setHighlightedIndex(i);
                    }}
                    key={option.key}
                    option={option}
                  />
                ))}
              </ul>
            </EditorPopover>
          ) : null
        }
      />
    </>
  );
};

function ComponentPickerMenuItem({
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: ComponentPickerOption;
}) {
  return (
    <ListItem
      key={option.key}
      tabIndex={-1}
      ref={option.setRefElement}
      role="option"
      aria-selected={isSelected}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      as="li"
    >
      <Icon as={option.icon} />
      <span className="text">{option.title}</span>
    </ListItem>
  );
}
