import { useCallback, useMemo, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { TextNode } from "lexical";

import { Icon, ListItem } from "@fxtrot/ui";

import {
  BulletedList,
  CheckList,
  Code,
  Collapsible,
  Divider,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  NumberedList,
  Paragraph,
  Quote,
} from "../../lib/blocks";
import { EditorPopover } from "../../lib/editor-popover";

function search(original: string, query: string) {
  return original.toLowerCase().includes(query.toLowerCase());
}

export const ComponentPickerMenuPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  });

  const options = useMemo(() => {
    return queryString
      ? baseOptions.filter((menuOption) => {
          const block = blocks[menuOption.key as keyof typeof blocks];
          return search(block.title, queryString) || block.keywords != null
            ? block.keywords.some((keyword) => search(keyword, queryString))
            : false;
        })
      : baseOptions;
  }, [queryString]);

  const onSelectOption = useCallback(
    (
      selectedOption: MenuOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
    ) => {
      const block = blocks[selectedOption.key as keyof typeof blocks];
      editor.update(() => {
        if (nodeToRemove) {
          nodeToRemove.remove();
        }
        block.onSelect(editor);
        closeMenu();
      });
    },
    [editor],
  );

  return (
    <>
      <LexicalTypeaheadMenuPlugin<MenuOption>
        onQueryChange={setQueryString}
        onSelectOption={onSelectOption}
        triggerFn={checkForTriggerMatch}
        options={options}
        menuRenderFn={(
          anchorElementRef,
          { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
        ) =>
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
  option: MenuOption;
}) {
  const block = blocks[option.key as keyof typeof blocks];
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
      <Icon as={block.icon} />
      {block.title}
    </ListItem>
  );
}

const blocks = {
  Paragraph,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  NumberedList,
  BulletedList,
  CheckList,
  Quote,
  Code,
  Divider,
  Collapsible,
} as const;
const baseOptions = Object.keys(blocks).map((key) => new MenuOption(key));
