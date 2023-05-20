import { type FormEvent, useMemo, useState } from "react";
import { RxLink2, RxLinkBreak2 } from "react-icons/rx/index.js";
import {
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext.js";

import { t } from "@fxtrot/lib";
import {
  Button,
  Icon,
  Row,
  Text,
  TextField,
  ToggleButton,
  Tooltip,
  useCopyToClipboard,
  useKeyboardHandles,
} from "@fxtrot/ui";

import { EditorPopover } from "../../lib/editor-popover.tsx";

import { useActorRef, useReferenceNode, useSelector } from "./state.ts";
import { ToggleGroup } from "./toggle-group.tsx";
import {
  selectLinkAndGetTheDetails,
  updateSelectedLink,
  useIsLinkSelected,
} from "./utils.ts";

export const LinkEdit = () => {
  const [editor] = useLexicalComposerContext();

  const isLinkEditOpen = useSelector((state) =>
    state.matches({
      toolbar: { shown: "linkEditShown" },
    })
  );
  const actor = useActorRef();
  const isLink = useIsLinkSelected();
  const [initialValues, setInitialValues] = useState<{
    text: string;
    link: string;
  } | null>();

  const { close, toggle } = useMemo(() => {
    const close = () => {
      setInitialValues(null);
      actor.send({ type: "cancel link edit" });
    };
    const open = async () => {
      actor.send({ type: "edit link" });
      const details = await selectLinkAndGetTheDetails(editor);
      setInitialValues(details);
    };
    const toggle = async () => {
      const state = actor.getSnapshot();
      if (state?.matches({ toolbar: { shown: "linkEditShown" } })) {
        close();
      } else {
        open();
      }
    };

    return { open, close, toggle };
  }, [actor, editor]);

  return (
    <>
      <ToggleGroup>
        <ToggleButton
          pressed={isLink || isLinkEditOpen}
          onClick={toggle}
          size="sm"
        >
          <Icon size="sm" as={RxLink2} />
          {t("Link")}
        </ToggleButton>
      </ToggleGroup>

      {isLinkEditOpen && initialValues && (
        <LinkEditPopup
          initialValues={initialValues}
          isLink={isLink}
          onClose={close}
        />
      )}
    </>
  );
};

interface LinkEditPopupProps {
  isLink: boolean;
  initialValues: {
    text: string;
    link: string;
  };
  onClose: () => void;
}

export const LinkEditPopup = ({
  initialValues,
  isLink,
  onClose,
}: LinkEditPopupProps) => {
  const [editor] = useLexicalComposerContext();
  const selectedNode = useReferenceNode();

  const removeLink = () => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    close();
  };

  const saveLink = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (form.get("text") as string) || "";
    const link = (form.get("link") as string) || "";
    updateSelectedLink(editor, { text, link });
  };

  const onKeyDown = useKeyboardHandles({
    Escape: onClose,
  });

  return (
    <EditorPopover
      onKeyDown={onKeyDown}
      isOpen={!!initialValues}
      placement="bottom"
      offset={8}
      reference={selectedNode}
    >
      {isLink ? (
        <Row main="end" gap="xs">
          <Tooltip
            delayDuration={200}
            content={<Text textStyle="body-sm">Open in a new tab</Text>}
          >
            <Button
              icon={ArrowTopRightOnSquareIcon}
              aria-label={t("Open in a new tab")}
            />
          </Tooltip>
          <Tooltip
            delayDuration={200}
            content={<Text textStyle="body-sm">Unlink</Text>}
          >
            <Button
              icon={RxLinkBreak2}
              label={t("Remove link")}
              intent="danger"
              onClick={removeLink}
            />
          </Tooltip>
          <CopyLinkButton href={initialValues.link} />
        </Row>
      ) : null}
      <form
        className="col-span-full row-start-2 flex w-64 flex-col gap-2 p-2"
        onSubmit={saveLink}
      >
        <TextField
          size="sm"
          placeholder="Text"
          name="text"
          label={t("Text")}
          defaultValue={initialValues.text}
          autoFocus
        />
        <TextField
          size="sm"
          placeholder="https://example.com"
          name="link"
          type="url"
          label={t("Link")}
          defaultValue={initialValues.link}
        />
        <div className="flex flex-row justify-end gap-2 pt-1">
          <Button size="sm" onClick={onClose}>
            {t("Cancel")}
          </Button>
          <Button size="sm" type="submit" variant="tonal">
            {t("Save")}
          </Button>
        </div>
      </form>
    </EditorPopover>
  );
};

const CopyLinkButton = ({ href }: { href: string }) => {
  const [copied, copy] = useCopyToClipboard();

  return (
    <Tooltip
      delayDuration={200}
      content={
        <Text textStyle="body-sm">
          {copied ? "Copied to clipboard" : "Copy to clipboard"}
        </Text>
      }
    >
      <Button
        icon={copied ? ClipboardDocumentCheckIcon : ClipboardDocumentListIcon}
        label={t("Copy link")}
        onClick={() => copy(href)}
      />
    </Tooltip>
  );
};
