import { useCallback, useEffect, useState } from 'react';
import { ToggleGroup } from './toggle-group';
import { Button, Icon, Text, TextField, ToggleButton } from '@fxtrot/ui';
import { TOGGLE_LINK_COMMAND, $isLinkNode } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import { $createRangeSelection, $getSelection, $isRangeSelection } from 'lexical';
import { RxLink2, RxLinkBreak2 } from 'react-icons/rx';
import { t } from '~/utils/translation';
import { getSelectedNode } from '../../utils/getSelectedNode';

interface Props {
  onEditChange: () => void;
}

export const LinkEdit = ({ onEditChange }: Props) => {
  const [editor] = useLexicalComposerContext();
  const [linkDetails, setLinkDetails] = useState<null | { text: string; link: string }>(null);

  const [isLink, setIsLink] = useState(false);

  const cancelEdit = () => {
    setLinkDetails(null);
    onEditChange();
  };

  const updateLink = () => {
    editor.update(() => {
      if (linkDetails) {
        return cancelEdit();
      }
      const selection = $getSelection();

      if (!$isRangeSelection(selection)) {
        return;
      }
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      const linkNode = $isLinkNode(node) ? node : $isLinkNode(parent) ? parent : null;

      if (linkNode) {
        const textNodes = linkNode.getAllTextNodes();

        const firstTextNode = textNodes[0];
        const lastTextNode = textNodes[textNodes.length - 1];

        selection.setTextNodeRange(firstTextNode, 0, lastTextNode, lastTextNode.getTextContentSize());

        setLinkDetails({
          link: linkNode.getURL(),
          text: linkNode.getTextContent(),
        });
      } else {
        setLinkDetails({
          link: '',
          text: selection.getTextContent(),
        });
      }
      onEditChange();
    });
  };

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

  const removeLink = () => {
    // text changed -> so toolbar position will be recalculated
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    setLinkDetails(null);
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
      cancelEdit();
    });
  };

  return (
    <>
      <ToggleGroup>
        <ToggleButton pressed={isLink} onPressedChange={updateLink} size="sm">
          <Icon size="sm" as={RxLink2} />
          {t('Link')}
        </ToggleButton>
      </ToggleGroup>
      {linkDetails && (
        <LinkEditForm
          text={linkDetails.text}
          link={linkDetails.link}
          onSave={saveLink}
          onCancel={cancelEdit}
          onRemove={removeLink}
        />
      )}
    </>
  );
};

interface LinkEditFormProps {
  text?: string;
  link?: string;
  onSave: (text: string, link: string) => void;
  onCancel: () => void;
  onRemove: () => void;
}

const LinkEditForm = ({ text, link, onSave, onCancel, onRemove }: LinkEditFormProps) => {
  return (
    <form
      className="col-span-full row-start-2 flex flex-col gap-2 p-2"
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const text = (form.get('text') as string) || '';
        const link = (form.get('link') as string) || '';
        onSave(text, link);
      }}
    >
      <TextField size="sm" placeholder="Text" name="text" label="Text" defaultValue={text} />
      <TextField size="sm" placeholder="https://example.com" name="link" defaultValue={link} label="Link" />
      <div className="flex flex-row justify-end gap-2 pt-1">
        <Button size="sm" intent="danger" onClick={onRemove} className="mr-4">
          <Icon as={RxLinkBreak2} aria-hidden />
          Remove
        </Button>
        <Button size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" type="submit" variant="tonal">
          Save
        </Button>
      </div>
    </form>
  );
};
