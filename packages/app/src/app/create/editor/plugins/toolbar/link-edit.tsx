import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ToggleGroup } from './toggle-group';
import { Button, Icon, TextField, ToggleButton } from '@fxtrot/ui';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { COMMAND_PRIORITY_CRITICAL, KEY_ESCAPE_COMMAND } from 'lexical';
import { RxLink2, RxLinkBreak2 } from 'react-icons/rx';
import { mergeRegister } from '@lexical/utils';

import { t } from 'shared';
import { useActorRef, useReferenceNode, useSelector } from './state';
import { EditorPopover } from '../../lib/editor-popover';
import { $isSelectionOnLinkNodeOnly, selectLinkAndGetTheDetails, updateSelectedLink } from './utils';

export const LinkEdit = () => {
  const [editor] = useLexicalComposerContext();

  const [isLink, setIsLink] = useState(false);
  const selection = useSelector((state) => state.context.selection);
  const isLinkEditOpen = useSelector((state) =>
    state.matches({
      toolbar: { openState: 'linkEditShown' },
    })
  );
  const actor = useActorRef();
  const [initialValues, setInitialValues] = useState<{ text: string; link: string } | null>();

  const updateLink = async () => {
    if (isLinkEditOpen) {
      setInitialValues(null);
      return actor.send('cancel link edit');
    } else {
      const details = await selectLinkAndGetTheDetails(editor);
      actor.send('edit link');
      setInitialValues(details);
    }
  };

  useEffect(() => {
    if (!selection) return;

    editor.getEditorState().read(() => {
      const linkNode = $isSelectionOnLinkNodeOnly();
      setIsLink(linkNode ? true : false);
    });
  }, [editor, selection]);

  return (
    <>
      <ToggleGroup>
        <ToggleButton pressed={isLink} onClick={updateLink} size="sm">
          <Icon size="sm" as={RxLink2} />
          {t('Link')}
        </ToggleButton>
      </ToggleGroup>

      {isLinkEditOpen && initialValues && <LinkEditPopup initialValues={initialValues} />}
    </>
  );
};

interface LinkEditPopupProps {
  initialValues: {
    text: string;
    link: string;
  };
}

export const LinkEditPopup = ({ initialValues }: LinkEditPopupProps) => {
  const [editor] = useLexicalComposerContext();
  const actor = useActorRef();
  const selectedNode = useReferenceNode();

  const close = useCallback(() => {
    actor.send('cancel link edit');
  }, [actor]);
  const removeLink = () => {
    // text changed -> so toolbar position will be recalculated
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    close();
  };

  const saveLink = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (form.get('text') as string) || '';
    const link = (form.get('link') as string) || '';
    updateSelectedLink(editor, { text, link });
  };

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          close();
          return true;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [close, editor]);

  return (
    <EditorPopover isOpen={!!initialValues} placement="bottom-start" reference={selectedNode}>
      <form className="col-span-full row-start-2 flex flex-col gap-2 p-2" onSubmit={saveLink}>
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
          <Button size="sm" onClick={close}>
            Cancel
          </Button>
          <Button size="sm" type="submit" variant="tonal">
            Save
          </Button>
        </div>
      </form>
    </EditorPopover>
  );
};
