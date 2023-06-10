import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext.js';
import { mergeRegister } from '@lexical/utils';
import { COMMAND_PRIORITY_HIGH, KEY_ESCAPE_COMMAND } from 'lexical';

import { Button, LinkButton, Row, Text } from '@fxtrot/ui';

import { EditorPopover } from '../../lib/editor-popover.tsx';

import { CopyLinkButton, LinkEditPopup } from './link-edit-popup.tsx';
import { RangeSelectionLink, TextFormat } from './range-selection.tsx';
import { useActorRef, useSelector } from './state.ts';

export const Selection = () => {
  const [editor] = useLexicalComposerContext();
  const actor = useActorRef();

  const linkSelected = useSelector((state) => state.matches({ toolbar: { shown: 'link' } }));
  const rangeSelected = useSelector((state) => state.matches({ toolbar: { shown: 'range' } }));

  const selection = useSelector((state) => state.context.selection);

  const isLinkEditOpen = useSelector((state) =>
    [
      state.matches({
        toolbar: { shown: { range: 'link-edit' } },
      }),
      state.matches({
        toolbar: { shown: { link: 'link-edit' } },
      }),
    ].some(Boolean)
  );

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          actor.send({ type: 'close' });
          return true;
        },
        COMMAND_PRIORITY_HIGH
      )
    );
  }, [editor, actor]);
  const offset = { mainAxis: 8, crossAxis: -32 };
  return (
    <>
      <EditorPopover
        className="grid grid-cols-1 grid-rows-1 place-items-start p-1"
        open={linkSelected || rangeSelected}
        reference={selection}
        offset={offset}
      >
        {linkSelected && selection instanceof HTMLAnchorElement ? (
          <LinkSelectionToggles link={selection} />
        ) : (
          <RangeSelectionToggles />
        )}
      </EditorPopover>
      {isLinkEditOpen ? <LinkEditPopup reference={selection} isLink /> : null}
    </>
  );
};

const RangeSelectionToggles = () => {
  return (
    <div className="flex gap-1">
      <TextFormat />
      <RangeSelectionLink />
    </div>
  );
};

type LinkSelectionProps = {
  link: HTMLElement;
};

const LinkSelectionToggles = ({ link }: LinkSelectionProps) => {
  const actor = useActorRef();

  const href = link?.getAttribute('href');

  if (!href) return null;

  const toggleEdit = () => {
    actor.send({ type: 'toggle edit link' });
  };

  return (
    <Row gap="xs" cross="center">
      <LinkButton href={href} title={href} className="max-w-[200px]" size="sm" main="start">
        <Text className="truncate">{href}</Text>
      </LinkButton>
      <CopyLinkButton href={href} />
      <Button size="sm" onClick={toggleEdit}>
        <Text textStyle="label-sm">Edit</Text>
      </Button>
    </Row>
  );
};
