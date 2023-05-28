import { type FormEvent, useEffect, useMemo, useState } from "react";
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
  getLinkDetails,
  selectWholeLink,
  updateSelectedLink,
  useIsLinkSelected,
} from "./utils.ts";

export const LinkEdit = () => {
  const [editor] = useLexicalComposerContext();
  const selection = useReferenceNode();

  const isLinkEditOpen = useSelector((state) =>
    state.matches({
      toolbar: { shown: "linkEditShown" },
    })
  );
  const actor = useActorRef();
  const [isLink, isDisabled] = useIsLinkSelected();
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
      // actor.send({ type: "selection change" });
      if (selection) {
        await selectWholeLink(editor, selection);
        actor.send({ type: "edit link" });
        const details = await getLinkDetails(editor);
        setInitialValues(details);
      }
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
  }, [actor, editor, selection]);

  return (
    <>
      <div className="w-0.5 bg-outline/10" />
      <ToggleGroup disabled={isDisabled}>
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
  const selection = useReferenceNode();

  useEffect(() => {
    // @ts-expect-error Highlights API is not yet in lib/dom
    if (selection && typeof Highlight !== "undefined") {
      // @ts-expect-error Highlights API is not yet in lib/dom
      const highlight = new Highlight(selection);
      // @ts-expect-error Highlights API is not yet in lib/dom
      CSS.highlights.set("editor", highlight);
      return () => {
        // @ts-expect-error Highlights API is not yet in lib/dom
        CSS.highlights.delete("editor");
      };
    }
  }, [selection]);

  const removeLink = () => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    onClose();
  };

  const saveLink = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (form.get("text") as string) || "";
    const link = (form.get("link") as string) || "";
    updateSelectedLink(editor, { text, link });
    onClose();
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
      reference={selection}
    >
      {isLink ? (
        <Row main="end" cross="center">
          <Tooltip
            delayDuration={200}
            content={<Text textStyle="body-sm">Open in a new tab</Text>}
          >
            <Button
              size="sm"
              icon={ArrowTopRightOnSquareIcon}
              aria-label={t("Open in a new tab")}
            />
          </Tooltip>
          <Tooltip
            delayDuration={200}
            content={<Text textStyle="body-sm">Unlink</Text>}
          >
            <Button
              size="sm"
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
        className="col-span-full row-start-2 flex w-64 flex-col gap-4 p-2"
        onSubmit={saveLink}
      >
        {/* 
         TODO: to implement this, the editor needs to get the
               selection and extract from selected nodes selected text with their styles.
               Then, on save, selected nodes need to be split on selection anchor and offset and new nodes created.
               Maybe at some point, but not now :)
        <MinimalEditor
          size="sm"
          placeholder={t("Text")}
          name="text"
          label={t("Text")}
          autoFocus
          initialEditorState={initialValues.text}
        /> */}
        {initialValues.text && (
          <TextField
            size="sm"
            label="Link title"
            placeholder="Reference"
            name="text"
            defaultValue={initialValues.text}
            autoFocus
          />
        )}
        <TextField
          size="sm"
          label="Link URL"
          placeholder="https://example.com"
          name="link"
          type="url"
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
        copied ? (
          <Text textStyle="body-sm">Copied to clipboard</Text>
        ) : (
          <Text textStyle="body-sm">Copy to clipboard</Text>
        )
      }
    >
      <Button
        size="sm"
        icon={copied ? ClipboardDocumentCheckIcon : ClipboardDocumentListIcon}
        label={t("Copy link")}
        onClick={() => copy(href)}
      />
    </Tooltip>
  );
};
