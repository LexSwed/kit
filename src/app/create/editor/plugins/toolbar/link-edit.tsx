import { useCallback, useEffect, useState } from 'react';
import { ToggleGroup } from './toggle-group';
import { Button, Icon, PopoverBox, Text, TextField, ToggleButton } from '@fxtrot/ui';
import { TOGGLE_LINK_COMMAND, $isLinkNode } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent, isHTMLAnchorElement, mergeRegister } from '@lexical/utils';
import * as RdxPresence from '@radix-ui/react-presence';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  KEY_ESCAPE_COMMAND,
  SELECTION_CHANGE_COMMAND,
  type RangeSelection,
} from 'lexical';
import { RxLink2, RxLinkBreak2 } from 'react-icons/rx';
import { useFloating, offset, flip, shift, inline, type Placement } from '@floating-ui/react';

import { getSelectedNode } from '../../utils/getSelectedNode';

import { t } from '~/utils/translation';
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
  open: boolean;
  onClose: () => void;
  initialValues: {
    text: string;
    link: string;
  } | null;
}

export const LinkEditPopup = ({ open, onClose, initialValues }: LinkEditPopupProps) => {
  const [editor] = useLexicalComposerContext();

  const { x, y, strategy, refs, context } = useFloating({
    open,
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
      const selection = $getSelection();

      if (!$isRangeSelection(selection)) {
        return;
      }
      const node = getSelectedNode(selection);
      node.setTextContent(text);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, link);
      onClose();
    });
  };

  useEffect(() => {
    return mergeRegister(
      // editor.registerUpdateListener(({editorState}) => {
      //   editorState.read(() => {
      //     updateLinkEditor();
      //   });
      // }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          const selection = $getSelection();

          if (!$isRangeSelection(selection)) {
            return false;
          }

          const node = getSelectedNode(selection);
          const linkParent = $findMatchingParent(node, $isLinkNode);

          if (linkParent !== null) {
            const link = editor.getElementByKey(linkParent.getKey());
            if (link && isHTMLAnchorElement(link)) {
              refs.setPositionReference(null);
              refs.setReference(link);
              return false;
            }
          }
          refs.setPositionReference(null);
          refs.setReference(null);
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
      // editor.registerCommand(
      //   KEY_ESCAPE_COMMAND,
      //   () => {
      //     if (isLink) {
      //       setIsLink(false);
      //       return true;
      //     }
      //     return false;
      //   },
      //   COMMAND_PRIORITY_HIGH,
      // ),
    );
  }, [editor, refs]);

  return (
    <RdxPresence.Presence present={open}>
      <PopoverBox
        data-align={align}
        data-side={side}
        ref={refs.setFloating}
        data-state={open ? 'open' : 'closed'}
        style={{
          position: strategy,
          top: y ?? 0,
          left: x ?? 0,
          width: 'max-content',
        }}
      >
        {initialValues && (
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
        )}
      </PopoverBox>
    </RdxPresence.Presence>
  );
};
function getSideAndAlignFromPlacement(placement: Placement) {
  const [side, align = 'center'] = placement.split('-');
  return [side, align] as const;
}
