import { useCallback, useEffect, useState } from 'react';
import { ToggleGroup } from './toggle-group';
import { Button, Icon, PopoverBox, TextField, ToggleButton } from '@fxtrot/ui';
import { TOGGLE_LINK_COMMAND, $isLinkNode } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import { $getSelection, $isRangeSelection, ElementNode, TextNode } from 'lexical';
import { RxLink2, RxLinkBreak2 } from 'react-icons/rx';
import { useFloating, offset, flip, shift, inline, type Placement } from '@floating-ui/react';

import { getSelectedNode } from '../../utils/getSelectedNode';

import { t } from 'shared';
interface Props {
  onEditLink: () => void;
}

export const LinkEdit = ({ onEditLink }: Props) => {
  const [editor] = useLexicalComposerContext();
  const [isLink, setIsLink] = useState(false);

  const updateLinkFormat = useCallback(() => {
    const selection = $getSelection();

    if (!$isRangeSelection(selection)) {
      return;
    }
    const node = getSelectedNode(selection);
    const parent = node.getParent();

    if ($isLinkNode(node) || $isLinkNode(parent)) {
      setIsLink(true);
    } else {
      setIsLink(false);
    }
  }, []);

  useEffect(() => {
    // get initial values
    editor.getEditorState().read(updateLinkFormat);
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(updateLinkFormat);
      })
    );
  }, [editor, updateLinkFormat]);

  return (
    <ToggleGroup>
      <ToggleButton pressed={isLink} onClick={onEditLink} size="sm">
        <Icon size="sm" as={RxLink2} />
        {t('Link')}
      </ToggleButton>
    </ToggleGroup>
  );
};

interface LinkEditPopupProps {
  onClose: () => void;
  node: TextNode | ElementNode;
  initialValues: {
    text: string;
    link: string;
  } | null;
}

export const LinkEditPopup = ({ onClose, initialValues, node }: LinkEditPopupProps) => {
  const [editor] = useLexicalComposerContext();

  const { x, y, strategy, refs, context } = useFloating({
    placement: 'bottom-start',
    middleware: [
      inline(),
      offset({ mainAxis: 8, crossAxis: -32 }),
      flip({
        crossAxis: false,
      }),
      shift(),
    ],
  });
  const [side, align] = getSideAndAlignFromPlacement(context.placement);

  const removeLink = () => {
    // text changed -> so toolbar position will be recalculated
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    onClose();
  };
  const saveLink = (text: string, link: string) => {
    editor.update(() => {
      node.setTextContent(text);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, link);

      const selection = $getSelection();

      if (!$isRangeSelection(selection)) {
        return;
      }

      const updatedNode = getSelectedNode(selection).getParent();

      if ($isLinkNode(updatedNode)) {
        const textNodes = updatedNode.getAllTextNodes();

        const firstTextNode = textNodes[0];
        const lastTextNode = textNodes[textNodes.length - 1];

        selection.setTextNodeRange(firstTextNode, 0, lastTextNode, lastTextNode.getTextContentSize());
      }

      onClose();
    });
  };

  useEffect(() => {
    const link = editor.getElementByKey(node.getKey());
    refs.setReference(link);
  }, [editor, node, refs]);

  return (
    <PopoverBox
      data-align={align}
      data-side={side}
      ref={refs.setFloating}
      data-state={'open'}
      style={{
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
        width: 'max-content',
      }}
    >
      <form
        className="col-span-full row-start-2 flex flex-col gap-2 p-2"
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          const text = (form.get('text') as string) || '';
          const link = (form.get('link') as string) || '';
          saveLink(text, link);
        }}
      >
        <TextField size="sm" placeholder="Text" name="text" label={t('Text')} defaultValue={initialValues?.text} />
        <TextField
          size="sm"
          placeholder="https://example.com"
          name="link"
          type="url"
          label={t('Link')}
          defaultValue={initialValues?.link}
        />
        <div className="flex flex-row justify-end gap-2 pt-1">
          <Button size="sm" intent="danger" onClick={removeLink} className="mr-4">
            <Icon as={RxLinkBreak2} aria-hidden />
            Remove
          </Button>
          <Button size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" type="submit" variant="tonal">
            Save
          </Button>
        </div>
      </form>
    </PopoverBox>
  );
};
function getSideAndAlignFromPlacement(placement: Placement) {
  const [side, align = 'center'] = placement.split('-');
  return [side, align] as const;
}
