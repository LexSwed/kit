import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ToggleGroup } from './toggle-group';
import { Button, Icon, Row, Text, TextField, ToggleButton, Tooltip, useCopyToClipboard } from '@fxtrot/ui';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { COMMAND_PRIORITY_CRITICAL, KEY_ESCAPE_COMMAND } from 'lexical';
import { RxLink2, RxLinkBreak2 } from 'react-icons/rx';
import {
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
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
      toolbar: { shown: 'linkEditShown' },
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
        <ToggleButton pressed={isLink || isLinkEditOpen} onClick={updateLink} size="sm">
          <Icon size="sm" as={RxLink2} />
          {t('Link')}
        </ToggleButton>
      </ToggleGroup>

      {isLinkEditOpen && initialValues && <LinkEditPopup initialValues={initialValues} isLink={isLink} />}
    </>
  );
};

interface LinkEditPopupProps {
  isLink: boolean;
  initialValues: {
    text: string;
    link: string;
  };
}

export const LinkEditPopup = ({ initialValues, isLink }: LinkEditPopupProps) => {
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

  const copyLink = () => {};

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
      {isLink ? (
        <Row main="end" gap="sm">
          <Tooltip delayDuration={200} content={'Open in a new tab'}>
            <Button icon={ArrowTopRightOnSquareIcon} aria-label={t('Open in a new tab')} />
          </Tooltip>
          <Tooltip delayDuration={200} content={'Unlink'}>
            <Button icon={RxLinkBreak2} label={t('Remove link')} intent="danger" onClick={removeLink} />
          </Tooltip>
          <CopyLinkButton href={initialValues.link} />
        </Row>
      ) : null}
      <form className="col-span-full row-start-2 flex w-64 flex-col gap-2 p-2" onSubmit={saveLink}>
        <TextField size="sm" placeholder="Text" name="text" label={t('Text')} defaultValue={initialValues.text} />
        <TextField
          size="sm"
          placeholder="https://example.com"
          name="link"
          type="url"
          label={t('Link')}
          defaultValue={initialValues.link}
        />
        <div className="flex flex-row justify-end gap-2 pt-1">
          <Button size="sm" onClick={close}>
            {t('Cancel')}
          </Button>
          <Button size="sm" type="submit" variant="tonal">
            {t('Save')}
          </Button>
        </div>
      </form>
    </EditorPopover>
  );
};

const CopyLinkButton = ({ href }: { href: string }) => {
  const [copied, copy] = useCopyToClipboard();

  return (
    <Tooltip delayDuration={200} content={copied ? 'Copied to clipboard' : 'Copy to clipboard'}>
      <Button
        icon={copied ? ClipboardDocumentCheckIcon : ClipboardDocumentListIcon}
        label={t('Copy link')}
        onClick={() => copy(href)}
      />
    </Tooltip>
  );
};
